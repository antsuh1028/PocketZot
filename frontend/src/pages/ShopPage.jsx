import { useState, useEffect } from "react";
import { Box, Text, HStack, SimpleGrid } from "@chakra-ui/react";
import { PixBtn } from "./WelcomePage.jsx";

const FONT = "'Press Start 2P', monospace";
const BACKEND_URL = "http://127.0.0.1:8000";

function TitleBar() {
  return (
    <Box bg="var(--panel)" borderBottom="3px solid var(--border)" px={3} py="5px"
      display="flex" alignItems="center" justifyContent="space-between">
      <Text fontFamily={FONT} fontSize="9px" color="var(--dark)">Pocket Zot</Text>
      <HStack gap="4px">
        {["◀","✕"].map(s => (
          <Box key={s} w="16px" h="16px" bg="var(--btn-bg)" border="2px solid var(--btn-border)"
            display="flex" alignItems="center" justifyContent="center"
            fontSize="8px" cursor="pointer" color="var(--dark)" fontFamily={FONT}>{s}</Box>
        ))}
      </HStack>
    </Box>
  );
}

export default function ShopPage({ user, onBack }) {
  const [items, setItems] = useState([]);
  const [confirming, setConfirming] = useState(null);
  const ants = user?.ants ?? 30;

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/accessories`)
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const displayItems = items.length ? items.slice(0, 6) : Array(6).fill(null);

  return (
    <Box bg="var(--bg)" border="3px solid var(--border)" boxShadow="4px 4px 0 #6a5a4a">
      <TitleBar />
      <Box p={5}>
        <HStack justify="space-between" mb={4}>
          <Text fontFamily={FONT} fontSize="14px" color="var(--dark)">Shop</Text>
          <Text fontFamily={FONT} fontSize="11px" color="var(--dark)">{ants} 🐜</Text>
        </HStack>

        <SimpleGrid columns={3} gap={3} mb={4}>
          {displayItems.map((item, i) => (
            <Box key={i} aspectRatio="1" bg="var(--panel)" border="2px solid var(--border)"
              cursor={item ? "pointer" : "default"} onClick={() => item && setConfirming(item)}
              display="flex" alignItems="center" justifyContent="center">
              {item?.image_url && <Box as="img" src={item.image_url} w="80%" h="80%" objectFit="contain" />}
            </Box>
          ))}
        </SimpleGrid>

        {/* Confirm modal */}
        {confirming && (
          <Box bg="var(--panel)" border="3px solid var(--border)" p={4} mt={2}>
            <HStack justify="space-between" mb={3}>
              <Text fontFamily={FONT} fontSize="10px" color="var(--dark)">Confirm Buy?</Text>
              <Text fontFamily={FONT} fontSize="11px" cursor="pointer" onClick={() => setConfirming(null)}>✕</Text>
            </HStack>
            <Box w="70px" h="70px" bg="var(--bg)" border="2px solid var(--border)" mx="auto" mb={3} />
            <HStack justify="space-between">
              <Text fontFamily={FONT} fontSize="9px" color="var(--dark)">{confirming?.price ?? 60} 🐜</Text>
              <PixBtn onClick={() => setConfirming(null)}>Buy</PixBtn>
            </HStack>
          </Box>
        )}
      </Box>
    </Box>
  );
}