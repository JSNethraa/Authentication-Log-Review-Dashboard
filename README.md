<div align="center">

# 🛡️ SOC Sentinel: Authentication Log Review Dashboard
### *Full-Stack Cybersecurity Threat Intelligence & Log Forensic Platform*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.0-lightgrey?logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Database](https://img.shields.io/badge/Database-SQLite%20/%20SQLAlchemy-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

*A specialized security monitoring and authentication anomaly detection system engineered for Security Operations Center (SOC) analysts to ingest, analyze, triage, and remediate identity-based cyber attacks in enterprise environments.*

</div>

---

## 📌 Project Overview
Authentication logs are primary attack vectors in modern credential-stuffing, brute-force, and lateral movement operations. **SOC Sentinel** is a defense platform that ingests raw authentication telemetry from multiple services (SSH, VPN, Web Portals, Active Directory), extracts indicators of compromise (IOCs), correlates authentication patterns using algorithmic detection rules, and visualizes security anomalies in real-time.

---

## ✨ Key Features

1. **Analyst Authentication & Role-Based Access Control (RBAC)**:
   - Secure analyst terminal with JWT token-based session verification.
   - Pre-configured default SOC analyst account for quick evaluation.

2. **Security Operations Overview (Executive SOC Dashboard)**:
   - High-level KPIs: Total Ingested Events, Failed Authentication Ratio, Active Critical/High Threats, and Incident Resolution Rate.
   - Real-time login volume and failure spike timeline (Interactive Recharts Area Chart).
   - Threat distribution breakdown by alert classification and severity levels.
   - Entity-level risk rankings: Top 5 Targeted User Accounts & Top 5 Malicious External IP Origins.

3. **CSV Log Ingestion & Normalization Engine**:
   - Drag-and-drop CSV log file parsing with resilient column mapping and timestamp normalization.
   - Ingests multiple authentication service protocols (SSH, Web-Portal, VPN, ActiveDirectory).
   - **One-Click Benchmark Dataset**: Bundled with 30 realistic enterprise authentication records containing embedded attack vectors for instantaneous demonstration.

4. **Multi-Vector Threat Detection Engine**:
   - **Repeated Failed Logins (Brute Force)**: Detects sustained authentication failure streaks ($\ge 5$ attempts within 10 minutes).
   - **Brute Force Leading to Compromise**: Flags high-risk occurrences where prolonged failed attempts are followed by a successful login from the same IP origin (**CRITICAL** alert).
   - **Suspicious Off-Hours Logins**: Detects anomalous logins between 22:00 and 05:00, escalating severity for privileged accounts (`admin`, `root`, `sysadmin`).
   - **Credential / Password Spraying**: Detects single IP sources probing multiple distinct corporate user accounts horizontally.

5. **Forensic Log Explorer**:
   - Paginated log table with real-time keyword search (by IP, username, reason, or location).
   - Multi-criteria filtering by authentication outcome (`SUCCESS` / `FAILURE`) and service protocol.
   - Detailed payload inspection modal displaying user agents, timestamps, and error codes.

