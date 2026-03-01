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
      <Box bg="#72645E" p={4} h="full">
        <VStack align="stretch" gap={4} px={8} maxW="350px" mx="auto" justify="center" alignItems="center">
          <Text fontSize="2xl" pt={4} textAlign="center" fontFamily="Reddit Mono" fontWeight="500">Send a command!</Text>
          <Box py={4} px={4} border="solid black 2px" bg="white" borderRadius={10} width="300px">
            <VStack display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                <Image src="IdleSmooth.png" width="150px"/>
                <Text fontFamily="'Press Start 2P'" fontSize="3xl" width="full" textAlign="center">Georgia</Text>
                <Box display="flex" justifyContent="space-between" bg="#DBB166" border="solid black 2px" borderRadius={4} width="full" p="15px" fontFamily="'Press Start 2P'">
                    <Box>
                        <Text fontWeight="500" fontSize="sm">Health</Text>
                    </Box>
                    <Box display="flex" flexDirection="column">
                        <Text fontWeight="500" fontSize="sm">Ants</Text>
                        <Box>
                            <Image src="Normal Ant.png" width="30px"/>
                        </Box>
                    </Box>
                </Box>
            </VStack>
          </Box>
          <Button fontFamily="'Press Start 2P'" fontSize="2xl" bg="#A90000" border="solid black 2px" borderRadius="lg" width="80%" p="15px">End</Button>
        </VStack>
      </Box>
    );
  }
  