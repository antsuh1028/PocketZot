/**
 * Background service worker for PocketZot.
 * Proxies classify and health update requests to localhost.
 */

var CLASSIFY_URL = 'http://localhost:8000/api/classify/';
var BACKEND_URL = 'http://localhost:8000';

function updateHealthWithAnteater(anteaterDetails, delta, sendResponse) {
  fetch(BACKEND_URL + '/api/anteaters/' + anteaterDetails.id + '/health', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta: delta })
  })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (result) {
      // Update stored anteater details
      chrome.storage.local.set({
        anteaterDetails: {
          id: anteaterDetails.id,
          name: anteaterDetails.name,
          health: result.health,
          ants: result.ants,
          isDead: result.isDead
        }
      });
      sendResponse({ ok: true, data: result });
    })
    .catch(function (err) {
      console.error('[PocketZot] health update error:', err);
      sendResponse({ ok: false, error: err.message });
    });
}

chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
  if (message.action === 'CLASSIFY') {
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
  }

  if (message.action === 'EQUIP_HAT') {
    var hat = message.hat || null;
    chrome.storage.local.set({ pocketzot_equipped_hat: hat }, function () {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          try {
            chrome.tabs.sendMessage(tab.id, { action: 'HAT_EQUIPPED', hat: hat }).catch(function () {});
          } catch (e) {}
        });
      });
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.action === 'UPDATE_HEALTH') {
    chrome.storage.local.get(['userId', 'anteaterDetails'], function (data) {
      console.log('[PocketZot] UPDATE_HEALTH - Raw chrome.storage data:', JSON.stringify(data));
      // Prefer anteaterDetails.uid if available, otherwise use stored userId
      var userId = data.anteaterDetails && data.anteaterDetails.uid ? data.anteaterDetails.uid : data.userId;
      var anteaterDetails = data.anteaterDetails;
      
      console.log('[PocketZot] UPDATE_HEALTH - Resolved userId:', userId, ', source: anteaterDetails.uid=' + (data.anteaterDetails?.uid), ', data.userId=' + data.userId);

      // If we have cached anteater details, use them directly
      if (anteaterDetails && anteaterDetails.id) {
        console.log('[PocketZot] Using cached anteater for user', userId);
        updateHealthWithAnteater(anteaterDetails, message.delta, sendResponse);
        return;
      }

      // If no userId, we can't proceed
      if (!userId) {
        console.error('[PocketZot] UPDATE_HEALTH - No user ID found! Storage data:', data);
        sendResponse({ ok: false, error: 'No user ID found - user not logged in' });
        return;
      }

      // If no anteater details in storage, fetch them for the user
      console.log('[PocketZot] Fetching anteater list for userId:', userId);
      fetch(BACKEND_URL + '/api/anteaters')
        .then(function (r) { return r.json(); })
        .then(function (list) {
          var found = list.find(function (a) { return a.uid === userId; });
          if (!found) {
            console.error('[PocketZot] No anteater found for user', userId, 'in list:', list);
            sendResponse({ ok: false, error: 'No anteater found for user ' + userId });
            return;
          }
          console.log('[PocketZot] Found anteater for user', userId);
          // Now update health with the found anteater
          updateHealthWithAnteater(found, message.delta, sendResponse);
        })
        .catch(function (err) {
          console.error('[PocketZot] Failed to fetch anteater list:', err);
          sendResponse({ ok: false, error: 'Failed to fetch anteater: ' + err.message });
        });
    });

    return true; // keep channel open for async sendResponse
  }

  if (message.action === 'VIEW_CLASSIFICATION') {
    // Store the classification to view
    chrome.storage.local.set({
      pocketzot_view_classification: message.classification
    }, function () {
      // Open the popup
      chrome.action.openPopup().catch(function () {
        // Popup might already be open or user interaction required
      });
    });
    sendResponse({ ok: true });
    return true;
  }

  return false;
});
