# PocketZot

Chrome Extension (Manifest V3) with a Shimeji-style anteater mascot that walks around on AI chat sites (ChatGPT, Claude, Gemini, Perplexity), plus a React popup and FastAPI backend.

## Features

- **Anteater mascot** — Walks around the page, can be dragged and thrown
- **Shop** — Buy hats (Plumber, Merrier, Egg, Crown) with ants, equip/unequip
- **Login / Sign up** — Email-based auth
- **Prompt classification** — LLM rates your prompts; mascot reacts (good/bad)
- **Ants & health** — Earn ants for good prompts, spend in shop

## Structure

```
PocketZot/
├── manifest.json          # Extension metadata, popup, content scripts
├── background.js          # Service worker (EQUIP_HAT, classify, health)
├── anteaterchar/          # Content script mascot (physics, sprite, drag)
│   ├── anteater.js
│   ├── sprite.js
│   ├── messageListener.js
│   └── assets/
├── frontend/              # React popup (Vite)
│   ├── pocket_zot.html
│   ├── src/App.jsx
│   └── src/pages/
├── backend/               # FastAPI
│   ├── src/main.py
│   ├── src/api/           # users, anteaters, accessories, classifier
│   └── schema/            # SQL migrations
└── dist/                  # Built output (popup + anteaterchar)
```

## Frontend (React) setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the popup and copy content scripts:

   ```bash
   npm run build
   ```

   This builds the popup to `dist/` and copies `anteaterchar/` into `dist/anteaterchar/`.

## Backend (FastAPI) setup

1. Create and activate a Python virtual environment.
2. Install dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Set up PostgreSQL and create a `.env` file with `DATABASE_URL`.
4. Run migrations:

   ```bash
   python backend/scripts/run_migration.py
   ```

5. Start the API server:

   ```bash
   uvicorn backend.src.main:app --reload
   ```

   API docs: `http://127.0.0.1:8000/docs`

## Load the extension

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `PocketZot` folder (the one with `manifest.json`).
5. Click the PocketZot icon to open the popup.

After code changes, run `npm run build` and click **Reload** on the extension card.

## Content script sites

The anteater mascot runs on:

- `https://chatgpt.com/*`
- `https://claude.ai/*`
- `https://gemini.google.com/*`
- `https://*.perplexity.ai/*`
