/**
 * messageListener.js
 * The primary Chrome content script entry point.
 * Injected into EVERY TAB via manifest.json → content_scripts. (change to just the ai models?)
 * 
 * This file only:
 *   1. Builds one PZAnteater instance per tab
 *   2. Listens for messages from the React popup
 *
 * Messages:
 *   { action: 'SPAWN'  }  → spawn the anteater on this tab
 *   { action: 'DESPAWN'}  → remove it
 *   { action: 'TOGGLE' }  → spawn if absent, despawn if present
 *   { action: 'STATUS' }  → reply { active: bool }
 */

(function () {
  'use strict';

  // Guard: prevents double-injection if the script runs twice in same tab
  if (window.__pocketzotLoaded) return;
  window.__pocketzotLoaded = true;

  // Lazily constructed — we wait until first message to build it
  var anteater = null;

  function getAnteater() {
    if (!anteater) {
      // chrome.runtime.getURL gives us the path to files inside the extension package.
      // This is how we load the sprite sheet from the extension's own files.
      var spriteUrl = chrome.runtime.getURL('anteaterchar/assets/anteater.png');
      anteater = new window.PZAnteater({ spriteUrl: spriteUrl });
    }
    return anteater;
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {

      case 'SPAWN':
        getAnteater().spawn();
        sendResponse({ ok: true });
        break;

      case 'DESPAWN':
        if (anteater) anteater.despawn();
        sendResponse({ ok: true });
        break;

      case 'TOGGLE':
        var a = getAnteater();
        if (a.isActive()) { a.despawn(); } else { a.spawn(); }
        sendResponse({ ok: true, active: a.isActive() });
        break;

      case 'STATUS':
        sendResponse({ active: anteater ? anteater.isActive() : false });
        break;

      default:
        sendResponse({ error: 'Unknown action: ' + message.action });
    }

    // Return true to keep the message channel open for async sendResponse
    return true;
  });

  console.log('[PocketZot] Content script ready');
})();