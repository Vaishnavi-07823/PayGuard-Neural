"""
main.py — Flask Application for PayGuard-Neural Backend (RBAC Edition)

ENDPOINTS (Public):
  POST /api/check-transaction    — Full 3-stage scoring pipeline
  POST /api/report-fraud         — Crowdsourced fraud report
  GET  /api/health               — Health check

ENDPOINTS (Protected — require Firebase ID token in Authorization header):
  POST /api/police/verify-allowlist  — Sets role=police if email on allowlist
  POST /api/admin/verify             — Returns {is_admin:true} for admins
  POST /api/kyc/submit               — User submits KYC (role=user)
  POST /api/kyc/review               — Admin approves/rejects KYC (role=admin)
  POST /api/transactions/override    — Admin overrides caution transaction (role=admin)
  POST /api/admin/blacklist-view     — Admin reads blacklist (role=admin, read-only)
  GET  /api/admin/transactions       — Admin views all transactions (role=admin)
  GET  /api/admin/kyc-queue          — Admin views pending KYC submissions (role=admin)
"""

import os
import sys
from functools import wraps

APP_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, APP_DIR)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

load_dotenv(os.path.join(APP_DIR, "..", ".env"))

from database import init_db, log_transaction, add_fraud_report
from risk_engine.scorer import compute_risk_engine_score
from blockchain.chain_trace import compute_chain_score
from ai_explainer import generate_explanation

# Firebase Admin (optional — graceful degradation if key not present)
try:
    from firebase_admin_init import (
        verify_firebase_token,
        get_user_role,
        check_police_allowlist,
        set_user_role,
        get_firestore_db,
        _initialized as firebase_ready
    )
except Exception as _fe:
    firebase_ready = False
    print(f"[Firebase Admin] Could not import: {_fe}")

# ── Flask App Setup ──────────────────────────────────────────────
app = Flask(
    __name__,
    static_folder=os.path.join(APP_DIR, "..", "static"),
    static_url_path="/static",
)
CORS(app)

init_db()

PROJECT_ROOT = os.path.join(APP_DIR, "..")


# ── RBAC Middleware ──────────────────────────────────────────────

