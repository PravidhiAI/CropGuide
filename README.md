# TERRAFORM — AI-Powered Agricultural Intelligence System
### Decision-Support Engine for High-Altitude Cold Terrace Agriculture

---

## 🏔️ Assigned Land Scenario: High-Altitude Cold Terrace
Mountain agricultural terraces in high-altitude zones (1400m – 3800m) present harsh environmental constraints:
- **Nocturnal radiation frost** that freezes cellular tissue in tender foliage.
- **Steep terrace slopes** prone to riser collapse and sheet erosion during sudden cloudbursts.
- **Short thermal growing windows** cut off by early autumn snowfalls.
- **Rocky, shallow soil shelves** that impede deep root penetration.
- **Glacial or cold meltwater** that induces root temperature shock if applied unwarmed.

**TERRAFORM** is an explainable decision-support web application that guides growers from photo intake and tactile, non-laboratory field observations through a 10-step terrace response. Crop records and qualitative preferences are sourced from `data/crops.csv`; crop suggestions, cultivation, pest management, harvest readiness, and storage remain separate tools in the platform.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Role |
|---|---|---|
| **Frontend** | React 19, Vite, TypeScript, Lucide Icons, Vanilla CSS | 16 responsive views, interactive checklists, progress tracking, live differential reasoning, and raw JSON inspection. |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, Uvicorn | Deterministic recommendation engine, land analysis engine, 9-stage plan generator, IPM diagnostic assistant. |
| **Persistence** | SQLite, SQLAlchemy | Local disk persistence for land assessments, active cultivation plans, task completion checklists, and field journal logs. |
| **Knowledge Base** | CSV and generated JSON (`data/`) | Crop records generated from the supplied CSV, plus separate pest/disease profiles, terrace methods, and institutional source citations. |
| **Scientific Sources** | ICAR-CPRI, ICAR-VPKAS, ICAR-IARI Katrain, ICAR-IIWBR, SKUAST-K, UHF Solan | Peer-reviewed packages of practices from apex Indian mountain research institutes. |

---

## 📁 Repository Directory Structure

```text
TERRAFORM/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── endpoints.py          # REST endpoints (/api/v1/...)
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── db.py                 # SQLite engine & session
│   │   │   └── models.py             # SQLAlchemy models
│   │   ├── engine/
│   │   │   ├── __init__.py
│   │   │   ├── land_analysis.py      # Non-lab observation evaluator
│   │   │   ├── recommendation.py     # Hard exclusions & suitability scoring
│   │   │   ├── cultivation_planner.py# 9-stage sequential plan generator
│   │   │   ├── pest_engine.py        # Multi-symptom IPM diagnostic engine
│   │   │   └── harvest_engine.py     # Morphological maturity & storage evaluator
│   │   ├── knowledge_base/
│   │   │   ├── __init__.py
│   │   │   └── loader.py             # Knowledge base loader & cache
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── common.py             # Standard JSON envelope
│   │   │   ├── land_assessment.py    # Input / output schemas
│   │   │   ├── crop.py               # Recommendation schemas
│   │   │   ├── cultivation.py        # Journey & journal schemas
│   │   │   └── pest.py               # Diagnosis & harvest schemas
│   │   ├── __init__.py
│   │   └── main.py                   # FastAPI application entrypoint
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api.py               # REST API integration tests
│   │   ├── test_engine.py            # Conflict & unit tests
│   │   └── test_scenarios.py         # 7 required mountain scenario tests
│   ├── requirements.txt              # Python dependencies
│   └── .env.example
├── data/
│   ├── crops.csv                     # Authoritative qualitative crop-condition records
│   ├── crop_database.json            # Generated crop records and source CSV rows
│   ├── pest_database.json            # 9 mountain pests, diseases & stresses
│   ├── cultivation_methods.json      # Terrace bunding, raised beds, cloches
│   └── source_registry.json          # ICAR / KVK research publications
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Sidebar navigation & status indicators
│   │   │   ├── JSONInspectorModal.tsx# Live raw API exchange inspector
│   │   │   └── CropDetailModal.tsx   # Verified botanical specifications modal
│   │   ├── pages/
│   │   │   ├── WelcomeDashboard.tsx  # Scenario introduction & quick actions
│   │   │   ├── LandAssessmentWizard.tsx # Photo/chat intake and field-observation wizard
│   │   │   ├── LandAnalysisView.tsx  # Facts vs inferences, terrace risks
│   │   │   ├── CropRecommendationsView.tsx # Ranked crops & hard exclusions panel
│   │   │   ├── CropComparisonView.tsx# Head-to-head crop comparison
│   │   │   ├── CultivationPlanView.tsx # 9-stage plan with persistent tasks
│   │   │   ├── OngoingCareChecklistView.tsx # Daily & weekly task tracker
│   │   │   ├── PestAssistantView.tsx # Interactive IPM diagnostic assistant
│   │   │   ├── HarvestReadinessView.tsx # Maturity verification & delay risks
│   │   │   ├── HarvestStorageGuideView.tsx # Reaping, curing & root cellar specs
│   │   │   ├── FieldJournalView.tsx  # Observation logs & harvest yield records
│   │   │   ├── CultivationCalendarView.tsx # 9-stage Gantt lifecycle timeline
│   │   │   ├── LiveChallengeView.tsx # Dedicated judging reasoning engine
│   │   │   ├── JSONInspectorView.tsx # Full API telemetry inspector
│   │   │   └── SettingsExportView.tsx# Data export & audio controls
│   │   ├── services/
│   │   │   └── api.ts                # REST client & telemetry recorder
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── audio.ts              # Web Audio API sound synthesizer
│   │   ├── App.tsx                   # Master state coordinator
│   │   ├── index.css                 # Vanilla CSS design tokens & themes
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── API_EXAMPLES.md                   # Real JSON requests and responses
├── run_backend.bat                   # Windows batch backend launcher
├── run_backend.ps1                   # Windows PowerShell backend launcher
├── run_frontend.bat                  # Windows batch frontend launcher
├── run_frontend.ps1                  # Windows PowerShell frontend launcher
├── run_all.bat                       # Unified batch launcher (both services)
├── run_all.ps1                       # Unified PowerShell launcher
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start on Windows & Visual Studio Code

### 1. Prerequisites
- **Python 3.10+** (verified on Python 3.14)
- **Node.js 18+** (verified on Node v24.21.0, npm 11.19.0)
- **Visual Studio Code** on Windows

---

### 2. One-Click Unified Launch
Open PowerShell or Command Prompt in the project folder and run:
```powershell
# Using PowerShell
.\run_all.ps1

