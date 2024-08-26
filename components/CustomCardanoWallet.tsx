import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Text,
  Image,
  ThemeProvider,
  extendTheme,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

// Define the structure of the Cardano wallet API
interface CardanoWalletAPI {
  getNetworkId: () => Promise<number>;
  getUtxos: () => Promise<unknown>;
  getBalance: () => Promise<unknown>;
  getUsedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  signTx: (tx: unknown, partialSign: boolean) => Promise<string>;
  submitTx: (tx: unknown) => Promise<string>;
}

// Define the structure of a Cardano wallet
interface CardanoWallet {
  enable: () => Promise<CardanoWalletAPI>;
  isEnabled: () => Promise<boolean>;
  apiVersion: string;
  name?: string;
}

// Define the structure of a detected Cardano wallet
interface DetectedCardanoWallet {
  name: string;
  iconUrl: string;
  apiVersion: string;
  wallet: CardanoWallet;
}

// Official URLs for wallet icons
const WALLET_ICONS = {
  nami: "/images/nami-logo.png",
  eternl: "/images/eternl-logo.png",
  flint: "https://flint-wallet.com/assets/flint-logo.png",
};

// Function to detect available Cardano wallets
const detectWallets = (): DetectedCardanoWallet[] => {
  const wallets: DetectedCardanoWallet[] = [];

  if (typeof window !== "undefined" && window.cardano) {
    const potentialWallets: Record<string, any> = {
      nami: window.cardano.nami,
      eternl: window.cardano.eternl || window.cardano.ccvault,
      flint: window.cardano.flint,
    };

    for (const [name, wallet] of Object.entries(potentialWallets)) {
      if (
        wallet &&
        typeof wallet.enable === "function" &&
        typeof wallet.isEnabled === "function"
      ) {
        wallets.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          iconUrl: WALLET_ICONS[name as keyof typeof WALLET_ICONS] || "",
          apiVersion: wallet.apiVersion,
          wallet: {
            enable: wallet.enable.bind(wallet),
            isEnabled: wallet.isEnabled.bind(wallet),
            apiVersion: wallet.apiVersion,
            name: wallet.name || name,
          },
        });
      }
    }
  }

  return wallets;
};

// Extend the Chakra UI theme to include a custom color scheme
const theme = extendTheme({
  colors: {
    blueGreen: {
      50: "#e6fffa",
      100: "#b2f5ea",
      200: "#81e6d9",
      300: "#4fd1c5",
      400: "#38b2ac",
      500: "#319795",
      600: "#2c7a7b",
      700: "#285e61",
      800: "#234e52",
      900: "#1d4044",
    },
  },
});

// Main CustomCardanoWallet component
const CustomCardanoWallet: React.FC = () => {
  // State for storing detected wallets
  const [wallets, setWallets] = useState<DetectedCardanoWallet[]>([]);
  // State for storing the currently selected wallet
  const [selectedWallet, setSelectedWallet] =
    useState<DetectedCardanoWallet | null>(null);
  // State for storing the wallet API after connection
  const [walletAPI, setWalletAPI] = useState<CardanoWalletAPI | null>(null);
  // State for tracking whether a wallet is connected
  const [isConnected, setIsConnected] = useState(false);
  // Hook for displaying toast notifications
  const toast = useToast();

  // Effect to detect available wallets on component mount
  useEffect(() => {
    const detectedWallets = detectWallets();
    setWallets(detectedWallets);
    console.log("Detected wallets:", detectedWallets);
  }, []);

  // Function to handle wallet connection
  const handleConnect = useCallback(
    async (detectedWallet: DetectedCardanoWallet) => {
      try {
        console.log(`Attempting to connect to ${detectedWallet.name}...`);
        const api = await detectedWallet.wallet.enable();
        console.log(`${detectedWallet.name} connected successfully:`, api);
        setWalletAPI(api);
        setSelectedWallet(detectedWallet);
        setIsConnected(true);
        toast({
          title: "Wallet connected",
          description: `Successfully connected to ${detectedWallet.name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error(`Failed to connect to ${detectedWallet.name}:`, error);
        toast({
          title: "Connection failed",
          description: `Failed to connect to ${detectedWallet.name}. Error: ${error}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  // Function to handle wallet disconnection
  const handleDisconnect = useCallback(async () => {
    if (selectedWallet) {
      try {
        // Reset state to disconnect
        setWalletAPI(null);
        setIsConnected(false);
        setSelectedWallet(null);
        toast({
          title: "Wallet disconnected",
          description: `Disconnected from ${selectedWallet.name}`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error during disconnection:", error);
        toast({
          title: "Disconnection error",
          description: `Error disconnecting from ${selectedWallet.name}. Please try again.`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [selectedWallet, toast]);

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            width="fit-content"
            colorScheme={isConnected ? "blueGreen" : "blue"}
          >
            {isConnected ? (
              <Box display="flex" alignItems="center">
                <Image
                  src={selectedWallet?.iconUrl}
                  alt={`${selectedWallet?.name} icon`}
                  boxSize="24px"
                  mr={2}
                  objectFit="contain"
                />
                <Text>{selectedWallet?.name} (Connected)</Text>
              </Box>
            ) : (
              "Select Wallet"
            )}
          </MenuButton>
          <MenuList>
            {isConnected ? (
              <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
            ) : (
              wallets.map((wallet) => (
                <MenuItem
                  key={wallet.name}
                  onClick={() => handleConnect(wallet)}
                >
                  <Box display="flex" alignItems="center">
                    <Image
                      src={wallet.iconUrl}
                      alt={`${wallet.name} icon`}
                      boxSize="24px"
                      mr={2}
                      objectFit="contain"
                    />
                    <Text>{wallet.name}</Text>
                  </Box>
                </MenuItem>
              ))
            )}
          </MenuList>
        </Menu>
      </Box>
    </ThemeProvider>
  );
};

export default CustomCardanoWallet;
