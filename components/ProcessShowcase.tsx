import React from "react";
import { Box, VStack, Text, Image, Flex, keyframes } from "@chakra-ui/react";
import { motion } from "framer-motion";

// Image Scroller Component
const ImageScroller: React.FC<{ images: string[] }> = ({ images }) => {
  return (
    <Flex overflow="hidden" width="100%" height="150px">
      <motion.div
        animate={{ x: [0, -1500] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        style={{ display: "flex" }}
      >
        {images.concat(images).map((src, index) => (
          <Image
            key={index}
            src={src}
            height="150px"
            minWidth="150px"
            objectFit="cover"
            mr={2}
          />
        ))}
      </motion.div>
    </Flex>
  );
};

// IPFS Upload Component
const uploadAnimation = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  50% { transform: translateY(-75px); opacity: 1; }
  100% { transform: translateY(-150px); opacity: 0; }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px #3182ce, 0 0 10px #3182ce; }
  50% { box-shadow: 0 0 20px #3182ce, 0 0 30px #3182ce; }
  100% { box-shadow: 0 0 5px #3182ce, 0 0 10px #3182ce; }
`;

const Arrow: React.FC<{ delay: string }> = ({ delay }) => (
  <Box
    position="absolute"
    bottom="10px"
    left="50%"
    transform="translateX(-50%)"
    fontSize="24px"
    color="blue.500"
    animation={`${uploadAnimation} 3s infinite ${delay}, ${glowAnimation} 1.5s infinite`}
    _before={{
      content: '""',
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      width: "2px",
      height: "20px",
      background: "blue.500",
      boxShadow: "0 0 10px #3182ce",
    }}
  >
    ▲
  </Box>
);

const IPFSUpload: React.FC = () => {
  return (
    <Box
      position="relative"
      height="200px"
      width="100%"
      mt="5px"
      overflow="hidden"
    >
      <Image
        src="/images/ipfs-logo.png"
        position="absolute"
        top="0"
        left="50%"
        transform="translateX(-50%)"
        width="100px"
      />
      <Arrow delay="0s" />
      <Arrow delay="1s" />
      <Arrow delay="2s" />
    </Box>
  );
};

// Minting Process Component
const mintAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const MintingProcess: React.FC = () => {
  return (
    <Box position="relative" height="150px" width="100%">
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="100px"
        height="100px"
        borderRadius="full"
        bg="purple.500"
        animation={`${mintAnimation} 2s infinite`}
      />
      <Text
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        fontSize="xl"
        fontWeight="bold"
        color="white"
      >
        NFT
      </Text>
    </Box>
  );
};

// Main Process Showcase Component
const ProcessShowcase: React.FC = () => {
  // Assuming you have 9 pre-generated AI images
  const images: string[] = [
    "/path/to/image1.jpg",
    "/path/to/image2.jpg",
    // ... add more image paths
  ];

  return (
    <VStack spacing={4} align="stretch" width="100%">
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={1}>
          1. Generate
        </Text>
        <ImageScroller images={images} />
      </Box>
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={1}>
          2. Upload
        </Text>
        <IPFSUpload />
      </Box>
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={1}>
          3. Mint
        </Text>
        <MintingProcess />
      </Box>
    </VStack>
  );
};

export default ProcessShowcase;
