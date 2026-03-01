/**
 * Background service worker for PocketZot.
 * Proxies classify requests to localhost — extensions can fetch localhost
 * without CORS/Private Network Access restrictions that block content scripts.
 * Relays hat equip events from popup to content scripts.
 */

var CLASSIFY_URL = 'http://localhost:8000/api/classify/';
var CONTENT_SCRIPT_URLS = [
  'https://chatgpt.com/*',
  'https://claude.ai/*',
  'https://gemini.google.com/*',
  'https://*.perplexity.ai/*',
];

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'EQUIP_HAT') {
    var hat = message.hat || null;
    chrome.storage.local.set({ pocketzot_equipped_hat: hat });
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (tab.id != null && tab.url && /^(https:\/\/)(chatgpt\.com|claude\.ai|gemini\.google\.com|.*\.perplexity\.ai)\//.test(tab.url)) {
          chrome.tabs.sendMessage(tab.id, { action: 'HAT_EQUIPPED', hat: hat }).catch(function () {});
        }
      });
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.action === 'GET_HAT') {
    chrome.storage.local.get('pocketzot_equipped_hat', function (data) {
      sendResponse({ hat: data && data.pocketzot_equipped_hat });
    });
    return true;
  }

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
