"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http, createConfig } from "wagmi";
import {
  RainbowKitProvider,
  lightTheme,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet, coinbaseWallet } from "@rainbow-me/rainbowkit/wallets";
import { REQUIRED_CHAIN, SEPOLIA_RPC_URL, WALLETCONNECT_ID } from "@/lib/constants";
import "@rainbow-me/rainbowkit/styles.css";

// Manually configure connectors and exclude WalletConnect to avoid the 403 error
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, coinbaseWallet],
    },
  ],
  {
    appName: "Shadow Sign",
    projectId: WALLETCONNECT_ID,
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains: [REQUIRED_CHAIN],
  transports: {
    [REQUIRED_CHAIN.id]: http(SEPOLIA_RPC_URL),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#8B7355",
            accentColorForeground: "#FFF9E6",
            borderRadius: "large",
          })}
          modalSize="compact"
          locale="en"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
