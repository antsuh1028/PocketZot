import { useState, useEffect } from "react";
import { Box, Button } from "@chakra-ui/react";
import WelcomePage from "./pages/WelcomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import MeetPage from "./pages/MeetPage.jsx";
import WhatIsShePage from "./pages/WhatIsShePage.jsx";
import HowSheHelpsPage from "./pages/HowShehelpsPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import IdlePage from "./pages/IdlePage.jsx";
import GoodCommandPage from "./pages/GoodCommandPage.jsx";
import BadCommandPage from "./pages/BadCommandPage.jsx";
import StudySummaryPage from "./pages/StudySummaryPage.jsx";
import Header from "./components/Header.jsx";

const DEV_MODE = false;
const BACKEND_URL = "http://127.0.0.1:8000";
const PAGES = ["welcome","signup","login","meet","whatisshe","howshehelps","main","shop","idle","good","bad","summary"];

export default function App() {
  const [view, setView] = useState("welcome");
  const [user, setUser] = useState(null);
  const [anteater, setAnteater] = useState(null);
  const [lastClassification, setLastClassification] = useState(null);
  const [sessionClassifications, setSessionClassifications] = useState([]);

  const normalizeClassification = (cls) => {
    if (!cls) return null;
    const direct = Number(cls.value);
    if (Number.isFinite(direct)) return { ...cls, value: direct };

    const raw = typeof cls.raw_response === "string" ? cls.raw_response : "";
    const match = raw.match(/[-+]?\d+/);
    if (!match) return null;
    const parsed = Number(match[0]);
    if (!Number.isFinite(parsed)) return null;
    return { ...cls, value: parsed };
  };

  // Inject global styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Reddit+Mono:wght@400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --bg: #e8e0d0; --panel: #d4c8b4; --border: #8a7a6a; --dark: #3a2e22;
        --btn-bg: #c4b89a; --btn-border: #7a6a5a; --input-bg: #f0e8d8;
        --accent: #6a9a5a; --red: #c45a4a;
      }
      html, body { background: var(--bg); }
    `;
    document.head.appendChild(style);
  }, []);

  // Dev auto-login and check for pending classification on mount
useEffect(() => {
  const initializeApp = async () => {
    try {
      const savedUser = localStorage.getItem("pocketzot_user");
      console.log('[PocketZot] App init - localStorage.pocketzot_user:', savedUser);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        console.log('[PocketZot] App init - Restored user:', u.id, u.name);
        setUser(u);

        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          chrome.storage.local.set({ userId: u.id });
          console.log('[PocketZot] Stored userId in chrome:', u.id);

          const data = await new Promise((resolve) =>
            chrome.storage.local.get(["pocketzot_view_classification"], resolve)
          );
          if (data?.pocketzot_view_classification) {
            const cls = data.pocketzot_view_classification;
            if (typeof cls.value === "number") {
              setLastClassification(cls);
              setView(cls.value > 0 ? "good" : "bad");
              chrome.storage.local.remove(["pocketzot_view_classification"]);
              return;
            }
          }
        }

        setView("main");
        return;
      }
    } catch (e) {
      console.error("Failed to restore user:", e);
    }

    // No saved user — clear chrome storage so background script can't use stale userId
    console.log('[PocketZot] App init - No saved user, clearing chrome storage');
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      // Clear all user-related data
      chrome.storage.local.remove(["userId", "anteaterDetails", "pocketzot_classifications", "pocketzot_equipped_hat"]);
      console.log('[PocketZot] Cleared all user data from chrome.storage');
    }
    // Stay on "welcome"
  };

  initializeApp();
}, []);
  // Fetch anteater whenever user changes
  useEffect(() => {
    if (!user) {
      // Clear chrome storage when no user is logged in
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.remove(["userId", "anteaterDetails"]);
      }
      return;
    }
    
    // Clear old anteater cache and set new userId immediately
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ 
        userId: user.id,
        anteaterDetails: null  // Clear old cache
      });
    }
    
    fetch(`${BACKEND_URL}/api/anteaters`)
      .then(r => r.json())
      .then(list => {
        const userAnt = list.find(a => a.uid === user.id) || null;
        setAnteater(userAnt);
        
        // Cache the anteater in chrome storage for background script
        if (userAnt && typeof chrome !== "undefined" && chrome.storage?.local) {
          chrome.storage.local.set({
            userId: user.id,
            anteaterDetails: {
              id: userAnt.id,
              uid: user.id,
              name: userAnt.name,
              health: userAnt.health,
              ants: user.ants || 0,
              isDead: userAnt.is_dead || false
            }
          });
        }
      })
      .catch(() => {});
  }, [user]);

  // Listen for classifications from shared extension storage
  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) return;

    const applyClassificationList = (rawList) => {
      const list = Array.isArray(rawList) ? rawList : [];
      const normalized = list.map(normalizeClassification).filter(Boolean);
      setSessionClassifications(normalized);

      const cls = normalized.length ? normalized[normalized.length - 1] : null;
      setLastClassification(cls);

      if (cls && view === "idle") {
        go(cls.value > 0 ? "good" : "bad");
      }
    };

    chrome.storage.local.get(["pocketzot_classifications"], (data) => {
      applyClassificationList(data && data.pocketzot_classifications);
    });

    const onChanged = (changes, areaName) => {
      if (areaName !== "local" || !changes.pocketzot_classifications) return;
      applyClassificationList(changes.pocketzot_classifications.newValue);

      if (user) {
        fetch(`${BACKEND_URL}/api/anteaters`)
          .then(r => r.json())
          .then(list => setAnteater(list.find(a => a.uid === user.id) || null))
          .catch(() => {});
      }
    };

    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, [user, view]);

  const go = (v) => setView(v);

  const handleLogin = (u) => {
    setUser(u);
    // Store userId in chrome storage for background script
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ userId: u.id });
    }
    go("meet");
  };

  const handleMeetNext = (name) => {
    if (!user || !name?.trim()) { go("whatisshe"); return; }

    const trimmedName = name.trim();

    fetch(`${BACKEND_URL}/api/anteaters`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        const existing = list.find((a) => a.uid === user.id);

        if (existing) {
          return fetch(`${BACKEND_URL}/api/anteaters/${existing.id}/name`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmedName }),
          }).then((r) => (r.ok ? r.json() : null));
        }

        return fetch(`${BACKEND_URL}/api/anteaters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            health: 100,
            is_dead: false,
            uid: user.id,
          }),
        }).then((r) => (r.ok ? r.json() : null));
      })
      .then((updatedOrCreated) => {
        if (updatedOrCreated) setAnteater(updatedOrCreated);
      })
      .catch(() => {})
      .finally(() => go("whatisshe"));
  };

  const despawnAnteater = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "DESPAWN" });
      });
    }
  };

  const spawnAnteater = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "SPAWN" });
      });
    }
  };

  const handleStartToIdle = () => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ pocketzot_classifications: [] });
    }
    setSessionClassifications([]);
    setLastClassification(null);
    spawnAnteater();
    go("idle");
  };

  const handleEndToSummary = () => {
    despawnAnteater();
    go("summary");
  };

  const handleEndToMain = () => {
    despawnAnteater();
    setSessionClassifications([]);
    setLastClassification(null);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ pocketzot_classifications: [] });
    }
    go("main");
  };

  const handleViewClassification = (classification) => {
    setLastClassification(classification);
    go(classification.value > 0 ? "good" : "bad");
  };
  return (
    <Box borderRadius="20px">
      {/* Fixed dev nav */}
      {DEV_MODE && (
        <Box
          position="fixed" top={0} left={0} right={0} zIndex={9999}
          bg="yellow.100" borderBottom="2px solid" borderColor="yellow.400"
          px={2} py={1} display="flex" flexDir="row" flexWrap="wrap"
          gap={1} justifyContent="center"
        >
          {PAGES.map(v => (
            <Button key={v} size="xs" onClick={() => go(v)}
              bg={view === v ? "gray.700" : "white"}
              color={view === v ? "white" : "gray.700"}
              border="1px solid" borderColor="gray.400" borderRadius={0}
              fontFamily="monospace" fontSize="10px" h="auto" px={2} py="2px"
              _hover={{ opacity: 0.8 }}>
              {v}
            </Button>
          ))}
          {user && (
            <>
            <Button
              size="xs"
              onClick={() => resetEquippedHat()}
              bg="orange.100"
              color="gray.800"
              border="1px solid"
              borderColor="orange.300"
              borderRadius={0}
              fontFamily="monospace"
              fontSize="10px"
              h="auto"
              px={2}
              py="2px"
              _hover={{ opacity: 0.8 }}
            >
              Reset hat
            </Button>
            <Button
              size="xs"
              onClick={() => clearInventory(user.id, setUser)}
              bg="red.100"
              color="gray.800"
              border="1px solid"
              borderColor="red.300"
              borderRadius={0}
              fontFamily="monospace"
              fontSize="10px"
              h="auto"
              px={2}
              py="2px"
              _hover={{ opacity: 0.8 }}
            >
              Clear inv
            </Button>
            </>
          )}
        </Box>
      )}

      <Header />

      <Box
        width="375px"
        mx="auto"
        border="1px solid black"
        mt={DEV_MODE ? "36px" : 0}
        backgroundImage={view === "signup" || view === "login" ? "url('Background.png')" : "none"}
        backgroundSize="cover"
        backgroundPosition="center"
      >
        {view === "welcome"     && <WelcomePage onSignUp={() => go("signup")} onLogIn={() => go("login")} />}
        {view === "signup"      && <SignupPage onSuccess={handleLogin} onSwitchToLogin={() => go("login")} />}
        {view === "login"       && <LoginPage onSuccess={handleLogin} onSwitchToSignup={() => go("signup")} />}
        {view === "meet"        && <MeetPage user={user} onNext={handleMeetNext} />}
        {view === "whatisshe"   && <WhatIsShePage onNext={() => go("howshehelps")} />}
        {view === "howshehelps" && <HowSheHelpsPage onNext={() => go("main")} />}
        {view === "main"        && <MainPage user={user} anteater={anteater} onShop={() => go("shop")} onStart={handleStartToIdle} />}
        {view === "shop"        && <ShopPage user={user} onBack={() => go("main")} />}
        {view === "idle"        && <IdlePage user={user} anteater={anteater} onEnd={handleEndToSummary} />}
        {view === "good"        && <GoodCommandPage user={user} anteater={anteater} classification={lastClassification} onEnd={handleEndToSummary} />}
        {view === "bad"         && <BadCommandPage user={user} anteater={anteater} classification={lastClassification} onEnd={handleEndToSummary} />}
        {view === "summary"     && <StudySummaryPage user={user} anteater={anteater} classifications={sessionClassifications} onDone={handleEndToMain} onViewClassification={handleViewClassification} />}
      </Box>
    </Box>
  );
}