from datetime import datetime, timezone
from decimal import Decimal

from flask import Blueprint, g, jsonify, request

from extensions import db
from models import BidTracker, TheBlock


bid_bp = Blueprint("bid", __name__, url_prefix="/api/bid-tracker")

# Numeric(12, 2) holds at most 10 integer digits.
MAX_BID = Decimal("10000000000")


def _as_utc(value):
    # SQLite returns naive datetimes; the app stores UTC.
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _reserve_met(vehicle, amount):
    return vehicle.reserve_price is None or amount >= vehicle.reserve_price


def _bid_entry_to_dict(entry):
    vehicle = entry.theblock
    return {
        "theblock_id": vehicle.id,
        "year": vehicle.year,
        "make": vehicle.make,
        "model": vehicle.model,
        "trim": vehicle.trim,
        "auction_end": vehicle.auction_end.isoformat() if vehicle.auction_end else None,
        "my_bid": float(entry.my_bid),
        "current_bid": float(vehicle.current_bid) if vehicle.current_bid is not None else None,
        "bid_count": vehicle.bid_count,
        "status": "winning"
        if vehicle.current_bid is not None and entry.my_bid >= vehicle.current_bid
        else "losing",
        "reserve_met": _reserve_met(vehicle, entry.my_bid),
    }


@bid_bp.route("", methods=["GET", "POST"])
def bids():
    if request.method == "GET":
        entries = (
            BidTracker.query.filter_by(user_id=int(g.current_user_id))
            .join(TheBlock, BidTracker.theblock_id == TheBlock.id)
            .order_by(TheBlock.auction_end.asc().nulls_last())
            .all()
        )
        return jsonify([_bid_entry_to_dict(entry) for entry in entries]), 200

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "A JSON request body is required."}), 400

    theblock_id = payload.get("theblock_id")
    if not isinstance(theblock_id, str) or not theblock_id.strip():
        return jsonify({"error": "theblock_id is required."}), 400

    amount = payload.get("amount")
    if amount is None:
        return jsonify({"error": "amount is required."}), 400
    if isinstance(amount, bool) or not isinstance(amount, (int, float)):
        return jsonify({"error": "amount must be a number."}), 400
    amount = Decimal(str(amount))
    if (
        not amount.is_finite()
        or amount <= 0
        or amount >= MAX_BID
        or amount.as_tuple().exponent < -2
    ):
        return jsonify(
            {"error": "amount must be a positive number with at most 2 decimal places."}
        ), 400

    vehicle = db.session.get(TheBlock, theblock_id.strip())
    if vehicle is None:
        return jsonify({"error": "Vehicle not found."}), 404

    now = datetime.now(timezone.utc)
    if now < _as_utc(vehicle.auction_start):
        return jsonify({"error": "Auction has not started."}), 422
    if vehicle.auction_end is not None and now >= _as_utc(vehicle.auction_end):
        return jsonify({"error": "Auction has ended."}), 422

    if vehicle.bid_count == 0:
        if amount < vehicle.starting_bid:
            return jsonify({"error": "Bid must be at least the starting bid."}), 422
    elif vehicle.current_bid is None or amount <= vehicle.current_bid:
        return jsonify({"error": "Bid must be higher than the current bid."}), 422

    # Latest-bid-only: a re-bid on the same (user, vehicle) overwrites my_bid.
    entry = BidTracker.query.filter_by(
        user_id=int(g.current_user_id), theblock_id=vehicle.id
    ).first()
    if entry is None:
        entry = BidTracker(
            user_id=int(g.current_user_id), theblock_id=vehicle.id, my_bid=amount
        )
        db.session.add(entry)
    else:
        entry.my_bid = amount

    vehicle.current_bid = amount
    vehicle.bid_count += 1
    vehicle.current_winner_id = int(g.current_user_id)
    db.session.commit()

    return jsonify(
        {
            "theblock_id": vehicle.id,
            "my_bid": float(amount),
            "current_bid": float(vehicle.current_bid),
            "bid_count": vehicle.bid_count,
            "status": "winning",
            "reserve_met": _reserve_met(vehicle, amount),
        }
    ), 201


@bid_bp.route("/<string:theblock_id>", methods=["DELETE"])
def bid_detail(theblock_id):
    entry = BidTracker.query.filter_by(
        user_id=int(g.current_user_id), theblock_id=theblock_id
    ).first()
    if entry is None:
        return jsonify({"error": "Bid tracker entry not found."}), 404

    # Removing your tracker row never retracts the bid: the_block's
    # current_bid/bid_count/current_winner_id are left untouched.
    db.session.delete(entry)
    db.session.commit()
    return "", 204
