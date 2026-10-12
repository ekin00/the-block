"""Import vehicles from instance/vehicles.json into the the_block table.

DATABASE_URL comes from .env via app.py (defaults to sqlite:///theblock.db,
resolved relative to Flask's instance directory).

Usage:
    python import_vehicles.py                   # keep auction_start from JSON
    python import_vehicles.py --random-auction  # overwrite auction_start with a
                                                # random timestamp in now +/- 5 days;
                                                # also guarantees 5 auctions ending
                                                # within 1 hour and 10 not yet started
"""

import argparse
import json
import os
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from models import AUCTION_DURATION_DAYS, KM_TO_MI, TheBlock

DATA_FILE = Path(__file__).parent.parent / "data" / "vehicles.json"

# Columns accepted from the JSON records (everything else is ignored).
COLUMN_NAMES = {c.name for c in TheBlock.__table__.columns}


def random_auction_start() -> datetime:
    """Random timestamp between now - 5 days and now + 5 days, any time of day."""
    start = datetime.now(timezone.utc) - timedelta(days=5)
    offset_seconds = random.uniform(0, 10 * 24 * 60 * 60)  # 10-day window
    return start + timedelta(seconds=offset_seconds)


ENDING_SOON_COUNT = 5  # guaranteed to end within the next hour
NOT_STARTED_COUNT = 10  # guaranteed to start in the future


def ending_soon_start() -> datetime:
    """auction_start such that auction_end lands 5-55 minutes from now."""
    end = datetime.now(timezone.utc) + timedelta(minutes=random.uniform(5, 55))
    return end - timedelta(days=AUCTION_DURATION_DAYS)


def not_started_start() -> datetime:
    """auction_start between 1 minute and 5 days from now."""
    return datetime.now(timezone.utc) + timedelta(
        seconds=random.uniform(60, 5 * 24 * 60 * 60)
    )


def import_vehicles(random_auction: bool) -> None:
    records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    print(f"Loaded {len(records)} records from {DATA_FILE.name}")
    print(f"Target database: {app.config['SQLALCHEMY_DATABASE_URI']}")

    imported = 0
    with app.app_context():
        existing_vins = {
            vin for (vin,) in db.session.query(TheBlock.vin).all()
        }

        new_records = [r for r in records if r["vin"] not in existing_vins]
        skipped = len(records) - len(new_records)

        # Pick distinct records for the guaranteed scenarios (random mode only).
        special = random.sample(
            range(len(new_records)),
            min(ENDING_SOON_COUNT + NOT_STARTED_COUNT, len(new_records)),
        ) if random_auction else []
        ending_soon = set(special[:ENDING_SOON_COUNT])
        not_started = set(special[ENDING_SOON_COUNT:])

        for i, record in enumerate(new_records):
            kwargs = {k: v for k, v in record.items() if k in COLUMN_NAMES}
            if i in ending_soon:
                kwargs["auction_start"] = ending_soon_start()
            elif i in not_started:
                kwargs["auction_start"] = not_started_start()
            elif random_auction:
                kwargs["auction_start"] = random_auction_start()
            else:
                kwargs["auction_start"] = datetime.fromisoformat(record["auction_start"])
            # auction_end is always derived from auction_start, randomized or not.
            kwargs["auction_end"] = kwargs["auction_start"] + timedelta(
                days=AUCTION_DURATION_DAYS
            )
            # Whole miles for U.S. display, always derived from odometer_km.
            kwargs["odometer_mi"] = round(record["odometer_km"] * KM_TO_MI)
            db.session.add(TheBlock(**kwargs))
            imported += 1

        db.session.commit()

        total = db.session.query(TheBlock).count()
        bounds = db.session.query(
            db.func.min(TheBlock.auction_start),
            db.func.max(TheBlock.auction_start),
        ).one()

    print(f"Imported: {imported}, skipped (duplicate VIN): {skipped}")
    print(f"the_block now has {total} rows, auction_start range: {bounds[0]} .. {bounds[1]}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import vehicles.json into the_block.")
    parser.add_argument(
        "--random-auction",
        action="store_true",
        help="Overwrite auction_start with a random timestamp in now +/- 5 days.",
    )
    args = parser.parse_args()
    import_vehicles(random_auction=args.random_auction)
