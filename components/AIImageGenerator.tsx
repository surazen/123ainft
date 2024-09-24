import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Textarea,
  Button,
  Image,
  Center,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Tooltip,
  HStack,
  Circle,
  Grid,
  GridItem,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { FiZap } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import PromptStorage from "./PromptStorage";

// Helper function to clean the prompt by removing "Generate" or "Create" from the beginning
const cleanPrompt = (prompt: string): string => {
  return prompt.replace(/^(generate|create)\s/i, "").trim();
};

// Define the possible dimension options
const dimensionOptions = [
  { value: "512x512", label: "512x512" },
  { value: "768x768", label: "768x768" },
  { value: "1024x1024", label: "1024x1024" },
];

// Define the style preset options
const stylePresets = [
  { value: "enhance", label: "Enhance" },
  { value: "anime", label: "Anime" },
  { value: "photographic", label: "Photographic" },
  { value: "digital-art", label: "Digital Art" },
  { value: "comic-book", label: "Comic Book" },
  { value: "fantasy-art", label: "Fantasy Art" },
  { value: "line-art", label: "Line Art" },
  { value: "analog-film", label: "Analog Film" },
  { value: "neon-punk", label: "Neon Punk" },
  { value: "isometric", label: "Isometric" },
  { value: "low-poly", label: "Low Poly" },
  { value: "origami", label: "Origami" },
  { value: "cinematic", label: "Cinematic" },
  { value: "3d-model", label: "3D Model" },
  { value: "pixel-art", label: "Pixel Art" },
];

