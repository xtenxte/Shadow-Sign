import { sepolia } from "viem/chains";

export const REQUIRED_CHAIN = sepolia;
export const REQUIRED_CHAIN_ID = sepolia.id;

const DEFAULT_SHADOW_SIGN_ADDRESS =
  "0x78675755b8c2eaF5b6184bCf56A06102cBACdC23" as const;
const DEFAULT_SEPOLIA_RPC_URL =
  "https://eth-sepolia.g.alchemy.com/v2/xeMfJRSGpIGq5WiFz-bEiHoG6DGrZnAr";
const DEFAULT_WALLETCONNECT_ID =
  "shadow-sign-placeholder-project-id-123456";

export const SHADOW_SIGN_ADDRESS =
  (process.env.NEXT_PUBLIC_SHADOW_SIGN_ADDRESS as `0x${string}`) ??
  DEFAULT_SHADOW_SIGN_ADDRESS;

export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC ?? DEFAULT_SEPOLIA_RPC_URL;

export const WALLETCONNECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? DEFAULT_WALLETCONNECT_ID;

export const PLAY_ROUND_GAS_LIMIT = BigInt(6_000_000);
export const RESET_SERIES_GAS_LIMIT = BigInt(3_000_000);

