<div align="center">

# 🛡️ PayGuard-Neural

### AI-Powered Pre-Transaction Fraud Detection System

> *Inspired by real frozen-account UPI fraud cases observed during Cyber Forensic Internship at Nagpur Cyber Police Station.*

</div>

---

## 📌 Problem Statement

Every day, thousands of Indians fall victim to UPI fraud — and by the time they realize it, their accounts are frozen and funds are gone. Traditional fraud detection works **after** the transaction. PayGuard-Neural works **before** it.

This project addresses a critical gap in digital payment security: **pre-transaction risk assessment** that empowers users to make informed decisions before money leaves their account.

---

## 🎯 Key Features

| Feature | Description |
|--------|-------------|
| 🔢 **Safety Score Engine** | Real-time 0–100 risk scoring with Red / Yellow / Green classification |
| 🤖 **AI Risk Explanation** | Claude API explains *why* a transaction is risky in plain language |
| ⛓️ **Blockchain Fraud Registry** | Tamper-proof log of flagged UPI IDs with chain tracing |
| 🔍 **Chain Tracing** | Traces fraud across linked accounts to map mule networks |
| 📦 **Evidence Export** | Tamper-proof, court-admissible digital evidence packaging |
| 📊 **Real-time Dashboard** | Live fraud analytics and transaction risk monitoring |

---

## 🧠 How It Works

```
User initiates payment
        │
        ▼
┌─────────────────────────┐
│   Risk Analysis Engine  │  ← UPI ID history, amount, time, geolocation,
│   (Multi-factor check)  │    transaction velocity, behavioral patterns
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Blockchain Fraud Check │  ← Cross-references decentralized fraud registry
│  + Chain Trace          │    Traces if recipient is linked to known mules
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Claude AI Explainer   │  ← Generates human-readable risk explanation
│   (Anthropic API)       │    "This UPI ID was flagged 3 times in 48 hours..."
└────────────┬────────────┘
             │
             ▼
     Safety Score: 0–100
     🔴 High Risk  |  🟡 Medium  |  🟢 Safe
             │
             ▼
   User makes informed decision
   Evidence auto-exported if flagged
```

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **Tailwind CSS** — Responsive, modern UI
- **Recharts** — Risk analytics visualization
- **Lucide React** — Icon system

### Backend & AI
- **Claude API (Anthropic)** — AI-powered risk explanation & analysis
- **Node.js / Python** — Risk scoring microservice

### Blockchain Layer
- **Ethereum / Polygon** (planned) — Decentralized fraud registry
- **Smart Contracts (Solidity)** — Tamper-proof fraud record management
- **IPFS** — Distributed evidence storage

### Security
- **SHA-256 hashing** — Evidence integrity verification
- **Digital signatures** — Non-repudiation of flagged records
- **AES-256 encryption** — Sensitive data protection

---

## 📁 Project Structure

```
payguard-neural/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SafetyScoreGauge.jsx     # 0-100 animated score display
│   │   │   ├── RiskExplainer.jsx        # Claude AI explanation panel
│   │   │   ├── ChainTracer.jsx          # Fraud network visualization
│   │   │   ├── EvidenceExport.jsx       # Tamper-proof export module
│   │   │   └── FraudDashboard.jsx       # Analytics overview
│   │   ├── hooks/
│   │   │   ├── useRiskScore.js          # Risk calculation logic
│   │   │   └── useBlockchainRegistry.js # Fraud registry queries
│   │   └── utils/
│   │       ├── claudeAPI.js             # Anthropic API integration
│   │       └── evidenceHash.js          # SHA-256 evidence hashing
├── backend/
│   ├── risk_engine/
│   │   ├── scorer.py                    # Multi-factor risk scoring
│   │   └── velocity_check.py            # Transaction velocity analysis
│   └── blockchain/
│       ├── contracts/
│       │   └── FraudRegistry.sol        # Smart contract
│       └── scripts/
│           └── deploy.js
├── docs/
│   ├── architecture.md
│   ├── api_reference.md
│   └── evidence_format_spec.md
└── README.md
```

---

## 🚦 Safety Score System

```
Score Range    Classification    Action
──────────────────────────────────────────────────────
  80 – 100     🟢 SAFE           Transaction likely legitimate
  40 –  79     🟡 CAUTION        Review AI explanation before proceeding
   0 –  39     🔴 HIGH RISK      Strong advisory to abort transaction
```

