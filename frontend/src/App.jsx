import { useState, useEffect } from "react";
import { Box, HStack, Button, Spinner, VStack, Text } from "@chakra-ui/react";
import WelcomePage from "./pages/WelcomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import MeetPage from "./pages/MeetPage.jsx";

const DEV_MODE = true; // Set to false for production
const BACKEND_URL = "http://127.0.0.1:8000";

export default function App() {
  const [view, setView] = useState("welcome");
  const [isLoadingDevLogin, setIsLoadingDevLogin] = useState(DEV_MODE);

  // Auto-login as user 1 in dev mode
  useEffect(() => {
    if (DEV_MODE) {
      fetch(`${BACKEND_URL}/api/users/1`)
        .then(res => {
          if (!res.ok) throw new Error("User not found");
          return res.json();
        })
        .then(userData => {
          localStorage.setItem("pocketzot_user", JSON.stringify(userData));
          setView("meet");
          setIsLoadingDevLogin(false);
        })
        .catch(err => {
          console.error("Dev auto-login failed:", err);
          setIsLoadingDevLogin(false);
        });
    }
  }, []);

  // Show loading screen during dev auto-login
  if (isLoadingDevLogin) {
    return (
      <Box minW="375px" minH="400px" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={3}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading dev mode...</Text>
        </VStack>
      </Box>
    );
  }

  const views = {
    welcome: <WelcomePage onSignUp={() => setView("signup")} onLogIn={() => setView("login")} />,
    signup: <SignupPage onSuccess={() => setView("meet")} onSwitchToLogin={() => setView("login")} />,
    login: <LoginPage onSuccess={() => setView("meet")} onSwitchToSignup={() => setView("signup")} />,
    meet: <MeetPage onNext={() => setView("main")} />,
  };

  return (
    <Box>
      {/* Dev Navigation Bar */}
      {DEV_MODE && (
        <Box bg="yellow.100" p={2} borderBottom="2px solid" borderColor="yellow.400" borderRadius={4}>
          <HStack gap={2} justify="center" flexWrap="wrap">
            <Button
              size="sm"
              colorScheme={view === "welcome" ? "blue" : "gray"}
              onClick={() => setView("welcome")}
            >
              Welcome
            </Button>
            <Button
              size="sm"
              colorScheme={view === "login" ? "blue" : "gray"}
              onClick={() => setView("login")}
            >
              Login
            </Button>
            <Button
              size="sm"
              colorScheme={view === "signup" ? "blue" : "gray"}
              onClick={() => setView("signup")}
            >
              Signup
            </Button>
            <Button
              size="sm"
              colorScheme={view === "meet" ? "blue" : "gray"}
              onClick={() => setView("meet")}
            >
              Meet
            </Button>
          </HStack>
        </Box>
      )}
      
      {/* Main Content */}
      <Box>{views[view]}</Box>
    </Box>
  );
}
