import { useEffect, useState } from "react";
import AnteaterButton from "./anteaterchar/AnteaterButton.jsx";
import {
  Box,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

const STORAGE_KEY = "pocketzot_note";
const BACKEND_URL = "http://127.0.0.1:8000/health";

export default function App() {
  
  return (
    <Box minW="375px" minH="400px" bg="gray.50" color="gray.800" p={3}>
      <VStack align="stretch" gap={3}>
        <Box>
          <Heading size="lg">PocketZot</Heading>
          <Text fontSize="sm" color="gray.600">
            A virtual pet to track your AI use!
          </Text>
          <AnteaterButton />
        </Box>
      </VStack>
    </Box>
  );
}
