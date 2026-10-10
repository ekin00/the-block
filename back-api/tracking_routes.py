from flask import Blueprint, g, jsonify, request
from sqlalchemy.exc import IntegrityError

from extensions import db
from models import MAX_COMPARISON_ITEMS, ComparisonItem, Favorite, TheBlock


tracking_bp = Blueprint("tracking", __name__, url_prefix="/api")


def _favorite_to_dict(favorite):
    return {
        "theblock_id": favorite.theblock_id,
        "comment": favorite.comment,
        "add_date": favorite.add_date.isoformat(),
    }


def _comparison_item_to_dict(item):
    return {
        "theblock_id": item.theblock_id,
        "position": item.position,
        "added_at": item.added_at.isoformat(),
    }


def _parse_theblock_ref(payload):
    if not isinstance(payload, dict):
        return None, "A JSON request body is required."
    theblock_id = payload.get("theblock_id")
    if not isinstance(theblock_id, str) or not theblock_id.strip():
        return None, "theblock_id is required."
    return theblock_id.strip(), None


@tracking_bp.route("/favorites", methods=["GET", "POST"])
def favorites():
    if request.method == "GET":
        rows = (
            Favorite.query.filter_by(user_id=int(g.current_user_id))
            .order_by(Favorite.add_date)
            .all()
        )
        return jsonify([_favorite_to_dict(row) for row in rows]), 200

    payload = request.get_json(silent=True)
    theblock_id, error = _parse_theblock_ref(payload)
    if error:
        return jsonify({"error": error}), 400

    comment = payload.get("comment")
    if comment is not None and not isinstance(comment, str):
        return jsonify({"error": "comment must be a string."}), 400

    if db.session.get(TheBlock, theblock_id) is None:
        return jsonify({"error": "Vehicle not found."}), 404

    favorite = Favorite(
        user_id=int(g.current_user_id), theblock_id=theblock_id, comment=comment
    )
    db.session.add(favorite)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Vehicle is already in favorites."}), 409
    return jsonify(_favorite_to_dict(favorite)), 201


@tracking_bp.route("/favorites/<string:theblock_id>", methods=["PATCH", "DELETE"])
def favorite_detail(theblock_id):
    favorite = Favorite.query.filter_by(
        user_id=int(g.current_user_id), theblock_id=theblock_id
    ).first()
    if favorite is None:
        return jsonify({"error": "Favorite not found."}), 404

    if request.method == "DELETE":
        db.session.delete(favorite)
        db.session.commit()
        return "", 204

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or "comment" not in payload:
        return jsonify({"error": "comment is required."}), 400
    if payload["comment"] is not None and not isinstance(payload["comment"], str):
        return jsonify({"error": "comment must be a string."}), 400

    favorite.comment = payload["comment"]
    db.session.commit()
    return jsonify(_favorite_to_dict(favorite)), 200


@tracking_bp.route("/comparison", methods=["GET", "POST"])
def comparison():
    if request.method == "GET":
        items = (
            ComparisonItem.query.filter_by(user_id=int(g.current_user_id))
            .order_by(ComparisonItem.position)
            .all()
        )
        return jsonify([_comparison_item_to_dict(item) for item in items]), 200

    payload = request.get_json(silent=True)
    theblock_id, error = _parse_theblock_ref(payload)
    if error:
        return jsonify({"error": error}), 400

    if db.session.get(TheBlock, theblock_id) is None:
        return jsonify({"error": "Vehicle not found."}), 404

    tray = ComparisonItem.query.filter_by(user_id=int(g.current_user_id)).all()
    if len(tray) >= MAX_COMPARISON_ITEMS:
        return jsonify(
            {
                "error": f"Comparison tray is full (max {MAX_COMPARISON_ITEMS}). "
                "Remove an item first."
            }
        ), 409

    # The tray cap is enforced in app code, so a free position always exists here.
    used_positions = {item.position for item in tray}
    position = next(
        p for p in range(1, MAX_COMPARISON_ITEMS + 1) if p not in used_positions
    )

    item = ComparisonItem(
        user_id=int(g.current_user_id), theblock_id=theblock_id, position=position
    )
    db.session.add(item)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Vehicle is already in the comparison tray."}), 409
    return jsonify(_comparison_item_to_dict(item)), 201


@tracking_bp.route("/comparison/<string:theblock_id>", methods=["DELETE"])
def comparison_detail(theblock_id):
    item = ComparisonItem.query.filter_by(
        user_id=int(g.current_user_id), theblock_id=theblock_id
    ).first()
    if item is None:
        return jsonify({"error": "Comparison item not found."}), 404

    db.session.delete(item)
    db.session.flush()

    # Auto-compact: renumber the remaining items so positions stay contiguous
    # from 1.
    remaining = (
        ComparisonItem.query.filter_by(user_id=int(g.current_user_id))
        .order_by(ComparisonItem.position)
        .all()
    )
    for index, other in enumerate(remaining, start=1):
        if other.position != index:
            other.position = index
            # One UPDATE at a time so each move lands on a free (user, position) slot.
            db.session.flush()
    db.session.commit()
    return "", 204
