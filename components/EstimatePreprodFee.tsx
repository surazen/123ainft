import React, { useState, useEffect } from "react";
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
  Spinner,
} from "@chakra-ui/react";
import { Transaction, ForgeScript, AssetMetadata, Mint } from "@meshsdk/core";
import { useWallet } from "@meshsdk/react";

interface EstimatePreprodFeeProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: {
    name: string;
    description: string;
    image: string;
    mediaType: string;
  };
}

const EstimatePreprodFee: React.FC<EstimatePreprodFeeProps> = ({
  isOpen,
  onClose,
  metadata,
}) => {
  const [fee, setFee] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallet, connected } = useWallet();

  const estimateFee = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!connected || !wallet) {
        throw new Error("Wallet not connected");
      }

      const tx = new Transaction({ initiator: wallet });

      const address = await wallet.getChangeAddress();

      const forgeScript = ForgeScript.withOneSignature(address);

      const assetMetadata: AssetMetadata = {
        name: metadata.name,
        image: metadata.image,
        mediaType: metadata.mediaType,
        description: metadata.description,
      };

      const asset: Mint = {
        assetName: metadata.name,
        assetQuantity: "1",
        metadata: assetMetadata,
        label: "721",
        recipient: address,
      };

      tx.mintAsset(forgeScript, asset);

      const utxos = await wallet.getUtxos();
      tx.setTxInputs(utxos);
      tx.setChangeAddress(address);

      // Build the transaction
      const unsignedTx = await tx.build();

      // Estimate fee based on transaction size

      const txSize = unsignedTx.length / 2; // Convert hex string length to byte size
      const estimatedFee = Math.ceil(txSize * 0.44 + 155381); // a * size + b (in lovelace)

      setFee(estimatedFee.toString());
    } catch (err) {
      console.error("Error estimating fee:", err);
      setError(
        `Failed to estimate fee: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && connected) {
      estimateFee();
    }
  }, [isOpen, connected]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Estimated Minting Fee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {loading && <Spinner />}
              {error && <Text color="red.500">{error}</Text>}
              {fee && (
                <>
                  <Text fontSize="xl" fontWeight="bold">
                    Estimated Fee: {parseInt(fee) / 1000000} ADA
                  </Text>
                  <Text fontSize="sm">
                    This is a simplified estimation based on transaction size
                    and may not be 100% accurate
                  </Text>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EstimatePreprodFee;
