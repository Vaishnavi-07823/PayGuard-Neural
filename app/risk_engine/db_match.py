"""
db_match.py — Stage 1a: Database / Crowdsourced Fraud Lookup

WHAT: Looks up a UPI ID in the fraud_reports SQLite table and converts
the report_count into a sub-score (0-100). Higher report_count means
a LOWER score (more dangerous).

WHY: Community-reported fraud data is one of the strongest real-world
signals. This mirrors how Truecaller's spam database works — one user's
report protects everyone.

SCORING LOGIC:
  - 0 reports  → score = 100 (no community evidence of fraud)
  - 1-2 reports → score = 65  (some reports, inconclusive)
  - 3-5 reports → score = 35  (multiple independent reports)
  - 6-10 reports → score = 15  (strong community consensus)
  - 11+ reports → score = 5   (overwhelmingly flagged)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import lookup_fraud_reports


def get_db_match_score(upi_id: str) -> dict:
    """
    Checks the fraud_reports database for the given UPI ID.

    Returns:
        dict with keys:
            - db_score (int, 0-100): Higher = safer
            - report_count (int): Number of community reports found
            - found_in_db (bool): Whether the UPI ID exists in our DB
            - source (str|None): 'crowdsourced' or 'seed_demo'
    """
    upi_id = upi_id.lower().strip()
    result = lookup_fraud_reports(upi_id)

    if result is None:
        return {
            "db_score": 100,
            "report_count": 0,
            "found_in_db": False,
            "source": None,
        }

    report_count = result["report_count"]

    if report_count == 0:
        db_score = 100
    elif report_count <= 2:
        db_score = 65
    elif report_count <= 5:
        db_score = 35
    elif report_count <= 10:
        db_score = 15
    else:
        db_score = 5

    return {
        "db_score": db_score,
        "report_count": report_count,
        "found_in_db": True,
        "source": result.get("source"),
    }
