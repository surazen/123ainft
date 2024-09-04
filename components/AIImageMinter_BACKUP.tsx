import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Button,
  Input,
  Textarea,
  Select,
  Text,
  HStack,
  useToast,
  RadioGroup,
  Radio,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  Center,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiUploadCloud, FiEye, FiStar, FiInfo } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import ADAIcon from "./ADAIcon";
import axios from "axios";
import StatusDisplay, { StatusType } from "./StatusDisplay";
import SaveToDisk from "./SaveToDisk";
import { useWallet } from "@meshsdk/react";
import { Transaction, AssetMetadata, Mint, ForgeScript } from "@meshsdk/core";
import EstimatePreprodFee from "./EstimatePreprodFee";

// Define the props interface for the AIImageMinter component
interface AIImageMinterProps {
  generatedImageUrl: string;
  onMintStatusChange: (status: StatusType) => void;
}

// Main AIImageMinter component
const AIImageMinter: React.FC<AIImageMinterProps> = ({
  generatedImageUrl,
  onMintStatusChange,
}) => {
  // State variables for managing the NFT minting process
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [mediaType, setMediaType] = useState<string>("image/png");
  const [network, setNetwork] = useState("preprod");
  const [status, setStatus] = useState<StatusType>("idle");
  const [isMinted, setIsMinted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showWalletAlert, setShowWalletAlert] = useState(false);
  const [isUploadDisabled, setIsUploadDisabled] = useState(false);
  const [isStep3Enabled, setIsStep3Enabled] = useState(false);

  // Hooks for managing UI components and wallet connection
  const toast = useToast();
  const { connected, wallet } = useWallet();

  // Use useEffect to hide the alert when the wallet is connected
  useEffect(() => {
    if (connected) {
      setShowWalletAlert(false);
    }
  }, [connected]);

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();
  const {
    isOpen: isFeeOpen,
    onOpen: onFeeOpen,
    onClose: onFeeClose,
  } = useDisclosure();

  // Function to upload the generated image to IPFS
  const uploadToIPFS = async () => {
    if (!generatedImageUrl) {
      toast({
        title: "No image to upload",
        description: "Please generate an image first.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Set uploading status
      setIsUploading(true);
      setStatus("uploading");
      onMintStatusChange("uploading");

      // Fetch the image blob from the generated URL
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();

      // Prepare form data for upload
      const formData = new FormData();
      formData.append("file", blob, "generated_image.png");

      // Send POST request to upload API
      const uploadResponse = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Extract IPFS data from response
      const { IpfsHash, PinSize, Timestamp, IpfsUrl } = uploadResponse.data;

      // Update state with IPFS data
      setIpfsHash(IpfsHash);
      setIpfsUrl(IpfsUrl);
      setStatus("uploaded");
      onMintStatusChange("uploaded");

      // Enable Step 3 after successful upload
      setIsStep3Enabled(true);

      // Disable the upload button after successful upload
      setIsUploadDisabled(true);

      // Show success toast
      toast({
        title: "Upload successful",
        description: `Image uploaded to IPFS with hash: ${IpfsHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      setStatus("error");
      onMintStatusChange("error");
      toast({
        title: "Upload failed",
        description: "There was an error uploading the image to IPFS.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      // Reset uploading status
      setIsUploading(false);
    }
  };

  // Add an effect to reset the upload button when a new image is generated
  useEffect(() => {
    if (generatedImageUrl) {
      setIsUploadDisabled(false);
      setIpfsHash(null);
      setIpfsUrl("");
      setIsStep3Enabled(false);
    }
  }, [generatedImageUrl]);

  // Function to handle NFT name input
  const handleNftNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNftName(e.target.value);
    if (e.target.value && !connected) {
      setShowWalletAlert(true);
    } else {
      setShowWalletAlert(false);
    }
  };

  // Function to reset component state after successful minting
  const resetState = () => {
    setIpfsHash(null);
    setIpfsUrl("");
    setNftName("");
    setNftDescription("");
    setStatus("idle");
    setIsMinted(true);
    onMintStatusChange("minted");
    setIsStep3Enabled(false); // Disable Step 3 after minting
  };

  // Function to mint the NFT on the Cardano blockchain
  const mintNFT = async () => {
    if (!connected || !ipfsHash || !nftName || !nftDescription) {
      toast({
        title: "Error",
        description:
          "Please connect wallet, upload to IPFS, and fill all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Set status to minting and notify parent component
      setStatus("minting");
      onMintStatusChange("minting");
      console.log("Starting NFT minting process...");

      // Create a new transaction
      const tx = new Transaction({ initiator: wallet });
      console.log("Transaction object created");

      // Get the wallet's change address
      const address = await wallet.getChangeAddress();
      console.log("Wallet address obtained:", address);

      // Prepare asset metadata
      const assetMetadata: AssetMetadata = {
        name: nftName,
        image: `ipfs://${ipfsHash}`,
        mediaType: mediaType,
        description: nftDescription,
      };
      console.log("Asset metadata prepared:", assetMetadata);

      // Prepare mint asset
      const asset: Mint = {
        assetName: nftName,
        assetQuantity: "1",
        metadata: assetMetadata,
        label: "721",
        recipient: address,
      };
      console.log("Mint asset prepared:", asset);

      // Create forge script and add asset to transaction
      const forgeScript = ForgeScript.withOneSignature(address);
      tx.mintAsset(forgeScript, asset);
      console.log("Asset minting added to transaction");

      // Build and sign the transaction
      const unsignedTx = await tx.build();
      console.log("Transaction built successfully");
      const signedTx = await wallet.signTx(unsignedTx);
      console.log("Transaction signed successfully");

      // Submit the transaction
      const txHash = await wallet.submitTx(signedTx);

      console.log("Transaction submitted:", txHash);
      toast({
        title: "Success",
        description: `NFT minted successfully! Transaction hash: ${txHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset component state after successful minting
      resetState();
    } catch (error) {
      console.error("Detailed error information:", error);

      let errorMessage = "Error minting NFT: ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += "Unknown error occurred.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setStatus("error");
      onMintStatusChange("error");
    }
  };

  // Render the component UI
  return (
    <VStack spacing={6} align="stretch">
      {/* IPFS Upload Section */}
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        borderColor={useColorModeValue("cyan.500", "cyan.800")}
      >
        <Text
          fontSize="md"
          fontWeight="bold"
          mb={4}
          color={useColorModeValue("blue.600", "blue.300")}
        >
          Step 2: Upload & Pin the image to IPFS
        </Text>
        <Center>
          <HStack spacing={4}>
            <Flex align="center">
              <Button
                leftIcon={isUploading ? undefined : <FiUploadCloud />}
                colorScheme="green"
                size="lg"
                onClick={uploadToIPFS}
                isDisabled={
                  !generatedImageUrl || isUploading || isUploadDisabled
                }
              >
                {isUploading ? (
                  <HStack>
                    <Text>Uploading</Text>
                    <BeatLoader size={8} color="white" />
                  </HStack>
                ) : (
                  "Upload & Pin to IPFS"
                )}
              </Button>
              <Tooltip
                label="This process uploads your image to IPFS, a decentralized file storage system, and pins it to ensure long-term availability."
                hasArrow
                placement="top"
              >
                <IconButton
                  icon={<FiInfo />}
                  aria-label="IPFS Information"
                  size="lg"
                  variant="unstyled"
                  color="gray.500"
                  _hover={{ color: "gray.600" }}
                  ml={1}
                  minWidth="auto"
                  height="auto"
                />
              </Tooltip>
            </Flex>
            <SaveToDisk
              imageUrl={generatedImageUrl}
              isDisabled={!generatedImageUrl}
            />
          </HStack>
        </Center>
      </Box>

      {/* NFT Minting Section */}
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        borderColor={useColorModeValue("cyan.500", "cyan.800")}
      >
        <Text
          fontSize="md"
          fontWeight="bold"
          mb={4}
          color={useColorModeValue("blue.600", "blue.300")}
        >
          Step 3: Mint your NFT on Cardano
        </Text>
        <VStack spacing={4} align="stretch">
          {/* Network Selection */}
          <RadioGroup
            value={network}
            onChange={setNetwork}
            isDisabled={!isStep3Enabled}
          >
            <HStack spacing={4}>
              <Radio value="preprod">Preprod</Radio>
              <Radio value="mainnet" isDisabled>
                Mainnet
              </Radio>
            </HStack>
          </RadioGroup>

          {/* NFT Metadata Input Fields */}
          <Input
            placeholder="NFT Name"
            value={nftName}
            onChange={handleNftNameChange}
            isDisabled={!isStep3Enabled}
          />
          {showWalletAlert && !connected && (
            <Alert status="warning">
              <AlertIcon />
              <AlertTitle mr={2}>Wallet not connected!</AlertTitle>
              <AlertDescription>
                Please connect your wallet to mint NFTs.
              </AlertDescription>
            </Alert>
          )}
          <Textarea
            placeholder="NFT Description"
            value={nftDescription}
            onChange={(e) => setNftDescription(e.target.value)}
            isDisabled={!isStep3Enabled}
          />
          <Input
            value={ipfsUrl}
            isReadOnly
            placeholder="IPFS URL will appear here"
          />
          <Select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            isDisabled={!isStep3Enabled}
          >
            <option value="image/png">image/png</option>
            <option value="image/jpg">image/jpg</option>
          </Select>

          {/* Action Buttons */}
          <Flex align="center" justify="space-between">
            <Box flex="1">
              <HStack spacing={4}>
                <Button
                  leftIcon={<FiEye />}
                  onClick={onPreviewOpen}
                  isDisabled={!isStep3Enabled}
                >
                  Preview
                </Button>
                <Button
                  leftIcon={<ADAIcon />}
                  onClick={onFeeOpen}
                  isDisabled={!isStep3Enabled}
                >
                  Estimate Fees
                </Button>
              </HStack>
            </Box>
            <Box flex="1" textAlign="center">
              <Button
                colorScheme="green"
                leftIcon={<FiStar />}
                size="lg"
                onClick={mintNFT}
                isDisabled={
                  !isStep3Enabled ||
                  !connected ||
                  !ipfsHash ||
                  !nftName ||
                  !nftDescription ||
                  isMinted
                }
              >
                {isMinted ? "NFT Minted" : "Mint NFT"}
              </Button>
            </Box>
            <Box flex="1" />
          </Flex>
        </VStack>
      </Box>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>NFT Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {generatedImageUrl && (
                <Box width="100%" maxWidth="500px" height="300px" mx="auto">
                  <Image
                    src={generatedImageUrl}
                    alt="NFT Image"
                    objectFit="contain"
                    width="100%"
                    height="100%"
                  />
                </Box>
              )}
              <Table variant="simple" size="sm">
                <Tbody>
                  <Tr>
                    <Th>Name</Th>
                    <Td>{nftName}</Td>
                  </Tr>
                  <Tr>
                    <Th>Description</Th>
                    <Td style={{ wordBreak: "break-word" }}>
                      {nftDescription}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>Image Type</Th>
                    <Td>{mediaType}</Td>
                  </Tr>
                  <Tr>
                    <Th>IPFS URL</Th>
                    <Td style={{ wordBreak: "break-all" }}>
                      {ipfsHash ? `ipfs://${ipfsHash}` : "Not uploaded yet"}
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onPreviewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Fee Estimation Modal */}
      <EstimatePreprodFee
        isOpen={isFeeOpen}
        onClose={onFeeClose}
        metadata={{
          name: nftName,
          description: nftDescription,
          image: ipfsHash ? `ipfs://${ipfsHash}` : "",
          mediaType: mediaType,
        }}
      />
    </VStack>
  );
};

export default AIImageMinter;
