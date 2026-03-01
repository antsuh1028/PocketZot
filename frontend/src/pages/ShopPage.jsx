import { useState, useEffect } from "react";
import { Box, Text, HStack, SimpleGrid } from "@chakra-ui/react";
import { PixBtn } from "./WelcomePage.jsx";

const FONT = "'Press Start 2P', monospace";
const BACKEND_URL = "http://127.0.0.1:8000";

function TitleBar({ onBack }) {
  return (
    <Box bg="var(--panel)" borderBottom="3px solid var(--border)" px={3} py="5px"
      display="flex" alignItems="center" justifyContent="space-between">
      <Text fontFamily={FONT} fontSize="9px" color="var(--dark)">Pocket Zot</Text>
      <HStack gap="4px">
        <Box w="16px" h="16px" bg="var(--btn-bg)" border="2px solid var(--btn-border)"
          display="flex" alignItems="center" justifyContent="center"
          fontSize="8px" cursor="pointer" color="var(--dark)" fontFamily={FONT}
          onClick={onBack}>◀</Box>
        <Box w="16px" h="16px" bg="var(--btn-bg)" border="2px solid var(--btn-border)"
          display="flex" alignItems="center" justifyContent="center"
          fontSize="8px" cursor="pointer" color="var(--dark)" fontFamily={FONT}>✕</Box>
      </HStack>
    </Box>
  );
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^(?:https?:|data:|chrome-extension:)/i.test(imageUrl)) return imageUrl;
  if (typeof chrome !== "undefined" && chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(imageUrl);
  }
  return imageUrl;
}

export default function ShopPage({ user, onBack, onUserUpdate }) {
  const uid = user?.id ?? 1;
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [confirming, setConfirming] = useState(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState(null);
  const ants = user?.ants ?? 0;

  const fetchShop = () => {
    fetch(`${BACKEND_URL}/api/accessories/user/${uid}/shop`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  };

  const fetchInventory = () => {
    fetch(`${BACKEND_URL}/api/accessories/user/${uid}/inventory`)
      .then((r) => r.json())
      .then(setInventory)
      .catch(() => setInventory([]));
  };

  useEffect(() => {
    fetchShop();
    fetchInventory();
  }, [uid]);

  const handleBuy = async () => {
    if (!confirming || !user) return;
    setBuying(true);
    setError(null);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/accessories/user/${uid}/buy/${confirming.id}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? "Purchase failed");
      }
      const bought = await res.json();
      fetchShop();
      fetchInventory();
      if (onUserUpdate) {
        const userRes = await fetch(`${BACKEND_URL}/api/users/${uid}`);
        const u = await userRes.json();
        onUserUpdate(u);
      }
      setConfirming(null);
    } catch (e) {
      setError(e.message ?? "Could not purchase");
    } finally {
      setBuying(false);
    }
  };

  const setEquippedHat = (hat) => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ pocketzot_equipped_hat: hat });
    }
  };

  const toggleEquip = async (ua) => {
    if (!ua) return;
    const isEquipped = ua.anteater_id != null;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/accessories/${ua.id}/${isEquipped ? "unequip" : "equip"}`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      fetchInventory();
      const hat = !isEquipped ? { image_url: updated.image_url, name: updated.name, user_accessory_id: updated.id } : null;
      setEquippedHat(hat);
    } catch {
      if (!isEquipped) {
        setEquippedHat({ image_url: ua.image_url, name: ua.name, user_accessory_id: ua.id });
      } else {
        setEquippedHat(null);
      }
      fetchInventory();
    }
  };

  const displayItems = items.length ? items.slice(0, 6) : Array(6).fill(null);
  const ownedHats = inventory.filter((i) => i.type === "hat");

  return (
    <Box bg="var(--bg)" border="3px solid var(--border)" boxShadow="4px 4px 0 #6a5a4a">
      <TitleBar onBack={onBack} />
      <Box p={5}>
        <HStack justify="space-between" mb={4}>
          <Text fontFamily={FONT} fontSize="14px" color="var(--dark)">Shop</Text>
          <Text fontFamily={FONT} fontSize="11px" color="var(--dark)">{ants} 🐜</Text>
        </HStack>

        <SimpleGrid columns={3} gap={3} mb={4}>
          {displayItems.map((item, i) => (
            <Box
              key={item?.id ?? i}
              aspectRatio="1"
              bg="var(--panel)"
              border="2px solid var(--border)"
              cursor={item ? "pointer" : "default"}
              onClick={() => item && !item.owned && setConfirming(item)}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {item?.image_url && (
                <Box
                  as="img"
                  src={resolveImageUrl(item.image_url)}
                  w="80%"
                  h="80%"
                  objectFit="contain"
                />
              )}
            </Box>
          ))}
        </SimpleGrid>

        {ownedHats.length > 0 && (
          <Box mb={4}>
            <Text fontFamily={FONT} fontSize="9px" color="var(--dark)" mb={2}>
              Your hats (click to equip/unequip)
            </Text>
            <HStack gap={2} flexWrap="wrap">
              {ownedHats.map((ua) => (
                <Box
                  key={ua.id}
                  w="60px"
                  h="60px"
                  bg="var(--panel)"
                  border={ua.anteater_id ? "3px solid var(--border)" : "2px solid var(--border)"}
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  onClick={() => toggleEquip(ua)}
                >
                  {ua.image_url && (
                    <Box
                      as="img"
                      src={resolveImageUrl(ua.image_url)}
                      w="80%"
                      h="80%"
                      objectFit="contain"
                    />
                  )}
                </Box>
              ))}
            </HStack>
          </Box>
        )}

        {/* Confirm buy overlay — full-screen popup */}
        {confirming && (
          <Box
            position="fixed"
            inset={0}
            zIndex={9999}
            bg="rgba(0,0,0,0.6)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={(e) => e.target === e.currentTarget && setConfirming(null)}
          >
            <Box
              bg="var(--panel)"
              border="3px solid var(--border)"
              p={5}
              maxW="300px"
              onClick={(e) => e.stopPropagation()}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontFamily={FONT} fontSize="10px" color="var(--dark)">
                  Confirm Buy?
                </Text>
                <Text
                  fontFamily={FONT}
                  fontSize="11px"
                  cursor="pointer"
                  onClick={() => setConfirming(null)}
                >
                  ✕
                </Text>
              </HStack>
              <Box
                w="70px"
                h="70px"
                bg="var(--bg)"
                border="2px solid var(--border)"
                mx="auto"
                mb={3}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {confirming.image_url && (
                  <Box
                    as="img"
                    src={resolveImageUrl(confirming.image_url)}
                    maxW="90%"
                    maxH="90%"
                    objectFit="contain"
                  />
                )}
              </Box>
              <HStack justify="space-between">
                <Text fontFamily={FONT} fontSize="9px" color="var(--dark)">
                  {(confirming.price ?? 1)} 🐜
                </Text>
                <PixBtn onClick={handleBuy} disabled={buying}>
                  {buying ? "..." : "Buy"}
                </PixBtn>
              </HStack>
              {error && (
                <Text fontFamily={FONT} fontSize="8px" color="red.600" mt={2}>
                  {error}
                </Text>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
