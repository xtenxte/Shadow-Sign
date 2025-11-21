import { sepolia } from "viem/chains";

export const REQUIRED_CHAIN = sepolia;
export const REQUIRED_CHAIN_ID = sepolia.id;

const DEFAULT_SHADOW_SIGN_ADDRESS =
  "0x9B04E93D71dbFf919a024695469Ad0939aD402cC" as const;
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

export const PLAY_ROUND_GAS_LIMIT = 6_000_000n;
export const RESET_SERIES_GAS_LIMIT = 3_000_000n;

