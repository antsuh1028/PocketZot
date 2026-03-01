import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
} from "@chakra-ui/react";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function MeetPage({ onNext }) {
  const [user, setUser] = useState(null);
  const [anteater, setAnteater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("pocketzot_user");
    if (!storedUser) {
      setError("No user found. Please log in.");
      setLoading(false);
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Fetch or create anteater for this user
    fetchOrCreateAnteater(userData.id);
  }, []);

  const fetchOrCreateAnteater = async (userId) => {
    try {
      // Try to get existing anteaters for this user
      const response = await fetch(`${BACKEND_URL}/api/anteaters`);
      
      if (response.ok) {
        const anteaters = await response.json();
        // Find anteater for this user
        const userAnteater = anteaters.find(a => a.uid === userId);
        
        if (userAnteater) {
          setAnteater(userAnteater);
        } else {
          // Create new anteater for this user
          await createAnteater(userId);
        }
      } else {
        setError("Failed to load anteater data.");
      }
    } catch (err) {
      console.error("Error fetching anteater:", err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const createAnteater = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/anteaters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userId,
          name: "Peter",
          health: 100,
        }),
      });

      if (response.ok) {
        const newAnteater = await response.json();
        setAnteater(newAnteater);
      } else {
        setError("Failed to create anteater.");
      }
    } catch (err) {
      console.error("Error creating anteater:", err);
      setError("Unable to create your anteater.");
    }
  };

  if (loading) {
    return (
      <Box minW="375px" minH="400px" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={3}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading your PocketZot...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minW="375px" minH="400px" bg="gray.50" p={4}>
        <Box
          p={3}
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
        >
          <Text fontSize="sm" color="red.700">{error}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box minW="375px" minH="400px" bg="gray.50" color="gray.800" p={4}>
      <VStack align="stretch" gap={4} maxW="400px" mx="auto">
        <Box textAlign="center">
          <Heading size="xl" mb={2}>Meet Your PocketZot!</Heading>
          <Text fontSize="md" color="gray.600">
            Welcome, {user?.name}! 👋
          </Text>
        </Box>

        {/* Anteater Display */}
        <Box
          p={6}
          bg="white"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
          textAlign="center"
        >
          <VStack gap={3}>
            {/* Placeholder for anteater image */}
            <Box
              w="120px"
              h="120px"
              bg="gradient.to-br, from='orange.200', to='orange.400'"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="4xl"
              mb={2}
            >
              🐜
            </Box>
            
            <Text fontSize="lg" fontWeight="600" color="orange.600">
              {anteater?.name || "Peter"}
            </Text>

            {/* Stats */}
            <VStack align="stretch" w="full" gap={2} mt={2}>
              <HStack justify="space-between" px={2}>
                <Text fontSize="sm" fontWeight="600">Health:</Text>
                <Text fontSize="sm" color="green.600">
                  {anteater?.health || 100}%
                </Text>
              </HStack>
              <HStack justify="space-between" px={2}>
                <Text fontSize="sm" fontWeight="600">Status:</Text>
                <Text fontSize="sm" color={anteater?.is_dead ? "red.600" : "green.600"}>
                  {anteater?.is_dead ? "Offline" : "Active"}
                </Text>
              </HStack>
              <HStack justify="space-between" px={2}>
                <Text fontSize="sm" fontWeight="600">Ants Collected:</Text>
                <Text fontSize="sm" color="blue.600">
                  {user?.ants || 0} 🐜
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* Action Buttons */}
        <VStack gap={2}>
          <Button
            colorScheme="blue"
            size="lg"
            w="full"
            onClick={onNext}
          >
            Continue
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem("pocketzot_user");
              window.location.reload();
            }}
          >
            Log Out
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
