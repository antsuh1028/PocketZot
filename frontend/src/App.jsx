import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";

const STORAGE_KEY = "pocketzot_note";
const BACKEND_URL = "http://127.0.0.1:8000/health";

export default function App() {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [apiStatus, setApiStatus] = useState("Not checked");

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((stored) => {
      setNote(stored[STORAGE_KEY] ?? "");
    });
  }, []);

  const save = async () => {
    await chrome.storage.local.set({ [STORAGE_KEY]: note.trim() });
    setStatus("Saved");
    window.setTimeout(() => setStatus(""), 1800);
  };

  const clear = async () => {
    await chrome.storage.local.remove(STORAGE_KEY);
    setNote("");
    setStatus("Cleared");
    window.setTimeout(() => setStatus(""), 1800);
  };

  const pingBackend = async () => {
    setApiStatus("Checking...");

    try {
      const response = await fetch(BACKEND_URL);
      if (!response.ok) {
        setApiStatus(`Backend error (${response.status})`);
        return;
      }

      const payload = await response.json();
      setApiStatus(`Healthy · ${payload.status}`);
    } catch {
      setApiStatus("Backend unreachable");
    }
  };

  return (
    <Box minW="320px" bg="gray.50" color="gray.800" p={3}>
      <VStack align="stretch" gap={3}>
        <Box>
          <Heading size="md">PocketZot</Heading>
          <Text fontSize="sm" color="gray.600">
            Frontend template is running.
          </Text>
        </Box>

        <Card.Root>
          <Card.Body>
            <VStack align="stretch" gap={2}>
              <Flex justify="space-between" align="center" gap={2}>
                <Text fontSize="xs" fontWeight="semibold">
                  Backend status
                </Text>
                <Button size="xs" variant="outline" onClick={pingBackend}>
                  Ping backend
                </Button>
              </Flex>
              <Input size="sm" value={apiStatus} readOnly />
            </VStack>
          </Card.Body>
        </Card.Root>

        <Box>
          <Text fontSize="xs" fontWeight="semibold" mb={1}>
            Quick note (saved locally)
          </Text>
          <Textarea
            id="noteInput"
            rows={4}
            placeholder="Type something..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            resize="vertical"
            bg="white"
          />
        </Box>

        <HStack gap={2}>
          <Button flex={1} onClick={save}>
            Save
          </Button>
          <Button flex={1} variant="outline" onClick={clear}>
            Clear
          </Button>
        </HStack>

        <Text fontSize="xs" color="green.700" minH="16px" aria-live="polite">
          {status}
        </Text>
      </VStack>
    </Box>
  );
}
