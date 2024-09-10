import React, { useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  CloseButton,
  OrderedList,
  ListItem,
  Text,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";

const ProcessInfoBox: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const bgColor = useColorModeValue("blue.50", "blue.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const headingColor = useColorModeValue("blue.600", "blue.200");
  const noteColor = useColorModeValue("orange.500", "orange.300");
  const borderColor = useColorModeValue("blue.200", "blue.700");

  if (!isVisible) return null;

  return (
    <Alert
      status="info"
      variant="subtle"
      flexDirection="column"
      alignItems="flex-start"
      borderRadius="md"
      p={3}
      bg={bgColor}
      color={textColor}
      maxWidth="470px"
      fontSize="sm"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex alignItems="center" width="100%">
        <AlertIcon />
        <Text fontSize="md" fontWeight="bold" color={headingColor}>
          NFT Creation Process
        </Text>
        <CloseButton
          position="absolute"
          right="8px"
          top="8px"
          onClick={() => setIsVisible(false)}
        />
      </Flex>
      <Box mt={2}>
        <Text fontSize="sm" mb={2}>
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
      </Box>
    </Alert>
  );
};

export default ProcessInfoBox;
