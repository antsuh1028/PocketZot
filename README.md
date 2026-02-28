# PocketZot

Minimal Chrome Extension (Manifest V3) starter.

## Structure

- `manifest.json` — extension metadata and popup registration
- `frontend/pocket_zot.html` — popup UI
- `frontend/pocket_zot.css` — popup styles
- `frontend/pocket_zot.js` — popup behavior + local storage save/load

## Run locally

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `PocketZot`.
5. Click the PocketZot extension icon to open the popup.

## Current functionality

- Enter text in the popup.
- Click **Save** to persist it using `chrome.storage.local`.
- Reopen the popup to see it loaded back.