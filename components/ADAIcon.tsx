import React from "react";
import Image from "next/image";

interface ADAIconProps {
  size?: number;
}

const ADAIcon: React.FC<ADAIconProps> = ({ size = 30 }) => (
  <Image
    src="/images/ada-symbol.png"
    alt="ADA Symbol"
    width={size}
    height={size}
  />
);

export default ADAIcon;
