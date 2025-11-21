"use client";

import { useAccount, useChainId } from "wagmi";
import { useFhevm } from "./providers/fhevm-provider";
import { SHADOW_SIGN_ADDRESS } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";

export function StatusBar() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { status } = useFhevm();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openEtherscan = () => {
    window.open(
      `https://sepolia.etherscan.io/address/${SHADOW_SIGN_ADDRESS}`,
      "_blank"
    );
  };

  return (
    <div className="fixed top-6 right-6 z-50 font-mono text-xs text-[var(--neon-green)] space-y-1">
      <div className="flex items-center gap-2">
        <span className="opacity-60">FHEVM:</span>
        <span
          className={
            status === "ready"
              ? "text-[var(--neon-green)]"
              : "text-[var(--neon-pink)]"
          }
        >
          {status === "ready" ? "READY" : "UNINITIALIZED"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="opacity-60">NETWORK:</span>
        <span className="text-[var(--neon-cyan)]">
          {chainId === 11155111 ? "SEPOLIA" : "UNKNOWN"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="opacity-60">CONTRACT:</span>
        <button
          onClick={openEtherscan}
          className="text-white hover:text-[var(--neon-cyan)] transition-colors cursor-pointer underline"
        >
          {shortenAddress(SHADOW_SIGN_ADDRESS as `0x${string}`)}
        </button>
      </div>
      {address && (
        <div className="flex items-center gap-2">
          <span className="opacity-60">WALLET:</span>
          <button
            onClick={() => copyToClipboard(address)}
            className="text-white hover:text-[var(--neon-cyan)] transition-colors cursor-pointer"
          >
            {shortenAddress(address)}
          </button>
        </div>
      )}
    </div>
  );
}

