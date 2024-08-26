import React from "react";
import { CardanoWallet, useWallet } from "@meshsdk/react";

interface CardanoWalletComponentProps {
  className?: string;
}

const CardanoWalletComponent: React.FC<CardanoWalletComponentProps> = ({
  className,
}) => {
  const { connecting, error } = useWallet();

  const renderError = () => {
    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return <p className="error">Error: {errorMessage}</p>;
    }
    return null;
  };

  return (
    <div className={`cardano-wallet-container ${className || ""}`}>
      <CardanoWallet
        label="Connect Wallet"
        isDark={true}
        onConnected={() => console.log("Wallet connected successfully")}
      />

      {connecting && <p>Connecting wallet...</p>}

      {renderError()}
    </div>
  );
};

export default CardanoWalletComponent;