### Risk Factors Analyzed
- UPI ID transaction history & complaint count
- Transaction amount vs. account behavior baseline
- Time-of-day anomaly detection
- Geolocation mismatch flags
- Transaction velocity (rapid successive transfers)
- Recipient account age & registration metadata
- Blockchain fraud registry cross-reference
- Mule network chain proximity score

---

## 🔗 Blockchain Fraud Registry

The decentralized fraud registry ensures:

- **Immutability** — Once a UPI ID is flagged, the record cannot be altered
- **Transparency** — Anyone can verify flagged accounts without central authority
- **Chain Tracing** — Maps how funds flow through mule accounts
- **Cross-platform** — Works across all UPI apps (GPay, PhonePe, Paytm, etc.)

```solidity
// FraudRegistry.sol (simplified)
struct FraudRecord {
    string upiId;
    uint256 flaggedAt;
    uint8 riskScore;
    string evidenceHash;    // IPFS hash of evidence bundle
    address reportedBy;
}

mapping(string => FraudRecord[]) public fraudHistory;
```

---

## 🖥️ Screenshots

> *(UI screenshots will be added as development progresses)*

| Safety Score View | Chain Trace | Evidence Export |
|:-----------------:|:-----------:|:---------------:|
| `[Coming Soon]`   | `[Coming Soon]` | `[Coming Soon]` |

---

##  Getting Started

### Prerequisites
```bash
Node.js >= 18.x
Python >= 3.10
Anthropic API Key
MetaMask (for blockchain features)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Vaishnavi-07823/payguard-neural.git
cd payguard-neural

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY and other configs to .env

# Start development server
npm run dev        # Frontend
python app.py      # Backend risk engine
```

---

## 🔐 Environment Variables

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=0x...
IPFS_GATEWAY=https://ipfs.io/ipfs/
ENCRYPTION_KEY=your_aes_key_here
```

---

## 🧪 Forensic Evidence Export

Each flagged transaction generates a tamper-proof evidence bundle:

```json
{
  "case_id": "PGN-2025-001",
  "timestamp": "2025-09-14T14:32:00Z",
  "upi_id": "suspect@paytm",
  "risk_score": 12,
  "classification": "HIGH_RISK",
  "ai_explanation": "This UPI ID was linked to 4 complaints in 72 hours...",
  "chain_trace": ["hop1@upi", "mule1@upi", "suspect@upi"],
  "evidence_hash": "sha256:a3f4b2c1...",
  "blockchain_tx": "0xabc123...",
  "export_format": "Court-Admissible / IT Act 2000 Compliant"
}
```

---

## 💡 Motivation & Real-World Context

This project was conceived during my internship at the **Nagpur Cyber Police Station** as a Cyber Forensic Intern, where I directly worked on:

-  APK static malware analysis
-  CCTV footage forensics
-  UPI fraud investigation & digital evidence handling

I witnessed firsthand how victims discover fraud only *after* the transaction — when accounts are frozen and recovery is nearly impossible. PayGuard-Neural is my attempt to shift the intervention point from **post-fraud recovery** to **pre-fraud prevention**.

---

##  Roadmap

- [x] Project architecture design
- [x] Risk scoring algorithm design
- [ ] React frontend — Safety Score UI
- [ ] Claude API integration — AI Explainer
- [ ] Risk engine backend (Python)
- [ ] Blockchain fraud registry (smart contract)
- [ ] Chain tracing visualization
- [ ] Evidence export module
- [ ] Mobile responsive design
- [ ] API documentation
- [ ] Pilot testing with synthetic fraud datasets

---

## 🤝 Contributing

This is a capstone project currently in active development. Contributions, suggestions, and feedback are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add: your feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

##  Author

**Vaishnavi Trivedi**
B.Tech Cybersecurity | GHRCE Nagpur
Cyber Forensic Intern | Nagpur Cyber Police Station
CEH v13 Trainee

[![LinkedIn](https://img.shields.io/badge/LinkedIn-vaishnavi--trivedi--cyber-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/vaishnavi-trivedi-cyber)
[![GitHub](https://img.shields.io/badge/GitHub-Vaishnavi--07823-181717?style=flat-square&logo=github)](https://github.com/Vaishnavi-07823)

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

*Built with ❤️ for a safer digital India*

**If you found this useful, please ⭐ the repo!**

</div>
