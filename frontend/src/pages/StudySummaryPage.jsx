import {
    Box,
    Button,
    Heading,
    Image,
    Text,
    VStack,
  } from "@chakra-ui/react";

export default function StudySummaryPage() {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
            <VStack>
                <Text fontSize="2xl" fontFamily="'Press Start 2P'">Study Summary</Text>
                <Box border="solid black 2px" width="100px" height="100px" bg="#00364C" borderRadius={10}>
                    <Image src="AnteaterJump.png" />
                </Box>
            </VStack>
            <Box border="solid black 3px" borderRadius={10} p="20px">
                <VStack>
                    <Text fontFamily="'Press Start 2P'">Georgia the Anteater</Text>
                    <VStack>
                        <Text fontFamily="Reddit Mono">Ants Eaten</Text>
                        <Box>

                        </Box>
                    </VStack>
                    <VStack>
                        <Text fontFamily="Reddit Mono">Learning Level</Text>
                        <Box>
                            
                        </Box>
                    </VStack>
                </VStack>
            </Box>
        </Box>
    )
}