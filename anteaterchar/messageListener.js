/**
 * messageListener.js
 * The primary Chrome content script entry point.
 */

(function () {
  "use strict";

  if (window.__pocketzotLoaded) return;
  window.__pocketzotLoaded = true;

  console.log("[PocketZot] messageListener starting...");
  console.log("[PocketZot] PZPhysics      =", typeof window.PZPhysics);
  console.log("[PocketZot] PZStateMachine =", typeof window.PZStateMachine);
  console.log("[PocketZot] PZSprite       =", typeof window.PZSprite);
  console.log("[PocketZot] PZDrag         =", typeof window.PZDrag);
  console.log("[PocketZot] PZAnteater     =", typeof window.PZAnteater);
  console.log("[PocketZot] Content script ready ✓");

  var anteater = null;

  function getAnteater() {
    if (!anteater) {
      anteater = new window.PZAnteater({ spriteUrl: null });
    }
    return anteater;
  }

  // ─── Popover ────────────────────────────────────────────────────────────────
  function createPopover() {
    if (document.getElementById("pocketzot-popover")) return;

    // Outer shell — slightly larger so popover text/elements are easier to read
    var popover = document.createElement("div");
    popover.id = "pocketzot-popover";
    popover.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483646;
      width: 152px;
      height: 186px;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Gray rounded card — fills the whole shell
    var card = document.createElement("div");
    card.style.cssText = `
      position: absolute;
      inset: 0;
      background: transparent;
      border-radius: 14px;
      overflow: hidden;
    `;
    popover.appendChild(card);

    // Question text — top-center
    var question = document.createElement("div");
    question.textContent = "Did you want start PocketZot?";
    question.style.cssText = `
      position: absolute;
      top: 40px;
      left: 10px;
      right: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      line-height: 1.35;
      text-align: center;
    `;
    popover.appendChild(question);

    // Speech bubble — left side, pointing right toward the anteater
    var bubble = document.createElement("div");
    bubble.style.cssText = `
  position: absolute;
  top: 100px;
  left: 30px;
  background: #ffffff;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
`;

    var tail = document.createElement("div");
    tail.style.cssText = `
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 8px solid #ffffff;
`;
    bubble.appendChild(tail);
    bubble.appendChild(document.createTextNode("Press me!"));
    popover.appendChild(bubble);
   
    // Anteater sprite — bottom-right corner of the card
    var sprite = document.createElement("img");
    sprite.src = chrome.runtime.getURL("dist/TESTER.png");
    sprite.style.cssText = `
  position: absolute;
  bottom: 0;
  right: -40px;
  width: 88px;
  height: 88px;
  object-fit: contain;
  user-select: none;
  cursor: pointer;
`;
    sprite.onclick = function () {
      processedPrompts.clear();
      seenNodes = new WeakSet();
      lastPromptCount = 0;
      if (promptObserver) {
        promptObserver.disconnect();
        promptObserver = null;
      }
      localStorage.removeItem("pocketzot_classifications");
      getAnteater().spawn();
      startPromptMonitoring();
      popover.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      popover.style.opacity = "0";
      popover.style.transform = "scale(0.9)";
      setTimeout(function () {
        popover.remove();
      }, 300);
    };
    popover.appendChild(sprite);

    document.body.appendChild(popover);

    // Fade in
    popover.style.opacity = "0";
    popover.style.transform = "translateY(8px)";
    setTimeout(function () {
      popover.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      popover.style.opacity = "1";
      popover.style.transform = "translateY(0)";
    }, 10);

    console.log("[PocketZot] Popover created");
  }

  // ─── Chrome message bridge ──────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener(
    function (message, _sender, sendResponse) {
      switch (message.action) {
        case "SPAWN":
          getAnteater().spawn();
          sendResponse({ ok: true });
          break;
        case "DESPAWN":
          if (anteater) anteater.despawn();
          sendResponse({ ok: true });
          break;
        case "TOGGLE":
          var a = getAnteater();
          if (a.isActive()) {
            a.despawn();
          } else {
            a.spawn();
          }
          sendResponse({ ok: true, active: a.isActive() });
          break;
        case "STATUS":
          sendResponse({ active: anteater ? anteater.isActive() : false });
          break;
        default:
          sendResponse({ error: "Unknown action: " + message.action });
      }
      return true;
    },
  );

  // ─── Prompt monitoring ──────────────────────────────────────────────────────
  var lastPromptCount = 0;
  var promptObserver = null;
  var processedPrompts = new Set();
  var seenNodes = new WeakSet();

  function detectPlatform() {
    var h = window.location.hostname;
    if (h.includes("chatgpt.com")) return "chatgpt";
    if (h.includes("claude.ai")) return "claude";
    if (h.includes("gemini.google.com")) return "gemini";
    if (h.includes("perplexity.ai")) return "perplexity";
    return "unknown";
  }

  function getPromptSelectors(platform) {
    var map = {
      chatgpt: {
        messageContainer: "main",
        userMessage: '[data-message-author-role="user"]',
      },
      claude: {
        messageContainer: null,
        messageContainerFallbacks: [
          '[data-testid="conversation-turn-list"]',
          '[class*="ConversationContainer"]',
          '[class*="conversation-container"]',
          "#thread-content",
        ],
        userMessageSelectors: [
          '[data-testid="human-turn"]',
          '[data-testid="user-message"]',
          '[data-is-streaming="false"][data-role="human"]',
          ".human-turn",
        ],
        userMessage: '[data-testid="human-turn"]',
      },
      gemini: {
        messageContainer: "main",
        userMessage: ".query-content",
      },
      perplexity: {
        messageContainer: "main",
        userMessage: '[class*="UserQuery"]',
      },
    };
    return map[platform] || null;
  }

  function extractPromptText(element) {
    if (!element) return null;
    var text = (element.textContent || element.innerText || "").trim();
    return text.length >= 2 ? text : null;
  }

  function onPromptDetected(promptText) {
    var hash = promptText.trim().toLowerCase();
    if (processedPrompts.has(hash)) return;
    processedPrompts.add(hash);
    console.log("[PocketZot] ✅ NEW prompt:", promptText.substring(0, 100));
    sendPromptToBackend(promptText);
  }

  function sendPromptToBackend(promptText) {
    fetch("http://localhost:8000/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        console.log("[PocketZot] Classification:", data);
        storeClassification(promptText, data);
        showClassificationToast(data);
      })
      .catch(function (err) {
        console.error("[PocketZot] classify error:", err);
      });
  }

  function storeClassification(prompt, classification) {
    try {
      var list = JSON.parse(
        localStorage.getItem("pocketzot_classifications") || "[]",
      );
      list.push({
        prompt: prompt,
        value: classification.value,
        suggestion: classification.suggestion,
        platform: detectPlatform(),
        timestamp: new Date().toISOString(),
      });
      if (list.length > 100) list = list.slice(-100);
      localStorage.setItem("pocketzot_classifications", JSON.stringify(list));

      // simply expose the full classification object to other scripts
      window.PocketZotLastClassification = classification;
      window.dispatchEvent(new CustomEvent('pocketzot:classification', {
        detail: { classification: classification },
      }));
    } catch (e) {
      console.error("[PocketZot] store error:", e);
    }
  }

  function showClassificationToast(classification) {
    var colors = {
      "-3": "#e74c3c",
      "-2": "#e74c3c",
      "-1": "#f39c12",
      1: "#3498db",
      2: "#2ecc71",
    };
    var emojis = { "-3": "📝", "-2": "📝", "-1": "🔗", 1: "💡", 2: "🎯" };
    var v = String(classification.value);
    var toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 2147483647;
      background: ${colors[v] || "#555"}; color: white; border-radius: 8px;
      padding: 14px 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: -apple-system, sans-serif; max-width: 280px;
      opacity: 0; transform: translateX(320px); transition: all 0.3s ease;
    `;
    toast.innerHTML =
      '<div style="font-weight:600;margin-bottom:6px">' +
      (emojis[v] || "") +
      " Classification: " +
      classification.value +
      "</div>" +
      (classification.suggestion
        ? '<div style="font-size:13px;opacity:.95">' +
          classification.suggestion +
          "</div>"
        : "");
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
    }, 10);
    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(320px)";
      setTimeout(function () {
        if (toast.parentNode) toast.remove();
      }, 300);
    }, 5000);
  }

  function startPromptMonitoring() {
    var platform = detectPlatform();
    if (platform === "unknown") {
      console.log("[PocketZot] Unknown platform");
      return;
    }
    console.log("[PocketZot] Monitoring:", platform);

    var selectors = getPromptSelectors(platform);
    if (!selectors) return;

    // Probe which selector exists (claude)
    if (platform === "claude" && selectors.userMessageSelectors) {
      for (var s = 0; s < selectors.userMessageSelectors.length; s++) {
        if (document.querySelector(selectors.userMessageSelectors[s])) {
          selectors.userMessage = selectors.userMessageSelectors[s];
          break;
        }
      }
      console.log("[PocketZot] Selector:", selectors.userMessage);
    }

    // Snapshot existing nodes — never classify them
    var existing = document.querySelectorAll(selectors.userMessage);
    for (var i = 0; i < existing.length; i++) seenNodes.add(existing[i]);
    lastPromptCount = existing.length;
    console.log("[PocketZot] Baseline:", lastPromptCount);

    function checkForNewPrompts() {
      var nodes = document.querySelectorAll(selectors.userMessage);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (seenNodes.has(node)) continue;
        seenNodes.add(node);
        var text = extractPromptText(node);
        if (text) onPromptDetected(text);
      }
    }

    // Resolve container
    var container = selectors.messageContainer
      ? document.querySelector(selectors.messageContainer)
      : null;
    if (!container && selectors.messageContainerFallbacks) {
      for (var f = 0; f < selectors.messageContainerFallbacks.length; f++) {
        container = document.querySelector(
          selectors.messageContainerFallbacks[f],
        );
        if (container) break;
      }
    }
    if (!container) {
      container = document.body;
      console.log("[PocketZot] Fallback: <body>");
    }

    promptObserver = new MutationObserver(checkForNewPrompts);
    promptObserver.observe(container, { childList: true, subtree: true });
    console.log("[PocketZot] ✓ Observer attached");
  }

  // ─── Init ───────────────────────────────────────────────────────────────────
  try {
    createPopover();
  } catch (e) {
    console.error("[PocketZot] Popover error:", e);
  }

  // startPromptMonitoring() called only on "Press me!" click, never on load.

  window.PocketZotStorage = {
    getClassifications: function () {
      try {
        return JSON.parse(
          localStorage.getItem("pocketzot_classifications") || "[]",
        );
      } catch (e) {
        return [];
      }
    },
    getStats: function () {
      var list = this.getClassifications();
      var stats = {
        total: list.length,
        byValue: {},
        byPlatform: {},
        recent: list.slice(-10).reverse(),
      };
      list.forEach(function (c) {
        stats.byValue[c.value] = (stats.byValue[c.value] || 0) + 1;
        stats.byPlatform[c.platform] = (stats.byPlatform[c.platform] || 0) + 1;
      });
      return stats;
    },
    clearAll: function () {
      localStorage.removeItem("pocketzot_classifications");
    },
    // helpers for external scripts
    onClassification: function (cb) {
      if (typeof cb === 'function') {
        window.addEventListener('pocketzot:classification', function (e) {
          cb(e.detail.classification);
        });
      }
    },
    getLastClassification: function () {
      return window.PocketZotLastClassification || null;
    },
  };

  // ------------------------------------------------------------
  // helper to drop PNGs around the mascot element when a classification
  // arrives.  The caller passes the raw classification object and the
  // routine will schedule `count = Math.abs(value) * 12` images to be
  // created at random offsets (±30px X, 0..-20px Y) relative to the
  // current sprite position.  Images are spaced ~250ms apart so they
  // don’t overload the page; each one auto‑cleans after a couple seconds.
  //
  // You can change `imageUrl` to point at whatever PNG you like; the
  // example uses a file in the extension’s `dist` folder.
  // ------------------------------------------------------------
  function sprinkleAroundSprite(classification) {
    var value = classification && classification.value;
    if (typeof value !== 'number') return;
    var total = Math.abs(value) * 12;
    if (total <= 0) return;

    var sprite = document.getElementById('pocketzot-mascot');
    if (!sprite) return;
    var rect = sprite.getBoundingClientRect();
    var imgUrl = chrome.runtime.getURL('dist/ANT.png'); // replace with your file

    var placed = 0;
    function placeNext() {
      if (placed >= total) return;
      var img = document.createElement('img');
      img.src = imgUrl;
      img.style.position = 'fixed';
      img.style.pointerEvents = 'none';
      img.style.width = '32px';
      img.style.height = '32px';
      // random offset: ±30px horizontal, -0..20px vertical (upwards only)
      var offsetX = Math.random() * 60 - 30;
      var offsetY = -Math.random() * 20;
      img.style.left = rect.left + offsetX + 'px';
      img.style.top  = rect.top  + offsetY + 'px';
      document.body.appendChild(img);
      setTimeout(function () { img.remove(); }, 2000);
      placed++;
      setTimeout(placeNext, 250);
    }
    placeNext();
  }

  // automatically trigger the sprinkle when a classification event fires
  window.addEventListener('pocketzot:classification', function (e) {
    sprinkleAroundSprite(e.detail.classification);
  });
})();
