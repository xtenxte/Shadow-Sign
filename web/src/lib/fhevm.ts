import type { EIP1193Provider, Hex, WalletClient } from "viem";
import { SEPOLIA_RPC_URL } from "@/lib/constants";

let fheInstance: any | null = null;
let initPromise: Promise<any> | null = null;
let sdkModulePromise: Promise<any> | null = null;

/**
 * Dynamically load RelayerSDK via module import (avoids flaky CDN scripts)
 */
async function loadRelayerSDK(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("RelayerSDK can only be loaded in the browser");
  }

  if (sdkModulePromise) {
    return sdkModulePromise;
  }

  console.log("📦 Loading RelayerSDK via dynamic import...");

  // @zama-fhe/relayer-sdk/package.json exports "./web" for browser usage
  sdkModulePromise = import("@zama-fhe/relayer-sdk/web")
    .then((mod) => {
      if (!mod?.initSDK || !mod?.createInstance || !mod?.SepoliaConfig) {
        throw new Error("RelayerSDK module missing required exports");
      }
      console.log("✅ RelayerSDK module loaded");
      return mod;
    })
    .catch((error) => {
      sdkModulePromise = null;
      console.error("❌ RelayerSDK module import failed:", error);
      throw error;
    });

  return sdkModulePromise;
}

/**
 * Initialize FHEVM instance (using RelayerSDK)
 */
export async function ensureFheInstance(provider?: EIP1193Provider) {
  void provider;
  if (fheInstance) {
    return fheInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  if (typeof window === "undefined") {
    throw new Error("FHEVM is only available in the browser");
  }

  console.log("🔧 Initializing FHEVM instance...");

  initPromise = (async () => {
    try {
      // Ensure SDK is loaded first
      const sdk = await loadRelayerSDK();

      const { initSDK, createInstance, SepoliaConfig } = sdk;

      // Initialize SDK
      await initSDK();
      console.log("✅ RelayerSDK initialized");

      // Create instance
      const rpcUrl =
        SEPOLIA_RPC_URL && !SEPOLIA_RPC_URL.includes("demo")
          ? SEPOLIA_RPC_URL
          : SepoliaConfig.network;
      const config = {
        ...SepoliaConfig,
        network: rpcUrl,
      };
      console.log("🧩 FHE config", {
        kms: config.kmsContractAddress,
        acl: config.aclContractAddress,
        inputVerifier: config.inputVerifierContractAddress,
        decryptVerifier: config.verifyingContractAddressDecryption,
        gatewayChainId: config.gatewayChainId,
      });

      fheInstance = await createInstance(config);
      
      console.log("✅ FHEVM instance created successfully");
      return fheInstance;
    } catch (error) {
      console.error("❌ FHEVM initialization failed:", error);
      initPromise = null;
      fheInstance = null;
      throw error;
    }
  })();

  return initPromise;
}

type EncryptResult = {
  handle: Hex;
  proof: Hex;
};

function toHexString(value: unknown, label: string): Hex {
  if (!value) {
    throw new Error(`Missing ${label}`);
  }
  if (typeof value === "string") {
    return (value.startsWith("0x") ? value : `0x${value}`) as Hex;
  }
  if (value instanceof Uint8Array) {
    return (`0x${Array.from(value)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`) as Hex;
  }
  if (Array.isArray(value)) {
    return toHexString(Uint8Array.from(value), label);
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "buffer" in value &&
    value.buffer instanceof ArrayBuffer
  ) {
    return toHexString(new Uint8Array(value as ArrayLike<number>), label);
  }
  throw new Error(`Unsupported ${label} format`);
}

export async function encryptMove(
  contractAddress: `0x${string}`,
  account: `0x${string}`,
  move: number,
) {
  if (!fheInstance) {
    throw new Error("FHEVM instance not ready");
  }

  const input = fheInstance.createEncryptedInput(contractAddress, account);
  input.add8(move);
  const encrypted = await input.encrypt();

  const rawHandle =
    encrypted?.handles?.[0] ??
    encrypted?.encryptedData ??
    encrypted?.ciphertext ??
    encrypted;
  const rawProof = encrypted?.inputProof ?? encrypted?.proof ?? encrypted;

  const handle = toHexString(rawHandle, "encrypted handle");
  const proof = toHexString(rawProof, "encrypted proof");

  return {
    handle,
    proof,
  } as EncryptResult;
}

export async function decryptHandles(
  handles: Hex[],
  contractAddress: `0x${string}`,
  walletClient: WalletClient,
) {
  if (!fheInstance) {
    throw new Error("FHEVM instance not ready");
  }
  if (!walletClient.account) {
    throw new Error("Missing wallet client account");
  }

  const keypair = fheInstance.generateKeypair();
  const now = Math.floor(Date.now() / 1000).toString();
  const durationDays = "7";
  const contractAddresses = [contractAddress];

  const eip712 = fheInstance.createEIP712(
    keypair.publicKey,
    contractAddresses,
    now,
    durationDays,
  );

  const signature = await walletClient.signTypedData({
    account: walletClient.account,
    domain: eip712.domain,
    types: {
      UserDecryptRequestVerification:
        eip712.types.UserDecryptRequestVerification,
    },
    primaryType: "UserDecryptRequestVerification",
    message: eip712.message,
  });

  const pairs = handles.map((handle) => ({
    handle,
    contractAddress,
  }));

  const result = await fheInstance.userDecrypt(
    pairs,
    keypair.privateKey,
    keypair.publicKey,
    signature.replace("0x", ""),
    contractAddresses,
    walletClient.account.address,
    now,
    durationDays,
  );

  const decrypted: Record<string, number> = {};
  for (const handle of handles) {
    const value = result[handle] ?? result.clearValues?.[handle];
    decrypted[handle] = Number(
      typeof value === "bigint" ? value : value ?? 0,
    );
  }

  return decrypted;
}

