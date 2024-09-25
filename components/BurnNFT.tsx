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
  Text,
  VStack,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useWallet } from "@meshsdk/react";
import { Transaction, ForgeScript, Asset } from "@meshsdk/core";

// Define the ValidNFT type within this file
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

interface ValidNFT extends Omit<DetailedAsset, "metadata"> {
  metadata: {
    name: string;
    description: string;
    image: string;
    [key: string]: any;
  };
}

interface BurnNFTProps {
  isOpen: boolean;
  onClose: () => void;
  nft: ValidNFT;
  onBurnComplete: () => void;
}

const BurnNFT: React.FC<BurnNFTProps> = ({
  isOpen,
  onClose,
  nft,
  onBurnComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { wallet } = useWallet();
  const toast = useToast();

  const warningColor = useColorModeValue("red.500", "red.300");
  const nftNameColor = useColorModeValue("blue.600", "blue.300");

  const handleBurn = async () => {
    setIsLoading(true);
    try {
      const usedAddresses = await wallet.getUsedAddresses();
      const address = usedAddresses[0];
      const forgingScript = ForgeScript.withOneSignature(address);

      const tx = new Transaction({ initiator: wallet });

      const asset: Asset = {
        unit: nft.unit,
        quantity: "1",
      };

      tx.burnAsset(forgingScript, asset);

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      toast({
        title: "NFT Burned Successfully",
        description: `Transaction Hash: ${txHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onBurnComplete();
      onClose();
    } catch (error) {
      console.error("Error burning NFT:", error);
      toast({
        title: "Error Burning NFT",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
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
        <ModalHeader>Burn NFT</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text color={warningColor} fontWeight="bold">
              Are you sure you want to burn this NFT?
            </Text>
            <Text color={nftNameColor} fontWeight="bold">
              Name: {nft.metadata.name}
            </Text>
            <Text fontSize="xs">Policy ID: {nft.policyId}</Text>
            <Text>
              Asset Name:{" "}
              {Buffer.from(nft.assetName || "", "hex").toString("utf-8")}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Note: Assets can only be burned by its minting address.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="red"
            mr={3}
            onClick={handleBurn}
            isLoading={isLoading}
          >
            Burn NFT
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BurnNFT;
