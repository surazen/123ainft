import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Textarea,
  FormHelperText,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useWallet } from "@meshsdk/react";
import { Transaction } from "@meshsdk/core";

// Import or define the ValidNFT type here
interface ValidNFT {
  unit: string;
  quantity: string;
  policyId: string | null;
  assetName: string | null;
  metadata: {
    name: string;
    description: string;
    image: string;
    [key: string]: any;
  };
}

interface SendNFTProps {
  isOpen: boolean;
  onClose: () => void;
  nft: ValidNFT;
  onSendComplete: (nftUnit: string) => void;
}

const SendNFT: React.FC<SendNFTProps> = ({
  isOpen,
  onClose,
  nft,
  onSendComplete,
}) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [onChainMessage, setOnChainMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { wallet } = useWallet();
  const toast = useToast();

  const MAX_MESSAGE_LENGTH = 64;

  const handleSend = async () => {
    if (!recipientAddress) {
      toast({
        title: "Error",
        description: "Please enter a recipient address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (nft.policyId === null || nft.assetName === null) {
      toast({
        title: "Error",
        description: "Invalid NFT data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const tx = new Transaction({ initiator: wallet });

      tx.sendAssets(recipientAddress, [{ unit: nft.unit, quantity: "1" }]);

      // Prepare the NFT metadata
      const nftMetadata = {
        "721": {
          [nft.policyId]: {
            [nft.assetName]: {
              ...nft.metadata,
              ...(onChainMessage && { message: onChainMessage }),
            },
          },
          version: "1.0",
        },
      };

      tx.setMetadata(721, nftMetadata);

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      console.log("Transaction submitted:", txHash);

      toast({
        title: "NFT Sent",
        description: `Successfully sent ${nft.metadata.name} to ${recipientAddress}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onSendComplete(nft.unit);
      onClose();
    } catch (error) {
      console.error("Error sending NFT:", error);
      toast({
        title: "Error",
        description: "Failed to send NFT. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send NFT</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text>
              You are about to send the NFT:{" "}
              <strong>{nft.metadata.name}</strong>
            </Text>
            <FormControl isRequired>
              <FormLabel>Recipient Address</FormLabel>
              <Input
                placeholder="Enter Cardano address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>On-Chain Message (Optional)</FormLabel>
              <Textarea
                placeholder="Enter an optional message to include in the transaction"
                value={onChainMessage}
                onChange={(e) => setOnChainMessage(e.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <FormHelperText>
                {onChainMessage.length}/{MAX_MESSAGE_LENGTH} characters
              </FormHelperText>
            </FormControl>
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              On-chain messages are public and permanently recorded on the
              blockchain. Please be mindful of the content you include.
            </Alert>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSend}
            isLoading={isLoading}
          >
            Send NFT
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SendNFT;
