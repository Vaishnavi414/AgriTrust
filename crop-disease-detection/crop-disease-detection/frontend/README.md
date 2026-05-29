# Frontend (React + Vite + Tailwind)

This folder is a **Vite + React** single-page app that talks to the Flask API using **Axios**.

## Run locally

1. Start the backend (from the repo root):

```powershell
cd ..\backend
.\.venv\Scripts\Activate.ps1
python app.py
```

2. Start the frontend:

```powershell
cd ..\frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Configure API URL

By default the app calls:

- `http://localhost:5000`

To override, create `frontend/.env` (optional). You can start from `.env.example`:

```text
VITE_API_BASE_URL=http://localhost:5000
```

Vite only reads env vars prefixed with `VITE_`.

## What you should see before training a model

- The header will show **“Backend OK · Model not installed yet”** if Flask is running but there is no `.h5` in `backend/model/`.
- Clicking **Analyze image** will show a helpful error until you train and add a model.

## Project structure (high level)

- `src/api/client.js` — Axios instance + API helpers
- `src/components/*` — reusable UI pieces (dropzone, spinner, results)
- `src/App.jsx` — page layout + “Analyze” button wiring
