from datetime import datetime, timedelta
from decimal import Decimal

from flask import Blueprint, jsonify, request
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import AUCTION_DURATION_DAYS, TheBlock


theblock_bp = Blueprint("theblock", __name__, url_prefix="/api/the-block")

REQUIRED_FIELDS = (
    "vin", "year", "make", "model", "trim", "body_style", "exterior_color",
    "interior_color", "engine", "transmission", "drivetrain", "odometer_km",
    "fuel_type", "condition_grade", "condition_report", "title_status",
    "province", "city", "auction_start", "starting_bid", "selling_dealership", "lot",
)
STRING_FIELDS = (
    "vin", "make", "model", "trim", "body_style", "exterior_color",
    "interior_color", "engine", "transmission", "drivetrain", "fuel_type",
    "condition_report", "title_status", "province", "city", "selling_dealership", "lot",
)
# current_bid, bid_count and current_winner_id change only through POST /api/bid-tracker.
INT_FIELDS = ("year", "odometer_km")
DECIMAL_FIELDS = ("starting_bid", "reserve_price", "buy_now_price")
NULLABLE_DECIMAL_FIELDS = ("reserve_price", "buy_now_price")
DATETIME_FIELDS = ("auction_start", "auction_end")
JSON_LIST_FIELDS = ("damage_notes", "images")


def _money(value):
    return float(value) if value is not None else None


def _vehicle_to_dict(vehicle):
    return {
        "id": vehicle.id,
        "vin": vehicle.vin,
        "year": vehicle.year,
        "make": vehicle.make,
        "model": vehicle.model,
        "trim": vehicle.trim,
        "body_style": vehicle.body_style,
        "exterior_color": vehicle.exterior_color,
        "interior_color": vehicle.interior_color,
        "engine": vehicle.engine,
        "transmission": vehicle.transmission,
        "drivetrain": vehicle.drivetrain,
        "odometer_km": vehicle.odometer_km,
        "fuel_type": vehicle.fuel_type,
        "condition_grade": vehicle.condition_grade,
        "condition_report": vehicle.condition_report,
        "damage_notes": vehicle.damage_notes,
        "title_status": vehicle.title_status,
        "province": vehicle.province,
        "city": vehicle.city,
        "auction_start": vehicle.auction_start.isoformat(),
        "auction_end": vehicle.auction_end.isoformat() if vehicle.auction_end else None,
        "starting_bid": _money(vehicle.starting_bid),
        "reserve_price": _money(vehicle.reserve_price),
        "buy_now_price": _money(vehicle.buy_now_price),
        "current_bid": _money(vehicle.current_bid),
        "bid_count": vehicle.bid_count,
        "current_winner_id": vehicle.current_winner_id,
        "images": vehicle.images,
        "selling_dealership": vehicle.selling_dealership,
        "lot": vehicle.lot,
    }


def _sort_expression(sort):
    # Price sorts use the live price: current_bid once bidding has started,
    # otherwise the starting bid.
    effective_price = func.coalesce(TheBlock.current_bid, TheBlock.starting_bid)
    return {
        "price_asc": effective_price.asc(),
        "price_desc": effective_price.desc(),
        "bid_count": TheBlock.bid_count.desc(),
        "ending_soon": TheBlock.auction_end.asc().nulls_last(),
    }.get(sort)


def _parse_datetime(value):
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _parse_vehicle_payload(payload, *, partial=False):
    if not isinstance(payload, dict):
        return None, "A JSON request body is required."

    values = {}
    for field in STRING_FIELDS:
        if field in payload:
            value = payload[field]
            if not isinstance(value, str) or not value.strip():
                return None, f"{field} must be a non-empty string."
            values[field] = value.strip()

    for field in INT_FIELDS:
        if field in payload:
            value = payload[field]
            if isinstance(value, bool) or not isinstance(value, int):
                return None, f"{field} must be an integer."
            values[field] = value

    if "condition_grade" in payload:
        value = payload["condition_grade"]
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return None, "condition_grade must be a number."
        values["condition_grade"] = value

    for field in DECIMAL_FIELDS:
        if field in payload:
            value = payload[field]
            if value is None and field in NULLABLE_DECIMAL_FIELDS:
                values[field] = None
                continue
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                return None, f"{field} must be a number."
            values[field] = Decimal(str(value))

    for field in DATETIME_FIELDS:
        if field in payload:
            value = payload[field]
            if value is None and field == "auction_end":
                values[field] = None
                continue
            parsed = _parse_datetime(value)
            if parsed is None:
                return None, f"{field} must be an ISO-formatted datetime."
            values[field] = parsed

    for field in JSON_LIST_FIELDS:
        if field in payload:
            if not isinstance(payload[field], list):
                return None, f"{field} must be a list."
            values[field] = payload[field]

    if not partial:
        for field in REQUIRED_FIELDS:
            if field not in values:
                return None, f"{field} is required."

    return values, None


@theblock_bp.route("", methods=["GET", "POST"])
def vehicles():
    if request.method == "GET":
        query = TheBlock.query
        make = request.args.get("make")
        if make:
            query = query.filter(TheBlock.make == make)
        body_style = request.args.get("body_style")
        if body_style:
            query = query.filter(TheBlock.body_style == body_style)
        order = _sort_expression(request.args.get("sort"))
        if order is not None:
            query = query.order_by(order)
        return jsonify([_vehicle_to_dict(vehicle) for vehicle in query.all()]), 200

    values, error = _parse_vehicle_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    values.setdefault(
        "auction_end", values["auction_start"] + timedelta(days=AUCTION_DURATION_DAYS)
    )
    vehicle = TheBlock(**values)
    db.session.add(vehicle)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A vehicle with this VIN already exists."}), 409
    return jsonify(_vehicle_to_dict(vehicle)), 201


@theblock_bp.route("/<string:vehicle_id>", methods=["GET", "PUT", "PATCH"])
def vehicle_detail(vehicle_id):
    vehicle = db.session.get(TheBlock, vehicle_id)
    if vehicle is None:
        return jsonify({"error": "Vehicle not found."}), 404

    if request.method == "GET":
        return jsonify(_vehicle_to_dict(vehicle)), 200

    values, error = _parse_vehicle_payload(
        request.get_json(silent=True), partial=request.method == "PATCH"
    )
    if error:
        return jsonify({"error": error}), 400

    for field, value in values.items():
        setattr(vehicle, field, value)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A vehicle with this VIN already exists."}), 409
    return jsonify(_vehicle_to_dict(vehicle)), 200
