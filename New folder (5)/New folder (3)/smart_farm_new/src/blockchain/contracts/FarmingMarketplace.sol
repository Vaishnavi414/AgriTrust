// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title FarmingMarketplace
 * @dev Smart contract for farming transactions and crop purchases on the blockchain
 */
contract FarmingMarketplace {
    // ============================================
    // EVENTS
    // ============================================
    
    // Event for logging transactions
    event TransactionRecorded(
        address indexed farmer,
        address indexed buyer,
        address product,
        uint256 price,
        string transactionHash,
        uint256 timestamp
    );

    // Event for multi-signature approvals
    event ApprovalAdded(
        string transactionHash,
        address approver,
        uint256 approvalCount,
        uint256 requiredCount
    );

    // Event for transaction completion
    event TransactionCompleted(
        string transactionHash,
        address farmer,
        address buyer,
        uint256 finalPrice
    );

    // ============================================
    // STRUCTURES
    // ============================================

    // Structure to store transaction records
    struct TransactionRecord {
        address farmer;
        address buyer;
        address product;
        uint256 price;
        string transactionHash;
        uint256 timestamp;
        bool completed;
    }

    // ============================================
    // MAPPINGS
    // ============================================

    // Mapping of transaction hash to transaction record
    mapping(string => TransactionRecord) public transactions;

    // Mapping to track approvals for each transaction
    mapping(string => address[]) public transactionApprovals;

    // Mapping to track required approvals per transaction
    mapping(string => uint256) public requiredApprovals;

    // Counter for total transactions
    uint256 public totalTransactions;

    // Owner of the contract (deployer)
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ============================================
    // TRANSACTION FUNCTIONS
    // ============================================

    /**
     * @dev Record a new transaction on the blockchain
     * @param farmer Address of the farmer
     * @param buyer Address of the buyer
     * @param product Address of the product (can be zero address for native tokens)
     * @param price Price of the transaction in wei
     * @param transactionHash Unique hash identifying the transaction
     */
    function recordTransaction(
        address farmer,
        address buyer,
        address product,
        uint256 price,
        string memory transactionHash
    ) public {
        require(farmer != address(0), "Farmer address cannot be zero");
        require(buyer != address(0), "Buyer address cannot be zero");
        require(price > 0, "Price must be greater than zero");
        require(
            bytes(transactionHash).length > 0,
            "Transaction hash cannot be empty"
        );
        require(
            transactions[transactionHash].timestamp == 0,
            "Transaction already exists"
        );

        transactions[transactionHash] = TransactionRecord({
            farmer: farmer,
            buyer: buyer,
            product: product,
            price: price,
            transactionHash: transactionHash,
            timestamp: block.timestamp,
            completed: false
        });

        totalTransactions++;

        emit TransactionRecorded(
            farmer,
            buyer,
            product,
            price,
            transactionHash,
            block.timestamp
        );
    }

    /**
     * @dev Add an approval to a transaction (for multi-sig support)
     * @param transactionHash The hash of the transaction to approve
     */
    function addApproval(string memory transactionHash) public {
        require(
            transactions[transactionHash].timestamp != 0,
            "Transaction does not exist"
        );
        require(
            !transactions[transactionHash].completed,
            "Transaction already completed"
        );

        address[] storage approvals = transactionApprovals[transactionHash];
        
        // Check if already approved
        for (uint256 i = 0; i < approvals.length; i++) {
            require(approvals[i] != msg.sender, "Already approved");
        }

        approvals.push(msg.sender);

        emit ApprovalAdded(
            transactionHash,
            msg.sender,
            approvals.length,
            requiredApprovals[transactionHash]
        );

        // Auto-complete if enough approvals
        if (requiredApprovals[transactionHash] > 0 && 
            approvals.length >= requiredApprovals[transactionHash]) {
            transactions[transactionHash].completed = true;
            emit TransactionCompleted(
                transactionHash,
                transactions[transactionHash].farmer,
                transactions[transactionHash].buyer,
                transactions[transactionHash].price
            );
        }
    }

    /**
     * @dev Set required approvals for a transaction
     * @param transactionHash The hash of the transaction
     * @param required The number of required approvals
     */
    function setRequiredApprovals(string memory transactionHash, uint256 required) public {
        require(
            transactions[transactionHash].timestamp != 0,
            "Transaction does not exist"
        );
        requiredApprovals[transactionHash] = required;
    }

    /**
     * @dev Mark a transaction as completed
     * @param transactionHash The hash of the transaction to complete
     */
    function completeTransaction(string memory transactionHash) public {
        require(
            transactions[transactionHash].timestamp != 0,
            "Transaction does not exist"
        );
        require(
            !transactions[transactionHash].completed,
            "Transaction already completed"
        );

        transactions[transactionHash].completed = true;

        emit TransactionCompleted(
            transactionHash,
            transactions[transactionHash].farmer,
            transactions[transactionHash].buyer,
            transactions[transactionHash].price
        );
    }

    /**
     * @dev Get transaction details
     * @param transactionHash The hash of the transaction
     * @return farmer Address of the farmer
     * @return buyer Address of the buyer
     * @return product Address of the product
     * @return price Price of the transaction
     * @return timestamp Timestamp when transaction was recorded
     * @return completed Whether the transaction is completed
     */
    function getTransaction(
        string memory transactionHash
    ) public view returns (
        address farmer,
        address buyer,
        address product,
        uint256 price,
        uint256 timestamp,
        bool completed
    ) {
        TransactionRecord memory record = transactions[transactionHash];
        return (
            record.farmer,
            record.buyer,
            record.product,
            record.price,
            record.timestamp,
            record.completed
        );
    }

    /**
     * @dev Get approval count for a transaction
     * @param transactionHash The hash of the transaction
     * @return Number of approvals
     */
    function getApprovalCount(string memory transactionHash) public view returns (uint256) {
        return transactionApprovals[transactionHash].length;
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Receive function to accept native tokens
    receive() external payable {}

    // ============================================
    // CROP PURCHASE FUNCTIONS
    // ============================================

    // Track sold status per product
    mapping(bytes32 => bool) public productSold;

    // Store purchase records
    struct CropPurchase {
        bytes32 productId;
        address buyer;
        address farmer;
        uint256 price;
        uint256 timestamp;
        bool withdrawn;
    }
    
    // Mapping from purchase ID to purchase record
    mapping(bytes32 => CropPurchase) public cropPurchases;
    bytes32[] public purchaseIds;
    
    // Event for crop purchase
    event CropPurchased(
        bytes32 indexed purchaseId,
        bytes32 indexed productId,
        address indexed buyer,
        address farmer,
        uint256 price,
        uint256 timestamp
    );
    
    // Event for farmer withdrawal
    event FarmerWithdrawn(
        bytes32 indexed purchaseId,
        address indexed farmer,
        uint256 amount
    );

    // Alias event for compatibility with frontend (same as CropPurchased)
    event PurchaseCreated(
        bytes32 indexed purchaseId,
        address indexed buyer,
        address indexed farmer,
        uint256 amount
    );

    /**
     * @dev Purchase crop via contract - all payments go through contract
     * @param productId Product ID (from Supabase)
     * @param farmerAddress Farmer's wallet address
     */
    function purchaseCrop(bytes32 productId, address farmerAddress) external payable {
        // Validate payment
        require(msg.value > 0, "Payment must be greater than zero");
        require(farmerAddress != address(0), "Farmer address cannot be zero");

        // Check if product already sold (prevents duplicate purchases)
        require(!productSold[productId], "Product already sold");

        // Use the EXACT productId from frontend - don't add anything!
        // This ensures frontend purchaseId matches contract storage
        bytes32 purchaseId = productId;

        // Record purchase - funds stay in contract
        cropPurchases[purchaseId] = CropPurchase({
            productId: productId,
            buyer: msg.sender,
            farmer: farmerAddress,
            price: msg.value,
            timestamp: block.timestamp,
            withdrawn: false
        });
        purchaseIds.push(purchaseId);

        // Mark product as sold to prevent duplicate purchases
        productSold[productId] = true;
        
        emit CropPurchased(purchaseId, productId, msg.sender, farmerAddress, msg.value, block.timestamp);
        emit PurchaseCreated(purchaseId, msg.sender, farmerAddress, msg.value);
    }

    /**
     * @dev Farmer withdraws their funds from the contract
     * @param purchaseIds Array of purchase IDs to withdraw from
     */
    function withdrawFunds(bytes32[] calldata purchaseIds) external {
        uint256 totalWithdrawal = 0;
        
        for (uint256 i = 0; i < purchaseIds.length; i++) {
            bytes32 purchaseId = purchaseIds[i];
            CropPurchase storage purchase = cropPurchases[purchaseId];
            
            // CRITICAL: Validate caller is the recorded farmer - NOT from frontend
            require(purchase.farmer == msg.sender, "Caller is not the farmer for this purchase");
            require(!purchase.withdrawn, "Already withdrawn");
            
            totalWithdrawal += purchase.price;
            purchase.withdrawn = true;
            
            emit FarmerWithdrawn(purchaseId, msg.sender, purchase.price);
        }
        
        require(totalWithdrawal > 0, "No funds to withdraw");
        
        // Transfer funds to farmer (msg.sender)
        (bool success, ) = payable(msg.sender).call{value: totalWithdrawal}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Get purchase details
     */
    function getPurchase(bytes32 purchaseId) public view returns (
        bytes32 productId,
        address buyer,
        address farmer,
        uint256 price,
        uint256 timestamp,
        bool withdrawn
    ) {
        CropPurchase memory purchase = cropPurchases[purchaseId];
        return (
            purchase.productId,
            purchase.buyer,
            purchase.farmer,
            purchase.price,
            purchase.timestamp,
            purchase.withdrawn
        );
    }
    
    /**
     * @dev Check if a product is sold
     */
    function isProductSold(bytes32 productId) public view returns (bool) {
        return productSold[productId];
    }
    
    /**
     * @dev Get total purchases count
     */
    function getTotalPurchases() public view returns (uint256) {
        return purchaseIds.length;
    }
}