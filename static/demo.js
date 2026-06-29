/**
 * demo.js — Connects the existing "Check now" button on the landing page
 * to the real PayGuard-Neural backend API.
 *
 * WHAT: On button click, sends a POST request to /api/check-transaction
 * with the typed UPI ID, then renders the response (score, colored badge,
 * AI explanation, optional chain trace) into the existing result area.
 *
 * WHY: The index.html already has the demo UI with input box, meter bar,
 * score display, and AI explanation area — this script makes it functional
 * by connecting to the real backend instead of using hardcoded demo data.
 */

// API base URL — when served by Flask, it's the same origin.
// Change this if the backend runs on a different port during development.
const API_BASE = window.location.origin;

/**
 * Overrides the existing runDemo() function to call the real backend API.
 * The original runDemo() in index.html uses hardcoded data — this replaces
 * it with real API calls while keeping the exact same visual behavior.
 */
async function runDemo() {
  const input = document.getElementById("demo-input");
  const upiId = input.value.trim();

  if (!upiId) {
    // Shake the input to indicate it's required
    input.style.borderColor = "#E24B4A";
    setTimeout(() => (input.style.borderColor = ""), 800);
    return;
  }

  // ── Show loading state ────────────────────────────────────────
  const scoreEl = document.getElementById("demo-score");
  const pillEl = document.getElementById("demo-pill");
  const aiEl = document.getElementById("demo-ai");
  const fillEl = document.getElementById("demo-fill");

  scoreEl.textContent = "...";
  scoreEl.style.color = "var(--text-muted)";
  pillEl.textContent = "Analyzing...";
  pillEl.style.background = "var(--bg2)";
  pillEl.style.color = "var(--text-muted)";
  aiEl.textContent = "Running risk analysis engine, blockchain check, and AI explainer...";
  fillEl.style.width = "0%";
  fillEl.style.background = "var(--purple)";

  // Animate the meter bar while loading
  setTimeout(() => {
    fillEl.style.width = "60%";
  }, 100);

  try {
    // ── Call the real backend API ──────────────────────────────
    const response = await fetch(`${API_BASE}/api/check-transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upi_id: upiId }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();

    // ── Map risk_level to visual styles ────────────────────────
    // Matches the existing CSS variables in index.html
    const styles = {
      HIGH_RISK: {
        color: "#A32D2D",
        fill: "#E24B4A",
        label: "🔴 High Risk",
        lbg: "#FCEBEB",
        lcol: "#A32D2D",
      },
      CAUTION: {
        color: "#854F0B",
        fill: "#EF9F27",
        label: "🟡 Caution",
        lbg: "#FAEEDA",
        lcol: "#854F0B",
      },
      SAFE: {
        color: "#3B6D11",
        fill: "#639922",
        label: "🟢 Safe",
        lbg: "#EAF3DE",
        lcol: "#3B6D11",
      },
    };

    const s = styles[data.risk_level] || styles.SAFE;

    // ── Render the results ────────────────────────────────────
    scoreEl.textContent = `${data.final_score}/100`;
    scoreEl.style.color = s.color;

    fillEl.style.width = `${data.final_score}%`;
    fillEl.style.background = s.fill;

    pillEl.textContent = s.label;
    pillEl.style.background = s.lbg;
    pillEl.style.color = s.lcol;

    // Build explanation text
    let explanationText = data.explanation || "";

    // If HIGH_RISK and chain_trace exists, append it
    if (data.risk_level === "HIGH_RISK" && data.chain_trace && data.chain_trace.length > 1) {
      explanationText += `\n\n🔗 Fraud chain traced: ${data.chain_trace.join(" → ")}`;
    }

    // Show breakdown scores
    if (data.breakdown) {
      explanationText += `\n\n📊 Risk Engine: ${data.breakdown.risk_engine_score}/100 · Blockchain: ${data.breakdown.chain_score}/100`;
    }

    aiEl.textContent = explanationText;

  } catch (error) {
    // ── Handle errors gracefully ──────────────────────────────
    console.error("PayGuard API error:", error);

    scoreEl.textContent = "--";
    scoreEl.style.color = "var(--text-muted)";
    fillEl.style.width = "0%";
    pillEl.textContent = "Error";
    pillEl.style.background = "#FCEBEB";
    pillEl.style.color = "#A32D2D";
    aiEl.textContent =
      "⚠️ Could not connect to PayGuard-Neural backend. Make sure the Flask server is running (python app/main.py). " +
      "Error: " + error.message;
  }
}

// Re-attach the Enter key listener (the original one in index.html
// calls the old runDemo — this override replaces it)
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("demo-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runDemo();
    });
  }
});
