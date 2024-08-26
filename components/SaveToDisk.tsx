import React from "react";
import { Button, useToast } from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";

interface SaveToDiskProps {
  imageUrl: string | null;
  isDisabled: boolean;
}

const SaveToDisk: React.FC<SaveToDiskProps> = ({ imageUrl, isDisabled }) => {
  const toast = useToast();

  const saveToDisk = async () => {
    if (!imageUrl) {
      toast({
        title: "No image to save",
        description: "Please generate an image first.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const defaultFilename = `generated_image_${Date.now()}.png`;

      if ("showSaveFilePicker" in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: defaultFilename,
            types: [
              {
                description: "PNG Files",
                accept: { "image/png": [".png"] },
              },
            ],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();

          toast({
            title: "Image saved",
            description: `The image has been saved as ${fileHandle.name}`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } catch (err) {
          if (err instanceof Error && err.name !== "AbortError") {
            throw err;
          }
          // User cancelled the save dialog
          console.log("Save cancelled:", err);
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = defaultFilename;
        link.click();
        URL.revokeObjectURL(link.href);

        toast({
          title: "Image save initiated",
          description: "The image download should begin shortly.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error saving image:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving the image to disk.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      leftIcon={<FiDownload />}
      colorScheme="purple"
      variant="solid"
      onClick={saveToDisk}
      isDisabled={isDisabled}
    >
      Save to Disk
    </Button>
  );
};

export default SaveToDisk;
