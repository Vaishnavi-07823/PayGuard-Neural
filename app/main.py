"""
main.py — Flask Application for PayGuard-Neural Backend

WHAT: The main Flask web server that:
  1. Serves the existing static HTML pages (index.html, login, etc.)
  2. Exposes the API endpoints for the risk scoring pipeline
  3. Initializes the SQLite database on startup

ENDPOINTS:
  POST /api/check-transaction  — Full 3-stage scoring pipeline
  POST /api/report-fraud       — Add a crowdsourced fraud report
  GET  /api/health             — Health check

WHY Flask: Lightweight, serves both HTML pages and API from one process.
"""

import os
import sys

APP_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, APP_DIR)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(os.path.join(APP_DIR, "..", ".env"))

from database import init_db, log_transaction, add_fraud_report
from risk_engine.scorer import compute_risk_engine_score
from blockchain.chain_trace import compute_chain_score
from ai_explainer import generate_explanation

# ── Flask App Setup ──────────────────────────────────────────────
app = Flask(
    __name__,
    static_folder=os.path.join(APP_DIR, "..", "static"),
    static_url_path="/static",
)
CORS(app)

# Initialize Database on Startup
init_db()

PROJECT_ROOT = os.path.join(APP_DIR, "..")


@app.route("/")
def serve_index():
    """Serves the existing index.html landing page."""
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.route("/<path:filename>")
def serve_static_files(filename):
    """Serves other static files (CSS, images, HTML pages)."""
    filepath = os.path.join(PROJECT_ROOT, filename)
    if os.path.isfile(filepath):
        return send_from_directory(PROJECT_ROOT, filename)
    return jsonify({"error": "Not found"}), 404


# ── API Endpoints ───────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health_check():
    """GET /api/health — Returns {"status": "ok"}."""
    return jsonify({"status": "ok"})


@app.route("/api/check-transaction", methods=["POST"])
def check_transaction():
    """
    POST /api/check-transaction
    Body: { "upi_id": "<string>" }

    Runs the full 3-stage pipeline:
      Stage 1: Risk Analysis Engine (DB + ML)
      Stage 2: Blockchain Fraud Check + Chain Trace
      Combine: 70% risk_engine + 30% chain → final_score
      Stage 3: Claude AI Explainer

    Risk Classification (from README):
      80-100 → SAFE, 40-79 → CAUTION, 0-39 → HIGH_RISK
    """
    data = request.get_json(force=True, silent=True)
    if not data or "upi_id" not in data:
        return jsonify({"error": "Missing 'upi_id' in request body"}), 400

    upi_id = data["upi_id"].strip()
    if not upi_id:
        return jsonify({"error": "'upi_id' cannot be empty"}), 400

    # Stage 1
    risk_result = compute_risk_engine_score(upi_id)
    risk_engine_score = risk_result["risk_engine_score"]

    # Stage 2
    chain_result = compute_chain_score(upi_id)
    chain_score = chain_result["chain_score"]

    # Combine: 70% risk engine, 30% chain
    final_score = round(risk_engine_score * 0.7 + chain_score * 0.3, 1)

    # Classify
    if final_score >= 80:
        risk_level = "SAFE"
    elif final_score >= 40:
        risk_level = "CAUTION"
    else:
        risk_level = "HIGH_RISK"

    # Build breakdown for AI explainer
    full_breakdown = {
        "risk_engine_score": risk_engine_score,
        "chain_score": chain_score,
        "db_result": risk_result.get("db_result", {}),
        "ml_result": risk_result.get("ml_result", {}),
        "chain_trace": chain_result.get("chain_trace", []),
        "chain_depth": chain_result.get("chain_depth", 0),
        "registry_check": chain_result.get("registry_check", {}),
    }

    # Stage 3: AI Explanation
    explanation = generate_explanation(upi_id, final_score, risk_level, full_breakdown)

    # Log transaction
    log_transaction(upi_id, final_score, risk_level)

    # Build response
    response = {
        "upi_id": upi_id,
        "final_score": final_score,
        "risk_level": risk_level,
        "breakdown": {
            "risk_engine_score": risk_engine_score,
            "chain_score": chain_score,
        },
        "explanation": explanation,
    }

    if risk_level == "HIGH_RISK" and chain_result.get("chain_trace"):
        response["chain_trace"] = chain_result["chain_trace"]

    return jsonify(response)


@app.route("/api/report-fraud", methods=["POST"])
def report_fraud():
    """
    POST /api/report-fraud
    Body: { "upi_id": "<string>", "reason": "<string>" }
    Adds/increments a crowdsourced fraud report.
    """
    data = request.get_json(force=True, silent=True)
    if not data or "upi_id" not in data:
        return jsonify({"error": "Missing 'upi_id' in request body"}), 400

    upi_id = data["upi_id"].strip()
    reason = data.get("reason", "").strip()

    if not upi_id:
        return jsonify({"error": "'upi_id' cannot be empty"}), 400

    add_fraud_report(upi_id, reason)

    return jsonify({
        "status": "reported",
        "upi_id": upi_id,
        "message": f"Fraud report for {upi_id} has been recorded. Thank you for helping protect the community."
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"""
    ╔═══════════════════════════════════════════════╗
    ║   PayGuard-Neural Backend Started             ║
    ║   Server: http://localhost:{port}                ║
    ║   Open index.html at: http://localhost:{port}/   ║
    ╚═══════════════════════════════════════════════╝
    """)
    app.run(host="0.0.0.0", port=port, debug=True)
