const hre = require("hardhat");

async function main() {
  const FarmingMarketplace = await hre.ethers.getContractFactory("FarmingMarketplace");
  const contract = await FarmingMarketplace.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("FarmingMarketplace deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
