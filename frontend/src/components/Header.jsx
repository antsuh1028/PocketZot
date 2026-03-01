import { Box, Heading, Text } from "@chakra-ui/react";

export default function Header({ showSubtitle = true }) {
  return (
    <Box textAlign="center" py={3}>
      <Heading
        size="2xl"
        bgGradient="linear(to-r, orange.400, orange.600)"
        bgClip="text"
        fontWeight="bold"
        letterSpacing="tight"
      >
        🐜 PocketZot
      </Heading>
      {showSubtitle && (
        <Text fontSize="sm" color="gray.600" mt={1}>
          Your AI companion anteater
        </Text>
      )}
    </Box>
  );
}
