import {
    Box,
    Button,
    Heading,
    Image,
    Text,
    VStack,
  } from "@chakra-ui/react";
  
  import "../index.css";
  
  export default function WelcomePage({ onSignUp, onLogIn }) {
    return (
      <Box bg="#FFA0A0" p={4} h="full">
        <VStack align="stretch" gap={4} px={8} maxW="350px" mx="auto" justify="center" alignItems="center">
          <Text fontSize="md" pt={4} textAlign="center" fontFamily="Reddit Mono" fontWeight="500">Ouchie!</Text>
          <Box py={4} borderRadius={10} justifyContent="center" alignItems="center" width="full">
          <VStack width="full">
                <Image src="IdleSmooth.png" width="120px"/>
                <Text fontFamily="'Press Start 2P'" fontSize="2xl">Georgia</Text>
                <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    borderRadius={4} 
                    width="full" 
                    p="15px" 
                    fontFamily="'Press Start 2P'"
                >
                    <Box>
                        <Text fontWeight="500" fontSize="sm">Health</Text>
                    </Box>
                    <Box display="flex" flexDirection="column">
                        <Text fontWeight="500" fontSize="sm">Ants</Text>
                        <Image src="Normal Ant.png" width="30px"/>
                    </Box>
                </Box>
            </VStack>
          </Box>
          <Box p={8} border="solid black 2px" width="full" borderRadius={10} color="#4CF190" bg="#00364C">
            <VStack fontFamily="Reddit Mono">
                <Box>
                    <Text textAlign="left">Keep it up!</Text>
                </Box>
            </VStack>
          </Box>
          <Button fontFamily="'Press Start 2P'" fontSize="2xl" bg="#A90000" border="solid black 2px" borderRadius="lg   " width="80%" p="15px">End</Button>
        </VStack>
      </Box>
    );
  }