"use client";

import { useAccount, useChainId } from "wagmi";
import { useFhevm } from "./providers/fhevm-provider";
import { SHADOW_SIGN_ADDRESS } from "@/lib/constants";
import { shortenAddress } from "@/lib/utils";

export function GhibliStatusBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { status } = useFhevm();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("✓ Copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openEtherscan = (addr: string) => {
    window.open(
      `https://sepolia.etherscan.io/address/${addr}`,
      "_blank"
    );
  };

  return (
    <div
      className="absolute z-20"
      style={{ top: 24, right: 24, pointerEvents: "auto" }}
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
            className="font-mono font-bold transition-colors underline cursor-pointer"
            style={{
              fontSize: '14px',
              color: "#16a34a",
              pointerEvents: 'auto',
              background: 'none',
              border: 'none',
              padding: 0,
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
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <span className="font-extrabold text-gray-800 uppercase tracking-wider" style={{ fontSize: '16px' }}>
          CONTRACT:
        </span>
        {SHADOW_SIGN_ADDRESS && SHADOW_SIGN_ADDRESS !== "0x0000000000000000000000000000000000000000" ? (
          <button
            onClick={() => openEtherscan(SHADOW_SIGN_ADDRESS)}
            className="font-mono font-bold transition-opacity underline cursor-pointer"
            style={{
              fontSize: '14px',
              color: "#4A4A4A",
              pointerEvents: 'auto',
              background: 'none',
              border: 'none',
              padding: 0,
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

      {/* GitHub Link */}
      <div className="flex items-center justify-center pt-2" style={{ borderTop: '2px solid rgba(139, 115, 85, 0.2)' }}>
        <a
          href="https://github.com/xtenxte/Shadow-Sign"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-70 cursor-pointer"
          style={{
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(139, 115, 85, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
          title="View on GitHub"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
            style={{ color: '#24292e', pointerEvents: 'none' }}
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>
      </div>
    </div>
  );
}
