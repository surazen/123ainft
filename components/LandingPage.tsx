import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  VStack,
  Input,
  Image,
  chakra,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Checkbox,
  HStack,
  Link,
} from "@chakra-ui/react";
import LandingPageContent from "./LandingPageContent";
import VideoSection from "./VideoSection";
import { motion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";

// Define props interface
interface LandingPageProps {
  onLogin: () => void;
}

const web3Gradient = "linear-gradient(to right, #00FFFF, #FF00FF)";
const web3HoverGradient = "linear-gradient(to right, #FF00FF, #00FFFF)";

const MotionBox = motion(Box);

const Web3Button = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <MotionBox
    as="button"
    ref={ref}
    py={2}
    px={4}
    borderRadius="md"
    fontWeight="semibold"
    color="white"
    textAlign="center"
    transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
    bgGradient={web3Gradient}
    _hover={{
      bgGradient: web3HoverGradient,
    }}
    _active={{
      transform: "scale(0.98)",
    }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    {...props}
  />
));

const gradientOptions = {
  option1: "linear-gradient(to right, #00FFFF, #FF00FF)", // Cyan to Magenta
  option2: "linear-gradient(to right, #FFA500, #FF00FF)", // Orange to Magenta
  option3: "linear-gradient(to right, #1E90FF, #FF1493)", // Dodger Blue to Deep Pink
  option4: "linear-gradient(to right, #00FF00, #0000FF)", // Lime to Blue
  option5: "linear-gradient(to left, #FFD700, black)"     // Gold to Black
};

const selectedGradient = gradientOptions.option5;

const LogoText = chakra(Text, {
  baseStyle: {
    fontSize: { base: "5xl", md: "7xl", lg: "8xl" },
    fontWeight: "extrabold",
    bgGradient: selectedGradient,
    bgClip: "text",
    letterSpacing: "tight",
    position: "relative",
    display: "inline-block",
    paddingBottom: "2px",
  },
});

const WaveAnimation = () => (
  <Box
    position="absolute"
    left={0}
    bottom={0}
    width="100%"
    height="200px"
    overflow="hidden"
    zIndex={0}
  >
    <svg
      viewBox="0 0 500 150"
      preserveAspectRatio="none"
      style={{ height: "100%", width: "100%" }}
    >
      <path
        d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
        style={{
          stroke: "none",
          fill: "rgba(255, 255, 255, 0.3)",
        }}
      >
        <animate
          attributeName="d"
          dur="10s"
          repeatCount="indefinite"
          values="
            M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z;
            M0.00,49.98 C149.99,0.00 349.20,150.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z;
            M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z
          "
        />
      </path>
    </svg>
  </Box>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [secretKey, setSecretKey] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem("secretKey");
    if (savedKey) {
      setSecretKey(savedKey);
      setRememberMe(true);
    }
  }, []);

  const handleSecretKeySubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: secretKey }),
      });
      const data = await response.json();
      if (data.valid) {
        if (rememberMe) {
          localStorage.setItem("secretKey", secretKey);
        } else {
          localStorage.removeItem("secretKey");
        }
        onLogin();
        onClose();
        toast({
          title: "Login Successful",
          description: "Welcome to the app!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Invalid Key",
          description: "The entered secret key is not valid.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error validating key:", error);
      toast({
        title: "Error",
        description: "An error occurred while validating the key.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      sx={{
        background: "linear-gradient(to right, #1E3A8A, #FFFFFF)",
      }}
    >
      <Container maxW="container.xl" py={20}>
        <VStack spacing={10} align="stretch">
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-start" }}
            justify="space-between"
          >
            <VStack align="flex-start" spacing={2} flex={1}> {/* Reduced spacing here */}
              <LogoText>123ainft</LogoText>
              <Text fontSize="xl" color="white" fontWeight="medium">
                Mint AI-generated NFTs on Cardano with ease
              </Text>
              <Text fontSize="md" color="gray.200">
                Create, collect, trade or gift unique digital assets powered by
                artificial intelligence
              </Text>
            </VStack>

            <Box
              bg="rgba(255, 255, 255, 0.15)"
              p={4}
              borderRadius="xl"
              boxShadow="xl"
              width={{ base: "full", md: "300px" }}
              maxWidth="100%"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255, 255, 255, 0.3)"
              mt={{ base: 6, md: 0 }}
            >
              <VStack spacing={3} align="stretch">
                {" "}
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="#11235A"
                  textAlign="center"
                >
                  Get Started
                </Text>
                <Web3Button size="md" onClick={onOpen} width="100%">
                  Sign in with Login Key
                </Web3Button>
                <Text fontSize="xs" color="gray.600" textAlign="center">
                  {" "}
                  This app is currently in beta. For login keys, please reach
                  out on Discord:
                </Text>
                <HStack spacing={1} justify="center">
                  <FaDiscord color="#7289da" />
                  <Link
                    href="https://discord.com/users/szen9778"
                    isExternal
                    fontSize="xs"
                    color="blue.500"
                    fontWeight="medium"
                  >
                    szen9778
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </Flex>

          <VideoSection
            videoSrc="/123AINFT_v4.0.mp4"
            posterSrc="/nft_minter.png"
            title="How to Use 123ainft"
            description="Watch this short video to learn how to use 123ainft and start creating your AI-generated NFTs on Cardano."
            videoWidth={1080} 
            videoHeight={720} 
          />

          <LandingPageContent />
        </VStack>
      </Container>
      <WaveAnimation />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Login Key</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Enter key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                type="password"
              />
              <Checkbox
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              >
                Remember me
              </Checkbox>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSecretKeySubmit}
              isLoading={isLoading}
            >
              Submit
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LandingPage;