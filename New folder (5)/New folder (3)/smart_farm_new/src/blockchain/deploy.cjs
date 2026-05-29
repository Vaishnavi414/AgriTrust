const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying FarmingMarketplace contract...");

  // Get the contract factory
  const FarmingMarketplace = await ethers.getContractFactory("FarmingMarketplace");

  // Deploy the contract
  const farmingMarketplace = await FarmingMarketplace.deploy();

  // Wait for deployment
  await farmingMarketplace.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await farmingMarketplace.getAddress();

  console.log(`FarmingMarketplace deployed to: ${contractAddress}`);

  // Save deployment info to a JSON file
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    contractAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString(),
    owner: (await ethers.getSigners())[0].address,
  };

  const deploymentPath = path.join(__dirname, "deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentPath}`);

  // Also save to a location accessible by the frontend
  const frontendPath = path.join(__dirname, "..", "lib", "contract-address.json");
  fs.writeFileSync(frontendPath, JSON.stringify({ contractAddress }, null, 2));
  console.log(`Contract address saved to frontend at: ${frontendPath}`);

  // Verify the contract was deployed correctly
  const owner = await farmingMarketplace.owner();
  console.log(`Contract owner: ${owner}`);

  const totalTransactions = await farmingMarketplace.totalTransactions();
  console.log(`Initial transaction count: ${totalTransactions}`);

  console.log("\n✅ Deployment successful!");
  console.log("\nTo interact with the contract, use:");
  console.log(`npm run blockchain:interact`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
