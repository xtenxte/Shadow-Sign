import { run } from "hardhat";
import { isAddress } from "ethers";

async function main() {
  const address = process.env.SHADOW_SIGN_ADDRESS;
  if (!address || !isAddress(address)) {
    throw new Error("Set SHADOW_SIGN_ADDRESS env var to the deployed contract.");
  }

  console.log(`Verifying ShadowSign at ${address}...`);

  await run("verify:verify", {
    address,
    constructorArguments: [],
  });

  console.log("Verification submitted to Etherscan.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

