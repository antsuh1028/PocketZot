import { useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
} from "@chakra-ui/react";
import Header from "../components/Header.jsx";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function LoginPage({ onSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/email/${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("No account found with this email. Please sign up first!");
        } else {
          setError("Login failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      const userData = await response.json();
      
      // Store user data in localStorage
      localStorage.setItem("pocketzot_user", JSON.stringify(userData));
      
      // Navigate to meet page
      onSuccess(userData);
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minW="375px" minH="400px" bg="gray.50" color="gray.800" p={4}>
      <VStack align="stretch" gap={4} maxW="400px" mx="auto">
        <Header showSubtitle={false} />
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="600" mb={1}>Welcome Back!</Text>
          <Text fontSize="sm" color="gray.600">
            Log in to check on your PocketZot
          </Text>
        </Box>

        <Box as="form" onSubmit={handleLogin}>
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="600" mb={2}>Email</Text>
              <Box
                as="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                w="full"
                px={3}
                py={2}
                bg="white"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                fontSize="md"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "blue.500", outline: "none", boxShadow: "0 0 0 1px #3182ce" }}
              />
            </Box>

            {error && (
              <Box
                p={3}
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="md"
              >
                <Text fontSize="sm" color="red.700">{error}</Text>
              </Box>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={loading}
              loadingText="Logging in..."
              w="full"
            >
              Log In
            </Button>

            <Text fontSize="sm" color="gray.600" textAlign="center">
              Don't have an account?{" "}
              <Box
                as="span"
                color="blue.500"
                cursor="pointer"
                fontWeight="600"
                _hover={{ textDecoration: "underline" }}
                onClick={onSwitchToSignup}
              >
                Sign up
              </Box>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
