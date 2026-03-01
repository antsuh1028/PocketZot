import { Box, Heading, Text } from "@chakra-ui/react";

export default function Header({ showSubtitle = true }) {
  return (
    <Box display="flex" gap="auto" width="full" borderBottom="solid black 3px" py={1} px={2} fontFamily="Reddit Mono">
      <Text fontSize="lg">Pocket Zot</Text>
    </Box>
  );
}
