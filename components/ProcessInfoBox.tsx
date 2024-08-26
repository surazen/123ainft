import React from "react";
import {
  Box,
  VStack,
  Text,
  OrderedList,
  ListItem,
  useColorModeValue,
} from "@chakra-ui/react";

const ProcessInfoBox: React.FC = () => {
  // Use color mode values for background, text, and border colors
  const bgColor = useColorModeValue("blue.50", "blue.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("blue.200", "blue.700");
  const headingColor = useColorModeValue("blue.600", "blue.200");
  const noteColor = useColorModeValue("orange.500", "orange.300");

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={3}
      bg={bgColor}
      maxWidth="470px"
      boxShadow="sm"
      fontSize="sm"
      borderColor={borderColor}
      color={textColor}
    >
      <VStack align="stretch" spacing={2}>
        <Text fontSize="md" fontWeight="bold" color={headingColor}>
          NFT Creation Process
        </Text>
        <Text fontSize="sm">
          Follow these steps to create your AI-generated NFT:
        </Text>
        <OrderedList spacing={1} pl={4} fontSize="sm">
          <ListItem>Generate an AI image</ListItem>
          <ListItem>Upload & Pin the image to IPFS</ListItem>
          <ListItem>
            Mint your NFT on Cardano{" "}
            <Text as="span" color={noteColor}>
              [ Note: Connect your Cardano wallet ]
            </Text>
          </ListItem>
        </OrderedList>
      </VStack>
    </Box>
  );
};

export default ProcessInfoBox;