def verify_role(*allowed_roles):
    """
    Decorator factory for role-based access control.
    Usage: @verify_role("admin") or @verify_role("admin", "police")

    Extracts the Bearer token from the Authorization header,
    verifies it with Firebase Admin SDK, then checks the user's
    role in Firestore. Role is NEVER trusted from the client body.
    Returns 401/403/503 on failure.
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if not firebase_ready:
                return jsonify({
                    "error": "Firebase Admin SDK not initialized. "
                             "Place serviceAccountKey.json in the app/ directory."
                }), 503

            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid Authorization header."}), 401

            token = auth_header.split(" ", 1)[1]
            try:
                decoded = verify_firebase_token(token)
            except ValueError as e:
                return jsonify({"error": str(e)}), 401

            uid  = decoded["uid"]
            role = get_user_role(uid)

            if role not in allowed_roles:
                return jsonify({
                    "error": f"Access denied. Required: {allowed_roles}. Your role: {role}"
                }), 403

            # Attach to request context so route handlers can use it
            request.firebase_uid  = uid
            request.firebase_role = role
            request.firebase_email = decoded.get("email", "")
            return f(*args, **kwargs)
        return wrapped
    return decorator


# ── Static File Serving ──────────────────────────────────────────

@app.route("/")
def serve_index():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.route("/<path:filename>")
def serve_static_files(filename):
    filepath = os.path.join(PROJECT_ROOT, filename)
    if os.path.isfile(filepath):
        return send_from_directory(PROJECT_ROOT, filename)
    return jsonify({"error": "Not found"}), 404


# ── Public API Endpoints ─────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "firebase_admin": firebase_ready
    })


@app.route("/api/dashboard-stats", methods=["GET"])
def dashboard_stats():
    """
    GET /api/dashboard-stats
    Returns aggregate counts from the in-memory pending_transactions store
    and the MongoDB transactions_log (if available).
    """
    total_scanned   = 0
    high_risk_blocked = 0
    fraud_prevented_amount = 0.0

    # Aggregate from in-memory pending_transactions
    for txn in pending_transactions.values():
        total_scanned += 1
        if txn.get("risk_level") == "HIGH_RISK" or txn.get("status") == "blocked":
            high_risk_blocked += 1
            fraud_prevented_amount += float(txn.get("amount", 0))

    # Also try to pull from MongoDB transactions_log for persistence across restarts
    try:
        from database import get_db
        dbm = get_db()
        log_docs = list(dbm["transactions_log"].find({}, {"_id": 0}))
        total_scanned += len(log_docs)
        for doc in log_docs:
            if doc.get("risk_level") == "HIGH_RISK":
                high_risk_blocked += 1
                # log_transaction doesn't store amount, so we can't sum it here
    except Exception:
        pass  # MongoDB not available — use in-memory only

    return jsonify({
        "total_scanned":          total_scanned,
        "high_risk_blocked":      high_risk_blocked,
        "fraud_prevented_amount": round(fraud_prevented_amount, 2)
    })


@app.route("/api/transactions/recent", methods=["GET"])
def recent_transactions():
    """
    GET /api/transactions/recent
    Returns the last 5 transactions from the in-memory pending_transactions store,
    newest first. Falls back to MongoDB transactions_log for older entries.
    """
    results = []

    # Collect from in-memory store (already have full detail)
    for txn in pending_transactions.values():
        results.append({
            "transaction_id": txn.get("transaction_id"),
            "sender_upi":     txn.get("sender_upi", "-"),
            "receiver_upi":   txn.get("receiver_upi", "-"),
            "amount":         txn.get("amount", 0),
            "risk_level":     txn.get("risk_level", "-"),
            "status":         txn.get("status", "-"),
            "created_at":     txn.get("created_at", ""),
        })

    # Sort newest first
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    # If we have fewer than 5, pad with MongoDB log entries (no amount stored there)
    if len(results) < 5:
        try:
            from database import get_db
            dbm = get_db()
            log_docs = list(
                dbm["transactions_log"]
                .find({}, {"_id": 0})
                .sort("created_at", -1)
                .limit(5 - len(results))
            )
            for doc in log_docs:
                results.append({
                    "transaction_id": doc.get("transaction_id", "-"),
                    "sender_upi":     doc.get("sender_upi", "-"),
                    "receiver_upi":   doc.get("upi_id", doc.get("receiver_upi", "-")),
                    "amount":         doc.get("amount", None),
                    "risk_level":     doc.get("risk_level", "-"),
                    "status":         doc.get("status", "logged"),
                    "created_at":     doc.get("created_at", ""),
                })
        except Exception:
            pass  # MongoDB not available

    return jsonify({"transactions": results[:5]})


@app.route("/api/check-transaction", methods=["POST"])
def check_transaction():
    """
    POST /api/check-transaction
    Body: { "upi_id": "<string>" }
    Public endpoint — no auth required.
    """
    data = request.get_json(force=True, silent=True)
    if not data or "upi_id" not in data:
        return jsonify({"error": "Missing 'upi_id' in request body"}), 400

    upi_id = data["upi_id"].strip()
    if not upi_id:
        return jsonify({"error": "'upi_id' cannot be empty"}), 400

    # Stage 1 — ML Risk Engine
    risk_result       = compute_risk_engine_score(upi_id)
    risk_engine_score = risk_result["risk_engine_score"]

    # Stage 2 — Blockchain Chain Score
    chain_result = compute_chain_score(upi_id)
    chain_score  = chain_result["chain_score"]

    # Combine: 70% risk engine, 30% chain
    final_score = round(risk_engine_score * 0.7 + chain_score * 0.3, 1)

    if final_score >= 80:
        risk_level = "SAFE"
    elif final_score >= 40:
        risk_level = "CAUTION"
    else:
        risk_level = "HIGH_RISK"

    full_breakdown = {
        "risk_engine_score": risk_engine_score,
        "chain_score":       chain_score,
        "db_result":         risk_result.get("db_result", {}),
        "ml_result":         risk_result.get("ml_result", {}),
        "chain_trace":       chain_result.get("chain_trace", []),
        "chain_depth":       chain_result.get("chain_depth", 0),
        "registry_check":    chain_result.get("registry_check", {}),
    }

    explanation = generate_explanation(upi_id, final_score, risk_level, full_breakdown)
    log_transaction(upi_id, final_score, risk_level)

    response = {
        "upi_id":      upi_id,
        "final_score": final_score,
        "risk_level":  risk_level,
        "breakdown":   {
            "risk_engine_score": risk_engine_score,
            "chain_score":       chain_score,
        },
        "explanation": explanation,
    }

    if risk_level == "HIGH_RISK" and chain_result.get("chain_trace"):
        response["chain_trace"] = chain_result["chain_trace"]

    return jsonify(response)


# In-memory store for pending transactions
pending_transactions = {}

@app.route("/api/initiate-transaction", methods=["POST"])
def initiate_transaction():
    """
    POST /api/initiate-transaction
    Body: { "sender_upi": "<string>", "receiver_upi": "<string>", "amount": <number> }
    """
    data = request.get_json(force=True, silent=True)
    if not data or "sender_upi" not in data or "receiver_upi" not in data or "amount" not in data:
        return jsonify({"error": "Missing required fields: sender_upi, receiver_upi, amount"}), 400

    sender_upi = data["sender_upi"].strip()
    receiver_upi = data["receiver_upi"].strip()
    try:
        amount = float(data["amount"])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount"}), 400

    if not sender_upi or not receiver_upi:
        return jsonify({"error": "sender_upi and receiver_upi cannot be empty"}), 400

    # Stage 1 — ML Risk Engine
    risk_result       = compute_risk_engine_score(receiver_upi)
    risk_engine_score = risk_result["risk_engine_score"]

    # Stage 2 — Blockchain Chain Score
    chain_result = compute_chain_score(receiver_upi)
    chain_score  = chain_result["chain_score"]

    # Combine: 70% risk engine, 30% chain
    final_score = round(risk_engine_score * 0.7 + chain_score * 0.3, 1)

    if final_score >= 80:
        risk_level = "SAFE"
    elif final_score >= 40:
        risk_level = "CAUTION"
    else:
        risk_level = "HIGH_RISK"

    # Compute full breakdown and explanation
    full_breakdown = {
        "risk_engine_score": risk_engine_score,
        "chain_score":       chain_score,
        "db_result":         risk_result.get("db_result", {}),
        "ml_result":         risk_result.get("ml_result", {}),
        "chain_trace":       chain_result.get("chain_trace", []),
        "chain_depth":       chain_result.get("chain_depth", 0),
        "registry_check":    chain_result.get("registry_check", {}),
    }
    explanation = generate_explanation(receiver_upi, final_score, risk_level, full_breakdown)

    # Log in DB
    log_transaction(receiver_upi, final_score, risk_level)

    if risk_level == "HIGH_RISK":
        return jsonify({
            "status": "blocked",
            "message": "Payment not possible, try after 2 hrs",
            "transaction_id": None,
            "risk_level": risk_level,
            "final_score": final_score,
            "breakdown": {
                "risk_engine_score": risk_engine_score,
                "chain_score": chain_score
            },
            "explanation": explanation
        })

    import uuid
    transaction_id = str(uuid.uuid4())

    pending_transactions[transaction_id] = {
        "transaction_id": transaction_id,
        "sender_upi":     sender_upi,
        "receiver_upi":   receiver_upi,
        "amount":         amount,
        "risk_level":     risk_level,
        "final_score":    final_score,
        "status":         "pending_decision",
        "created_at":     datetime.utcnow().isoformat(),
        "breakdown": {
            "risk_engine_score": risk_engine_score,
            "chain_score": chain_score
        },
        "explanation": explanation
    }

    return jsonify({
        "status":         "pending_decision",
        "transaction_id": transaction_id,
        "risk_level":     risk_level,
        "final_score":    final_score,
        "breakdown": {
            "risk_engine_score": risk_engine_score,
            "chain_score": chain_score
        },
        "explanation": explanation
    })


@app.route("/api/transaction/<transaction_id>", methods=["GET"])
def get_transaction(transaction_id):
    """
    GET /api/transaction/<transaction_id>
    """
    if transaction_id not in pending_transactions:
        return jsonify({"error": "Transaction not found"}), 404
    return jsonify(pending_transactions[transaction_id])


@app.route("/api/transaction/<transaction_id>/decide", methods=["POST"])
def decide_transaction(transaction_id):
    """
    POST /api/transaction/<transaction_id>/decide
    Body: { "decision": "accept"|"decline" }
    """
    if transaction_id not in pending_transactions:
        return jsonify({"error": "Transaction not found"}), 404

    data = request.get_json(force=True, silent=True)
    if not data or "decision" not in data:
        return jsonify({"error": "Missing 'decision' in request body"}), 400

    decision = data["decision"].strip().lower()
    if decision not in ("accept", "decline"):
        return jsonify({"error": "Invalid decision. Must be 'accept' or 'decline'"}), 400

    status = "accepted" if decision == "accept" else "declined"
    pending_transactions[transaction_id]["status"] = status
    pending_transactions[transaction_id]["decided_at"] = datetime.utcnow().isoformat()

    return jsonify({
        "transaction_id": transaction_id,
        "status": status,
        "transaction": pending_transactions[transaction_id]
    })


@app.route("/api/report-fraud", methods=["POST"])
def report_fraud():
    """
    POST /api/report-fraud
    Body: { "upi_id": "<string>", "reason": "<string>" }
    Public — also used by the Police Blacklist portal.
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
        "status":  "reported",
        "upi_id":  upi_id,
        "message": f"Fraud report for {upi_id} has been recorded."
    })


