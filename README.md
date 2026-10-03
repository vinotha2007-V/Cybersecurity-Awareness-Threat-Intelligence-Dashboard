
# 🛡️ Cybersecurity Awareness & Threat Intelligence Dashboard

A cybersecurity dashboard designed to support threat intelligence analysis, security monitoring, and cybersecurity awareness through synthetic threat data and interactive visualizations.

## 📌 Project Overview

The Cybersecurity Awareness & Threat Intelligence Dashboard provides a centralized interface for exploring sample security threats, reviewing risk levels, identifying threat categories, and learning essential cybersecurity practices.

Built as a student project, it combines a Python-based API with an interactive web dashboard and a cybersecurity awareness quiz.

**Note:** This project uses synthetic training data. Its alerts and risk scores are for educational demonstration and are not verified real-world threat intelligence.

## 🎯 Objectives

- Visualize threat intelligence records in a dashboard.
- Summarize threat severity, categories, and risk scores.
- Search and filter synthetic threat records.
- Display security alerts for educational investigation.
- Provide a cybersecurity awareness quiz with instant feedback.
- Demonstrate API development and data analysis.

## ✨ Key Features

- 📊 **Threat Intelligence Dashboard** — Summary cards and threat visualizations.
- 🚨 **Security Alerts** — Review sample high-risk records.
- 🔍 **Threat Search** — Search threat records by relevant terms.
- 🎚️ **Severity Filtering** — Filter records by severity.
- 📈 **Threat Analytics** — View category and severity breakdowns.
- 🧠 **Security Awareness Quiz** — 30 questions with explanations and a final score.
- ⚡ **REST API** — Retrieve threat records and analytical summaries.
- 🧪 **Synthetic Dataset** — Generate and analyze 2,000 sample threat records.
- 🌐 **Interactive Web Interface** — Dark-themed dashboard designed for readability.

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Programming Language | Python |
| Backend API | FastAPI |
| API Server | Uvicorn |
| Frontend | HTML, CSS, JavaScript |
| Data Analysis | Python |
| Data Storage | CSV and JSON synthetic datasets |
| API Documentation | Swagger UI |
| Testing | Pytest |
| Version Control | Git and GitHub |

## 🏗️ Project Structure

```text
Cybersecurity-Awareness-Threat-Intelligence-Dashboard/
│
├── backend/
│   ├── main.py
│   ├── analysis_engine.py
│   ├── routes/
│   └── services/
│
├── awareness/
│   ├── quiz.html
│   ├── quiz.css
│   ├── quiz.js
│   └── quiz_questions.json
│
├── data/
│   ├── generate_data.py
│   ├── threat_records.csv
│   └── threat_records.json
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
├── tests/
├── docs/
├── reports/
├── screenshots/
├── requirements.txt
├── .gitignore
└── README.md
```

*The structure above represents the intended layout; retain the actual filenames in your repository if they differ.*

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/vinotha2007-V/Cybersecurity-Awareness-Threat-Intelligence-Dashboard.git
cd Cybersecurity-Awareness-Threat-Intelligence-Dashboard
```

### 2. Create and activate a virtual environment

Windows Command Prompt:

```bat
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Start the backend API

From the project root directory:

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Keep the backend terminal open while using the dashboard.

### 5. Open the API documentation

Visit:

http://127.0.0.1:8000/docs

The available endpoints are documented by FastAPI.

### 6. Open the frontend

Open `frontend/index.html` with the VS Code Live Server extension.

The dashboard's API connection is configured for the local backend. Keep the backend running while testing the frontend.

### 7. Open the awareness quiz

Open `awareness/quiz.html` using Live Server.

The quiz includes multiple-choice questions, answer feedback, progress tracking, and a final awareness score.

## 📡 API Endpoints

The backend may expose endpoints such as the following, depending on the implemented routes:

| Endpoint | Purpose |
|---|---|
| `/health` | Check API availability |
| `/stats` | Retrieve threat summary statistics |
| `/threats` | Retrieve threat records |
| `/alerts` | Retrieve sample security alerts |
| `/docs` | Explore API documentation |

Use `http://127.0.0.1:8000/docs` to verify the exact endpoints available in your implementation.

## 📊 Synthetic Dataset

The project generates **2,000 synthetic threat records** for analysis and dashboard visualization.

Sample threat categories include:

- Brute Force
- Data Exposure
- Malware
- Phishing
- Suspicious Domain
- Vulnerability

The dataset supports demonstrations of severity classification, risk scoring, search, filtering, and category analysis.

## 🧠 Cybersecurity Awareness Quiz

The awareness module provides:

- 30 multiple-choice questions.
- Instant correct/incorrect feedback.
- Explanations for answers.
- Question navigation and progress tracking.
- Final score and result summary.
- Retake functionality.

Quiz scores are calculated in the browser and are not persisted to a backend database in the current implementation.

## 🧪 Testing

Activate the virtual environment and run:

```bash
python -m pytest -q
```

To verify the analysis engine and synthetic dataset, run:

```bash
python backend/analysis_engine.py
```

Expected dataset size: 2,000 records, provided the synthetic dataset has been generated successfully.

## 🔐 Security and Ethical Use

This project is designed exclusively for defensive cybersecurity education, threat-intelligence analysis, and security awareness.

- Uses synthetic training records for demonstrations.
- Does not execute malicious payloads.
- Does not scan or probe unauthorized systems.
- Does not automatically contact suspicious IP addresses or domains.
- Does not represent synthetic alerts as confirmed real-world incidents.

## 🚀 Future Enhancements

- Add persistent quiz results and learning history.
- Add user authentication and role-based access.
- Store investigation notes in a database.
- Add CSV export for authorized analysis.
- Integrate trusted threat-intelligence sources with appropriate validation.
- Improve dashboard accessibility and mobile responsiveness.
- Add automated API and frontend tests.
- Add deployment configuration and monitoring.

## 👩‍💻 Author

**Vinotha**

GitHub: [vinotha2007-V](https://github.com/vinotha2007-V)

## 📄 License

This project is intended for educational and portfolio purposes. Add an appropriate open-source license if you want others to reuse or modify the code.

---

**Built for learning, threat awareness, and defensive cybersecurity analytics.**
