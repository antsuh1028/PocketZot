import { Box, VStack, HStack, Button, Text } from "@chakra-ui/react";

function InfoPanel({ children }) {
  return (
    <Box bg="#d4c8b4" border="2px solid #8a7a6a" p={3} fontSize="sm" color="#3a2e22" lineHeight={1.8}>
      {children}
    </Box>
  );
}

export default function HowSheHelpsPage({ onNext }) {
  return (
    <Box w="550px" bg="#e8e0d0" border="3px solid #8a7a6a" boxShadow="4px 4px 0 #6a5a4a" fontFamily="system-ui">
      <Box bg="#d4c8b4" borderBottom="3px solid #8a7a6a" px={3} py={2}>
        <Text fontSize="sm" fontWeight="bold" color="#3a2e22">Pocket Zot</Text>
      </Box>
      <VStack p={4} spacing={4} align="stretch">
        <HStack justifyContent="space-between" alignItems="flex-start">
          <Text fontSize="xl" fontWeight="bold" color="#3a2e22">How?</Text>
          <Text fontSize="24px" flexShrink={0}>🐜</Text>
        </HStack>

        <HStack spacing={2} align="stretch">
          <InfoPanel>If they are deemed bad for your learning,</InfoPanel>
          <VStack spacing={2} flex={1}>
            <InfoPanel>Georgia is trained by an LLM to rate your prompts.</InfoPanel>
            <InfoPanel>she will suggest ways to improve!</InfoPanel>
          </VStack>
        </HStack>

        <Box display="flex" justifyContent="flex-end">
          <Button 
            onClick={onNext}
            bg="#c4b89a"
            border="2px solid #7a6a5a"
            color="#3a2e22"
            fontSize="sm"
            fontWeight="bold"
          >
            Next
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}