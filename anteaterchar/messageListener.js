/**
 * messageListener.js
 * The primary Chrome content script entry point.
 * Injected into EVERY TAB via manifest.json → content_scripts. (change to just the ai models?)
 * 
 * This file only:
 *   1. Builds one PZAnteater instance per tab
 *   2. Listens for messages from the React popup
 *   3. Shows a popover with a "Start" button to spawn the anteater
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

  // Verbose startup logging — verify all globals loaded in DevTools
  console.log('[PocketZot] messageListener starting...');
  console.log('[PocketZot] PZPhysics      =', typeof window.PZPhysics);
  console.log('[PocketZot] PZStateMachine =', typeof window.PZStateMachine);
  console.log('[PocketZot] PZSprite       =', typeof window.PZSprite);
  console.log('[PocketZot] PZDrag         =', typeof window.PZDrag);
  console.log('[PocketZot] PZAnteater     =', typeof window.PZAnteater);
  console.log('[PocketZot] Content script ready ✓');

  // Lazily constructed — we wait until first message to build it
  var anteater = null;

  function getAnteater() {
    if (!anteater) {
      // chrome.runtime.getURL gives us the path to files inside the extension package.
      // This is how we load the sprite sheet from the extension's own files.
      var spriteUrl = null; //chrome.runtime.getURL('anteaterchar/assets/anteater.png');
      anteater = new window.PZAnteater({ spriteUrl: spriteUrl });
    }
    return anteater;
  }

  // Create and inject the popover UI
  function createPopover() {
    // Check if popover already exists
    if (document.getElementById('pocketzot-popover')) return;

    var popover = document.createElement('div');
    popover.id = 'pocketzot-popover';
    
    popover.style.cssText = `
      position: absolute;
      bottom: 20px ;
      right: 20px;
      z-index: 2147483646;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
      min-width: 240px;
      max-width: 300px;
      text-align: center;
    `;

    var title = document.createElement('div');
    title.textContent = '🐜 PocketZot';
    title.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    `;

    var description = document.createElement('div');
    description.textContent = 'Spawn your anteater mascot to keep you company!';
    description.style.cssText = `
      font-size: 14px;
      margin-bottom: 15px;
      opacity: 0.95;
      line-height: 1.4;
    `;

    var button = document.createElement('button');
    button.textContent = 'Start';
    button.style.cssText = `
      background: white;
      color: #667eea;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
      margin-bottom: 8px;
    `;

    button.onmouseover = function() {
      this.style.transform = 'scale(1.05)';
      this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    };
    button.onmouseout = function() {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = 'none';
    };

    button.onclick = function() {
      console.log('[PocketZot] Start button clicked');
      
      // Reset ALL session state before starting
      processedPrompts.clear();
      seenNodes = new WeakSet();
      lastPromptCount = 0;
      if (promptObserver) {
        promptObserver.disconnect();
        promptObserver = null;
      }
      localStorage.removeItem('pocketzot_classifications');
      console.log('[PocketZot] Cleared previous session data');
      
      getAnteater().spawn();
      
      // Start monitoring prompts — only NOW, after user clicks Start
      startPromptMonitoring();
      
      // Close the popover after spawning
      popover.style.opacity = '0';
      popover.style.transform = 'scale(0.9)';
      popover.style.transition = 'all 0.3s ease';
      setTimeout(function() {
        popover.remove();
      }, 300);
    };

    var closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 16px;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s ease;
    `;

    closeBtn.onmouseover = function() {
      this.style.background = 'rgba(255, 255, 255, 0.3)';
    };
    closeBtn.onmouseout = function() {
      this.style.background = 'rgba(255, 255, 255, 0.2)';
    };

    closeBtn.onclick = function() {
      popover.style.opacity = '0';
      popover.style.transform = 'scale(0.9)';
      popover.style.transition = 'all 0.3s ease';
      setTimeout(function() {
        popover.remove();
      }, 300);
    };

    popover.appendChild(title);
    popover.appendChild(description);
    popover.appendChild(button);
    popover.appendChild(closeBtn);

    document.body.appendChild(popover);

    // Fade in animation
    popover.style.opacity = '0';
    popover.style.transform = 'scale(0.9)';
    setTimeout(function() {
      popover.style.transition = 'all 0.3s ease';
      popover.style.opacity = '1';
      popover.style.transform = 'scale(1)';
    }, 10);

    console.log('[PocketZot] Popover created');
  }

  chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
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

  // Prompt monitoring system
  var lastPromptCount = 0;
  var promptObserver = null;
  var processedPrompts = new Set(); // Track prompt text hashes we've already classified
  var seenNodes = new WeakSet();    // Track DOM nodes we've already seen — immune to count drift

  function detectPlatform() {
    var hostname = window.location.hostname;
    if (hostname.includes('chatgpt.com')) return 'chatgpt';
    if (hostname.includes('claude.ai')) return 'claude';
    if (hostname.includes('gemini.google.com')) return 'gemini';
    if (hostname.includes('perplexity.ai')) return 'perplexity';
    return 'unknown';
  }

  function getPromptSelectors(platform) {
    var selectors = {
      chatgpt: {
        messageContainer: 'main',
        // data-message-author-role is only set to "user" on user turns
        userMessage: '[data-message-author-role="user"]',
        inputField: 'textarea[placeholder*="Message"]'
      },
      claude: {
        // Claude.ai uses a scrollable div, not <main>
        messageContainer: '[data-testid="conversation-turn-list"]',
        messageContainerFallbacks: [
          '[data-testid="conversation-turn-list"]',
          '.flex-1.overflow-y-auto',
          '#thread-content',
          'div[class*="ConversationContainer"]',
          'div[class*="conversation"]',
        ],
        userMessage: '[data-testid="user-message"]',
        inputField: 'div[contenteditable="true"]'
      },
      gemini: {
        messageContainer: 'main',
        userMessage: '.query-content',
        inputField: 'textarea'
      },
      perplexity: {
        messageContainer: 'main',
        userMessage: '[class*="UserQuery"]',
        inputField: 'textarea'
      }
    };
    return selectors[platform] || null;
  }

  function extractPromptText(element, platform) {
    if (!element) return null;
    
    // Try to get text content, stripping extra whitespace
    var text = element.textContent || element.innerText || '';
    text = text.trim();
    
    // Filter out very short or empty messages
    if (text.length < 2) return null;
    
    return text;
  }

  function onPromptDetected(promptText) {
    // Create a hash of the prompt to track if we've seen it
    var promptHash = promptText.trim().toLowerCase();
    
    if (processedPrompts.has(promptHash)) {
      console.log('[PocketZot] ⏭️ Skipped duplicate prompt:', promptText.substring(0, 50) + '...');
      return;
    }
    
    processedPrompts.add(promptHash);
    console.log('[PocketZot] ✅ NEW prompt detected! Classifying:', promptText.substring(0, 100) + (promptText.length > 100 ? '...' : ''));
    
    // Send to backend for classification
    sendPromptToBackend(promptText);
  }

  function sendPromptToBackend(promptText) {
    // Replace with your actual backend URL
    var backendUrl = 'http://localhost:8000/api/classify';
    
    fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: promptText })
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      console.log('[PocketZot] Classification result:', data);
      
      // Store in localStorage
      storeClassification(promptText, data);
      
      // Show visual feedback
      showClassificationToast(data);
    })
    .catch(function(error) {
      console.error('[PocketZot] Classification error:', error);
    });
  }

  function storeClassification(prompt, classification) {
    try {
      // Get existing classifications from localStorage
      var stored = localStorage.getItem('pocketzot_classifications');
      var classifications = stored ? JSON.parse(stored) : [];
      
      // Add new classification
      classifications.push({
        prompt: prompt,
        value: classification.value,
        suggestion: classification.suggestion,
        platform: detectPlatform(),
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 classifications to avoid storage limits
      if (classifications.length > 100) {
        classifications = classifications.slice(-100);
      }
      
      // Save back to localStorage
      localStorage.setItem('pocketzot_classifications', JSON.stringify(classifications));
      
      console.log('[PocketZot] Stored classification. Total:', classifications.length);
    } catch (error) {
      console.error('[PocketZot] Failed to store classification:', error);
    }
  }

  function showClassificationToast(classification) {
    // Create a toast notification showing the classification
    var toast = document.createElement('div');
    toast.id = 'pocketzot-classification-toast';
    
    var emoji = '';
    var color = '';
    if (classification.value <= -2) {
      emoji = '📝';
      color = '#e74c3c';
    } else if (classification.value === -1) {
      emoji = '🔗';
      color = '#f39c12';
    } else if (classification.value === 1) {
      emoji = '💡';
      color = '#3498db';
    } else if (classification.value === 2) {
      emoji = '🎯';
      color = '#2ecc71';
    }
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: ${color};
      color: white;
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 300px;
      opacity: 0;
      transform: translateX(400px);
      transition: all 0.3s ease;
    `;
    
    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px;">
        ${emoji} Classification: ${classification.value}
      </div>
      ${classification.suggestion ? `<div style="font-size: 14px; opacity: 0.95;">${classification.suggestion}</div>` : ''}
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(400px)';
      setTimeout(function() {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 5000);
  }

  function startPromptMonitoring() {
    var platform = detectPlatform();
    if (platform === 'unknown') {
      console.log('[PocketZot] Unknown platform, skipping prompt monitoring');
      return;
    }

    console.log('[PocketZot] Starting prompt monitoring for:', platform);
    var selectors = getPromptSelectors(platform);
    
    if (!selectors) return;

    // Snapshot all currently-visible user message nodes as "already seen" —
    // we register their identity so we never classify them, even if the DOM
    // later mutates and shifts indices around.
    var currentMessages = document.querySelectorAll(selectors.userMessage);
    for (var i = 0; i < currentMessages.length; i++) {
      seenNodes.add(currentMessages[i]);
    }
    lastPromptCount = currentMessages.length; // kept for logging only

    console.log('[PocketZot] Baseline:', lastPromptCount, 'existing messages — these will NOT be classified');
    console.log('[PocketZot] ✓ Only prompts sent AFTER clicking Start will be classified');
    console.log('[PocketZot] To view stored classifications, run: window.PocketZotStorage.getClassifications()');

    // Use MutationObserver to watch for new messages
    var targetNode = document.querySelector(selectors.messageContainer);

    function checkForNewPrompts() {
      var userMessages = document.querySelectorAll(selectors.userMessage);

      for (var i = 0; i < userMessages.length; i++) {
        var node = userMessages[i];
        if (seenNodes.has(node)) continue; // already processed or pre-existing
        seenNodes.add(node);

        var promptText = extractPromptText(node, platform);
        if (promptText) {
          console.log('[PocketZot] 📝 New user node detected');
          onPromptDetected(promptText);
        }
      }
    }

    // Try the primary selector, then fallbacks
    var targetNode = document.querySelector(selectors.messageContainer);
    if (!targetNode && selectors.messageContainerFallbacks) {
      for (var f = 0; f < selectors.messageContainerFallbacks.length; f++) {
        targetNode = document.querySelector(selectors.messageContainerFallbacks[f]);
        if (targetNode) {
          console.log('[PocketZot] Found container via fallback:', selectors.messageContainerFallbacks[f]);
          break;
        }
      }
    }

    // If still not found, observe <body> as a last resort — broad but always works
    if (!targetNode) {
      targetNode = document.body;
      console.log('[PocketZot] ⚠️ Could not find specific message container, falling back to <body>');
    }

    promptObserver = new MutationObserver(function() {
      checkForNewPrompts();
    });

    promptObserver.observe(targetNode, {
      childList: true,
      subtree: true,
    });

    console.log('[PocketZot] ✓ Prompt observer attached to:', targetNode.tagName || targetNode);
  }

  // Show popover when content script loads
  try {
    console.log('[PocketZot] Creating popover...');
    createPopover();
  } catch (err) {
    console.error('[PocketZot] Popover creation failed:', err);
  }

  // NOTE: startPromptMonitoring() is intentionally NOT called here.
  // It is only called when the user clicks the Start button in the popover.

  // Expose helper functions globally for popup/frontend access
  window.PocketZotStorage = {
    getClassifications: function() {
      try {
        var stored = localStorage.getItem('pocketzot_classifications');
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('[PocketZot] Failed to get classifications:', error);
        return [];
      }
    },
    
    getStats: function() {
      var classifications = this.getClassifications();
      var stats = {
        total: classifications.length,
        byValue: {},
        byPlatform: {},
        recent: classifications.slice(-10).reverse()
      };
      
      // Count by classification value
      classifications.forEach(function(c) {
        stats.byValue[c.value] = (stats.byValue[c.value] || 0) + 1;
        stats.byPlatform[c.platform] = (stats.byPlatform[c.platform] || 0) + 1;
      });
      
      return stats;
    },
    
    clearAll: function() {
      localStorage.removeItem('pocketzot_classifications');
      console.log('[PocketZot] Cleared all classifications');
    }
  };

})();