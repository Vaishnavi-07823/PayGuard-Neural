"""
scorer.py — Stage 1 Combiner: Merges DB-match + ML-pattern into one
risk_engine_score.

WHAT: Takes the db_score (from community reports lookup) and ml_score
(from the Random Forest model) and produces a single risk_engine_score.

WHY: Neither signal alone is sufficient. Combining them gives a more
robust signal.

WEIGHTING: db_score 50%, ml_score 50% — both internally calibrated.
"""

from .db_match import get_db_match_score
from .ml_pattern import get_ml_score


def compute_risk_engine_score(upi_id: str) -> dict:
    """
    Computes the combined Stage 1 risk engine score.

    Returns:
        dict with keys:
            - risk_engine_score (float, 0-100): Combined score
            - db_result (dict): Full output from db_match
            - ml_result (dict): Full output from ml_pattern
    """
    db_result = get_db_match_score(upi_id)
    ml_result = get_ml_score(upi_id)

    risk_engine_score = round(
        db_result["db_score"] * 0.5 + ml_result["ml_score"] * 0.5,
        1
    )

    return {
        "risk_engine_score": risk_engine_score,
        "db_result": db_result,
        "ml_result": ml_result,
    }
