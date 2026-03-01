import { useEffect, useState } from "react";
import { Box, Text, HStack, VStack, Image } from "@chakra-ui/react";
import { PixBtn } from "./WelcomePage.jsx";

const FONT = "'Press Start 2P', monospace";
const BACKEND_URL = "http://127.0.0.1:8000";

export default function MainPage({ user, onShop }) {
  const [anteater, setAnteater] = useState(null);
  const [isSpawned, setIsSpawned] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND_URL}/api/anteaters`)
      .then((r) => r.json())
      .then((list) => setAnteater(list.find((a) => a.uid === user.id) || null))
      .catch(() => {});
  }, [user]);

  const handleSpawn = () => {
    if (isSpawned) return;
    
    // Send message to content script to spawn anteater
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "spawnAnteater" });
        setIsSpawned(true);
      }
    });
  };

  const name = anteater?.name || user?.name || "Georgia";
  const health = anteater?.health ?? 100;
  const ants = user?.ants ?? 0;

  return (
    <Box>
    <Box
      bg="#5B514C"
      border="3px solid var(--border)"
      boxShadow="4px 4px 0 #6a5a4a"
    >
      {/* Title bar */}
      <Box
        bg="var(--panel)"
        borderBottom="3px solid var(--border)"
        px={3}
        py="5px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontSize="16px">🏠</Text>
        <HStack gap="4px">
          {["◀", "✕"].map((s) => (
            <Box
              key={s}
              w="16px"
              h="16px"
              bg="var(--btn-bg)"
              border="2px solid var(--btn-border)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="8px"
              cursor="pointer"
              color="var(--dark)"
              fontFamily={FONT}
            >
              {s}
            </Box>
          ))}
        </HStack>
      </Box>

      <Box p={5}>
        <Text
          fontFamily={FONT}
          fontSize="32px"
          color="white"
          textAlign="center"
          mb={6}
        >
          {name}
        </Text>

        {/* Main content area */}
        <HStack gap={4} mb={5} align="flex-start" justifyContent="center">
          {" "}
          {/* Stats box on left */}
          <VStack
            gap={3}
            bg="var(--panel)"
            border="4px solid #DBB166"
            p={3}
            flex={1}
            h="170px"
          >
            <Box border="4px solid #DBB166" bg="black" py={1} px={2} mt={-9}>
              {" "}
              <Text
                fontFamily={FONT}
                fontSize="lg"
                color="#DBB166"
                bg="var(--bg)"
                px={2}
                py={-1}
                textAlign="center"
              >
                Stats
              </Text>
            </Box>

            {/* Health */}
            <VStack gap={1} w="full" align="flex-start">
              <Text fontFamily={FONT} fontSize="9px" color="var(--dark)">
                Health
              </Text>
              <HStack gap={2} w="full" align="center">
                <Text fontSize="14px">❤️</Text>
                <Box
                  flex={1}
                  h="8px"
                  bg="#8a7a6a"
                  border="2px solid var(--border)"
                >
                  <Box w={`${health}%`} h="100%" bg="#7ab86a" />
                </Box>
              </HStack>
            </VStack>

            {/* Ants */}
            <HStack gap={2} justify="center">
              <Text fontFamily={FONT} fontSize="10px" color="var(--dark)">
                Ants
              </Text>
              <Box
                w="28px"
                h="28px"
                borderRadius="50%"
                bg="#ff6b9d"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontFamily={FONT}
                fontSize="10px"
              >
                {ants}
              </Box>
            </HStack>
          </VStack>
          {/* Image and slots on right */}
          <VStack gap={3} align="center" flex={1} ml={4}>
            <Box
              position="relative"
              boxSize="120px"
              border="4px solid black"
              overflow="hidden"
            >
              <Image
                src="Background.png"
                boxSize="130px"
                objectFit="cover"
                style={{ marginTop: "-10px" }}
              />
              <Image
                src="Idle State.png"
                boxSize="90px"
                objectFit="contain"
                style={{ imageRendering: "pixelated" }}
                position="absolute"
                bottom="25px"
                left="50%"
                transform="translateX(-50%)"
              />
            </Box>

            {/* Accessory slots */}
            <HStack gap={2}>
              {[0, 1, 2, 3].map((i) => (
                <Box
                  key={i}
                  w="28px"
                  h="28px"
                  bg="var(--panel)"
                  border="2px solid var(--border)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="4px"
                >
                  <Box
                    w="16px"
                    h="16px"
                    borderRadius="50%"
                    bg={i === 0 ? "#7ab86a" : "#999"}
                  />
                </Box>
              ))}
            </HStack>
          </VStack>
        </HStack>

        {/* Message */}
        <Box w="full" display="flex" justifyContent="center">
          <Text
            fontFamily={FONT}
            fontSize="2xl"
            color="white"
            mb={4}
            noOfLines={2}
            lineHeight="1.2"
            textAlign="center"
            px={8}
          >
            Start your ai agent now!
          </Text>
        </Box>

        {/* Bottom section with shop */}
        <HStack gap={3} justify="space-between" mb={4}>
          <Box flex={1} />
          <Box
            w="36px"
            h="36px"
            bg="var(--panel)"
            border="2px solid var(--border)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            fontSize="20px"
            onClick={onShop}
          >
            🎁
          </Box>
        </HStack>

        
      </Box>
      
    </Box>
    <Box my={4} display="flex" justifyContent="center">
      <Box w="55%">
        <PixBtn 
          fullWidth 
          variant="green"
          bg="#5a9650"
          onClick={handleSpawn}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
  <g filter="url(#filter0_d_145_1630)">
    <rect width="1.74222" height="9.62803" fill="#27CA40"/>
    <rect x="0.825317" y="0.916992" width="1.74222" height="7.79412" fill="#27CA40"/>
    <rect x="1.65051" y="2.20068" width="1.74222" height="5.22665" fill="#27CA40"/>
    <rect x="2.75098" y="3.30103" width="1.74222" height="3.02595" fill="#27CA40"/>
  </g>
  <defs>
    <filter id="filter0_d_145_1630" x="0" y="0" width="6.6547" height="11.7896" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dx="1.29692" dy="1.29692"/>
      <feGaussianBlur stdDeviation="0.432306"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_145_1630"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_145_1630" result="shape"/>
    </filter>
  </defs>
</svg>
          {isSpawned ? "Agent Running!" : "Start"}
        </PixBtn>
      </Box>
    </Box>
    </Box>
  );
}