# ── Police Endpoints ─────────────────────────────────────────────

@app.route("/api/police/verify-allowlist", methods=["POST"])
def police_verify_allowlist():
    """
    POST /api/police/verify-allowlist
    Authorization: Bearer <firebase-id-token>

    Checks if the signed-in user's email is in the police_allowlist
    Firestore collection. If yes, sets their role to "police" server-side.
    Returns { is_officer: true|false }.
    """
    if not firebase_ready:
        return jsonify({"error": "Firebase Admin not initialized."}), 503

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing Authorization header."}), 401

    token = auth_header.split(" ", 1)[1]
    try:
        decoded = verify_firebase_token(token)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    uid   = decoded["uid"]
    email = decoded.get("email", "")

    is_officer = check_police_allowlist(email)

    if is_officer:
        # Upgrade role to "police" in Firestore (server-side only)
        set_user_role(uid, "police")

    return jsonify({"is_officer": is_officer, "email": email})


# ── Admin Endpoints ──────────────────────────────────────────────

@app.route("/api/admin/verify", methods=["POST"])
def admin_verify():
    """
    POST /api/admin/verify
    Authorization: Bearer <firebase-id-token>
    Verifies the caller has role=admin. Returns { is_admin: true|false }.
    """
    if not firebase_ready:
        return jsonify({"error": "Firebase Admin not initialized."}), 503

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing Authorization header."}), 401

    token = auth_header.split(" ", 1)[1]
    try:
        decoded = verify_firebase_token(token)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    role     = get_user_role(decoded["uid"])
    is_admin = role == "admin"
    return jsonify({"is_admin": is_admin})


