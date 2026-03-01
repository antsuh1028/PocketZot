import { Box, Text, Button } from "@chakra-ui/react";

const FONT = "'Press Start 2P', monospace";

function TitleBar() {
  return (
    <Box
      bg="var(--panel)"
      borderBottom="1px solid var(--border)"
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

function Card({ children, align }) {
  return (
    <Box
      display="flex"
      justifyContent={align === "right" ? "flex-end" : "flex-start"}
      px="10px"
      py={16}
    >
      <Box
        maxW="58%"
        bg="#9C7B6D"
        border="2px solid #6a5a4a"
        borderRadius="4px"
        p={4}
        fontFamily={FONT}
        fontSize="xs"
        color="white"
        lineHeight={1.9}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function HowSheHelpsPage({ onNext }) {
  return (
    <Box bg="var(--bg)" border="1px solid #b0c4d8" boxShadow="0 2px 8px rgba(0,0,0,0.15)"
      display="flex" flexDir="column" h="590px">
      <TitleBar />

      <Box flex={1} display="flex" flexDir="column" minHeight={0}>
        <Box p={5} overflowY="auto" flex={1}>
          <Text fontFamily={FONT} fontSize="2xl" color="#222" mb={6}>How?</Text>

          <Box pb={9}>
            <Card align="right">
              If your ai prompt is deemed bad for your learning,
            </Card>
            <Card align="left">
              pocketzot will suggest ways to improve!
            </Card>
            <Card align="right">
              We have trained an LLM to rate your prompts, and help you learn!
            </Card>
          </Box>
        </Box>

        {/* Next button */}
        <Box display="flex" justifyContent="flex-end" px={5} pb={5} pt={2} flexShrink={0}>
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
      </Box>

      <Box h="8px" bg="var(--panel)" borderTop="1px solid var(--border)" />
    </Box>
  );
}