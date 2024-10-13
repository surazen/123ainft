import React from "react";
import { Box, Text } from "@chakra-ui/react";

interface VideoSectionProps {
  videoSrc: string;
  posterSrc: string;
  title: string;
  description: string;
  videoWidth: number; 
  videoHeight: number;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  videoSrc,
  posterSrc,
  title,
  description,
  videoWidth,
  videoHeight,
}) => {
  return (
    <Box mt={16}>
      <Text
        fontSize="3xl"
        fontWeight="bold"
        color="#021526"
        mb={8}
        textAlign="center"
      >
        {title}
      </Text>
      <Box
        maxWidth={`${videoWidth}px`}
        width="100%"
        margin="0 auto"
        boxShadow="xl"
        borderRadius="lg"
        overflow="hidden"
      >
        <video
          controls
          width={videoWidth}
          height={videoHeight}
          poster={posterSrc}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Box>
      <Text
        mt={4}
        textAlign="center"
        fontSize="sm"
        color="white"
      >
        {description}
      </Text>
    </Box>
  );
};

export default VideoSection;