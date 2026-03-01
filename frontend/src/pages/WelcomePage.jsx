import {
  Box,
  Button,
  Heading,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import Header from "../components/Header.jsx";

export default function WelcomePage({ onSignUp, onLogIn }) {
  return (
    <Box minW="375px" minH="400px" bg="gray.50" color="gray.800" p={4}>
      <VStack align="stretch" gap={4} maxW="400px" mx="auto" h="full" justify="center">
        <Header />

        {/* Welcome Message */}
        <Box textAlign="center" py={4}>
          <Heading size="lg" mb={3}>Welcome to Pocket Zot!</Heading>
        </Box>

        {/* Anteater Illustration Placeholder */}
        <Box
          w="160px"
          h="160px"
          mx="auto"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="6xl"
          boxShadow="lg"
        >
          <Image src="/Plop.png" w="100%" h="100%" />
        </Box>

        {/* Action Buttons */}
        <VStack gap={3} pt={2}>
          <Button
            colorScheme="orange"
            size="lg"
            w="full"
            onClick={onSignUp}
            fontWeight="bold"
          >
            Get Started
          </Button>

          <Button
            variant="outline"
            size="lg"
            w="full"
            onClick={onLogIn}
          >
            Log in
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
