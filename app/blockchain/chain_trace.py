"""
chain_trace.py — Stage 2: Simulated Blockchain Fraud Registry + Mule
Chain Graph Traversal

============================================================
SIMULATED FOR DEMO — real Ethereum/Polygon smart contract is on the
roadmap (see README). This build simulates the registry logic in
Python using a dict/JSON as the fraud registry and a simple adjacency
list for mule chain graph traversal.
============================================================

WHAT: Maintains a simulated decentralized fraud registry and traces
whether a UPI ID connects to known mule chains (A→B→C→D style graph).

WHY: In real UPI fraud, money moves through chains of mule accounts.
Tracing these chains is critical for cyber police investigation.
"""

# ── SIMULATED FRAUD REGISTRY ───────────────────────────────────────
# In production, this would be on-chain (Ethereum/Polygon smart contract).
FRAUD_REGISTRY = {
    "lucky99@upi": {
        "flagged_at": "2025-09-10T14:32:00Z",
        "risk_level": "HIGH",
        "evidence_hash": "sha256:a3f4b2c1d5e6f7890abcdef1234567890abcdef1234567890abcdef12345678",
        "reporter": "nagpur_cyber_police",
    },
    "quickcash99@ybl": {
        "flagged_at": "2025-09-11T09:15:00Z",
        "risk_level": "HIGH",
        "evidence_hash": "sha256:b4e5c3d2f6a7b8901bcdef2345678901bcdef2345678901bcdef2345678901",
        "reporter": "crowdsourced_reports",
    },
    "mule.acct1@upi": {
        "flagged_at": "2025-09-12T11:00:00Z",
        "risk_level": "MEDIUM",
        "evidence_hash": "sha256:c5f6d4e3a7b8c9012cdef3456789012cdef3456789012cdef3456789012345",
        "reporter": "chain_analysis",
    },
    "mule.acct2@paytm": {
        "flagged_at": "2025-09-12T11:05:00Z",
        "risk_level": "MEDIUM",
        "evidence_hash": "sha256:d6a7e5f4b8c9d0123def4567890123def4567890123def4567890123456789",
        "reporter": "chain_analysis",
    },
    "seller.fraud@upi": {
        "flagged_at": "2025-09-13T16:30:00Z",
        "risk_level": "HIGH",
        "evidence_hash": "sha256:e7b8f6a5c9d0e1234ef5678901234ef5678901234ef5678901234567890abc",
        "reporter": "crowdsourced_reports",
    },
    "loanagent@paytm": {
        "flagged_at": "2025-09-14T08:20:00Z",
        "risk_level": "HIGH",
        "evidence_hash": "sha256:f8c9a7b6d0e1f2345fa6789012345fa6789012345fa6789012345678901bcd",
        "reporter": "nagpur_cyber_police",
    },
}

# ── SIMULATED MULE CHAIN GRAPH ─────────────────────────────────────
# Adjacency list: UPI ID → list of UPI IDs it sent money to.
MULE_CHAINS = {
    "lucky99@upi":       ["mule.acct1@upi", "quickcash99@ybl"],
    "mule.acct1@upi":    ["mule.acct2@paytm"],
    "mule.acct2@paytm":  ["cashout.final@ybl"],
    "quickcash99@ybl":   ["seller.fraud@upi"],
    "seller.fraud@upi":  ["loanagent@paytm"],
    "loanagent@paytm":   ["mule.acct1@upi"],
    # newdeal@paytm: weak 1-hop connection → moderate chain_score
    "newdeal@paytm":     ["suspicious.unknown@ybl"],
    # vaishnavi@okaxis: intentionally NOT in the graph → SAFE
}


def check_fraud_registry(upi_id: str) -> dict:
    """Checks if a UPI ID exists in the simulated blockchain fraud registry."""
    upi_id = upi_id.lower().strip()
    entry = FRAUD_REGISTRY.get(upi_id)
    return {
        "in_registry": entry is not None,
        "registry_entry": entry,
    }


def trace_mule_chain(upi_id: str, max_depth: int = 5) -> list:
    """
    BFS traversal of the mule chain graph. Returns the ordered list of
    hops (the chain trace). Max depth prevents infinite loops.
    """
    upi_id = upi_id.lower().strip()
    if upi_id not in MULE_CHAINS:
        return []

    visited = set()
    chain = [upi_id]
    queue = [upi_id]
    visited.add(upi_id)
    depth = 0

    while queue and depth < max_depth:
        next_queue = []
        for node in queue:
            neighbors = MULE_CHAINS.get(node, [])
            for neighbor in neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    chain.append(neighbor)
                    next_queue.append(neighbor)
        queue = next_queue
        depth += 1

    return chain


def compute_chain_score(upi_id: str) -> dict:
    """
    Computes Stage 2 chain_score by combining fraud registry lookup
    and mule chain traversal.

    SCORING (0-100, higher = safer):
      - Not in registry AND no chain → 100
      - Not in registry BUT has chain → 60 - (hops * 10), min 20
      - In registry AND no chain → 20
      - In registry AND has chain → 15 - depth, min 5
    """
    upi_id = upi_id.lower().strip()

    registry_check = check_fraud_registry(upi_id)
    chain_trace = trace_mule_chain(upi_id)
    chain_depth = max(0, len(chain_trace) - 1)

    in_registry = registry_check["in_registry"]
    has_chain = chain_depth > 0

    if not in_registry and not has_chain:
        chain_score = 100
    elif not in_registry and has_chain:
        chain_score = max(20, 60 - (chain_depth * 10))
    elif in_registry and not has_chain:
        chain_score = 20
    else:
        chain_score = max(5, 15 - chain_depth)

    return {
        "chain_score": float(chain_score),
        "registry_check": registry_check,
        "chain_trace": chain_trace,
        "chain_depth": chain_depth,
    }
