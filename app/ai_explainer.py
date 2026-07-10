"""
ai_explainer.py — Stage 3: Claude AI Explainer

WHAT: Calls Claude API (claude-sonnet-4-6) to generate a plain-language
explanation of why the UPI ID received its risk score.

REAL COMPONENT: This is a REAL API call to Anthropic's Claude API —
not simulated. If ANTHROPIC_API_KEY is missing, falls back to a static
message — never crashes.
"""

import os


def generate_explanation(upi_id: str, final_score: float, risk_level: str, breakdown: dict) -> str:
    """
    Generates a plain-language AI explanation for the risk score.
    Falls back to a static message if API key is missing or call fails.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()

    if not api_key:
        return _generate_fallback_explanation(upi_id, final_score, risk_level, breakdown)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        prompt = _build_prompt(upi_id, final_score, risk_level, breakdown)

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=250,
            messages=[{"role": "user", "content": prompt}],
        )

        return message.content[0].text.strip()

    except Exception as e:
        print(f"[AI Explainer] Claude API error: {e}")
        return _generate_fallback_explanation(upi_id, final_score, risk_level, breakdown)


def _build_prompt(upi_id: str, final_score: float, risk_level: str, breakdown: dict) -> str:
    """Builds the context-rich prompt sent to Claude."""
    risk_engine_score = breakdown.get("risk_engine_score", "N/A")
    chain_score = breakdown.get("chain_score", "N/A")
    db_result = breakdown.get("db_result", {})
    report_count = db_result.get("report_count", 0)
    found_in_db = db_result.get("found_in_db", False)
    chain_trace = breakdown.get("chain_trace", [])
    chain_depth = breakdown.get("chain_depth", 0)
    in_registry = breakdown.get("registry_check", {}).get("in_registry", False)
    ml_result = breakdown.get("ml_result", {})
    ml_score = ml_result.get("ml_score", "N/A")

    return f"""You are a fraud risk explainer for PayGuard-Neural, a UPI payment safety system in India.

A user just checked UPI ID: {upi_id}

Scoring results:
- Final Safety Score: {final_score}/100
- Risk Level: {risk_level}
- Risk Engine Score (DB + ML): {risk_engine_score}/100
  - Community fraud reports found: {report_count}
  - Found in fraud database: {found_in_db}
  - ML behavioral score: {ml_score}/100
- Blockchain Chain Score: {chain_score}/100
  - In fraud registry: {in_registry}
  - Mule chain depth: {chain_depth} hops
  - Chain trace: {' → '.join(chain_trace) if chain_trace else 'None'}

Write a 2-3 sentence plain-language explanation for an everyday user (non-technical).
Tell them what the score means, what specific red flags (or green flags) were found,
and what they should do. Be direct and actionable. Do not use technical jargon.
Do not mention "ML model" or "Random Forest" — just say "our analysis" or "our system".
Keep it under 60 words."""


def _generate_fallback_explanation(upi_id: str, final_score: float, risk_level: str, breakdown: dict) -> str:
    """
    Static fallback when Claude API key is missing or call fails.
    The system NEVER crashes — scores are still accurate.
    """
    db_result = breakdown.get("db_result", {})
    report_count = db_result.get("report_count", 0)
    chain_trace = breakdown.get("chain_trace", [])

    if risk_level == "HIGH_RISK":
        base = f"⚠️ High risk detected for {upi_id}."
        if report_count > 0:
            base += f" This UPI ID has {report_count} community fraud report(s)."
        if len(chain_trace) > 1:
            base += f" It appears in a fraud chain with {len(chain_trace) - 1} linked account(s)."
        base += " We strongly recommend NOT proceeding with this payment."
    elif risk_level == "CAUTION":
        base = f"⚡ Moderate risk detected for {upi_id}."
        if report_count > 0:
            base += f" Found {report_count} unverified community report(s)."
        base += " Verify the receiver's identity before sending money."
    else:
        base = f"✅ {upi_id} appears safe based on our checks."
        base += " No fraud reports or suspicious chain activity found. Safe to proceed, but always verify large payments."

    base += "\n\n(AI explanation unavailable — API key not configured. Score and risk level are still accurate.)"
    return base
