import {
  Box,
  Button,
  Heading,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import Header from "../components/Header.jsx";

export function PixBtn({
  children,
  onClick,
  fullWidth,
  variant = "default",
  bg,
  color,
  border,
}) {
  const variantStyles = {
    default: {
      bg: "var(--btn-bg)",
      color: "var(--dark)",
      border: "2px solid var(--btn-border)",
    },
    green: {
      bg: "#7ab86a",
      color: "#1f2a1a",
      border: "2px solid #4d7f41",
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <Button
      onClick={onClick}
      width={fullWidth ? "100%" : "auto"}
      minH="34px"
      px={4}
      bg={bg || style.bg}
      color={color || style.color}
      border={border || style.border}
      borderRadius={0}
      fontFamily="'Press Start 2P', monospace"
      fontSize="9px"
      _hover={{ filter: "brightness(0.95)" }}
      _active={{ transform: "translateY(1px)" }}
    >
      {children}
    </Button>
  );
}

export default function WelcomePage({ onSignUp, onLogIn }) {
  return (
    <Box minW="375px" minH="400px" bg="gray.50" color="gray.800" p={4}>
      <VStack align="stretch" gap={4} px={8} maxW="350px" mx="auto" h="full" justify="center">

        {/* Welcome Message */}
        <Box textAlign="center" py={4}>
          <Heading fontFamily="Reddit Mono" size="4xl" mb={3}>
            Welcome to Pocket Zot!
          </Heading>
        </Box>

        {/* Anteater Illustration Placeholder */}
        <VStack
        >
          <Image src="USEFUL.png" width="150px"/>
          <Image src="WelcomeHand.png" width="180px"/>
        </VStack>

        {/* Action Buttons */}
        <VStack pt={2} fontFamily="Reddit Mono">
          <Button
            bg="#72645E"
            size="lg"
            width="full"
            onClick={onSignUp}
            fontWeight="bold"
            borderRadius={10}
            marginBottom="30px"
          >
            Sign Up
          </Button>

          <Button
            variant="outline"
            borderColor="#72645E"
            borderWidth={2}
            size="lg"
            width="full"
            onClick={onLogIn}
            borderRadius={10}
          >
            Log in
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
