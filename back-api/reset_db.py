# reset_db.py
from app import app, db
import models  # noqa: F401  -- import registers all models on db.metadata


def reset_tables():
    with app.app_context():
        db.drop_all()
        db.create_all()
        return sorted(db.metadata.tables)


if __name__ == "__main__":
    confirm = input("Drop ALL tables and recreate? Data will be lost. [y/N] ")
    if confirm.strip().lower() == "y":
        table_names = reset_tables()
        print(f"Database reset. Tables recreated: {', '.join(table_names)}")
    else:
        print("Aborted.")