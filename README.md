# PayGuard-Neural 🛡️

**Pre-transaction UPI Fraud Detection System**

> Built by Vaishnavi Trivedi — CEH v13 Certified | Cyber Forensic Intern, Nagpur Cyber Police Station

[Live Demo](https://vaishnavi-07823.github.io/PayGuard-Neural/)   [GitHub](https://github.com/Vaishnavi-07823)  [CEH](https://www.eccouncil.org/)

---

## Problem Statement

During my internship at **Nagpur Cyber Police Station** (authorized by Dy. Commissioner Lohit Matani IPS), I observed that most UPI fraud complaints came in *after* the money had already moved through 3–4 accounts. Innocent account holders were getting frozen because funds passed through them in a fraud chain.

**Current gap:** No system checks transaction risk *before* processing to protect the receiver.

**PayGuard-Neural** solves this by acting as an Inbound Protection Gateway. It assigns a Safety Score (0–100) to every sender before allowing the money into the receiver's account, preventing innocent accounts from being frozen.

---

## Live Demo

🌐 **https://vaishnavi-07823.github.io/PayGuard-Neural/**

| Page | URL |
|------|-----|
| Landing | `/index.html` |
| Login | `/login.html` |
| Register | `/register.html` |
| Consumer Dashboard | `/dashboard.html` |
| Police Investigation Panel | `/police.html` |

---

## Safety Score System

| Score | Risk Level | Action |
|-------|-----------|--------|
| 80–100 | 🟢 Safe | Transaction likely legitimate |
| 40–79 | 🟡 Caution | Review AI explanation before proceeding |
| 0–39 | 🔴 High Risk | Strong advisory to abort transaction |

---

## Features

### Consumer Dashboard
- Inbound Payment Protection (Generate Secure Payment Links)
- Pre-transaction UPI ID safety check
- Real-time risk score (0–100) with Red/Yellow/Green signal
- AI-powered risk explanation in plain language
- Community fraud reporting system
- Check history and personal stats

### Police Investigation Panel
- Direct Blacklist Portal (Block fraudulent UPI IDs globally)
- New case creation with FIR number and UPI IDs
- Visual fraud chain tracer (A→B→C→D money flow)
- Factor breakdown table per UPI ID
- AI investigation summary
- SHA-256 hash-verified evidence export
- APK static analysis module (jadx + apktool pipeline)
- Case management system

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Authentication | Firebase Auth (Email + Google) |
| Database | Firebase Firestore |
| Backend API | FastAPI (Python) |
| ML Scoring | Scikit-learn, Pandas |
| AI Explanation | Claude AI API (Anthropic) |
| Fraud Registry | Blockchain (immutable ledger) |
| Evidence Export | SHA-256 hash-verified PDF |

---

## Project Structure

```
PayGuard-Neural/
│
├── index.html          # Landing page
├── login.html          # Firebase login
├── register.html       # Firebase register (role selection)
├── kyc.html            # KYC verification
├── dashboard.html      # Consumer dashboard
├── police.html         # Police investigation panel
├── logo.png            # Project logo
│
├── app/                # Python backend
│   ├── main.py         # FastAPI app
│   ├── database.py     # DB connection
│   ├── ai_explainer.py # Claude AI integration
│   ├── train_model.py  # ML model training
│   ├── requirements.txt
│   ├── blockchain/     # Fraud chain registry
│   └── risk_engine/    # ML scoring pipeline
│
├── backend/            # Node.js auth backend
│   ├── server.js
│   ├── models/
│   └── routes/
│
├── static/             # Static assets
│   └── demo.js
│
└── README.md
```

---

## Real-World Validation

Concept validated against **50+ live UPI fraud cases** investigated daily during internship at Nagpur Cyber Police Station. The false-positive account freezing problem — where innocent mule accounts get frozen — was directly observed in real cases and forms the core motivation for this project.

---

## About the Builder

**Vaishnavi Trivedi**
- B.Tech Cybersecurity, GHRCE Nagpur (2027)
- CEH v13 Certified — 110/125 (EC-Council via Simplilearn)
- CLLMSP — Certified LLM Security Professional (Red Team Leaders)
- Cyber Forensic Intern, Nagpur Cyber Police Station
- CGPA: 8.38

📧 vaishnavitrivedi240@gmail.com
🔗 [LinkedIn](https://linkedin.com/in/vaishnavi-trivedi-cyber)
💻 [GitHub](https://github.com/Vaishnavi-07823)

---

## Roadmap

- [x] Project architecture design
- [x] Risk scoring algorithm design
- [x] Risk engine backend (Python Flask + scikit-learn)
- [x] Claude API integration — AI Explainer
- [x] Simulated blockchain fraud registry & chain tracer (Python)
- [ ] React frontend — Safety Score UI
- [ ] Blockchain fraud registry (real Ethereum/Polygon smart contract)
- [ ] Chain tracing visualization (D3.js graph)
- [ ] Evidence export module
- [ ] Mobile responsive design
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Pilot testing with synthetic fraud datasets

---

## 🚀 Run Locally

### Prerequisites
```bash
Python >= 3.10
pip (comes with Python)
```

### Step 1: Install Python dependencies
```bash
cd app
pip install -r requirements.txt
```

### Step 2: Train the ML model
```bash
python train_model.py
# This generates app/models/model.pkl
```

### Step 3: (Optional) Set your Claude API key for AI explanations
```bash
# Windows PowerShell:
$env:ANTHROPIC_API_KEY = "your-key-here"

# Linux/macOS:
export ANTHROPIC_API_KEY="your-key-here"
```
> **Note:** The system works without an API key — scores and risk levels are still accurate. Only the AI explanation will show a fallback message.

### Step 4: Start the Flask backend
```bash
python main.py
```

### Step 5: Open in browser
```
http://localhost:5000/
```
Scroll to **Live Demo** and try:
- `lucky99@upi` → 🔴 HIGH RISK
- `newdeal@paytm` → 🟡 CAUTION
- `vaishnavi@okaxis` → 🟢 SAFE

---

*Built with real forensic field experience. Not a classroom project.*
