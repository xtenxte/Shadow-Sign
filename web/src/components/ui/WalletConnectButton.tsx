"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { shortenAddress } from "@/lib/utils";

export function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <button className="ghibli-button" onClick={openConnectModal}>
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button className="ghibli-button" onClick={openChainModal}>
              Switch Network
            </button>
          );
        }

        const displayName = account.displayName ?? shortenAddress(account.address ?? "0x");

        return (
          <button className="ghibli-button" onClick={openAccountModal}>
            {displayName} · {chain.name}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

