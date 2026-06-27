"""
database.py — SQLite connection, schema creation, and seed data.

WHY: We use SQLite for simplicity in a student demo. No database server
setup required — just a .db file. Comment: PostgreSQL is the planned
production DB (see README roadmap).

WHAT: Creates two tables (fraud_reports, transactions_log) and seeds
them with the 3 demo UPI IDs + extra realistic entries so the demo
doesn't look empty.
"""

import sqlite3
import os
from datetime import datetime, timedelta

# Database file lives alongside this script inside app/
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fraud_reports.db")


def get_connection():
    """
    Returns a new SQLite connection with row_factory set to sqlite3.Row
    so we can access columns by name (e.g., row["upi_id"]).
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Creates the tables if they don't exist and seeds demo data.
    Called once when the Flask app starts.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # ── Create tables ────────────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fraud_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            upi_id TEXT NOT NULL,
            report_count INTEGER DEFAULT 1,
            source TEXT,                 -- 'crowdsourced' | 'seed_demo'
            last_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            upi_id TEXT,
            final_score REAL,
            risk_level TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # ── Seed data (only if tables are empty) ─────────────────────
    cursor.execute("SELECT COUNT(*) as cnt FROM fraud_reports")
    count = cursor.fetchone()["cnt"]

    if count == 0:
        _seed_demo_data(cursor)
        conn.commit()

    conn.close()


def _seed_demo_data(cursor):
    """
    Inserts the 3 advertised demo UPI IDs and extra realistic entries.

    WHY these specific values:
      - lucky99@upi:       HIGH_RISK — 14 reports, many sources → score < 40
      - newdeal@paytm:     CAUTION   —  3 reports → score 40-79
      - vaishnavi@okaxis:  SAFE      —  0 reports → score 80-100
    """
    now = datetime.utcnow()
    seed_entries = [
        # ── The 3 demo UPI IDs advertised on the landing page ────
        # lucky99@upi: HIGH RISK — lots of reports from multiple sources
        ("lucky99@upi",      14, "seed_demo",     (now - timedelta(hours=6)).isoformat()),
        # newdeal@paytm: CAUTION — a few reports, not conclusive
        ("newdeal@paytm",     3, "seed_demo",     (now - timedelta(days=2)).isoformat()),
        # vaishnavi@okaxis: SAFE — zero reports (we add 0-report row for completeness)
        ("vaishnavi@okaxis",  0, "seed_demo",     (now - timedelta(days=30)).isoformat()),

        # ── Extra realistic entries so the DB doesn't look fake ──
        ("quickcash99@ybl",   8, "crowdsourced",  (now - timedelta(hours=12)).isoformat()),
        ("seller.fraud@upi",  6, "crowdsourced",  (now - timedelta(days=1)).isoformat()),
        ("loanagent@paytm",  11, "crowdsourced",  (now - timedelta(hours=3)).isoformat()),
        ("prize2025@okicici", 5, "crowdsourced",  (now - timedelta(days=4)).isoformat()),
        ("recharge.offer@ybl",2, "crowdsourced",  (now - timedelta(days=7)).isoformat()),
        ("genuine.shop@okaxis",0,"crowdsourced",  (now - timedelta(days=60)).isoformat()),
        ("ravi.kumar@oksbi",  0, "crowdsourced",  (now - timedelta(days=90)).isoformat()),
    ]

    cursor.executemany(
        "INSERT INTO fraud_reports (upi_id, report_count, source, last_reported) VALUES (?, ?, ?, ?)",
        seed_entries,
    )


def lookup_fraud_reports(upi_id: str):
    """
    Looks up a UPI ID in the fraud_reports table.
    Returns the row dict if found, else None.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT upi_id, report_count, source, last_reported FROM fraud_reports WHERE upi_id = ?",
        (upi_id.lower().strip(),),
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def add_fraud_report(upi_id: str, reason: str = ""):
    """
    Adds or increments a crowdsourced fraud report for a UPI ID.
    If the UPI ID already exists, increments report_count.
    If new, inserts a new row with report_count=1.
    """
    upi_id = upi_id.lower().strip()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, report_count FROM fraud_reports WHERE upi_id = ?", (upi_id,))
    existing = cursor.fetchone()

    if existing:
        cursor.execute(
            "UPDATE fraud_reports SET report_count = report_count + 1, last_reported = ?, source = 'crowdsourced' WHERE upi_id = ?",
            (datetime.utcnow().isoformat(), upi_id),
        )
    else:
        cursor.execute(
            "INSERT INTO fraud_reports (upi_id, report_count, source, last_reported) VALUES (?, 1, 'crowdsourced', ?)",
            (upi_id, datetime.utcnow().isoformat()),
        )

    conn.commit()
    conn.close()


def log_transaction(upi_id: str, final_score: float, risk_level: str):
    """
    Logs every check to the transactions_log table for analytics.
    WHY: Useful for the dashboard (future feature) and audit trail.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO transactions_log (upi_id, final_score, risk_level) VALUES (?, ?, ?)",
        (upi_id.lower().strip(), final_score, risk_level),
    )
    conn.commit()
    conn.close()
