from datetime import datetime, timezone
from uuid import uuid4  
from extensions import db

#BTW: https://docs.sqlalchemy.org/en/20/tutorial/metadata.html https://docs.sqlalchemy.org/en/20/orm/quickstart.html

# user's comparison tray if raising it (e.g. 3 -> 4) is a constant
MAX_COMPARISON_ITEMS = 3

# auctions run this many days from auction_start; auction_end is derived at import
AUCTION_DURATION_DAYS = 5

# odometer_km is stored in km; odometer_mi is derived from it with this factor
KM_TO_MI = 0.621371

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True, index=True)
    trips = db.relationship("Trip", back_populates="user")
    favorites = db.relationship("Favorite", back_populates="user")
    bid_entries = db.relationship(
        "BidTracker", back_populates="user", cascade="all, delete-orphan"
    )
    comparison_items = db.relationship(
        "ComparisonItem",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="ComparisonItem.position",
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

class Trip(db.Model):
    __tablename__ = "trips"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    itinerary = db.Column(db.JSON, nullable=False, default=list)
    user = db.relationship("User", back_populates="trips")
    
    
class TheBlock(db.Model):
    __tablename__ = "the_block"
    #BTW use no rowid

    __table_args__ = {
        "sqlite_with_rowid": False
    }
    favorites = db.relationship("Favorite", back_populates="theblock")
    comparison_items = db.relationship("ComparisonItem", back_populates="theblock")
    bid_entries = db.relationship("BidTracker", back_populates="theblock")
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    vin = db.Column(db.String(17), nullable=False, unique=True)
    year = db.Column(db.Integer, nullable=False)
    make = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    trim = db.Column(db.String(100), nullable=False)
    body_style = db.Column(db.String(100), nullable=False)
    exterior_color = db.Column(db.String(100), nullable=False)
    interior_color = db.Column(db.String(100), nullable=False)
    engine = db.Column(db.String(100), nullable=False)
    transmission = db.Column(db.String(100), nullable=False)
    drivetrain = db.Column(db.String(50), nullable=False)
    odometer_km = db.Column(db.Integer, nullable=False)
    # whole miles for U.S. display, derived from odometer_km (KM_TO_MI)
    odometer_mi = db.Column(db.Integer, nullable=True)
    fuel_type = db.Column(db.String(50), nullable=False)
    condition_grade = db.Column(db.Float, nullable=False)
    condition_report = db.Column(db.Text, nullable=False)
    damage_notes = db.Column(db.JSON, nullable=False, default=list)
    title_status = db.Column(db.String(50), nullable=False)
    province = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    auction_start = db.Column(db.DateTime(timezone=True), nullable=False)
    starting_bid = db.Column(db.Numeric(12, 2), nullable=False)
    reserve_price = db.Column(db.Numeric(12, 2))
    buy_now_price = db.Column(db.Numeric(12, 2))
    images = db.Column(db.JSON, nullable=False, default=list)
    selling_dealership = db.Column(db.String(255), nullable=False)
    lot = db.Column(db.String(50), nullable=False)
    current_bid = db.Column(db.Numeric(12, 2))
    bid_count = db.Column(db.Integer, nullable=False, default=0)
    auction_end = db.Column(db.DateTime(timezone=True), nullable=True)
    current_winner_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    
class Favorite(db.Model):
    __tablename__ = "favorites"

    # One favorite per user/vehicle pair; each user can favorite many vehicles.
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)
    theblock_id = db.Column(
        db.String(36), db.ForeignKey("the_block.id"), primary_key=True
    )

    add_date = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    comment = db.Column(db.Text)
    user = db.relationship("User", back_populates="favorites")
    theblock = db.relationship("TheBlock", back_populates="favorites")



class ComparisonItem(db.Model):
    """One vehicle in the user's single comparison tray (one tray per user).

    The composite key prevents duplicate vehicles per tray; the MAX_COMPARISON_ITEMS
    cap is enforced in app code, not the database. Positions must be unique per user.
    """

    __tablename__ = "comparison_items"
    # Existing databases need a migration; create_all() does not alter constraints.
    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "position", name="uq_comparison_item_position"
        ),
    )

    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

# Both selection screens resolve to TheBlock.id, never to a Favorite row.
# Removing a favorite must not remove the vehicle from the comparison tray.
    theblock_id = db.Column(
        db.String(36),
        db.ForeignKey("the_block.id", ondelete="CASCADE"),
        primary_key=True,
    )

    position = db.Column(db.Integer, nullable=False)

    added_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", back_populates="comparison_items")
    theblock = db.relationship("TheBlock", back_populates="comparison_items")


# One user's latest bid on one vehicle. The composite PK enforces latest-bid-only:
# a re-bid on the same (user, vehicle) pair overwrites my_bid.
class BidTracker(db.Model):
    __tablename__ = "bid_tracker"

    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    theblock_id = db.Column(
        db.String(36),
        db.ForeignKey("the_block.id", ondelete="CASCADE"),
        primary_key=True,
    )

    my_bid = db.Column(db.Numeric(12, 2), nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", back_populates="bid_entries")
    theblock = db.relationship("TheBlock", back_populates="bid_entries")



