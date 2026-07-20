# SYNTEX

Your personal companion for the neurodivergent brain to turn sensory overload into cognitive clarity.

Originally designed in Figma ([SYNTEX App Interface Design](https://www.figma.com/design/awriPTP76k45QMLb5TK724/SYNTEX-App-Interface-Design)), now backed by a real FastAPI service for profile, tasks, circles, alerts, settings, and check-in history.

## Structure

- `frontend/` — React + Vite + TypeScript UI (the Figma export, wired to the backend)
- `backend/` — FastAPI service (JSON-file persistence, single local profile)

## Running it

**Backend** (from `backend/`):

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (from `frontend/`):

```
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:8000`, so run both at once. Visit `http://localhost:5173`.

## Notes

- All data is stored locally (`backend/data.json`, gitignored) — no cloud sync, no third-party access.
- Circle/caregiver alerts are simulated in-app (no real SMS/email) by design, to keep the "your data never leaves your device" promise made in Settings.
