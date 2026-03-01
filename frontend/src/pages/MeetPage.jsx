import {
    Box,
    Button,
    Heading,
    Image,
    Input,
    Text,
    VStack,
  } from "@chakra-ui/react";
  import "../index.css"
  import { useState } from "react";
  
  export default function WelcomePage({ onSignUp, onLogIn }) {
    const [name, setName] = useState("");

    return (
      <Box minW="350px" minH="auto" bg="gray.50" color="gray.800"  fontFamily="Reddit Mono">
        <VStack gap={4} h="full" justify="center">
            <Box alignSelf="flex-start">
                <Heading fontFamily="Reddit Mono" size="4xl" mb={4}>Meet</Heading>
            </Box>

            <Box position="relative">
                <Image src="Background.png" width="200px"/>
                <Image  
                    src="MeetAnteater.png" 
                    position="absolute" 
                    width="100px"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                />
            </Box>

            <Box alignSelf="flex-end">
                <VStack align="flex-end" gap={4}>                    
                    <Input
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="flushed"
                        borderBottom="2px solid"
                        borderColor="gray.400"
                        size="2xl"
                    />
                    <Button
                        bg="#72645E"
                        fontSize="lg"
                        px={6}
                        py={6}
                        borderRadius={10}
                    >Next</Button>
                </VStack>
            </Box>
        </VStack>
      </Box>
    );
  }