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

const FONT = "Reddit Mono, monospace";

export default function MeetPage({ onNext }) {
  const [name, setName] = useState("");

  return (
    <Box bg="var(--bg)" border="3px" h="590px">
      <VStack p={5} gap={4}>
        <Text
          fontFamily={FONT}
          fontSize="4xl"
          color="var(--dark)"
          textAlign="left"
          ml={6}
          alignSelf=""
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
      </VStack>
    </Box>
  );
}
