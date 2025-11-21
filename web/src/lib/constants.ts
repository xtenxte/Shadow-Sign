import { sepolia } from "viem/chains";

export const REQUIRED_CHAIN = sepolia;
export const REQUIRED_CHAIN_ID = sepolia.id;

export const SHADOW_SIGN_ADDRESS =
  (process.env.NEXT_PUBLIC_SHADOW_SIGN_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC ??
  "https://eth-sepolia.g.alchemy.com/v2/demo";

export const WALLETCONNECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "00000000000000000000000000000000";

export const PLAY_ROUND_GAS_LIMIT = 6_000_000n;
export const RESET_SERIES_GAS_LIMIT = 3_000_000n;

