import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "@meshsdk/react";
import { Transaction, AssetMetadata, ForgeScript, Mint } from "@meshsdk/core";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  VStack,
  Text,
  useToast,
  Image,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  HStack,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import EstimatePreprodFee from "./EstimatePreprodFee";

// Constants for file validation
const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg"];

const SavedImageNFTMinter: React.FC = () => {
  // State variables
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [isMintingComplete, setIsMintingComplete] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>("preprod");
  const [isStep3Enabled, setIsStep3Enabled] = useState<boolean>(false);
  const [isWalletAlertOpen, setIsWalletAlertOpen] = useState(false);

  const cancelRef: React.RefObject<HTMLButtonElement> = React.useRef(null);

  //useDisclosure hook for managing the wallet alert dialog
  const {
    isOpen: isWalletAlertDialogOpen,
    onOpen: onWalletAlertOpen,
    onClose: onWalletAlertClose,
  } = useDisclosure();

  // Hooks
  const { connected, wallet } = useWallet();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isFeeOpen,
    onOpen: onFeeOpen,
    onClose: onFeeClose,
  } = useDisclosure();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();

  // Color mode values
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  // Effect to set client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // function to check if the wallet is connected when the user enters the NFT name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    if (newName && !connected) {
      onWalletAlertOpen();
    }
  };

  // File validation function
  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size exceeds 1.5MB limit.");
      return false;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Only PNG and JPG files are allowed.");
      return false;
    }
    return true;
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setImagePreview(URL.createObjectURL(selectedFile));
        setSelectedFileName(selectedFile.name);
        setIsMintingComplete(false);
        setIsMinted(false);
        setIpfsHash("");
        setName("");
        setDescription("");
        setFileError(null);
        setIsStep3Enabled(false);
      } else {
        onAlertOpen(); // Open the alert dialog
        event.target.value = ""; // Reset file input
      }
    }
  };

  // Upload file to IPFS
  const uploadToIPFS = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file to IPFS...");
      const response = await fetch("/api/upload-savedimageminter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload to IPFS failed");
      }

      const data = await response.json();
      console.log("IPFS upload response:", data);

      if (data.ipfsHash) {
        setIpfsHash(data.ipfsHash);
        console.log("IPFS Hash:", data.ipfsHash);
        setIsStep3Enabled(true);
        toast({
          title: "Success",
          description: "File uploaded to IPFS successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("IPFS hash not found in the response");
      }
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      toast({
        title: "Error",
        description: "Failed to upload file to IPFS",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state after successful minting
  const resetState = () => {
    setFile(null);
    setImagePreview(null);
    setSelectedFileName(null);
    setName("");
    setDescription("");
    setIpfsHash("");
    setIsMinted(true);
    setIsMintingComplete(true);
    setIsStep3Enabled(false);
  };

  // Mint NFT
  const mintNFT = async () => {
    if (!connected || !ipfsHash || !name || !description) {
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
      console.log(`Starting NFT minting process on ${network} network...`);
      // Create a new transaction
      const tx = new Transaction({ initiator: wallet });
      console.log("Transaction object created");

      const addresses = await wallet.getUsedAddresses();
      const address = addresses[0];
      if (!address) {
        throw new Error("No wallet address available");
      }
      console.log("Wallet address obtained:", address);

      // Prepare asset metadata
      const assetMetadata: AssetMetadata = {
        name: name,
        image: `ipfs://${ipfsHash}`,
        mediaType: file?.type || "image/png",
        description: description,
      };
      console.log("Asset metadata prepared:", assetMetadata);

      // Prepare mint asset
      const asset: Mint = {
        assetName: name,
        assetQuantity: "1",
        metadata: assetMetadata,
        label: "721",
        recipient: address,
      };
      console.log("Mint asset prepared:", asset);

      // Create forge script and mint asset
      const forgeScript = ForgeScript.withOneSignature(address);
      tx.mintAsset(forgeScript, asset);
      console.log("Asset minting added to transaction");

      // Add inputs and change
      const utxos = await wallet.getUtxos();
      tx.setTxInputs(utxos);
      tx.setChangeAddress(address);
      console.log("Transaction inputs and change address set");

      // Build, sign, and submit transaction
      console.log("Building transaction...");
      const unsignedTx = await tx.build();
      console.log("Transaction built successfully");

      console.log("Signing transaction...");
      const signedTx = await wallet.signTx(unsignedTx);
      console.log("Transaction signed successfully");

      console.log("Submitting transaction...");
      const txHash = await wallet.submitTx(signedTx);

      console.log("Transaction submitted:", txHash);
      toast({
        title: "Success",
        description: `NFT minted successfully! Transaction hash: ${txHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset the state after successful minting
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
    }
  };

  // Return null if not client-side to prevent server-side rendering issues
  if (!isClient) {
    return null;
  }

  return (
    <Container maxW="container.md" py={10}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        boxShadow="sm"
        bg={useColorModeValue("white", "gray.700")}
      >
        <VStack spacing={6} align="stretch">
          {/* Main heading */}
          <Heading
            as="h2"
            size="lg"
            textAlign="center"
            mb={4}
            color={headingColor}
          >
            Mint Your Saved Images as NFTs
          </Heading>

          {/* File upload section */}
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.400">
              Please select a PNG or JPG file, max size 1.5MB.
            </Text>

            <Box
              borderWidth="1px"
              borderRadius="md"
              py={3}
              px={4}
              bg={useColorModeValue("gray.50", "gray.600")}
            >
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg"
                height="auto"
                py={1}
              />
            </Box>

            {/* Display selected filename */}
            {selectedFileName && (
              <Text fontSize="sm" color="gray.500">
                Selected file: {selectedFileName}
              </Text>
            )}

            {/* Image preview */}
            {imagePreview && (
              <Box width="100%" maxWidth="300px" height="200px" mx="auto">
                <Image
                  src={imagePreview}
                  alt="Selected image"
                  objectFit="contain"
                  width="100%"
                  height="100%"
                />
              </Box>
            )}

            {/* IPFS upload button with loading indicator */}
            <Button
              colorScheme="blue"
              onClick={uploadToIPFS}
              isDisabled={!file || isMintingComplete || isUploading}
              width="100%"
            >
              {isUploading ? (
                <HStack spacing={2}>
                  <Spinner size="sm" />
                  <Text>Uploading to IPFS...</Text>
                </HStack>
              ) : (
                "Upload & Pin to IPFS"
              )}
            </Button>

            {/* Display IPFS hash if available */}
            {ipfsHash && (
              <VStack align="stretch">
                <Text fontWeight="bold">IPFS URL:</Text>
                <Input
                  value={`ipfs://${ipfsHash}`}
                  isReadOnly
                  placeholder="IPFS Hash"
                />
              </VStack>
            )}

            {/* Network Selection */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2}>
                All form fields below are required.
              </Text>
              <Text mb={2}>Select Network:</Text>
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
            </Box>

            {/* Input field for NFT Name */}
            <Input
              placeholder="NFT Name"
              value={name}
              onChange={handleNameChange}
              isDisabled={!isStep3Enabled}
            />

            {/* Textarea for NFT Description */}
            <Textarea
              placeholder="NFT Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              isDisabled={!isStep3Enabled}
            />

            {/* Preview NFT button */}
            <Button
              colorScheme="teal"
              onClick={onOpen}
              isDisabled={!isStep3Enabled || !name || !description}
            >
              Preview NFT
            </Button>

            {/* Estimate Minting Fee button */}
            <Button
              colorScheme="purple"
              onClick={onFeeOpen}
              isDisabled={!isStep3Enabled || !name || !description}
            >
              Estimate Minting Fee
            </Button>

            {/* Mint NFT button */}
            <Button
              colorScheme="green"
              onClick={mintNFT}
              isDisabled={
                !connected ||
                !isStep3Enabled ||
                !name ||
                !description ||
                isMinted ||
                isMintingComplete
              }
            >
              {isMinted ? "NFT Minted" : "Mint NFT"}
            </Button>
          </VStack>

          {/* NFT Preview Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>NFT Preview</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  {imagePreview && (
                    <Box width="100%" maxWidth="500px" height="300px" mx="auto">
                      <Image
                        src={imagePreview}
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
                        <Td>{name}</Td>
                      </Tr>
                      <Tr>
                        <Th>Description</Th>
                        <Td style={{ wordBreak: "break-word" }}>
                          {description}
                        </Td>
                      </Tr>
                      <Tr>
                        <Th>Image Type</Th>
                        <Td>{file?.type || "Unknown"}</Td>
                      </Tr>
                      <Tr>
                        <Th>IPFS URL</Th>
                        <Td style={{ wordBreak: "break-all" }}>
                          ipfs://{ipfsHash}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Estimate Minting Fee Modal */}
          <EstimatePreprodFee
            isOpen={isFeeOpen}
            onClose={onFeeClose}
            metadata={{
              name,
              description,
              image: `ipfs://${ipfsHash}`,
              mediaType: file?.type || "image/png",
            }}
          />

          {/* Alert Dialog for File Errors */}
          <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={onAlertClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  File Error
                </AlertDialogHeader>

                <AlertDialogBody>{fileError}</AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onAlertClose}>
                    OK
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          {/* Wallet Connection Alert Dialog */}
          <AlertDialog
            isOpen={isWalletAlertDialogOpen}
            leastDestructiveRef={cancelRef}
            onClose={onWalletAlertClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Wallet Not Connected
                </AlertDialogHeader>

                <AlertDialogBody>
                  Please connect your wallet before proceeding with NFT minting.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onWalletAlertClose}>
                    OK
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </VStack>
      </Box>
    </Container>
  );
};

export default SavedImageNFTMinter;
