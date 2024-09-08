import React, { useState } from "react";
import LandingPage from "@/components/LandingPage";
import CardanoAINFTMinter from "@/components/CardanoAINFTMinter";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <CardanoAINFTMinter onLogout={handleLogout} />
      ) : (
        <LandingPage onLogin={handleLogin} />
      )}
    </>
  );
}
