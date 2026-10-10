"""Ad-hoc schema invariant checks for comparison_items and bid_tracker.

Run with the project venv after seed_validation.py:
    venv/Scripts/python.exe verify_schema.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import inspect
from sqlalchemy.exc import IntegrityError

from app import app, db
from models import User, ComparisonItem, BidTracker


def try_insert(label, item):
    db.session.add(item)
    try:
        db.session.commit()
        print(f"{label}: COMMITTED")
    except IntegrityError:
        db.session.rollback()
        print(f"{label}: IntegrityError (rejected)")


def main():
    with app.app_context():
        u = User.query.filter_by(name="GUEST3").first()

        # Duplicate vehicle in the same tray -> composite PK must reject.
        try_insert(
            "duplicate vehicle",
            ComparisonItem(
                user_id=u.id,
                theblock_id=u.comparison_items[0].theblock_id,
                position=9,
            ),
        )

        # Duplicate position for the same user -> unique constraint must reject.
        other = User.query.filter_by(name="GUEST1").first()
        try_insert(
            "duplicate position",
            ComparisonItem(
                user_id=u.id,
                theblock_id=other.comparison_items[0].theblock_id,
                position=1,
            ),
        )

        # Fourth distinct vehicle -> DB must ACCEPT (no cap in schema).
        db.session.add(
            ComparisonItem(
                user_id=u.id,
                theblock_id=other.comparison_items[0].theblock_id,
                position=4,
            )
        )
        db.session.commit()
        print(f"4th item: COMMITTED, tray now has {len(u.comparison_items)} items")

        # Clean up the 4th item so the seeded state is preserved.
        db.session.delete(
            ComparisonItem.query.filter_by(user_id=u.id, position=4).first()
        )
        db.session.commit()

        # bid_tracker table and the new the_block columns must exist.
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"bid_tracker table exists: {'PASS' if 'bid_tracker' in tables else 'FAIL'}")

        theblock_cols = {c["name"] for c in inspector.get_columns("the_block")}
        for col in ("auction_end", "current_winner_id"):
            print(f"the_block.{col} column: {'PASS' if col in theblock_cols else 'FAIL'}")

        # Duplicate bid on the same (user, vehicle) -> composite PK must reject.
        g1 = User.query.filter_by(name="GUEST1").first()
        existing_bid = BidTracker.query.filter_by(user_id=g1.id).first()
        try_insert(
            "duplicate bid (user, vehicle)",
            BidTracker(
                user_id=g1.id,
                theblock_id=existing_bid.theblock_id,
                my_bid=existing_bid.my_bid + 1,
            ),
        )


if __name__ == "__main__":
    main()
