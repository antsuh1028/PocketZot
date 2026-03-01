  import { useState } from "react";
  import { Box, Text, Input, Image } from "@chakra-ui/react";
  import { PixBtn } from "./WelcomePage.jsx";

  const FONT = "'Press Start 2P', monospace";
  const BACKEND_URL = "http://127.0.0.1:8000";

  export default function SignupPage({ onSuccess, onSwitchToLogin }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignup = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email: name }),
        });
        if (!res.ok) {
          setError("Email taken.");
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
      <Box bg="var(--bg)" border="3px solid var(--border)" backgroundSize="cover" backgroundPosition="center" h="100%">      
        <Box p={5}>
          <Text
            fontFamily={FONT}
            fontSize="4xl"
            color="var(--dark)"
            textAlign="center"
            mb={5}
          >
            Sign Up
          </Text>

          {/* Brown center box with gradient effect */}

          <Box display="flex" justifyContent="flex-start" mb={-2}>
            <Image
              src="IdleSmooth.png"
              boxSize="56px"
              objectFit="contain"
              style={{ imageRendering: "pixelated", transform: "scaleX(-1)" }}
            />
          </Box>
          <Box
            bg="linear-gradient(90deg, #8a7a6a 0%, #8a7a6a 80%, #5a4a3a 20%, #5a4a3a 100%)"
            p={5}
            mb={3}
            borderRadius="5px 5px 0 0"
          >
            <PixInput
              label="User:"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error && (
              <Text fontFamily={FONT} fontSize="9px" color="#ff6666" mb={2}>
                {error}
              </Text>
            )}
            <Box display="flex" justifyContent="flex-end" mt={3}>
              <PixBtn
                onClick={handleSignup}
                bg="white"
                color="var(--dark)"
                border="3px solid #5a4a3a"
              >
                {loading ? "..." : "Go!"}
              </PixBtn>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

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