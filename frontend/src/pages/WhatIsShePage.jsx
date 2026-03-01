import { Box, Text, Image, VStack, Button, } from "@chakra-ui/react";
import { PixBtn } from "./WelcomePage.jsx";

const FONT = "'Press Start 2P', monospace";

function TitleBar() {
  return (
    <Box
      bg="white"
      borderBottom="1px solid #d0d0d0"
      px={3}
      py="8px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontFamily={FONT} fontSize="10px" color="#333">
        Pocket Zot
      </Text>
      <Box display="flex" gap="8px" alignItems="center">
        <Text fontSize="14px" color="#555" cursor="pointer">⊞</Text>
        <Text fontSize="14px" color="#555" cursor="pointer">✕</Text>
      </Box>
    </Box>
  );
}

export default function WhatIsShePage({ onNext }) {
  return (
    <Box
      bg="white"
      border="1px solid #b0c4d8"
      boxShadow="0 2px 8px rgba(0,0,0,0.15)"
      display="flex"
      flexDir="column"
      w="auto"
      h="590px"
      pt={8}
    >
      <TitleBar />

      <VStack p={5} flex={1} align="stretch" gap={5}>

        {/* Anteater + speech bubble */}
        <Box display="flex" alignItems="flex-start" gap={2} pt={4}pl={4} >
          <Image
            src="HomeJump.png"
            boxSize="64px"
            objectFit="contain"
            style={{ imageRendering: "pixelated", transform: "scaleX(-1)" }}
          />
          {/* Speech bubble */}
          <Box position="relative" mt={1}>
            {/* tail */}
            <Box
              position="absolute"
              left="-8px"
              top="10px"
              w={0} h={0}
              borderTop="6px solid transparent"
              borderBottom="6px solid transparent"
              borderRight="8px solid #666"
            />
            <Box
              position="absolute"
              left="-6px"
              top="11px"
              w={0} h={0}
              borderTop="5px solid transparent"
              borderBottom="5px solid transparent"
              borderRight="7px solid white"
            />
            <Box
              bg="white"
              border="2px solid #666"
              borderRadius="6px"
              px={3}
              py={2}
            >
              <Text fontFamily={FONT} fontSize="md" color="#333">
                Zot zot!
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Heading */}
        <Text fontFamily={FONT} fontSize="2xl" color="#222" lineHeight={1.6} textAlign="center" noOfLines={1} mt={-6}>
          What is Pocket Zot?
        </Text>

        {/* Info card */}
        <Box
          bg="#9C7B6D"
          border="2px solid #6a5a4a"
          borderRadius="8px"
          p={2}
          fontFamily={FONT}
          fontSize="xs"
          color="white"
          lineHeight={1.7}
          w="50%"
          alignSelf="flex-end"
          boxShadow="8px 8px 0 rgba(0, 0, 0, 0.25)"
          textAlign="center"
          mr={6}
        >
          Georgia is a web extension.
          <br /><br />
          It helps you learn with AI the right way!
        </Box>

        {/* Next button */}
        <Box display="flex" justifyContent="flex-end">
          <Box display="flex" justifyContent="flex-end" mt={3}>
                    <Button
                      bg="#72645E"
                      color="white"
                      borderRadius={8}
                      fontFamily={FONT}
                      fontSize="lg"
                      minH="34px"
                      px={4}
                      onClick={onNext}
                      _hover={{ filter: "brightness(0.95)" }}
                      _active={{ transform: "translateY(1px)" }}
                    >
                      Next
                    </Button>
                  </Box>
        </Box>

      </VStack>

      {/* Bottom bar */}
      <Box h="8px" bg="#e8e8e8" borderTop="1px solid #d0d0d0" />
    </Box>
  );
}