@app.route("/api/admin/kyc-queue", methods=["GET"])
@verify_role("admin")
def admin_kyc_queue():
    """
    GET /api/admin/kyc-queue
    Returns all pending KYC submissions for admin review.
    """
    try:
        fdb   = get_firestore_db()
        docs  = fdb.collection("kyc_submissions").where("status", "==", "submitted").stream()
        queue = []
        for d in docs:
            entry = d.to_dict()
            entry["uid"] = d.id
            # Remove any sensitive binary fields before returning
            entry.pop("pan_file", None)
            entry.pop("aadhaar_file", None)
            queue.append(entry)
        return jsonify({"queue": queue, "count": len(queue)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/kyc/submit", methods=["POST"])
@verify_role("user")
def kyc_submit():
    """
    POST /api/kyc/submit
    Authorization: Bearer <firebase-id-token>  (role=user required)
    Body: { "pan": "...", "aadhaar": "...", "business_name": "...", "upi_id": "..." }
    Creates/updates a kyc_submissions/{uid} doc with status="submitted".
    """
    data    = request.get_json(force=True, silent=True) or {}
    uid     = request.firebase_uid
    try:
        fdb = get_firestore_db()
        fdb.collection("kyc_submissions").document(uid).set({
            "uid":           uid,
            "pan":           data.get("pan", ""),
            "aadhaar":       data.get("aadhaar", ""),
            "business_name": data.get("business_name", ""),
            "upi_id":        data.get("upi_id", ""),
            "status":        "submitted",
            "submitted_at":  datetime.utcnow().isoformat()
        }, merge=True)
        # Update user kycStatus to "submitted"
        fdb.collection("users").document(uid).update({"kycStatus": "submitted"})
        return jsonify({"status": "submitted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/kyc/review", methods=["POST"])
@verify_role("admin")
def kyc_review():
    """
    POST /api/kyc/review
    Authorization: Bearer <firebase-id-token>  (role=admin required)
    Body: { "target_uid": "...", "decision": "approved"|"rejected", "reason": "..." }
    Approves or rejects a KYC submission. Logs the admin action.
    """
    data       = request.get_json(force=True, silent=True) or {}
    target_uid = data.get("target_uid", "").strip()
    decision   = data.get("decision", "").strip()
    reason     = data.get("reason", "").strip()
    admin_uid  = request.firebase_uid

    if not target_uid or decision not in ("approved", "rejected"):
        return jsonify({"error": "target_uid and decision (approved|rejected) are required."}), 400

    try:
        fdb = get_firestore_db()
        # Update KYC submission
        fdb.collection("kyc_submissions").document(target_uid).update({
            "status":        decision,
            "reviewed_at":   datetime.utcnow().isoformat(),
            "reviewed_by":   admin_uid,
            "review_reason": reason
        })
        # Update user kycStatus
        fdb.collection("users").document(target_uid).update({"kycStatus": decision})
        # Audit log
        fdb.collection("admin_audit_log").add({
            "action":      f"kyc_{decision}",
            "admin_uid":   admin_uid,
            "target_uid":  target_uid,
            "reason":      reason,
            "timestamp":   datetime.utcnow().isoformat()
        })
        return jsonify({"status": "ok", "decision": decision, "target_uid": target_uid})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/transactions/override", methods=["POST"])
@verify_role("admin")
def transaction_override():
    """
    POST /api/transactions/override
    Authorization: Bearer <firebase-id-token>  (role=admin required)
    Body: { "transaction_id": "...", "decision": "approved"|"rejected", "reason": "..." }
    Admin manual override for CAUTION-zone transactions. Logs action.
    """
    data           = request.get_json(force=True, silent=True) or {}
    transaction_id = data.get("transaction_id", "").strip()
    decision       = data.get("decision", "").strip()
    reason         = data.get("reason", "").strip()
    admin_uid      = request.firebase_uid

    if not transaction_id or decision not in ("approved", "rejected"):
        return jsonify({
            "error": "transaction_id and decision (approved|rejected) are required."
        }), 400

    try:
        fdb = get_firestore_db()
        # Update the transaction override status
        fdb.collection("transaction_overrides").document(transaction_id).set({
            "transaction_id": transaction_id,
            "decision":       decision,
            "reason":         reason,
            "admin_uid":      admin_uid,
            "timestamp":      datetime.utcnow().isoformat()
        })
        # Audit log
        fdb.collection("admin_audit_log").add({
            "action":         f"txn_override_{decision}",
            "admin_uid":      admin_uid,
            "transaction_id": transaction_id,
            "reason":         reason,
            "timestamp":      datetime.utcnow().isoformat()
        })
        return jsonify({"status": "ok", "decision": decision})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/transactions", methods=["GET"])
@verify_role("admin")
def admin_transactions():
    """
    GET /api/admin/transactions
    Returns recent transactions from MongoDB transactions_log.
    Admin-only view.
    """
    from database import get_db
    try:
        dbm   = get_db()
        docs  = list(
            dbm["transactions_log"]
            .find({}, {"_id": 0})
            .sort("created_at", -1)
            .limit(50)
        )
        return jsonify({"transactions": docs})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("PayGuard-Neural Backend (RBAC Edition)")
    print(f"  Server : http://localhost:{port}/")
    print(f"  Health : http://localhost:{port}/api/health")
    print(f"  Firebase Admin: {'READY' if firebase_ready else 'NOT INITIALIZED (place serviceAccountKey.json in app/)'}")
    app.run(host="0.0.0.0", port=port, debug=True)
