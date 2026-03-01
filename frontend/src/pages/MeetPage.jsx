import {
  Box,
  Button,
  Heading,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import "../index.css";
import { useState } from "react";

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
      mt={8}
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

export default function MeetPage({ onNext }) {
  const [name, setName] = useState("");

  return (
    <Box bg="var(--bg)" border="3px" h="560px">
      <TitleBar />
      <Box p={5}>
        <Text
          fontFamily={FONT}
          fontSize="4xl"
          color="var(--dark)"
          textAlign="left"
          ml={6}
        //   mb={5}
        >
          Meet
        </Text>

        <Box display="flex" justifyContent="center" mb={4} border="1px">
          <Box
            position="relative"
            boxSize="200px"
            overflow="hidden"
            // borderRadius="50%"
          >
            <Image src="Background.png" boxSize="200px" objectFit="cover" />
            <Image
              src="MeetAnteater.png"
              position="absolute"
              width="100px"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
            />
          </Box>
        </Box>
        <Box mb={4} allign="center" textAlign="center">
          <Input
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            textAlign="center"
            fontSize="lg"
            bg="white"
            borderRadius={8}
            fontFamily={FONT}
            h="auto"
            px={3}
            py={2}
            w="65%"
            border="2px solid black"
            _focus={{ boxShadow: "none", borderColor: "#3a2e22" }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            bg="#72645E"
            color="white"
            borderRadius={8}
            fontFamily={FONT}
            fontSize="lg"
            minH="34px"
            px={4}
            onClick={() => onNext(name)}
            _hover={{ filter: "brightness(0.95)" }}
            _active={{ transform: "translateY(1px)" }}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
