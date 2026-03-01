/**
 * Background service worker for PocketZot.
 * Proxies classify requests to localhost — extensions can fetch localhost
 * without CORS/Private Network Access restrictions that block content scripts.
 */

var CLASSIFY_URL = 'http://localhost:8000/api/classify/';

chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
  if (message.action !== 'CLASSIFY') return false;

  fetch(CLASSIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: message.prompt }),
  })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      sendResponse({ ok: true, data: data });
    })
    .catch(function (err) {
      console.error('[PocketZot] background classify error:', err);
      sendResponse({ ok: false, error: err.message });
    });

  return true; // keep channel open for async sendResponse
});
