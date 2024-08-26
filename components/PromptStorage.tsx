import React, { useState, useEffect } from "react";
import {
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import { FiSave, FiList, FiTrash2 } from "react-icons/fi";

const STORAGE_KEY = "saved-prompts";

interface PromptStorageProps {
  currentPrompt: string;
  onPromptSelect: (prompt: string) => void;
}

const localStorageManager = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },
};

const PromptStorage: React.FC<PromptStorageProps> = ({
  currentPrompt,
  onPromptSelect,
}) => {
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const toast = useToast();

  useEffect(() => {
    const storedPrompts = localStorageManager.get(STORAGE_KEY);
    if (storedPrompts) {
      setSavedPrompts(storedPrompts);
    }
  }, []);

  const handleSavePrompt = () => {
    if (currentPrompt && !savedPrompts.includes(currentPrompt)) {
      const newSavedPrompts = [...savedPrompts, currentPrompt];
      setSavedPrompts(newSavedPrompts);
      localStorageManager.set(STORAGE_KEY, newSavedPrompts);
      toast({
        title: "Prompt saved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else if (savedPrompts.includes(currentPrompt)) {
      toast({
        title: "Prompt already saved",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDeletePrompt = (promptToDelete: string) => {
    const newSavedPrompts = savedPrompts.filter((p) => p !== promptToDelete);
    setSavedPrompts(newSavedPrompts);
    localStorageManager.set(STORAGE_KEY, newSavedPrompts);
    toast({
      title: "Prompt deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <HStack spacing={2} width="100%">
      <Tooltip label="Save current prompt">
        <IconButton
          icon={<FiSave />}
          onClick={handleSavePrompt}
          aria-label="Save prompt"
          size="lg"
          border="1px solid"
          borderColor="gray.400"
        />
      </Tooltip>
      <Menu>
        <Tooltip label="View saved prompts">
          <MenuButton
            as={IconButton}
            icon={<FiList />}
            aria-label="Saved prompts"
            size="lg"
            border="1px solid"
            borderColor="gray.400"
          />
        </Tooltip>
        <MenuList>
          {savedPrompts.map((savedPrompt, index) => (
            <MenuItem key={index} onClick={() => onPromptSelect(savedPrompt)}>
              <HStack justifyContent="space-between" width="100%">
                <Text isTruncated maxWidth="calc(100% - 40px)" as="span">
                  {savedPrompt}
                </Text>
                <Tooltip label="Delete prompt">
                  <IconButton
                    size="xs"
                    icon={<FiTrash2 />}
                    aria-label="Delete prompt"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePrompt(savedPrompt);
                    }}
                  />
                </Tooltip>
              </HStack>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </HStack>
  );
};

export default PromptStorage;