# Or using Command Prompt
run_all.bat
```
This automatically starts:
1. **FastAPI Backend** on `http://127.0.0.1:8000`
2. **Vite React Frontend** on `http://localhost:5173`
3. Automatically opens your default web browser to the dashboard.

On first launch, the backend launcher creates the project `.venv` and installs the dependencies from `backend/requirements.txt`. Later launches reuse that environment.

---

### 3. Manual Step-by-Step Setup

#### A. Backend Setup
1. Open a terminal in the project directory and run the backend launcher:
   ```powershell
   # PowerShell
   .\run_backend.ps1

   # Or Command Prompt
   run_backend.bat
   ```
2. Verify backend health in browser:
   - Health check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)
   - Interactive Swagger API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### B. Frontend Setup
1. Open a second terminal window in `frontend/`:
   ```powershell
   cd frontend
   npm install
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
2. Open your web browser at:
   - [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Automated Tests

All 26 backend automated tests evaluate:
- System health and knowledge base integrity
- CSV record fidelity, photo-intake uncertainty, and the exact 10-step protocol
- Observation conflict detection
- Missing information penalties
- Dataset-driven frost, drainage, sunlight, water, season, and soil scenarios
- All 7 mandated cold terrace test scenarios
- 9-stage sequential plan generation
- Persistent task checklists and journal logging

Run the test suite from the repository root:
```powershell
python -m pytest backend/tests -v
```

**Expected output:**
```text
======================== 26 passed ========================
```

---

## ⚖️ Hackathon Judging Guide: Live Challenge Mode

Judges can evaluate the system's reasoning over **completely unseen combinations of inputs** without predetermined hardcoded recommendations:

1. Click **"Live Challenge Mode"** in the sidebar.
2. Choose a demonstration preset or enter custom field observations. The engine evaluates crop preferences and excludes statistical/aggregate CSV rows from plantable recommendations.
3. Click **"Evaluate Live Challenge"**:
   - The system calls `POST /api/v1/live-challenge/evaluate`.
   - The **"Differential Reasoning: What Changed and Why"** panel explains every single parameter alteration and why specific crops were admitted or banned.
   - Click **"Inspect Raw JSON"** to view the live FastAPI response payload.

---

## 🔍 Real Backend JSON Inspector

Click **"View API JSON"** in the top navigation or open the **"JSON Inspector"** in the sidebar to review live backend network exchanges:
- View live requests and responses for Land Assessments, Recommendations, 9-Stage Plans, Pest Diagnoses, and Harvest Readiness.
- Displays HTTP status, latency in milliseconds, and the exact endpoint URL.
- One-click **"Copy JSON"** to clipboard.
- One-click **"Download .json"** for offline auditing.

---

## 🌿 Crop Dataset

`data/crops.csv` is the authoritative source for 34 records: 26 crop profiles and 8 aggregate/statistical labels. Aggregate rows are retained for source fidelity but excluded from plantable recommendations. Crop preferences are qualitative and marked as requiring local agronomic validation; derived planting details should be confirmed for the selected variety and region.

The photo intake accepts and forwards an image with grower notes. The current backend has no visual-recognition model, so it does not claim to identify soil, terrain, or crop conditions from pixels; the wizard asks the grower to confirm field observations instead.

---

## 🛠️ Troubleshooting on Windows

1. **PowerShell Script Execution Policy Error:**
   If running `.ps1` scripts gives an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   Or simply use the corresponding `.bat` files (`run_backend.bat`, `run_frontend.bat`, `run_all.bat`).

2. **Port 8000 or 5173 Already in Use:**
   - To specify a different backend port:
     ```powershell
     python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001
     ```
   - Then update `frontend/.env`:
     ```text
     VITE_API_BASE_URL=http://127.0.0.1:8001
     ```

3. **No Laboratory Measurements Prompted:**
   By design, TERRAFORM does not ask for pH, NPK ppm, or electrical conductivity. The system reasons over natural tactile observations (soil ribbon test, drainage time, moisture feel, and stone presence) to infer suitability deterministically.
#   C r o p G u i d e  
 #   C r o p G u i d e  
 