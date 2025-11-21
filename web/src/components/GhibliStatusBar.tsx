"use client";

import { useAccount, useChainId } from "wagmi";
import { useFhevm } from "./providers/fhevm-provider";
import { SHADOW_SIGN_ADDRESS } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";

export function GhibliStatusBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { status } = useFhevm();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const openEtherscan = (addr: string) => {
    window.open(
      `https://sepolia.etherscan.io/address/${addr}`,
      "_blank"
    );
  };

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ top: 24, right: 24 }}
    >
      <div
        className="text-sm min-w-[300px] pointer-events-auto"
        style={{
          background: 'rgba(255, 249, 230, 0.98)',
          border: '3px solid #8B7355',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
      {/* FHEVM Status */}
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <span className="font-extrabold text-gray-800 uppercase tracking-wider" style={{ fontSize: '16px' }}>
          FHEVM:
        </span>
        <span
          className="font-extrabold"
          style={{
            fontSize: '16px',
            color: status === "ready" ? "#16a34a" : "#dc2626",
          }}
        >
          {status === "ready" ? "Ready ✓" : "Uninitialized"}
        </span>
      </div>

      {/* Network Status */}
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <span className="font-extrabold text-gray-800 uppercase tracking-wider" style={{ fontSize: '16px' }}>
          NETWORK:
        </span>
        <span
          className="font-extrabold"
          style={{
            fontSize: '16px',
            color: isConnected 
              ? (chainId === 11155111 ? "#16a34a" : "#dc2626")
              : "#dc2626",
          }}
        >
          {isConnected 
            ? (chainId === 11155111 ? "Sepolia ✓" : "Wrong Network")
            : "Not Connected"
          }
        </span>
      </div>

      {/* Wallet Address */}
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <span className="font-extrabold text-gray-800 uppercase tracking-wider" style={{ fontSize: '16px' }}>
          WALLET:
        </span>
        {address ? (
          <button
            onClick={() => copyToClipboard(address)}
            className="font-mono font-bold transition-colors underline"
            style={{
              fontSize: '14px',
              color: "#16a34a",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#15803d"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#16a34a"}
            title="Click to copy"
          >
            {shortenAddress(address)}
          </button>
        ) : (
          <span className="font-extrabold" style={{ fontSize: '16px', color: "#dc2626" }}>
            Not Connected
          </span>
        )}
      </div>

      {/* Contract Address */}
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-gray-800 uppercase tracking-wider" style={{ fontSize: '16px' }}>
          CONTRACT:
        </span>
        {SHADOW_SIGN_ADDRESS && SHADOW_SIGN_ADDRESS !== "0x0000000000000000000000000000000000000000" ? (
          <button
            onClick={() => openEtherscan(SHADOW_SIGN_ADDRESS)}
            className="font-mono font-bold transition-opacity underline"
            style={{
              fontSize: '14px',
              color: "#4A4A4A",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            title="Click to view on Etherscan"
          >
            {shortenAddress(SHADOW_SIGN_ADDRESS)}
          </button>
        ) : (
          <span className="font-extrabold text-gray-500" style={{ fontSize: '16px' }}>
            Not Deployed
          </span>
        )}
      </div>
      </div>
    </div>
  );
}
