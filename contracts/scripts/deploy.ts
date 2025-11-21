import { ethers } from "hardhat";

async function main() {
  const shadowSign = await ethers.deployContract("ShadowSign");
  await shadowSign.waitForDeployment();

  console.log("ShadowSign deployed to:", await shadowSign.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

