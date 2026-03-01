import { Box, Text, Image, VStack, HStack, Button } from "@chakra-ui/react";

const FONT = "'Press Start 2P', monospace";
const REDDIT = "Reddit Mono, monospace";

export default function StudySummaryPage({ user, anteater, classifications = [], onDone }) {
  const name = anteater?.name || user?.name || "Georgia";
  const health = anteater?.health ?? 100;
  const ants = user?.ants ?? 0;

  // Tally classifications
  const good = classifications.filter(c => c.value > 0).length;
  const bad  = classifications.filter(c => c.value < 0).length;
  const total = classifications.length;

  // Learning level label
  const learningLevel =
    total === 0 ? "—"
    : good / total >= 0.8 ? "🌟 Master"
    : good / total >= 0.5 ? "📚 Learner"
    : "🌱 Beginner";

  return (
    <Box bg="#e8e0d0" minH="100%" p={5}>
      <VStack gap={5} align="center">

        <Text fontFamily={FONT} fontSize="xl" color="#3a2e22" textAlign="center" pt={2}>
          Study Summary
        </Text>

        {/* Anteater celebration */}
        <Box
          border="2px solid black"
          borderRadius={10}
          bg="#00364C"
          w="full"
          p={4}
          display="flex"
          justifyContent="center"
        >
          <Image src="AnteaterJump.png" w="100px" />
        </Box>

        {/* Main stats card */}
        <Box border="2px solid black" borderRadius={10} p={5} w="full" bg="white">
          <VStack gap={4} align="stretch">

            <Text fontFamily={FONT} fontSize="md" color="#3a2e22" textAlign="center">
              {name}
            </Text>

            <Box h="1px" w="full" bg="#c0b0a0" />

            {/* Ants eaten */}
            <HStack justify="space-between" align="center">
              <VStack align="flex-start" gap={0}>
                <Text fontFamily={REDDIT} fontSize="xs" color="#7a6a5a">Ants Earned</Text>
                <HStack gap={2} mt={1}>
                  <Text fontFamily={FONT} fontSize="lg" color="#3a2e22">{ants}</Text>
                  <Image src="NakedAnt.png" boxSize="28px" />
                </HStack>
              </VStack>

              {/* Health */}
              <VStack align="flex-end" gap={0}>
                <Text fontFamily={REDDIT} fontSize="xs" color="#7a6a5a">Health</Text>
                <HStack gap={2} mt={1}>
                  <Text fontSize="14px">❤️</Text>
                  <Box w="70px" h="8px" bg="#e0d0c0" borderRadius={2}>
                    <Box w={`${health}%`} h="100%" bg="#7ab86a" borderRadius={2} />
                  </Box>
                </HStack>
              </VStack>
            </HStack>

            <Box h="1px" w="full" bg="#c0b0a0" />

            {/* Prompt breakdown */}
            <VStack align="stretch" gap={2}>
              <Text fontFamily={REDDIT} fontSize="xs" color="#7a6a5a">Prompt Breakdown</Text>
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Box w="10px" h="10px" bg="#7ab86a" borderRadius={2} />
                  <Text fontFamily={REDDIT} fontSize="sm" color="#3a2e22">Good prompts</Text>
                </HStack>
                <Text fontFamily={FONT} fontSize="sm" color="#3a2e22">{good}</Text>
              </HStack>
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Box w="10px" h="10px" bg="#e05050" borderRadius={2} />
                  <Text fontFamily={REDDIT} fontSize="sm" color="#3a2e22">Bad prompts</Text>
                </HStack>
                <Text fontFamily={FONT} fontSize="sm" color="#3a2e22">{bad}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontFamily={REDDIT} fontSize="sm" color="#7a6a5a">Total</Text>
                <Text fontFamily={FONT} fontSize="sm" color="#3a2e22">{total}</Text>
              </HStack>
            </VStack>

            <Box h="1px" w="full" bg="#c0b0a0" />

            {/* Learning level */}
            <VStack align="center" gap={1}>
              <Text fontFamily={REDDIT} fontSize="xs" color="#7a6a5a">Learning Level</Text>
              <Text fontFamily={FONT} fontSize="md" color="#3a2e22">{learningLevel}</Text>
            </VStack>

          </VStack>
        </Box>

        {/* Done button */}
        <Button
          fontFamily={FONT}
          fontSize="md"
          bg="#72645E"
          color="white"
          border="2px solid black"
          borderRadius="lg"
          w="80%"
          py={6}
          onClick={onDone}
          _hover={{ bg: "#5a4a44" }}
          _active={{ transform: "translateY(1px)" }}
        >
          Done
        </Button>

      </VStack>
    </Box>
  );
}