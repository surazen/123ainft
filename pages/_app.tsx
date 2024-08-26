import type { AppProps } from "next/app";
import { MeshProvider } from "@meshsdk/react";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "@meshsdk/react/styles.css";
import theme from "../components/theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Component {...pageProps} />
      </ChakraProvider>
    </MeshProvider>
  );
}

export default MyApp;
