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
    <Box fontFamily="system-ui">
      <VStack p={4} spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold" color="#3a2e22">How?</Text>

        <Box>
          <Box>
            
          </Box>
        </Box>

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