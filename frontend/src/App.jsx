import { useState, useEffect } from "react";
import { Box, Button, HStack, Text } from "@chakra-ui/react";
import WelcomePage from "./pages/WelcomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import MeetPage from "./pages/MeetPage.jsx";
import WhatIsShePage from "./pages/WhatIsShePage.jsx";
import HowSheHelpsPage from "./pages/HowshehelpsPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import Header from "./components/Header.jsx";

const DEV_MODE = true;
const BACKEND_URL = "http://127.0.0.1:8000";
const PAGES = [
  "welcome",
  "signup",
  "login",
  "meet",
  "whatisshe",
  "howshehelps",
  "main",
  "shop",
];

export default function App() {
  const [view, setView] = useState("welcome");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    `;
    document.head.appendChild(style);

    if (DEV_MODE) {
      fetch(`${BACKEND_URL}/api/users/1`)
        .then((r) => (r.ok ? r.json() : null))
        .then((u) => {
          if (u) {
            setUser(u);
            localStorage.setItem("pocketzot_user", JSON.stringify(u));
            setView("main");
          }
        })
        .catch(() => {});
    }
  }, []);

  const go = (v) => setView(v);
  const handleLogin = (u) => {
    setUser(u);
    go("meet");
  };

  return (
    <Box borderRadius="20px">
      {/* Fixed nav — out of flow, never affects page width */}
      {DEV_MODE && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={9999}
          bg="yellow.100"
          borderBottom="2px solid"
          borderColor="yellow.400"
          px={2}
          py={1}
          display="flex"
          flexDir="row"
          flexWrap="wrap"
          gap={1}
          justifyContent="center"
        >
          {PAGES.map((v) => (
            <Button
              key={v}
              size="xs"
              onClick={() => go(v)}
              bg={view === v ? "gray.700" : "white"}
              color={view === v ? "white" : "gray.700"}
              border="1px solid"
              borderColor="gray.400"
              borderRadius={0}
              fontFamily="monospace"
              fontSize="10px"
              h="auto"
              px={2}
              py="2px"
              _hover={{ opacity: 0.8 }}
            >
              {v}
            </Button>
          ))}
        </Box>
      )}

      <Header />
      {/* Page content — mt clears the fixed nav bar */}
      <Box width="375px" maxHeight="400" mx="auto" border="1px solid" borderColor="black" 
        backgroundImage={view === "signup" || view === "login" ? "url('Background.png')" : "none"}
        backgroundSize="cover"
        backgroundPosition="center"
        minHeight={view === "signup" || view === "login" ? "100vh" : "auto"}
      >
        {view === "welcome" && (
          <WelcomePage
            onSignUp={() => go("signup")}
            onLogIn={() => go("login")}
          />
        )}
        {view === "signup" && (
          <SignupPage
            onSuccess={handleLogin}
            onSwitchToLogin={() => go("login")}
          />
        )}
        {view === "login" && (
          <LoginPage
            onSuccess={handleLogin}
            onSwitchToSignup={() => go("signup")}
          />
        )}
        {view === "meet" && (
          <MeetPage user={user} onNext={() => go("whatisshe")} />
        )}
        {view === "whatisshe" && (
          <WhatIsShePage onNext={() => go("howshehelps")} />
        )}
        {view === "howshehelps" && (
          <HowSheHelpsPage onNext={() => go("main")} />
        )}
        {view === "main" && <MainPage user={user} onShop={() => go("shop")} />}
        {view === "shop" && <ShopPage user={user} onBack={() => go("main")} />}
      </Box>
    </Box>
  );
}
