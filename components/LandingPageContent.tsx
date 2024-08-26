import React from "react";
import { Box, Text, VStack, SimpleGrid, Icon, HStack } from "@chakra-ui/react";
import { FaPalette, FaRocket, FaShieldAlt } from "react-icons/fa";
import { IconType } from "react-icons";
import HowItWorks from "./HowItWorks";

interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <VStack
    align="center"
    p={5}
    bg="rgba(248, 237, 227, 0.25)"
    borderRadius="lg"
    boxShadow="md"
    backdropFilter="blur(10px)"
    border="1px solid rgba(248, 237, 227, 0.5)"
    transition="all 0.3s"
    _hover={{
      transform: "translateY(-5px)",
      boxShadow: "lg",
      bg: "rgba(248, 237, 227, 0.35)",
    }}
  >
    <Icon as={icon} w={10} h={10} color="blue.500" />
    <Text fontWeight="bold" fontSize="xl" color="gray.900">
      {title}
    </Text>
    <Text textAlign="center" color="gray.800">
      {description}
    </Text>
  </VStack>
);

const LandingPageContent: React.FC = () => {
  return (
    <VStack spacing={16} position="relative" zIndex={1}>
      <Box w="full">
        <Text
          fontSize="3xl"
          fontWeight="bold"
          color="#021526"
          mb={8}
          textAlign="center"
        >
          Why Choose 123ainft?
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <FeatureCard
            icon={FaPalette}
            title="AI-Powered Creativity"
            description="Generate unique NFTs using cutting-edge AI algorithms"
          />
          <FeatureCard
            icon={FaRocket}
            title="Seamless Minting"
            description="Mint your NFTs on Cardano with just a few clicks"
          />
          <FeatureCard
            icon={FaShieldAlt}
            title="Secure & Sustainable"
            description="Benefit from Cardano's robust security and energy-efficient blockchain"
          />
        </SimpleGrid>
      </Box>

      <HowItWorks />
    </VStack>
  );
};

export default LandingPageContent;