6. **Security Alert Triage Hub & Case Management**:
   - Prioritized alert queue with color-coded severity tags (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
   - Interactive investigation modal: take remediation actions (e.g., *Password Reset Enforced*, *Source IP Blocked on Firewall*) and update incident status.
   - Manual detection re-run capability.

7. **SOC Analyst Audit Trail**:
   - Immutable audit logging of all notes, actions taken, and resolutions with analyst attribution.

8. **Compliance & Forensic Reports**:
   - **Executive PDF Report**: Generates and downloads a formal SOC security audit report with metrics and alert details formatted using ReportLab.
   - **Raw Forensic CSV Export**: Downloadable sanitized log datasets for external SIEM or forensic tooling.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (v19), Vite (v5), React Router DOM (v7), Recharts (v3), Lucide React Icons |
| **Styling** | SOC Dark Navy & Cyber Blue Design System (`index.css`), CSS Variables, Responsive Layouts |
| **Backend** | Python (3.10+), Flask (v3), Flask-CORS, PyJWT, Werkzeug (Password Hashing) |
| **Detection Engine** | Pure Python Algorithmic sliding-window correlation engines |
| **Database** | SQLite, Flask-SQLAlchemy, SQLAlchemy ORM |
| **Report Generation**| ReportLab (PDF Engine), Python CSV Engine |

---

## 📂 Project Directory Structure

```
Authentication-Log-Review-Dashboard/
├── backend/
│   ├── app.py                     # Flask application factory, CORS, and blueprint registration
│   ├── config.py                  # Database URI, JWT secret keys, threat thresholds
│   ├── models.py                  # SQLAlchemy models (User, AuthLog, LogBatch, Alert, Investigation)
│   ├── requirements.txt           # Python backend dependencies
│   ├── .env.example               # Template for backend environment variables
│   ├── sample_data/
│   │   └── auth_logs_sample.csv   # Pre-seeded enterprise authentication dataset with embedded attacks
│   ├── services/
│   │   ├── detector.py            # Rule-based cybersecurity anomaly detection algorithms
│   │   ├── log_parser.py          # Resilient CSV parser with header normalization
│   │   └── report_generator.py    # ReportLab PDF generator & CSV exporter
│   └── routes/
│       ├── auth.py                # Analyst login, registration, JWT auth
│       ├── logs.py                # CSV upload, forensic search, log batches
│       ├── analysis.py            # Aggregations, KPIs, and timeline charts
│       ├── alerts.py              # Alert triage, status updates, trigger detection
│       ├── investigations.py      # Analyst investigation audit trail
│       └── reports.py             # Downloadable executive PDF & forensic CSV
│
├── frontend/
│   ├── package.json               # Node.js dependencies & scripts
│   ├── vite.config.js             # Vite configuration
│   ├── index.html                 # HTML shell
│   ├── .env.example               # Template for frontend environment variables
│   └── src/
│       ├── main.jsx               # Application entry point
│       ├── App.jsx                # Route definitions & layout guard
│       ├── index.css              # Dark navy cybersecurity theme & styling
│       ├── api/
│       │   └── client.js          # Axios client with JWT interceptor & base URL
│       ├── context/
│       │   └── AuthContext.jsx    # Authentication & analyst session state
│       ├── components/
│       │   ├── Sidebar.jsx        # Navigation sidebar with engine status
│       │   ├── Header.jsx         # Status bar, UTC clock & backend connectivity indicator
│       │   ├── StatCard.jsx       # Cyber metric cards with trend indicators
│       │   ├── SeverityBadge.jsx  # Colored threat severity badges
│       │   └── Modal.jsx          # Reusable modal for inspection & triage
│       └── pages/
│           ├── Login.jsx          # Analyst terminal authentication
│           ├── Overview.jsx       # SOC Command Center (KPIs + Recharts)
│           ├── LogUpload.jsx      # CSV Ingestion & sample dataset loader
│           ├── LogExplorer.jsx    # Forensic search & filterable log table
│           ├── Alerts.jsx         # Security alert triage hub
│           ├── Investigation.jsx  # Analyst action history audit trail
│           └── Reports.jsx        # Executive PDF & CSV report export
│
├── .gitignore                     # Git exclusion rules (venv, node_modules, db, etc.)
└── README.md                      # Comprehensive project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: Version `3.10` or higher
- **Node.js**: Version `18.x` or `20.x` (with npm)
- **Git**: Installed on your system

---

### 2. Backend Setup & Run

1. Open your terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```

2. (Recommended) Create and activate a Python virtual environment:
   - **Windows**:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```bash
   python app.py
   ```
   > The backend server starts at **`http://127.0.0.1:5000`**.  
   > Database tables and the default analyst account are automatically initialized on startup.

---

### 3. Frontend Setup & Run

1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > The frontend application will be accessible at **`http://localhost:5173`**.

---

## 🔑 Default Analyst Credentials

| Field | Value |
| :--- | :--- |
| **Username** | `analyst` |
| **Password** | `Analyst123!` |
| **Role** | Senior SOC Analyst |

*(Credentials are also pre-filled on the login screen for quick presentation).*

---

## 🧪 Testing the Attack Detection Scenarios

1. Log in to the dashboard at `http://localhost:5173`.
2. Navigate to **Upload & Parse Logs** from the sidebar.
3. Click **"Load Benchmark Logs"** to ingest 30 pre-configured enterprise authentication events.
4. Go to **Security Overview** to observe live updates:
   - Failure volume spikes on the timeline area chart.
   - Threat distribution breakdown.
   - Identified compromised account (`irene.adler`).
   - Password spraying originating from `198.51.100.24`.
5. Visit the **Security Alerts Hub** to review detected anomalies, click **Investigate** on any alert, log mitigation notes, and change the status to `Resolved`.
6. Navigate to **Investigation History** to review the forensic audit trail.
7. Open **Audit Reports** and click **Download SOC Audit PDF** to export a report.

---

## 🛡️ API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | API system status & version | No |
| `GET` | `/api/health` | Service health check | No |
| `POST` | `/api/auth/login` | Analyst authentication & JWT issuance | No |
| `GET` | `/api/auth/me` | Current analyst profile | Yes |
| `GET` | `/api/analysis/overview`| SOC overview metrics & Recharts data | Yes |
| `GET` | `/api/logs` | Search and filter authentication logs | Yes |
| `POST` | `/api/logs/upload` | Upload and parse CSV log file | Yes |
| `POST` | `/api/logs/sample-load`| Ingest sample attack logs | Yes |
| `GET` | `/api/alerts` | Retrieve detected security alerts | Yes |
| `PATCH`| `/api/alerts/<id>/status`| Update alert status & record action | Yes |
| `POST` | `/api/alerts/run-detection`| Re-execute rule-based detection engine | Yes |
| `GET` | `/api/investigations`| Retrieve analyst investigation audit logs | Yes |
| `GET` | `/api/reports/download-pdf`| Download executive SOC audit PDF | Yes |
| `GET` | `/api/reports/download-csv`| Export forensic log dataset as CSV | Yes |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
