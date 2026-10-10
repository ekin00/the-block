import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text

from identity_middleware import register_identity_middleware
from user_routes import user_bp
from extensions import db
from trip_routes import trip_bp
from theblock_routes import theblock_bp
from tracking_routes import tracking_bp
from bid_routes import bid_bp

load_dotenv()

app = Flask(__name__)
# hardcode as backup?
database_url = os.getenv("DATABASE_URL", "sqlite:///theblock.db")
if database_url == "your-sqldatabase-url-here":
    database_url = "sqlite:///theblock.db"

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev")
app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# CORS configuration for the React frontend, only if .env didn't specify FRONTEND_URL otherwise default to 3000
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in frontend_url.split(",") if origin.strip()]

app.logger.info("CONFIG allowed_origins=%s", allowed_origins)

app.logger.info("CONFIG full=%s", {k: v for k, v in sorted(app.config.items()) if "KEY" not in k and "URI" not in k})

db.init_app(app)
CORS(
    app,
    resources={
        r"/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "X-User-Id"],
            "supports_credentials": True,
        }
    },
)
app.register_blueprint(user_bp)
app.register_blueprint(trip_bp)
app.register_blueprint(theblock_bp)
app.register_blueprint(tracking_bp)
app.register_blueprint(bid_bp)
register_identity_middleware(app)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to The Block API"})

@app.route('/health')
def health_check():
    """Basic health check - reports API status and database connectivity."""
    try:
        db.session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db.session.rollback()
        db_status = "unavailable"

    healthy = db_status == "connected"
    return jsonify({
        "status": "healthy" if healthy else "unhealthy",
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), 200 if healthy else 503

if __name__ == '__main__':
    app.run(debug=True)
