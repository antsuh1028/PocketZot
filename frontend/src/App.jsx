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

const DEV_MODE = true;
const BACKEND_URL = "http://127.0.0.1:8000";
const PAGES = ["welcome","signup","login","meet","whatisshe","howshehelps","main","shop","idle","good","bad","summary"];

export default function App() {
  const [view, setView] = useState("welcome");
  const [user, setUser] = useState(null);
  const [anteater, setAnteater] = useState(null);
  const [lastClassification, setLastClassification] = useState(null);
  const [sessionClassifications, setSessionClassifications] = useState([]);

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

  // Dev auto-login
  useEffect(() => {
    if (!DEV_MODE) return;
    fetch(`${BACKEND_URL}/api/users/1`)
      .then(r => r.ok ? r.json() : null)
      .then(u => {
        if (!u) return;
        setUser(u);
        localStorage.setItem("pocketzot_user", JSON.stringify(u));
        setView("main");
      })
      .catch(() => {});
  }, []);

  // Fetch anteater whenever user changes
  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND_URL}/api/anteaters`)
      .then(r => r.json())
      .then(list => setAnteater(list.find(a => a.uid === user.id) || null))
      .catch(() => {});
  }, [user]);

  // Listen for classifications from the content script
  useEffect(() => {
    const handler = (e) => {
      const cls = e?.detail?.classification;
      if (!cls) return;
      setLastClassification(cls);
      setSessionClassifications(prev => [...prev, cls]);
      // Re-fetch anteater to get updated health
      if (user) {
        fetch(`${BACKEND_URL}/api/anteaters`)
          .then(r => r.json())
          .then(list => setAnteater(list.find(a => a.uid === user.id) || null))
          .catch(() => {});
      }
      go(cls.value > 0 ? "good" : "bad");
    };
    window.addEventListener("pocketzot:classification", handler);
    return () => window.removeEventListener("pocketzot:classification", handler);
  }, [user]);

  const go = (v) => setView(v);

  const handleLogin = (u) => {
    setUser(u);
    go("meet");
  };

  const handleMeetNext = (name) => {
    if (!user || !name?.trim()) { go("whatisshe"); return; }
    fetch(`${BACKEND_URL}/api/anteaters/user/${user.id}/name`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(updated => { if (updated) setAnteater(updated); })
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
    go("main");
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
        {view === "summary"     && <StudySummaryPage user={user} anteater={anteater} classifications={sessionClassifications} onDone={handleEndToMain} />}
      </Box>
    </Box>
  );
}