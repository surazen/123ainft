import React from "react";
import { Box, Text, Button, VStack } from "@chakra-ui/react";

interface UserProfileSettingsProps {
  onLogout: () => void;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  onLogout,
}) => {
  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    // or if you want to clear only specific items:
    // localStorage.removeItem("secretKey");
    // localStorage.removeItem("authToken");

    // Call the onLogout function passed as a prop
    onLogout();
  };

  return (
    <Box>
      <VStack align="flex-end" spacing={2}>
        <Text fontSize="xs">User: Guest</Text>
        <Button size="xs" onClick={handleLogout}>
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default UserProfileSettings;
