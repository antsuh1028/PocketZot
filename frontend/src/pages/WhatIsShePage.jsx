import { Box, Text, Image } from "@chakra-ui/react";
import { PixBtn } from "./WelcomePage.jsx";

const FONT = "'Press Start 2P', monospace";

function TitleBar() {
  return (
    <Box
      bg="var(--panel)"
      borderBottom="3px solid var(--border)"
      px={3}
      py="5px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontFamily={FONT} fontSize="9px" color="var(--dark)">
        Pocket Zot
      </Text>
      <Box display="flex" gap="4px">
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
      </Box>
    </Box>
  );
}

function InfoCard({ children }) {
  return (
    <Box
      flex={1}
      bg="#9C7B6D"
      border="2px solid var(--border)"
      p={3}
      fontFamily={FONT}
      fontSize="9px"
      color="var(--dark)"
      lineHeight={2}
      borderRadius="4px"
    >
      {children}
    </Box>
  );
}

export default function WhatIsShePage({ onNext }) {
  return (
    <Box
      bg="var(--bg)"
      border="3px"
      h="590px"
    >
      <TitleBar />
      <Box p={5}>
        {/* Anteater + speech bubble */}
        <Box display="flex" alignItems="flex-start" gap={3} mb={4}>
          <Image
            src="HomeJump.png"
            boxSize="48px"
            objectFit="contain"
            style={{ imageRendering: "pixelated", transform: "scaleX(-1)" }}
          />
          <Box
            position="relative"
            bg="var(--panel)"
            border="2px solid var(--border)"
            px={3}
            py={2}
          >
            <Box
              position="absolute"
              left="-9px"
              top="8px"
              w={0}
              h={0}
              borderTop="5px solid transparent"
              borderBottom="5px solid transparent"
              borderRight="9px solid var(--border)"
            />
            <Text fontFamily={FONT} fontSize="9px" color="var(--dark)">
              Zot zot!
            </Text>
          </Box>
        </Box>

        <Text fontFamily={FONT} fontSize="11px" color="var(--dark)" mb={4}>
          What is Pocket Zot?
        </Text>

        <Box display="flex" gap={3} mb={5}>
          <InfoCard>
            Georgia is a web extension. It helps you learn with AI the right
            way!
          </InfoCard>
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <PixBtn onClick={onNext}>Next</PixBtn>
        </Box>
      </Box>
    </Box>
  );
}
