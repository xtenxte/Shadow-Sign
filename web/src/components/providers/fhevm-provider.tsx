"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccount, useChainId } from "wagmi";
import { REQUIRED_CHAIN_ID } from "@/lib/constants";
import { ensureFheInstance } from "@/lib/fhevm";
import type { EIP1193Provider } from "viem";

type FhevmContextValue = {
  status: "idle" | "loading" | "ready" | "error";
  instance: any | null;
  error?: string;
  ensureReady: () => Promise<void>;
};

const FhevmContext = createContext<FhevmContextValue>({
  status: "idle",
  instance: null,
  ensureReady: async () => {},
});

export function FhevmProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [state, setState] = useState<Omit<FhevmContextValue, "ensureReady">>({
    status: "idle",
    instance: null,
  });

  // Guard to ensure hooks only run once the component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const boot = useCallback(async () => {
    if (typeof window === "undefined" || !mounted) return;
    if (!isConnected || chainId !== REQUIRED_CHAIN_ID) {
      setState({ status: "idle", instance: null });
      return;
    }
    if (!window.ethereum) {
      setState({
        status: "error",
        instance: null,
        error: "Wallet provider not detected",
      });
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: undefined }));
    try {
      const instance = await ensureFheInstance(
        window.ethereum as unknown as EIP1193Provider,
      );
      setState({ status: "ready", instance });
    } catch (error) {
      setState({
        status: "error",
        instance: null,
        error: error instanceof Error ? error.message : "FHE init failed",
      });
    }
  }, [isConnected, chainId, mounted]);

  useEffect(() => {
    if (mounted) {
      boot();
    }
  }, [boot, mounted]);

  const value = useMemo<FhevmContextValue>(
    () => ({
      ...state,
      ensureReady: boot,
    }),
    [state, boot],
  );

  return (
    <FhevmContext.Provider value={value}>{children}</FhevmContext.Provider>
  );
}

export function useFhevm() {
  return useContext(FhevmContext);
}