// Define the props interface for the component
interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  shouldReset: boolean;
  onReset: () => void;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  onImageGenerated,
  shouldReset,
  onReset,
}) => {
  // State variables
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState("");
  const [isGenerateDisabled, setIsGenerateDisabled] = useState(true);
  const [dimension, setDimension] = useState("");
  const [stylePreset, setStylePreset] = useState("");
  const [aiModel, setAIModel] = useState("stable-diffusion");
  const [isImageGenerated, setIsImageGenerated] = useState(false);

  // Effect to update the disabled state of the Generate button
  useEffect(() => {
    setIsGenerateDisabled(
      !prompt.trim() || isLoading || !engine || !dimension || isImageGenerated
    );
  }, [prompt, isLoading, engine, dimension, isImageGenerated]);

  // Effect to set the dimension when the engine is changed
  useEffect(() => {
    if (engine === "sdxl") {
      setDimension("1024x1024");
    } else {
      setDimension("");
    }
  }, [engine]);

  // Function to reset all fields to their initial state
  const resetAllFields = () => {
    setPrompt("");
    setEngine("");
    setDimension("");
    setStylePreset("");
    setAIModel("stable-diffusion");
    setImageUrl("");
    setIsImageGenerated(false);
  };

  //Function to reset the image-generator post successful mint
  useEffect(() => {
    if (shouldReset) {
      setPrompt("");
      setEngine("");
      setDimension("");
      setStylePreset("");
      setAIModel("stable-diffusion");
      setImageUrl("");
      setIsImageGenerated(false);
      onReset(); // Call this to inform the parent that reset is complete
    }
  }, [shouldReset, onReset]);

  // Function to handle image generation
  const handleGenerate = async () => {
    if (!engine) {
      setError("Please select an engine before generating an image.");
      return;
    }

    if (!dimension) {
      setError("Please select a dimension before generating an image.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const cleanedPrompt = cleanPrompt(prompt);

    try {
      let endpoint;
      switch (engine) {
        case "sdxl":
          endpoint = "/api/generate-image-sdxl";
          break;
        case "sd16":
          endpoint = "/api/generate-image-sd16";
          break;
        default:
          throw new Error("Invalid engine selected");
      }

      const [height, width] = dimension.split("x").map(Number);

      const requestBody: any = {
        prompt: cleanedPrompt,
        height,
        width,
      };

      if (stylePreset) {
        requestBody.style_preset = stylePreset;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      onImageGenerated(data.imageUrl);
      setIsImageGenerated(true);
    } catch (error) {
      console.error("Error generating image:", error);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the "Try again" action
  const handleTryAgain = () => {
    resetAllFields();
  };

  // Function to handle prompt selection from PromptStorage
  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  // Generated image display background color for light and dark modes
  const imageBgColor = useColorModeValue("gray.200", "gray.700");

  return (
    <VStack spacing={6} align="stretch">
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image display box */}
      <Box
        borderWidth={1}
        borderRadius="lg"
        p={4}
        bg={imageBgColor}
        minHeight="300px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderColor={useColorModeValue("gray.300", "gray.600")}
        boxShadow={useColorModeValue(
          "none",
          "0 0 10px rgba(255, 255, 255, 0.1)"
        )}
      >
        {isLoading ? (
          <Center>
            <BeatLoader color="#3182CE" size={15} margin={2} />
          </Center>
        ) : imageUrl ? (
          <Image src={imageUrl} alt="Generated AI Image" maxH="300px" />
        ) : (
          <Text color={useColorModeValue("gray.500", "gray.400")}>
            Your generated image will appear here
          </Text>
        )}
      </Box>

      {/* Input fields */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem>
          <Select
            placeholder="Select AI Model..."
            value={aiModel}
            onChange={(e) => setAIModel(e.target.value)}
          >
            <option value="stable-diffusion">Stable Diffusion</option>
            <option value="dall-e" disabled>
              DALL-E (Coming Soon)
            </option>
            <option value="imagen" disabled>
              Imagen (Coming Soon)
            </option>
          </Select>
        </GridItem>

        <GridItem>
          <HStack>
            <Select
              placeholder="Select engine..."
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
            >
              <option value="sd16">Stable Diffusion 1.6</option>
              <option value="sdxl">SDXL Engine</option>
              <option value="ultra" disabled>
                Ultra Engine (Premium)
              </option>
              <option value="core" disabled>
                Stable Diffusion Core (Premium)
              </option>
            </Select>
            <Tooltip
              label="Ultra Engine and Stable Diffusion Core are available to premium users only."
              hasArrow
            >
              <Circle size="20px" bg="gray.100" color="gray.600">
                <Text fontSize="xs" fontWeight="bold">
                  i
                </Text>
              </Circle>
            </Tooltip>
          </HStack>
        </GridItem>

        <GridItem>
          <Tooltip
            label="The SDXL engine only allows 1024x1024 dimension. For smaller dimensions use Stable Diffusion 1.6 engine."
            hasArrow
          >
            <Select
              placeholder="Select image dimension..."
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              isDisabled={engine === "sdxl"}
            >
              {dimensionOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={engine === "sdxl" && option.value !== "1024x1024"}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </Tooltip>
        </GridItem>

        <GridItem>
          <Tooltip
            label="Select a style preset to influence the aesthetic of the generated image."
            hasArrow
          >
            <Select
              placeholder="Select image style... (optional)"
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              isDisabled={!engine}
            >
              {stylePresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </Tooltip>
        </GridItem>
      </Grid>

      {/* Prompt input */}
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your image prompt here..."
        size="lg"
      />

      {/* Add PromptStorage component */}
      <PromptStorage
        currentPrompt={prompt}
        onPromptSelect={handlePromptSelect}
      />

      {/* Generate button and Try again link */}
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Button
          onClick={handleGenerate}
          colorScheme="blue"
          size="lg"
          isLoading={isLoading}
          loadingText="Generating..."
          isDisabled={isGenerateDisabled}
          width={["100%", "auto"]}
          leftIcon={<FiZap />}
        >
          Generate Image
        </Button>
        {isImageGenerated && (
          <Text mt={2} textAlign="center">
            Not the image you're looking for?{" "}
            <Link color="blue.500" onClick={handleTryAgain}>
              Try again
            </Link>
          </Text>
        )}
      </Box>
    </VStack>
  );
};

export default AIImageGenerator;
