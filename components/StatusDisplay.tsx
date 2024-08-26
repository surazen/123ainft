import React from "react";
import { Box, Text, useColorModeValue, Flex } from "@chakra-ui/react";

// Define the possible status values
export type StatusType =
  | "idle"
  | "generating"
  | "uploading"
  | "uploaded"
  | "minting"
  | "minted"
  | "error";

// Define the structure for status configuration
interface StatusConfig {
  color: string;
  text: string;
}

// Define the props for the StatusDisplay component
interface StatusDisplayProps {
  status: StatusType;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  const statusConfig: Record<StatusType, StatusConfig> = {
    idle: { color: "gray", text: "Idle" },
    generating: { color: "blue", text: "Generating image" },
    uploading: { color: "yellow", text: "Uploading to IPFS" },
    uploaded: { color: "green", text: "Uploaded to IPFS" },
    minting: { color: "purple", text: "Minting NFT" },
    minted: { color: "green", text: "NFT minted successfully" },
    error: { color: "red", text: "Error occurred" },
  };

  const { color, text } = statusConfig[status] || {
    color: "gray",
    text: "Unknown status",
  };

  return (
    <Flex justifyContent="flex-end" alignItems="center">
      <Box
        w={3}
        h={3}
        borderRadius="full"
        bg={useColorModeValue(`${color}.500`, `${color}.200`)}
        mr={2}
      />
      <Text
        fontWeight="medium"
        color={useColorModeValue(`${color}.700`, `${color}.200`)}
        fontSize="sm"
      >
        Status: {text}
      </Text>
    </Flex>
  );
};

export default StatusDisplay;
