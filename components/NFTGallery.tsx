import React, { useState, useEffect, useCallback } from "react";
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
  Spacer,
  Spinner,
  useToast,
  Tooltip,
  Alert,
  AlertIcon,
  CloseButton,
} from "@chakra-ui/react";
import { HamburgerIcon, InfoIcon, RepeatIcon } from "@chakra-ui/icons";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import BurnNFT from "./BurnNFT";
import SendNFT from "./SendNFT";

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
  transactionMetadata: {
    [key: string]: any;
  } | null;
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

// Step beater component for loading animation
const StepBeater = () => (
  <Flex
    justifyContent="center"
    alignItems="center"
    height="100%"
    flexDirection="column"
  >
    <Flex>
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
    <Text fontSize="sm" color="gray.500" marginTop="8px">
      loading...
    </Text>
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
  // State for burn modal
  const [burnModalOpen, setBurnModalOpen] = useState(false);
  const [nftToBurn, setNftToBurn] = useState<ValidNFT | null>(null);
  // State for send modal
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [nftToSend, setNftToSend] = useState<ValidNFT | null>(null);
  // Hook to access wallet connection status and wallet API
  const { connected, wallet } = useWallet();
  // State to track manual refresh status
  const [refreshing, setRefreshing] = useState(false);
  // State for forcing re-render
  const [key, setKey] = useState(0);
  // State to control the visibility of the info box
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [showSyncMessage, setShowSyncMessage] = useState(true);

  // Hook to show toast notifications
  const toast = useToast();

  // Chakra UI color mode values for dynamic theming
  const bgColor = useColorModeValue("gray.200", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.50");
  const borderColor = useColorModeValue("gray.500", "gray.700");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const syncMessageBg = useColorModeValue("blue.50", "blue.900");
  const syncMessageColor = useColorModeValue("blue.800", "blue.50");

  // Function to fetch NFTs from the API
  const fetchNFTs = useCallback(
    async (showToast: boolean = false) => {
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

        // Show success toast if requested
        if (showToast) {
          toast({
            title: "NFTs refreshed",
            description: "Your NFT gallery has been updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unknown error occurred while fetching NFTs"
        );
        // Show error toast if requested
        if (showToast) {
          toast({
            title: "Error refreshing NFTs",
            description: "There was an error updating your NFT gallery.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [wallet, toast]
  );

  // Effect to fetch NFTs when the wallet is connected
  useEffect(() => {
    if (connected && wallet) {
      fetchNFTs();
    }
  }, [connected, wallet, fetchNFTs]);

  // Function to handle NFT click and open modal
  const handleNFTClick = (nft: ValidNFT) => {
    setSelectedNFT(nft);
    onOpen();
  };

  // Function to handle menu actions
  const handleMenuAction = (action: string, nft: ValidNFT) => {
    if (action === "burn") {
      setNftToBurn(nft);
      setBurnModalOpen(true);
    } else if (action === "send") {
      setNftToSend(nft);
      setSendModalOpen(true);
    }
  };

  // Function to handle burn completion
  const handleBurnComplete = useCallback(() => {
    if (nftToBurn) {
      setNFTs((prevNFTs) =>
        prevNFTs.filter((nft) => nft.unit !== nftToBurn.unit)
      );
      setNftToBurn(null);
      setBurnModalOpen(false);
      // Show success toast for burn action
      toast({
        title: "NFT Burned",
        description: "The NFT has been successfully burned.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [nftToBurn, toast]);

  // Function to handle send completion
  const handleSendComplete = useCallback(
    (sentNftUnit: string) => {
      setNFTs((prevNFTs) => prevNFTs.filter((nft) => nft.unit !== sentNftUnit));
      setNftToSend(null);
      setSendModalOpen(false);
      // Show success toast for send action
      toast({
        title: "NFT Sent",
        description: "The NFT has been successfully sent.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  // Function to handle manual refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNFTs(true).then(() => {
      // Force re-render of the entire component
      setKey((prevKey) => prevKey + 1);
      setRefreshing(false);
    });
  }, [fetchNFTs]);

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

  if (loading && !refreshing) {
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
        <Button mt={4} onClick={() => fetchNFTs()} colorScheme="blue">
          Retry
        </Button>
      </Center>
    );
  }

  return (
    <Flex
      key={key} // Add key prop to force re-render
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
        {showInfoBox && (
          <Alert status="info" mb={4} fontSize="sm" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              Each NFT has a menu (☰) with options to Send or Burn the NFT.
              Click on a NFT to view more details.
            </Box>
            <CloseButton
              onClick={() => setShowInfoBox(false)}
              position="absolute"
              right="8px"
              top="8px"
            />
          </Alert>
        )}

        {showSyncMessage && (
          <Alert
            status="info"
            mb={4}
            fontSize="xs"
            borderRadius="md"
            bg={syncMessageBg}
            color={syncMessageColor}
          >
            <InfoIcon mr={2} />
            <Box flex="1">
              Recently minted NFTs may not appear immediately due to blockchain
              synchronization. Please allow some time for updates to be
              reflected.
            </Box>
            <CloseButton
              onClick={() => setShowSyncMessage(false)}
              position="absolute"
              right="8px"
              top="8px"
            />
          </Alert>
        )}

        <Flex alignItems="center" mb={4}>
          <Heading as="h2" size="lg" textAlign="left" color={headingColor}>
            MyNFTs Gallery
          </Heading>
          <Spacer />
          <Flex alignItems="center">
            {loading || refreshing ? (
              <Spinner size="sm" mr={2} />
            ) : (
              <Text fontSize="sm" fontWeight="bold" mr={2}>
                Total NFTs: {nfts.length}
              </Text>
            )}
            {/* Refresh button */}
            <Tooltip label="Refresh NFTs" aria-label="A tooltip">
              <IconButton
                aria-label="Refresh NFTs"
                icon={<RepeatIcon />}
                onClick={handleRefresh}
                isLoading={refreshing}
                size="sm"
              />
            </Tooltip>
          </Flex>
        </Flex>

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
            {/* Pagination controls */}
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

        {/* Modal for displaying NFT details */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent bg={bgColor} color={textColor}>
            <ModalHeader>{selectedNFT?.metadata.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Center>
                  <LazyLoadImage
                    src={getOptimizedImageUrl(
                      selectedNFT?.metadata.image || ""
                    )}
                    alt={selectedNFT?.metadata.name}
                    effect="blur"
                    style={{
                      maxHeight: "400px",
                      objectFit: "contain",
                      maxWidth: "100%",
                    }}
                    placeholder={<StepBeater />}
                    onError={(
                      e: React.SyntheticEvent<HTMLImageElement, Event>
                    ) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/fallback-image.jpg";
                    }}
                  />
                </Center>
                <Text>
                  <strong>Description:</strong>{" "}
                  {selectedNFT?.metadata.description}
                </Text>
                <Text>
                  <strong>Policy ID:</strong>{" "}
                  <Text as="span" fontSize="xs">
                    {selectedNFT?.policyId}
                  </Text>
                </Text>
                <Text>
                  <strong>Asset Name:</strong>{" "}
                  {selectedNFT?.assetName
                    ? Buffer.from(selectedNFT.assetName, "hex").toString(
                        "utf-8"
                      )
                    : "N/A"}
                </Text>
                <Text>
                  <strong>Media Type:</strong>{" "}
                  {selectedNFT?.metadata.mediaType || "N/A"}
                </Text>
                {selectedNFT?.transactionMetadata &&
                  (() => {
                    const metadata = selectedNFT.transactionMetadata["721"];
                    let message = null;

                    if (metadata && typeof metadata === "object") {
                      const policyId = Object.keys(metadata).find(
                        (key) => key !== "version"
                      );
                      if (policyId) {
                        const assetName = Object.keys(metadata[policyId])[0];
                        if (assetName) {
                          message = metadata[policyId][assetName].message;
                        }
                      }
                    }

                    if (message && message !== "N/A") {
                      return (
                        <Box>
                          <Heading
                            as="h4"
                            size="xs"
                            mb={2}
                            mt={2}
                            textTransform="uppercase"
                          >
                            Latest Transaction Metadata
                          </Heading>
                          <Text>
                            <strong>Message:</strong> {message}
                          </Text>
                        </Box>
                      );
                    }

                    return null; // Return null if there's no valid message
                  })()}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* BurnNFT component */}
        {nftToBurn && (
          <BurnNFT
            isOpen={burnModalOpen}
            onClose={() => {
              setBurnModalOpen(false);
              setNftToBurn(null);
            }}
            nft={nftToBurn}
            onBurnComplete={handleBurnComplete}
          />
        )}

        {/* SendNFT component */}
        {nftToSend && (
          <SendNFT
            isOpen={sendModalOpen}
            onClose={() => {
              setSendModalOpen(false);
              setNftToSend(null);
            }}
            nft={nftToSend}
            onSendComplete={handleSendComplete}
          />
        )}
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
