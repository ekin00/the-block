"""Seed validation data: 3 guest users with favorites and comparison trays.

Creates GUEST1, GUEST2, GUEST3 (idempotent) and seeds:
    - favorites:       user N gets N + 1 favorites
    - comparison tray: user N gets N items at positions 1..N
    - bids:            GUEST2 loses to GUEST1 on the first vehicle
    - vehicles are drawn from the_block sequentially (stable while IDs are fixed)

Run after reset_db.py + import_vehicles.py:
    python seed_validation.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from models import User, TheBlock, Favorite, ComparisonItem, BidTracker

GUEST_NAMES = ["GUEST1", "GUEST2", "GUEST3"]


def seed():
    with app.app_context():
        vehicles = TheBlock.query.order_by(TheBlock.id).all()
        if len(vehicles) < 9:
            raise SystemExit(
                f"Need at least 9 rows in the_block, found {len(vehicles)}. "
                "Run import_vehicles.py first."
            )

        users = []
        for name in GUEST_NAMES:
            user = User.query.filter_by(name=name).first()
            if not user:
                user = User(name=name)
                db.session.add(user)
                print(f"created user {name}")
            else:
                print(f"user {name} already exists (id={user.id})")
            users.append(user)
        db.session.flush()

        v = 0  # walk vehicles sequentially so selections are deterministic
        for n, user in enumerate(users, start=1):
            fav_vehicles = vehicles[v:v + n + 1]
            v += n + 1

            if user.favorites:
                print(f"{user.name} already seeded, skipping")
                v += n  # keep vehicle assignment aligned across users
                continue

            for vehicle in fav_vehicles:
                db.session.add(Favorite(user=user, theblock=vehicle))

            for position in range(1, n + 1):
                db.session.add(
                    ComparisonItem(
                        user_id=user.id,
                        theblock_id=vehicles[v].id,
                        position=position,
                    )
                )
                v += 1

        db.session.commit()

        # Bid seeding: GUEST2 bids the starting bid on the first vehicle, then
        # GUEST1 outbids by 500 and becomes the current winner.
        bid_vehicle = vehicles[0]
        guest1, guest2 = users[0], users[1]
        if BidTracker.query.filter_by(
            user_id=guest1.id, theblock_id=bid_vehicle.id
        ).first():
            print(f"bids on vehicle {bid_vehicle.id} already seeded, skipping")
        else:
            losing_bid = bid_vehicle.starting_bid
            winning_bid = losing_bid + 500
            db.session.add(
                BidTracker(
                    user_id=guest2.id,
                    theblock_id=bid_vehicle.id,
                    my_bid=losing_bid,
                )
            )
            db.session.add(
                BidTracker(
                    user_id=guest1.id,
                    theblock_id=bid_vehicle.id,
                    my_bid=winning_bid,
                )
            )
            bid_vehicle.current_bid = winning_bid
            bid_vehicle.bid_count = 2
            bid_vehicle.current_winner_id = guest1.id
            db.session.commit()
            print(
                f"seeded bids on vehicle {bid_vehicle.id}: "
                f"{guest2.name} my_bid={losing_bid} (losing), "
                f"{guest1.name} my_bid={winning_bid} (winning)"
            )

        # Validation pass: exercise the user.favorites / comparison tray relationships.
        for user in users:
            db.session.refresh(user)
            tray = [
                f"pos {i.position} -> {i.theblock_id}" for i in user.comparison_items
            ]
            print(
                f"{user.name}: {len(user.favorites)} favorite(s), "
                f"{len(user.comparison_items)} tray item(s): {tray}"
            )


if __name__ == "__main__":
    seed()
