import { useState } from "react";
import { Box, Text, Input, Image } from "@chakra-ui/react";
import { PixBtn } from "./WelcomePage.jsx";

const FONT = "'Press Start 2P', monospace";
const BACKEND_URL = "http://127.0.0.1:8000";

function PixInput({ label, type = "text", value, onChange }) {
  return (
    <Box mb={4}>
      <Text fontFamily={FONT} fontSize="10px" color="white" mb={1}>
        {label}
      </Text>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        bg="white"
        border="3px solid #5a4a3a"
        borderRadius={0}
        fontFamily={FONT}
        fontSize="11px"
        color="var(--dark)"
        h="auto"
        px={3}
        py={2}
        _focus={{ boxShadow: "none", borderColor: "#3a2e22" }}
      />
    </Box>
  );
}

export default function LoginPage({ onSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/users/email/${encodeURIComponent(email)}`,
      );
      if (!res.ok) {
        setError("Account not found.");
        return;
      }
      const u = await res.json();
      localStorage.setItem("pocketzot_user", JSON.stringify(u));
      onSuccess(u);
    } catch {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="var(--bg)" border="3px solid var(--border)" display="flex" flexDirection="column" flex={1} minHeight={0}>
      <Box p={5} flexShrink={0}>
        <Text
          fontFamily={FONT}
          fontSize="4xl"
          color="var(--dark)"
          textAlign="center"
          mb={5}
        >
          Log In
        </Text>

        <Box display="flex" justifyContent="flex-end" mb={-2}>
          <Image
            src="IdleSmooth.png"
            boxSize="56px"
            objectFit="contain"
            style={{ imageRendering: "pixelated" }}
          />
        </Box>
      </Box>

      {/* Brown center box — extends to bottom */}
      <Box
        flex={1}
        bg="linear-gradient(90deg, #8a7a6a 0%, #8a7a6a 80%, #5a4a3a 20%, #5a4a3a 100%)"
        p={5}
        pb={6}
        borderRadius="5px 5px 0 0"
        borderTop="3px solid #5a4a3a"
        display="flex"
        flexDirection="column"
        minHeight={0}
      >
          <PixInput
            label="Email:"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <PixBtn
              onClick={handleLogin}
              bg="white"
              color="var(--dark)"
              border="3px solid #5a4a3a"
            >
              {loading ? "..." : "Go!"}
            </PixBtn>
          </Box>
          {error && (
            <Text fontFamily={FONT} fontSize="9px" color="#ff6666" mt={2}>
              {error}
            </Text>
          )}
        </Box>
    </Box>
  );
}
