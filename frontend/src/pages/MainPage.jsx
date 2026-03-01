import { useEffect, useState } from "react";
import { Box, Text, HStack, VStack, Image } from "@chakra-ui/react";
import { PixBtn } from "./WelcomePage.jsx";

const FONT = "'Press Start 2P', monospace";
const BACKEND_URL = "http://127.0.0.1:8000";

export default function MainPage({ user, onShop }) {
  const [anteater, setAnteater] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND_URL}/api/anteaters`)
      .then(r => r.json())
      .then(list => setAnteater(list.find(a => a.uid === user.id) || null))
      .catch(() => {});
  }, [user]);

  const name = anteater?.name || user?.name || "Georgia";
  const health = anteater?.health ?? 100;
  const ants = user?.ants ?? 0;

  return (
    <Box bg="var(--bg)" border="3px solid var(--border)" boxShadow="4px 4px 0 #6a5a4a">
      {/* Title bar */}
      <Box bg="var(--panel)" borderBottom="3px solid var(--border)" px={3} py="5px"
        display="flex" alignItems="center" justifyContent="space-between">
        <Text fontSize="16px">🏠</Text>
        <HStack gap="4px">
          {["◀","✕"].map(s => (
            <Box key={s} w="16px" h="16px" bg="var(--btn-bg)" border="2px solid var(--btn-border)"
              display="flex" alignItems="center" justifyContent="center"
              fontSize="8px" cursor="pointer" color="var(--dark)" fontFamily={FONT}>{s}</Box>
          ))}
        </HStack>
      </Box>

      <Box p={5}>
        <Text fontFamily={FONT} fontSize="16px" color="var(--dark)" textAlign="center" mb={4}>{name}</Text>

        {/* Health */}
        <HStack gap={3} mb={2} align="center">
          <Text fontFamily={FONT} fontSize="9px" color="var(--dark)" minW="50px">Health</Text>
          <Box flex={1} h="10px" bg="#8a7a6a" border="2px solid var(--border)">
            <Box w={`${health}%`} h="100%" bg="#7ab86a" />
          </Box>
        </HStack>

        {/* Ants */}
        <HStack gap={3} mb={5}>
          <Text fontFamily={FONT} fontSize="9px" color="var(--dark)" minW="50px">Ants</Text>
          <Text fontFamily={FONT} fontSize="9px" color="#5a7aaa">{ants} 🐜</Text>
        </HStack>

        {/* Main area */}
        <Box display="flex" alignItems="flex-end" justifyContent="space-between" mb={5}>
          <VStack gap={3}>
            <Slot />
            <Slot />
          </VStack>

          <Image src="/Idle State.png" boxSize="100px" objectFit="contain" style={{ imageRendering: "pixelated" }} />

          <VStack gap={3}>
            <Box w="36px" h="36px" bg="var(--panel)" border="2px solid var(--border)"
              display="flex" alignItems="center" justifyContent="center"
              cursor="pointer" fontSize="18px" onClick={onShop}>🎁</Box>
          </VStack>
        </Box>

        <PixBtn fullWidth variant="green" onClick={() => {}}>Start</PixBtn>
      </Box>
    </Box>
  );
}

function Slot() {
  return (
    <Box w="36px" h="36px" bg="#c4503a" border="2px solid #8a2a1a"
      display="flex" alignItems="center" justifyContent="center"
      fontFamily={FONT} fontSize="13px" color="white" fontWeight="bold">E</Box>
  );
}