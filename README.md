# PocketZot

Chrome Extension (Manifest V3) with a React popup + FastAPI backend template.

## Structure

- `manifest.json` — extension metadata and popup registration
- `frontend/pocket_zot.html` — React popup HTML entry (Vite input)
- `frontend/src/App.jsx` — React popup component
- `frontend/src/main.jsx` — React mount point
- `frontend/pocket_zot.css` — popup styles
- `dist/` — built popup output used by the extension
- `backend/main.py` — FastAPI app template

## Frontend (React) setup

1. Install Node dependencies:

	```bash
	npm install
	```

2. Build the popup bundle for the extension:

	```bash
	npm run build
	```

## Load extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `PocketZot`.
5. Click the PocketZot extension icon to open the popup.

If you update React code, run `npm run build` again, then click **Reload** on the extension card.

## Current functionality

- React-powered popup UI.
- Enter text in the popup.
- Click **Save** to persist it using `chrome.storage.local`.
- Reopen the popup to see it loaded back.

## Backend template (FastAPI)

### Files

- `backend/main.py` — FastAPI app template with `/`, `/health`, `/api/echo`
- `backend/requirements.txt` — backend Python dependencies

### Run backend

1. Create and activate a Python virtual environment.
2. Install dependencies:

	```bash
	pip install -r backend/requirements.txt
	```

3. Start the API server:

	```bash
	uvicorn backend.main:app --reload
	```

4. Open docs at `http://127.0.0.1:8000/docs`.