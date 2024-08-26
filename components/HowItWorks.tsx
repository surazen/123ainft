import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Grid,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import FAQSection from "./FAQSection";

interface HowItWorksStepProps {
  number: string;
  title: string;
  description: string;
}

const HowItWorksStep: React.FC<HowItWorksStepProps> = ({
  number,
  title,
  description,
}) => (
  <HStack align="start" spacing={4}>
    <Box
      minW="40px"
      h="40px"
      borderRadius="full"
      bg="blue.500"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="xl"
      fontWeight="bold"
    >
      {number}
    </Box>
    <VStack align="start" spacing={1}>
      <Text fontWeight="bold" fontSize="lg" color="#EEF5FF">
        {title}
      </Text>
      <Text color="#F8EDE3">{description}</Text>
    </VStack>
  </HStack>
);

const NFTGallery: React.FC = () => (
  <Box>
    <Text
      fontSize="2.3rem"
      fontWeight="bold"
      mb={1}
      bg="#e3f9f7"
      bgClip="text"
      as="h2"
      css={{
        "-webkit-text-stroke": "1px #B8860B",
      }}
    >
      NFT Gallery
    </Text>
    <Text
      fontSize="1rem"
      fontWeight="bold"
      mb={4}
      bgGradient="linear(45deg, cyan.800, purple.700)"
      bgClip="text"
      as="h2"
    >
      Community Masterpieces: Top AI-Generated NFTs
    </Text>
    <SimpleGrid columns={3} spacing={0.5}>
      {[...Array(9)].map((_, index) => (
        <Box
          key={index}
          position="relative"
          width="100%"
          paddingBottom="100%"
          overflow="hidden"
          borderRadius="md"
        >
          <Image
            src={`/images/landing/img${index + 1}.png`}
            alt={`AI Generated NFT ${index + 1}`}
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>
      ))}
    </SimpleGrid>
  </Box>
);

const HowItWorks: React.FC = () => {
  return (
    <Box w="full">
      <Text
        fontSize="3xl"
        fontWeight="bold"
        color="#EEF5FF"
        mb={8}
        textAlign="center"
      >
        How It Works
      </Text>
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={8}
        bg="rgba(255, 255, 255, 0.1)"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.3)"
      >
        <VStack spacing={6} align="start">
          <HowItWorksStep
            number="1"
            title="Create Your NFT"
            description="Utilize popular AI tools like Stable Diffusion or DALL-E to generate unique digital art"
          />
          <HowItWorksStep
            number="2"
            title="Upload & Pin to IPFS"
            description="Securely store your NFT's metadata and files on IPFS, ensuring decentralized and permanent access"
          />
          <HowItWorksStep
            number="3"
            title="Mint Your NFT"
            description="Connect your Cardano wallet and securely mint your NFT on the Cardano blockchain"
          />
          {/* FAQ Section */}
          <FAQSection />
        </VStack>
        <NFTGallery />
      </Grid>
    </Box>
  );
};

export default HowItWorks;
