import type { AppProps } from "next/app";
import "../styles/global.css";
import { MoralisProvider } from "react-moralis";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <Component {...pageProps} />
    </MoralisProvider>
  );
}
