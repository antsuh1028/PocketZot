import { Box, Text, Button, VStack } from "@chakra-ui/react";

const FONT = "'Press Start 2P', monospace";

function TitleBar() {
  return (
    <Box
      bg="white"
      borderBottom="1px solid #d0d0d0"
      px={3} py="8px"
      display="flex" alignItems="center" justifyContent="space-between"
    >
      <Text fontFamily={FONT} fontSize="10px" color="#333">Pocket Zot</Text>
      <Box display="flex" gap="8px" alignItems="center">
        <Text fontSize="14px" color="#555" cursor="pointer">⊞</Text>
        <Text fontSize="14px" color="#555" cursor="pointer">✕</Text>
      </Box>
    </Box>
  );
}

function Card({ children, style = {} }) {
  return (
    <Box
      bg="#9C7B6D"
      border="2px solid #6a5a4a"
      borderRadius="4px"
      p={4}
      fontFamily={FONT}
      fontSize="xs"
      color="white"
      lineHeight={1.9}
      style={style}
    >
      {children}
    </Box>
  );
}

export default function HowSheHelpsPage({ onNext }) {
  return (
    <Box bg="white" border="1px solid #b0c4d8" boxShadow="0 2px 8px rgba(0,0,0,0.15)"
      display="flex" flexDir="column" h="590px">
      <TitleBar />

      <VStack p={5} flex={1} align="stretch" gap={0}>
        {/* "How?" heading */}
        <Text fontFamily={FONT} fontSize="2xl" color="#222" mb={6}>How?</Text>

        {/* Stacked overlapping cards */}
        <Box position="relative" h="260px" mb={4}>

          {/* Card 1 — top right, behind */}
          <Box position="absolute" top="0" right="0" w="65%">
            <Card>
              If they are deemed bad for your learning,
            </Card>
          </Box>

          {/* Card 2 — middle, behind bottom-left */}
          <Box position="absolute" top="60px" right="20px" w="55%">
            <Card>
              she will suggest ways to improve!
            </Card>
          </Box>

          {/* Card 3 — bottom left, on top */}
          <Box position="absolute" bottom="0" left="0" w="65%" zIndex={2}>
            <Card>
              Georgia is trained by an LLM to rate your prompts.
            </Card>
          </Box>

        </Box>

        {/* Next button */}
        <Box display="flex" justifyContent="flex-end" mt="auto">
          <Button
            bg="#72645E" color="white" borderRadius={8}
            fontFamily={FONT} fontSize="lg" minH="34px" px={6}
            onClick={onNext}
            _hover={{ filter: "brightness(0.95)" }}
            _active={{ transform: "translateY(1px)" }}
          >
            Next
          </Button>
        </Box>
      </VStack>

      <Box h="8px" bg="#e8e8e8" borderTop="1px solid #d0d0d0" />
    </Box>
  );
}