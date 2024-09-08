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
  Link,
  HStack,
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
} from "@chakra-ui/react";
import LandingPageContent from "./LandingPageContent";

// Define props interface
interface LandingPageProps {
  onLogin: () => void;
}

const web3Gradient = "linear-gradient(to right, #00FFFF, #FF00FF)";

const gradientOptions = {
  option1: "linear-gradient(to right, #00FFFF, #FF00FF)", // Cyan to Magenta
  option2: "linear-gradient(to right, #FFA500, #FF00FF)", // Orange to Magenta
  option3: "linear-gradient(to right, #1E90FF, #FF1493)", // Dodger Blue to Deep Pink
  option4: "linear-gradient(to right, #00FF00, #0000FF)", // Lime to Blue
  option5: "linear-gradient(to right, #FFD700, black)", // Gold to Orange Red
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  const handleGoogleSignIn = () => {
    onOpen();
  };

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
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
        >
          <VStack align="flex-start" spacing={6} mb={{ base: 10, md: 0 }}>
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
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            width={{ base: "full", md: "400px" }}
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.3)"
          >
            <form onSubmit={handleLogin}>
              <VStack spacing={4} align="stretch">
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color="#11235A"
                  textAlign="center"
                >
                  Get Started
                </Text>
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="rgba(255, 255, 255, 0.2)"
                  color="white"
                  _placeholder={{ color: "gray.600" }}
                  borderColor="rgba(255, 255, 255, 0.4)"
                  _hover={{ borderColor: "rgba(255, 255, 255, 0.6)" }}
                  _focus={{
                    borderColor: "white",
                    bg: "rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.6)",
                  }}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="rgba(255, 255, 255, 0.2)"
                  color="white"
                  _placeholder={{ color: "gray.600" }}
                  borderColor="rgba(255, 255, 255, 0.4)"
                  _hover={{ borderColor: "rgba(255, 255, 255, 0.6)" }}
                  _focus={{
                    borderColor: "white",
                    bg: "rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.6)",
                  }}
                />
                <Button
                  bg="#596FB7"
                  _hover={{ color: "#FEFBD8" }}
                  color="white"
                  size="lg"
                  type="submit"
                >
                  Sign In
                </Button>
                <HStack justify="space-between">
                  <Link
                    color="cyan.900"
                    fontSize="sm"
                    href="#"
                    _hover={{ color: "cyan.700" }}
                  >
                    Forgot password?
                  </Link>
                  <Link
                    color="cyan.900"
                    fontSize="sm"
                    href="#"
                    _hover={{ color: "cyan.700" }}
                  >
                    New User? Sign Up
                  </Link>
                </HStack>
                <Text textAlign="center" color="black">
                  or
                </Text>
                <Button
                  leftIcon={
                    <Image
                      src="/images/google-logo.jpg"
                      alt="Google logo"
                      boxSize="20px"
                    />
                  }
                  bg="#F7F7F8"
                  color="gray.700"
                  border="1px solid"
                  borderColor="gray.300"
                  _hover={{ bg: "gray.100" }}
                  size="lg"
                  onClick={handleGoogleSignIn}
                >
                  Sign in with Google
                </Button>
              </VStack>
            </form>
          </Box>
        </Flex>
        <Box mt={35}>
          <LandingPageContent />
        </Box>
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
