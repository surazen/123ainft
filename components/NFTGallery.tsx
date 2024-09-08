import React, { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import {
  Box,
  Grid,
  Heading,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  VStack,
  Badge,
  Flex,
  useColorModeValue,
  Center,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  keyframes,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

// Interface for the detailed asset structure received from the API
interface DetailedAsset {
  unit: string;
  quantity: string;
  policyId: string | null;
  assetName: string | null;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    [key: string]: any;
  } | null;
}

// Interface for a valid NFT, ensuring required metadata fields are present
interface ValidNFT extends Omit<DetailedAsset, "metadata"> {
  metadata: {
    name: string;
    description: string;
    image: string;
    [key: string]: any;
  };
}

// Interface for the API response
interface NFTsResponse {
  assets?: ValidNFT[];
  error?: string;
  details?: string;
}

// Props interface for the NFTGallery component
interface NFTGalleryProps {
  itemsPerPage?: number;
}

// Step beater animation
const stepBeater = keyframes`
  0%, 100% { height: 10px; }
  50% { height: 20px; }
`;

// Step beater component
const StepBeater = () => (
  <Flex justifyContent="center" alignItems="center" height="100%">
    {[...Array(3)].map((_, i) => (
      <Box
        key={i}
        width="4px"
        height="10px"
        backgroundColor="blue.500"
        marginX="2px"
        animation={`${stepBeater} 1s ease-in-out ${i * 0.1}s infinite`}
      />
    ))}
  </Flex>
);

const NFTGallery: React.FC<NFTGalleryProps> = ({ itemsPerPage = 15 }) => {
  // State to store the list of NFTs
  const [nfts, setNFTs] = useState<ValidNFT[]>([]);
  // State to track loading status
  const [loading, setLoading] = useState(true);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);
  // State to store the currently selected NFT for the modal
  const [selectedNFT, setSelectedNFT] = useState<ValidNFT | null>(null);
  // State to keep track of the current page for pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Hook to control the modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Hook to access wallet connection status and wallet API
  const { connected, wallet } = useWallet();

  // Chakra UI color mode values for dynamic theming
  const bgColor = useColorModeValue("gray.200", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.50");
  const borderColor = useColorModeValue("gray.500", "gray.700");
  const headingColor = useColorModeValue("blue.600", "blue.300");

  // Effect to fetch NFTs when the wallet is connected
  useEffect(() => {
    if (connected && wallet) {
      fetchNFTs();
    }
  }, [connected, wallet]);

  // Function to fetch NFTs from the API
  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the first used address from the wallet (receive address)
      const addresses = await wallet.getUsedAddresses();
      const address = addresses[0];
      if (!address) {
        throw new Error("No wallet address available");
      }
      console.log("Wallet address obtained:", address);

      // Make API call to fetch NFT data
      const response = await fetch("/api/blockfrost-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NFTsResponse = await response.json();

      if (data.error) {
        throw new Error(`BlockFrost API error: ${data.error}`);
      }

      if (data.assets) {
        // Filter for valid NFTs and those with a quantity of '1'
        const validNFTs = data.assets.filter(
          (asset) => isValidNFT(asset) && asset.quantity === "1"
        );
        setNFTs(validNFTs);
      } else {
        setNFTs([]);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching NFTs"
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to handle NFT click and open modal
  const handleNFTClick = (nft: ValidNFT) => {
    setSelectedNFT(nft);
    onOpen();
  };

  // Function to handle menu actions (to be implemented)
  const handleMenuAction = (action: string, nft: ValidNFT) => {
    console.log(`${action} action for NFT:`, nft);
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(nfts.length / itemsPerPage);
  // Get NFTs for the current page
  const paginatedNFTs = nfts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to get optimized image URL
  const getOptimizedImageUrl = (originalUrl: string) => {
    if (originalUrl.startsWith("ipfs://")) {
      const ipfsHash = originalUrl.slice(7);
      return `https://ipfs.io/ipfs/${ipfsHash}`;
    }
    return originalUrl;
  };

  // Render based on different states
  if (!connected) {
    return (
      <Center h="50vh">
        <Text fontSize="xl" color={textColor}>
          Please connect your wallet to view your NFTs.
        </Text>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h="50vh">
        <StepBeater />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="50vh" flexDirection="column">
        <Text color="red.500" fontSize="xl" mb={4}>
          Error fetching NFTs:
        </Text>
        <Text color="red.500" whiteSpace="pre-wrap" textAlign="center">
          {error}
        </Text>
        <Button mt={4} onClick={fetchNFTs} colorScheme="blue">
          Retry
        </Button>
      </Center>
    );
  }

  return (
    <Flex
      width="100%"
      height="100vh"
      justifyContent="center"
      alignItems="flex-start"
      padding="20px"
    >
      <Box
        bg={bgColor}
        color={textColor}
        p={4}
        borderRadius="lg"
        boxShadow="md"
        width="100%"
        maxWidth="1200px"
      >
        <Heading as="h2" size="lg" textAlign="left" mb={4} color={headingColor}>
          MyNFTs Gallery
        </Heading>
        {nfts.length === 0 ? (
          <Text>No valid NFTs with quantity 1 found in this wallet.</Text>
        ) : (
          <>
            <Grid
              templateColumns={{
                base: "repeat(auto-fill, minmax(100px, 1fr))",
                sm: "repeat(auto-fill, minmax(150px, 1fr))",
                md: "repeat(auto-fill, minmax(200px, 1fr))",
                lg: "repeat(5, 1fr)",
              }}
              gap={2}
              width="100%"
              sx={{
                "@media screen and (min-width: 900px)": {
                  "& > div": {
                    width: "200px !important",
                    height: "200px !important",
                    paddingBottom: "0 !important",
                  },
                },
              }}
            >
              {paginatedNFTs.map((nft) => (
                <Box
                  key={nft.unit}
                  borderWidth="1px"
                  borderColor={borderColor}
                  overflow="hidden"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ transform: "scale(1.05)", zIndex: 1, shadow: "md" }}
                  width="100%"
                  height={0}
                  paddingBottom="100%"
                  position="relative"
                  onClick={() => handleNFTClick(nft)}
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                  >
                    <LazyLoadImage
                      src={getOptimizedImageUrl(nft.metadata.image)}
                      alt={nft.metadata.name}
                      effect="blur"
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover" }}
                      placeholder={<StepBeater />}
                      onError={(
                        e: React.SyntheticEvent<HTMLImageElement, Event>
                      ) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/fallback-image.jpg";
                      }}
                    />
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      bg="rgba(0,0,0,0.7)"
                      p={1}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color="white"
                        isTruncated
                      >
                        {nft.metadata.name}
                      </Text>
                    </Box>
                  </Box>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<HamburgerIcon />}
                      variant="ghost"
                      size="sm"
                      position="absolute"
                      top={1}
                      right={1}
                      zIndex={2}
                      color="white"
                      bg="rgba(0,0,0,0.5)"
                      _hover={{ bg: "rgba(0,0,0,0.7)" }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <MenuList
                      bg="rgba(0,0,0,0.7)"
                      border="none"
                      borderRadius="md"
                      p={1}
                      minW="auto"
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction("send", nft);
                        }}
                        fontSize="xs"
                        color="white"
                        bg="transparent"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                        h="auto"
                        py={1}
                      >
                        Send
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuAction("burn", nft);
                        }}
                        fontSize="xs"
                        color="white"
                        bg="transparent"
                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                        h="auto"
                        py={1}
                      >
                        Burn
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Box>
              ))}
            </Grid>
            <Flex justifyContent="center" mt={6} flexWrap="wrap">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={currentPage === 1}
                size="sm"
                mr={2}
                mb={2}
              >
                Previous
              </Button>
              <Text alignSelf="center" mx={2} fontSize="sm" mb={2}>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                isDisabled={currentPage === totalPages}
                size="sm"
                ml={2}
                mb={2}
              >
                Next
              </Button>
            </Flex>
          </>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent bg={bgColor} color={textColor}>
            <ModalHeader>{selectedNFT?.metadata.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <LazyLoadImage
                  src={getOptimizedImageUrl(selectedNFT?.metadata.image || "")}
                  alt={selectedNFT?.metadata.name}
                  effect="blur"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                  placeholder={<StepBeater />}
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>
                  ) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/path/to/fallback-image.jpg"; // Replace with your fallback image
                  }}
                />
                <Text>
                  <strong>Description:</strong>{" "}
                  {selectedNFT?.metadata.description}
                </Text>
                <Text>
                  <strong>Policy ID:</strong> {selectedNFT?.policyId}
                </Text>
                <Text>
                  <strong>Asset Name:</strong>{" "}
                  {selectedNFT?.assetName
                    ? Buffer.from(selectedNFT.assetName, "hex").toString(
                        "utf-8"
                      )
                    : "N/A"}
                </Text>
                <Box>
                  <Heading as="h4" size="sm" mb={2}>
                    Additional Metadata
                  </Heading>
                  <Flex flexWrap="wrap">
                    {selectedNFT &&
                      Object.entries(selectedNFT.metadata)
                        .filter(
                          ([key]) =>
                            !["name", "description", "image"].includes(key)
                        )
                        .map(([key, value]) => (
                          <Badge key={key} mr={2} mb={2}>
                            {key}:{" "}
                            {typeof value === "string"
                              ? value
                              : JSON.stringify(value)}
                          </Badge>
                        ))}
                  </Flex>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
};

// Helper function to validate if an asset is a valid NFT
function isValidNFT(asset: DetailedAsset): asset is ValidNFT {
  return (
    asset.policyId !== null &&
    asset.assetName !== null &&
    asset.metadata !== null &&
    typeof asset.metadata.name === "string" &&
    typeof asset.metadata.description === "string" &&
    typeof asset.metadata.image === "string" &&
    asset.quantity === "1"
  );
}

export default NFTGallery;
