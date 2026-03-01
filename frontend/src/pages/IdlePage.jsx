import { Box, Text, Image, VStack, HStack, Button } from "@chakra-ui/react";

const FONT = "'Press Start 2P', monospace";
const REDDIT = "Reddit Mono, monospace";

export default function IdlePage({ user, anteater, onEnd }) {
  const name = anteater?.name || user?.name || "Georgia";
  const health = anteater?.health ?? 100;
  const ants = user?.ants ?? 0;

  return (
    <Box bg="#72645E" minH="100%" p={5}>
      <VStack gap={5} align="center">

        <Text fontFamily={REDDIT} fontSize="2xl" color="white" fontWeight="600" pt={2} textAlign="center">
          Send a command!
        </Text>

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
              {/* Health */}
              <VStack gap={1} align="flex-start">
                <Text fontFamily={FONT} fontSize="xs" color="#3a2e22">Health</Text>
                <HStack gap={2}>
                  <Text fontSize="14px">❤️</Text>
                  <Box w="80px" h="8px" bg="#8a7a6a" borderRadius={2}>
                    <Box w={`${health}%`} h="100%" bg="#7ab86a" borderRadius={2} />
                  </Box>
                </HStack>
              </VStack>

              {/* Ants */}
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

        {/* End button */}
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