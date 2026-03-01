import { useState, useEffect } from "react";
import { Box, Text, HStack, SimpleGrid } from "@chakra-ui/react";
import { PixBtn } from "./WelcomePage.jsx";

const FONT = "'Press Start 2P', monospace";
const BACKEND_URL = "http://localhost:8000";

function TitleBar({ onBack }) {
  return (
    <Box bg="var(--panel)" borderBottom="2px solid var(--border)" px={3} py="5px"
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

function AnteaterPreview({ equippedHat }) {
  const walkUrl = resolveImageUrl("dist/anteaterchar/assets/WALK LEFT.png");
  return (
    <Box position="relative" w="100px" h="100px" mx="auto" flexShrink={0}>
      {walkUrl && (
        <Box
          as="img"
          src={walkUrl}
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="contain"
          style={{ imageRendering: "pixelated" }}
        />
      )}
      {equippedHat?.image_url && (
        <Box
          position="absolute"
          inset={0}
          display="flex"
          alignItems="flex-start"
          justifyContent="center"
          pointerEvents="none"
        >
          <Box
            as="img"
            src={resolveImageUrl(equippedHat.image_url)}
            maxW="120%"
            maxH="70px"
            objectFit="contain"
            style={{
              marginTop: equippedHat?.name?.toLowerCase?.().includes("merrier") ? "8px" : "-10px",
              transform: equippedHat?.name?.toLowerCase?.().includes("merrier") ? "scaleX(-1)" : undefined,
              imageRendering: "pixelated",
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default function ShopPage({ user, onBack, onUserUpdate }) {
  const uid = user?.id ?? 1;
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [anteater, setAnteater] = useState(null);
  const [equippedHat, setEquippedHat] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState(null);
  const [clickFeedbackId, setClickFeedbackId] = useState(null);
  const ants = user?.ants ?? 0;

  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND_URL}/api/anteaters`)
      .then((r) => r.json())
      .then((list) => setAnteater(list.find((a) => a.uid === user.id) || null))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) return;
    chrome.storage.local.get("pocketzot_equipped_hat", (data) => {
      setEquippedHat(data?.pocketzot_equipped_hat || null);
    });
    const listener = (changes, area) => {
      if (area === "local" && changes.pocketzot_equipped_hat) {
        setEquippedHat(changes.pocketzot_equipped_hat.newValue || null);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

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

  const handleBuy = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
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

  const persistEquippedHat = (hat) => {
    setEquippedHat(hat);
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) return;
    chrome.runtime.sendMessage({ action: "EQUIP_HAT", hat });
  };

  const handleRemoveAllHats = async () => {
    if (equippedHat?.user_accessory_id) {
      try {
        await fetch(
          `${BACKEND_URL}/api/accessories/${equippedHat.user_accessory_id}/unequip`,
          { method: "PATCH" }
        );
      } catch { /* ignore */ }
    }
    if (typeof chrome !== "undefined") {
      if (chrome.storage?.local) chrome.storage.local.set({ pocketzot_equipped_hat: null });
      if (chrome.runtime?.sendMessage) chrome.runtime.sendMessage({ action: "EQUIP_HAT", hat: null });
    }
    setEquippedHat(null);
    fetchInventory();
  };

  const toggleEquip = async (ua) => {
    if (!ua) return;
    setClickFeedbackId(ua.id);
    setTimeout(() => setClickFeedbackId(null), 300);
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
      persistEquippedHat(hat);
    } catch {
      if (!isEquipped) {
        persistEquippedHat({ image_url: ua.image_url, name: ua.name, user_accessory_id: ua.id });
      } else {
        persistEquippedHat(null);
      }
      fetchInventory();
    }
  };

  const displayItems = items.length ? items.slice(0, 6) : Array(6).fill(null);
  const ownedHats = inventory.filter((i) => i.type === "hat");
  const anteaterName = anteater?.name || user?.name || "Bobby";

  return (
    <Box
      bg="var(--bg)"
      display="flex"
      flexDir="column"
      minH="500px"
      h="100%"
    >
      <TitleBar onBack={onBack} />
      {/* Top section: Shop + ants */}
      <Box px={4} pt={4} pb={2}>
        <HStack justify="space-between">
          <Text fontFamily={FONT} fontSize="14px" color="var(--dark)">Shop</Text>
          <Text fontFamily={FONT} fontSize="11px" color="var(--dark)">{ants} 🐜</Text>
        </HStack>
      </Box>

      {/* Centered anteater name */}
      <Text
        color="#000"
        textAlign="center"
        fontFamily={FONT}
        fontSize="14px"
        fontStyle="normal"
        fontWeight={400}
        lineHeight="normal"
        letterSpacing="0.144px"
        mt={1}
        mb={2}
      >
        {anteaterName}
      </Text>

      {/* Walk sprite + equipped hat preview - pushed down ~2 enter's space */}
      <Box display="flex" justifyContent="center" mt={6} mb={3}>
        <Box transform="scale(1.15)">
          <AnteaterPreview equippedHat={equippedHat} />
        </Box>
      </Box>

      {/* Hats section - ~1 enter below anteater, brown bg from here down */}
      <Box flex={1} minH="140px" mt={4} px={4} py={3} pb={4} overflowY="auto" display="flex" flexDir="column" bg="#72645E">
        <HStack justify="space-between" align="center" mb={3}>
          <Text fontFamily={FONT} fontSize="medium" color="#000">Hats:</Text>
          <Box
            as="button"
            fontFamily={FONT}
            fontSize="8px"
            px={2}
            py={1}
            bg="#8B3A3A"
            color="#fff"
            border="2px solid var(--border)"
            cursor="pointer"
            _hover={{ opacity: 0.9 }}
            _active={{ transform: "scale(0.96)" }}
            onClick={handleRemoveAllHats}
          >
            Remove all hats
          </Box>
        </HStack>
        <SimpleGrid columns={2} gap={3} flex={1}>
            {displayItems.map((item, i) => {
              const ua = item?.owned ? inventory.find((inv) => inv.id === item.user_accessory_id || (inv.accessory_id === item.id)) : null;
              const isClickFeedback = ua && clickFeedbackId === ua.id;
              const isOwned = item?.owned ?? false;
              return (
              <Box
                key={item?.id ?? i}
                aspectRatio="1"
                bg="#B69D94"
                border="2px solid var(--border)"
                borderColor={isClickFeedback ? "green.500" : undefined}
                boxShadow={isClickFeedback ? "0 0 0 3px rgba(34,197,94,0.6)" : undefined}
                cursor={item ? "pointer" : "default"}
                transform={isClickFeedback ? "scale(0.92)" : undefined}
                transition="transform 0.1s, border-color 0.1s, box-shadow 0.1s"
                position="relative"
                onClick={() => {
                  if (!item) return;
                  if (item.owned) {
                    if (ua) toggleEquip(ua);
                  } else {
                    setConfirming(item);
                  }
                }}
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
                  style={{ imageRendering: "pixelated" }}
                />
              )}
              {!isOwned && item && (
                <>
                  <Box
                    position="absolute"
                    inset={0}
                    bg="gray"
                    opacity={0.75}
                    pointerEvents="none"
                  />
                  <Text
                    position="absolute"
                    bottom={1}
                    right={1}
                    fontFamily={FONT}
                    fontSize="8px"
                    color="#000"
                    pointerEvents="none"
                  >
                    {(item?.price ?? 1)} 🐜
                  </Text>
                </>
              )}
            </Box>
          );})}
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
                  borderColor={clickFeedbackId === ua.id ? "green.500" : undefined}
                  boxShadow={clickFeedbackId === ua.id ? "0 0 0 3px rgba(34,197,94,0.6)" : undefined}
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transform={clickFeedbackId === ua.id ? "scale(0.92)" : undefined}
                  transition="transform 0.1s, border-color 0.1s, box-shadow 0.1s"
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
      </Box>

      {/* Confirm buy overlay - full-screen popup */}
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
              bg="white"
              border="3px solid var(--border)"
              p={5}
              maxW="300px"
              boxShadow="0 4px 20px rgba(0,0,0,0.4)"
              onClick={(e) => e.stopPropagation()}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontFamily={FONT} fontSize="10px" color="#1a1a1a">
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
                bg="gray.100"
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
  );
}
