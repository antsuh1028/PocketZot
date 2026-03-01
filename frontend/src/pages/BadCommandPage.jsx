import { Box, Text, Image, VStack, HStack, Button } from "@chakra-ui/react";

const FONT = "'Press Start 2P', monospace";
const REDDIT = "Reddit Mono, monospace";

export default function BadCommandPage({ user, anteater, classification, onEnd }) {
  const name = anteater?.name || user?.name || "Georgia";
  const health = anteater?.health ?? 100;
  const ants = user?.ants ?? 0;
  const suggestion = classification?.suggestion || "Try asking a more specific question to deepen your understanding!";

  return (
    <Box bg="#FFA0A0" minH="100%" p={5}>
      <VStack gap={5} align="center">

        {/* Header */}
        <Text fontFamily={REDDIT} fontSize="lg" fontWeight="600" color="#6a0000" pt={2} textAlign="center">
          Ouchie!
        </Text>

        {/* Anteater card */}
        <Box bg="white" border="2px solid black" borderRadius={10} p={4} w="full">
          <VStack gap={3} align="center">
            {/* Sad/hurt anteater — reuse idle, or swap to a hurt sprite if available */}
            <Box position="relative">
              <Image src="IdleSmooth.png" w="130px" style={{ filter: "hue-rotate(300deg) saturate(0.6)" }} />
              {/* Pain indicator */}
              <Text position="absolute" top="-8px" right="-8px" fontSize="24px">💔</Text>
            </Box>

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
                    <Box w={`${health}%`} h="100%" bg="#e05050" borderRadius={2} />
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
            <Text color="#FF8080" fontSize="xs" fontFamily={FONT} w="full">Try instead:</Text>
            <Text color="#f0f0f0" fontSize="sm" textAlign="left" w="full">
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