/**
 *Manages the anteater's state from the popup/frontend.
 *
 * Usage:
 *   import { useAnteater } from './anteaterchar/useAnteater';
 *   const { active, loading, error, spawn, despawn, toggle } = useAnteater();
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Send a message to the content script on the currently active tab.
 * Returns a Promise that resolves to the response, or rejects on error.
 */


function sendToActiveTab(message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        reject(new Error('No active tab found'));
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        if (chrome.runtime.lastError) {
          // Common cause: content script not yet injected on this tab.
          // Usually happens on chrome:// pages or right after install.
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  });
}

export  function useAnteater() {
  const [active, setActive]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // On popup open, poll the active tab for current status
  useEffect(() => {
    sendToActiveTab({ action: 'STATUS' })
      .then((res) => setActive(res?.active ?? false))
      .catch(() => {}); // silent — content script may not be ready
  }, []);

  const spawn = useCallback(async () => {
    setLoading(true);
    try {
      await sendToActiveTab({ action: 'SPAWN' });
      setActive(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const despawn = useCallback(async () => {
    setLoading(true);
    try {
      await sendToActiveTab({ action: 'DESPAWN' });
      setActive(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    active ? await despawn() : await spawn();
  }, [active, spawn, despawn]);

  return { active, loading, error, spawn, despawn, toggle };
}
