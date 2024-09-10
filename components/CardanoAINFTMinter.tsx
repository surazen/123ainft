import React, { useState } from "react";
import AIImageGenerator from "./AIImageGenerator";
import AIImageMinter from "./AIImageMinter";
import StatusDisplay, { StatusType } from "./StatusDisplay";
import CardanoWalletComponent from "../components/CardanoWalletComponent";
import ProcessInfoBox from "./ProcessInfoBox";
import SavedImageNFTMinter from "./SavedImageNFTMinter";
import NFTGallery from "./NFTGallery";
import Head from "next/head";
import Image from "next/image";
import UserProfileSettings from "./UserProfileSettings";
import {
  Box,
  Flex,
  Button,
  Tooltip,
  VStack,
  HStack,
  Text,
  Container,
  useColorModeValue,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import {
  FiHome,
  FiImage,
  FiUpload,
  FiInfo,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import Web3Heading from "./Web3Heading";

type ViewType = "home" | "uploadAndMint" | "myNFTs";

interface CardanoAINFTMinterProps {
  onLogout: () => void;
}

const CardanoAINFTMinter: React.FC<CardanoAINFTMinterProps> = ({
  onLogout,
}) => {
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [mintStatus, setMintStatus] = useState<StatusType>("idle");
  const { colorMode, toggleColorMode } = useColorMode();
  const [currentView, setCurrentView] = useState<ViewType>("home");

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImageUrl(imageUrl);
  };

  const handleMintStatusChange = (newStatus: StatusType) => {
    setMintStatus(newStatus);
  };

  const bgColor = useColorModeValue("#EEF5FF", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <>
      <Head>
        <title>Cardano AI NFT Minter</title>
        <meta name="description" content="Mint AI-generated NFTs on Cardano" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box bg={bgColor} minH="100vh">
        <Container maxW="container.xl" py={5}>
          <VStack spacing={4} align="stretch">
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center">
                <Box position="relative" width="auto" height="auto">
                  <Image src="/logo.png" alt="Logo" width={65} height={50} />
                </Box>
                <Web3Heading>Cardano AI NFT Minter</Web3Heading>
              </Flex>
              <VStack alignItems="flex-end" spacing={6}>
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
                  onClick={toggleColorMode}
                />
                <Box>
                  <UserProfileSettings onLogout={onLogout} />
                </Box>
              </VStack>
            </Flex>

            <Flex justifyContent="space-between" alignItems="left">
              <HStack spacing={4}>
                <Tooltip label="Go to homepage" aria-label="A tooltip for Home">
                  <Button
                    variant="ghost"
                    leftIcon={<FiHome />}
                    onClick={() => setCurrentView("home")}
                  >
                    Home
                  </Button>
                </Tooltip>
                <Tooltip
                  label="View your NFT collection"
                  aria-label="A tooltip for My NFTs"
                >
                  <Button
                    variant="ghost"
                    leftIcon={<FiImage />}
                    onClick={() => setCurrentView("myNFTs")}
                  >
                    My NFTs
                  </Button>
                </Tooltip>
                <Tooltip
                  label="Upload and mint saved images"
                  aria-label="A tooltip for Upload & Mint"
                >
                  <Button
                    variant="ghost"
                    leftIcon={<FiUpload />}
                    onClick={() => setCurrentView("uploadAndMint")}
                  >
                    Upload & Mint
                  </Button>
                </Tooltip>
                <Tooltip
                  label="Learn more about our platform"
                  aria-label="A tooltip for About"
                >
                  <Button variant="ghost" leftIcon={<FiInfo />}>
                    About
                  </Button>
                </Tooltip>
                <CardanoWalletComponent />
              </HStack>
            </Flex>

            <VStack spacing={6} align="stretch">
              {currentView === "home" && (
                <>
                  <ProcessInfoBox />
                  <Box
                    borderWidth="1px"
                    borderColor={useColorModeValue("cyan.500", "cyan.800")}
                    borderRadius="md"
                    p={4}
                  >
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      mb={4}
                      color={useColorModeValue("blue.600", "blue.300")}
                    >
                      Step 1: Generate an AI image
                    </Text>
                    <AIImageGenerator onImageGenerated={handleImageGenerated} />
                  </Box>

                  <AIImageMinter
                    generatedImageUrl={generatedImageUrl}
                    onMintStatusChange={handleMintStatusChange}
                  />

                  <Box
                    mt={4}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor={useColorModeValue("blue.400", "gray.800")}
                    bg={useColorModeValue("blue.200", "blue.500")}
                  >
                    <StatusDisplay status={mintStatus} />
                  </Box>
                </>
              )}

              {currentView === "uploadAndMint" && <SavedImageNFTMinter />}

              {currentView === "myNFTs" && <NFTGallery />}
            </VStack>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default CardanoAINFTMinter;
