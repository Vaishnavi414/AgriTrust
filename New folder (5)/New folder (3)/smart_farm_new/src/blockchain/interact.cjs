const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load the deployed contract address
  const contractAddressPath = path.join(__dirname, "..", "lib", "contract-address.json");
  
  let contractAddress;
  
  if (fs.existsSync(contractAddressPath)) {
    const data = JSON.parse(fs.readFileSync(contractAddressPath, "utf8"));
    contractAddress = data.contractAddress;
  } else {
    console.log("Contract not deployed yet. Run 'npm run blockchain:deploy' first.");
    return;
  }

  console.log(`Interacting with FarmingMarketplace at: ${contractAddress}\n`);

  // Get the contract factory
  const FarmingMarketplace = await ethers.getContractFactory("FarmingMarketplace");
  
  // Connect to the deployed contract
  const contract = FarmingMarketplace.attach(contractAddress);

  // Get signers (accounts) - on testnet, we only have one account
  const signers = await ethers.getSigners();
  const owner = signers[0];
  
  // For testing, use the owner address for both farmer and buyer
  const farmerAddress = owner.address;
  const buyerAddress = owner.address;

  console.log("=== Available Accounts ===");
  console.log(`Owner:  ${owner.address}`);
  console.log(`Farmer: ${farmerAddress} (using owner for testing)`);
  console.log(`Buyer:  ${buyerAddress} (using owner for testing)\n`);

  // Example: Record a transaction
  console.log("=== Recording a Test Transaction ===");
  
  const transactionHash = "0x" + 
    ethers.keccak256(ethers.toUtf8Bytes(`test-${Date.now()}`));
  
  const tx = await contract.recordTransaction(
    farmerAddress,  // farmer
    buyerAddress,   // buyer
    ethers.ZeroAddress, // product (zero address for native)
    ethers.parseEther("1.0"), // price: 1 ETH
    transactionHash
  );

  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  
  console.log("Transaction confirmed!\n");

  // Get transaction details
  console.log("=== Transaction Details ===");
  const [farmerAddr, buyerAddr, product, price, timestamp, completed] = 
    await contract.getTransaction(transactionHash);
  
  console.log(`Farmer:     ${farmerAddr}`);
  console.log(`Buyer:      ${buyerAddr}`);
  console.log(`Product:    ${product}`);
  console.log(`Price:      ${ethers.formatEther(price)} ETH`);
  console.log(`Timestamp:  ${new Date(Number(timestamp) * 1000).toISOString()}`);
  console.log(`Completed:  ${completed}\n`);

  // Example: Add an approval
  console.log("=== Adding Approval ===");
  const approvalTx = await contract.connect(owner).addApproval(transactionHash);
  console.log(`Approval added: ${approvalTx.hash}`);
  await approvalTx.wait();
  
  const approvalCount = await contract.getApprovalCount(transactionHash);
  console.log(`Approval count: ${approvalCount}\n`);

  // Get total transactions
  const totalTx = await contract.totalTransactions();
  console.log(`=== Total Transactions: ${totalTx} ===`);

  console.log("\n✅ Interaction complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
