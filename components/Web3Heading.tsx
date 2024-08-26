import React from "react";
import { Heading, keyframes, useColorModeValue } from "@chakra-ui/react";

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Web3Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gradientLight = "linear-gradient(45deg, #3494E6, #EC6EAD)";
  const gradientDark = "linear-gradient(45deg, #4facfe, #00f2fe)";
  const gradient = useColorModeValue(gradientLight, gradientDark);

  return (
    <Heading
      size="lg"
      ml={3}
      bgGradient={gradient}
      bgClip="text"
      fontSize={["xl", "2xl", "3xl"]}
      fontWeight="extrabold"
      letterSpacing="tight"
      animation={`${gradientAnimation} 3s ease infinite`}
      sx={{
        WebkitTextFillColor: "transparent",
        WebkitBackgroundClip: "text",
      }}
      _hover={{
        transform: "scale(1.05)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      {children}
    </Heading>
  );
};

export default Web3Heading;
