from app import app, db
import models  # noqa: F401  -- import registers all models on db.metadata


def create_tables():
    with app.app_context():
        db.create_all()
        return sorted(db.metadata.tables)


if __name__ == "__main__":
    table_names = create_tables()
    print(f"Database tables ready: {', '.join(table_names)}")