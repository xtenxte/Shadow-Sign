import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ShadowSign with:", deployer.address);

  const contract = await ethers.deployContract("ShadowSign");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`ShadowSign deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

