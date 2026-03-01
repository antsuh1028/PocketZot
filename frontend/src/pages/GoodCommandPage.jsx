import { Box, Text, Image, VStack, HStack, Button } from "@chakra-ui/react";

const FONT = "'Press Start 2P', monospace";
const REDDIT = "Reddit Mono, monospace";

export default function GoodCommandPage({ user, anteater, classification, onEnd }) {
  const name = anteater?.name || user?.name || "Georgia";
  const health = anteater?.health ?? 100;
  const ants = user?.ants ?? 0;
  const value = Number(classification?.value);
  const rawSuggestion = (classification?.suggestion || "").trim();
  const fallbackSuggestion =
    value === 2
      ? "Great deep-learning question. Keep asking for reasoning and alternatives to build mastery."
      : value === 1
        ? "Nice question! Add one more follow-up asking for an example to strengthen understanding."
        : "Keep it up!";
  const suggestion = rawSuggestion || fallbackSuggestion;

  return (
    <Box bg="#31FF51" minH="100%" p={5}>
      <VStack gap={5} align="center">

        {/* Header message */}
        <Box position="relative" w="full" textAlign="center" pt={2}>
          <Text fontFamily={REDDIT} fontSize="lg" fontWeight="600" color="#1a4a2a" zIndex={1} position="relative">
            Good command, you're learning!
          </Text>
        </Box>

        {/* Anteater card */}
        <Box bg="white" border="2px solid black" borderRadius={10} p={4} w="full">
          <VStack gap={3} align="center">
            <Image src="IdleSmooth.png" w="130px" />

            <Text fontFamily={FONT} fontSize="xl" color="#3a2e22" textAlign="center">
              {name}
            </Text>

            {/* Stats row */}
            <Box
              bg="#DBB166"
              border="2px solid black"
              borderRadius={4}
              w="full"
              p={3}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <VStack gap={1} align="flex-start">
                <Text fontFamily={FONT} fontSize="xs" color="#3a2e22">Health</Text>
                <HStack gap={2}>
                  <Text fontSize="14px">❤️</Text>
                  <Box w="80px" h="8px" bg="#8a7a6a" borderRadius={2}>
                    <Box w={`${health}%`} h="100%" bg="#7ab86a" borderRadius={2} />
                  </Box>
                </HStack>
              </VStack>

              <VStack gap={1} align="center">
                <Text fontFamily={FONT} fontSize="xs" color="#3a2e22">Ants</Text>
                <HStack gap={1}>
                  <Text fontFamily={FONT} fontSize="sm" color="#3a2e22">{ants}</Text>
                  <Image src="NakedAnt.png" boxSize="24px" />
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Suggestion box */}
        <Box
          p={5}
          border="2px solid black"
          w="full"
          borderRadius={10}
          bg="#00364C"
        >
          <VStack fontFamily={REDDIT} gap={2}>
            <Text color="#4CF190" fontSize="sm" textAlign="left" w="full">
              {suggestion}
            </Text>
          </VStack>
        </Box>

        <Button
          fontFamily={FONT}
          fontSize="lg"
          bg="#A90000"
          color="white"
          border="2px solid black"
          borderRadius="lg"
          w="80%"
          py={6}
          onClick={onEnd}
          _hover={{ bg: "#8a0000" }}
          _active={{ transform: "translateY(1px)" }}
        >
          End
        </Button>

      </VStack>
    </Box>
  );
}