"""
database.py — MongoDB connection and schema operations.

WHAT: Connects to MongoDB, manages the `fraud_reports` and `transactions_log`
collections, and seeds demo data.

WHY MongoDB: Vercel serverless functions are read-only. We need a cloud
database so users can continue to submit fraud reports after deployment.
"""

import os
from datetime import datetime, timedelta
from pymongo import MongoClient

# Use the environment variable, fallback to localhost for local testing without .env
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/payguard_neural")

client = None
db = None

def get_db():
    """Returns the MongoDB database instance."""
    global client, db
    if db is None:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Extract DB name from URI or default to 'payguard_neural'
        db_name = MONGO_URI.rsplit('/', 1)[-1].split('?')[0]
        if not db_name or db_name == "localhost:27017":
            db_name = "payguard_neural"
        db = client[db_name]
    return db

def init_db():
    """
    Creates indexes and seeds demo data if the collection is empty.
    Called once when the Flask app starts.
    Gracefully skips if MongoDB is unreachable (e.g., local dev without Atlas URI set).
    """
    try:
        database = get_db()
        reports_col = database["fraud_reports"]

        # Ensure indexes
        reports_col.create_index("upi_id", unique=True)
        database["transactions_log"].create_index("created_at")

        # Seed data if collection is empty
        if reports_col.count_documents({}) == 0:
            _seed_demo_data(reports_col)

        print("[DB] MongoDB connected and initialized OK.")
    except Exception as e:
        print(f"[DB WARNING] MongoDB not reachable: {e}")
        print("[DB WARNING] App will start but DB-dependent features may fail.")
        print("[DB WARNING] Set MONGODB_URI in .env to a MongoDB Atlas URI to fix this.")

def _seed_demo_data(collection):
    """
    Inserts the 3 advertised demo UPI IDs and extra realistic entries.
    """
    now = datetime.utcnow()
    seed_entries = [
        # ── The 3 demo UPI IDs advertised on the landing page ────
        {"upi_id": "lucky99@upi",      "report_count": 14, "source": "seed_demo",    "last_reported": (now - timedelta(hours=6)).isoformat()},
        {"upi_id": "newdeal@paytm",    "report_count": 3,  "source": "seed_demo",    "last_reported": (now - timedelta(days=2)).isoformat()},
        {"upi_id": "vaishnavi@okaxis", "report_count": 0,  "source": "seed_demo",    "last_reported": (now - timedelta(days=30)).isoformat()},

        # ── Extra realistic entries so the DB doesn't look fake ──
        {"upi_id": "quickcash99@ybl",   "report_count": 8,  "source": "crowdsourced", "last_reported": (now - timedelta(hours=12)).isoformat()},
        {"upi_id": "seller.fraud@upi",  "report_count": 6,  "source": "crowdsourced", "last_reported": (now - timedelta(days=1)).isoformat()},
        {"upi_id": "loanagent@paytm",   "report_count": 11, "source": "crowdsourced", "last_reported": (now - timedelta(hours=3)).isoformat()},
        {"upi_id": "prize2025@okicici", "report_count": 5,  "source": "crowdsourced", "last_reported": (now - timedelta(days=4)).isoformat()},
        {"upi_id": "recharge.offer@ybl","report_count": 2,  "source": "crowdsourced", "last_reported": (now - timedelta(days=7)).isoformat()},
        {"upi_id": "genuine.shop@okaxis","report_count": 0, "source": "crowdsourced", "last_reported": (now - timedelta(days=60)).isoformat()},
        {"upi_id": "ravi.kumar@oksbi",  "report_count": 0,  "source": "crowdsourced", "last_reported": (now - timedelta(days=90)).isoformat()},
    ]
    collection.insert_many(seed_entries)

def lookup_fraud_reports(upi_id: str):
    """
    Looks up a UPI ID in the fraud_reports collection.
    Returns the doc if found, else None.
    """
    database = get_db()
    result = database["fraud_reports"].find_one({"upi_id": upi_id.lower().strip()})
    if result:
        # Convert _id to string or just return the dict
        result["_id"] = str(result["_id"])
        return result
    return None

def add_fraud_report(upi_id: str, reason: str = ""):
    """
    Adds or increments a crowdsourced fraud report for a UPI ID.
    If the UPI ID already exists, increments report_count.
    If new, inserts a new doc with report_count=1.
    """
    upi_id = upi_id.lower().strip()
    database = get_db()
    collection = database["fraud_reports"]
    
    collection.update_one(
        {"upi_id": upi_id},
        {
            "$inc": {"report_count": 1},
            "$set": {
                "source": "crowdsourced",
                "last_reported": datetime.utcnow().isoformat()
            },
            # If we want to store reasons, we could $push to a reasons array
        },
        upsert=True
    )

def log_transaction(upi_id: str, final_score: float, risk_level: str):
    """
    Logs every check to the transactions_log collection for analytics.
    """
    database = get_db()
    database["transactions_log"].insert_one({
        "upi_id": upi_id.lower().strip(),
        "final_score": final_score,
        "risk_level": risk_level,
        "created_at": datetime.utcnow().isoformat()
    })
