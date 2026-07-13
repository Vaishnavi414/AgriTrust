import { ethers } from 'ethers';
import contractAddressData from './contract-address.json';

const normalizeAddress = (address) => {
  try {
    return ethers.getAddress(address);
  } catch {
    return address;
  }
};

const getContractAddress = () => {
  const contractData = contractAddressData;
  const addr = contractData?.contractAddress;
  if (!addr || addr === '' || addr === '0x0000000000000000000000000000000000000000') {
    return null;
  }
  if (addr.toLowerCase() === '0x5fbdb2315678afecb367f032d93f642f64180aa3') {
    return null;
  }
  return normalizeAddress(addr);
};

const CONTRACT_ABI = [
  "function purchaseCrop(bytes32 productId, address farmerAddress) external payable",
  "function withdrawFunds(bytes32[] calldata purchaseIds) external",
  "function getPurchase(bytes32 purchaseId) public view returns (bytes32 productId, address buyer, address farmer, uint256 price, uint256 timestamp, bool withdrawn)",
  "function getTotalPurchases() public view returns (uint256)",
  "event PurchaseCreated(bytes32 indexed purchaseId, address indexed buyer, address indexed farmer, uint256 amount)",
  "event FarmerWithdrawn(bytes32 indexed purchaseId, address indexed farmer, uint256 amount)"
];

export const WalletState = {
  address: '',
  balance: '',
  balanceInEth: '',
  connected: false,
  network: '',
};

export const PurchaseResult = {
  success: false,
  transactionHash: null,
  productIdBytes: null,
  error: null,
};

export const getPurchase = async (purchaseId) => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddr = getContractAddress();
    if (!contractAddr) throw new Error('Contract not deployed');
    
    const contract = new ethers.Contract(contractAddr, CONTRACT_ABI, signer);
    const [productId, buyer, farmer, price, timestamp, withdrawn] = await contract.getPurchase(purchaseId);
    return { productId, buyer, farmer, price, timestamp, withdrawn };
  } catch (error) {
    console.error('Error fetching purchase from chain:', purchaseId, error);
    throw error;
  }
};

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
};

const SEPOLIA_CHAIN_ID = '0xaa36a7';

export const switchToSepolia = async () => {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Sepolia network:', addError);
        return false;
      }
    }
    console.error('Failed to switch to Sepolia:', error);
    return false;
  }
};

export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    alert('MetaMask is not installed. Please install MetaMask to use this feature.');
    return null;
  }

  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', currentChainId);
    
    const normalizedCurrent = currentChainId?.toLowerCase();
    const SEPOLIA_CHAIN_ID = '0xaa36a7';
    
    if (normalizedCurrent !== SEPOLIA_CHAIN_ID) {
      console.log('Rejecting connection: Not Sepolia (Hardhat/localhost not allowed)');
      console.log('Current chain:', currentChainId);
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (newChainId?.toLowerCase() !== SEPOLIA_CHAIN_ID) {
          alert('Please switch to Sepolia manually in MetaMask. Hardhat/localhost not allowed.');
          return null;
        }
        console.log('Switched to Sepolia successfully');
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia',
                rpcUrls: [import.meta.env.VITE_INFURA_SEPOLIA || 'https://sepolia.infura.io/v3/'],
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
          } catch {
            alert('Sepolia network not available. Please add Sepolia in MetaMask manually.');
            return null;
          }
        } else {
          alert('Please switch to Sepolia in MetaMask. Hardhat/localhost not allowed.');
          return null;
        }
      }
    }
    
    console.log('Confirmed: Running on Sepolia (chain 0xaa36a7)');

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      alert('No accounts found. Please unlock MetaMask and try again.');
      return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString(16);
    const expectedChainId = SEPOLIA_CHAIN_ID.replace('0x', '');
    
    if (chainId !== expectedChainId) {
      alert(`Wrong network! Please switch MetaMask to Sepolia. Current: ${network.name || 'unknown'} (0x${chainId})`);
      return null;
    }
    
    const balance = await provider.getBalance(accounts[0]);
    const balanceInEth = ethers.formatEther(balance);

    console.log('✓ Connected to Sepolia:', network.name, 'Chain ID:', chainId);
    console.log('✓ Wallet address:', accounts[0]);
    console.log('✓ Wallet balance:', balanceInEth, 'ETH');

    return {
      address: accounts[0],
      balance: balance.toString(),
      balanceInEth: balanceInEth,
      connected: true,
      network: 'sepolia',
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    alert('Failed to connect wallet. Please ensure MetaMask is unlocked and connected to Sepolia.');
    return null;
  }
};

export const refreshWalletBalance = async (address) => {
  if (!address) return '0';
  
  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Refresh - Current chain ID:', currentChainId);
    
    const normalizedChain = currentChainId?.toLowerCase();
    if (normalizedChain !== '0xaa36a7') {
      console.warn('Not on Sepolia network! Current:', currentChainId);
      throw new Error('Please switch to Sepolia network in MetaMask');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString(16);
    
    if (chainId !== 'aa36a7') {
      console.warn('Not connected to Sepolia network. Current chain ID: 0x' + chainId);
      throw new Error('Please switch to Sepolia network in MetaMask');
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const currentAccount = accounts[0];
    console.log('Refresh - Current account:', currentAccount);
    
    if (!currentAccount || currentAccount.toLowerCase() !== address.toLowerCase()) {
      console.warn('Account mismatch! Expected:', address, 'Got:', currentAccount);
    }
    
    const balance = await provider.getBalance(currentAccount);
    const balanceInEth = ethers.formatEther(balance);
    console.log('✓ Refreshed balance for', currentAccount, ' :', balanceInEth, 'ETH');
    
    return balanceInEth;
  } catch (error) {
    console.error('Failed to refresh balance:', error);
    return '0';
  }
};

export const purchaseCrop = async (
  priceInEth,
  productId,
  farmerAddress
) => {
  console.log('========== TRANSACTION SAFETY CHECK ==========');
  console.log('purchaseCrop called');
  console.log('Product ID:', productId);
  console.log('Farmer Address:', farmerAddress);
  console.log('Price (ETH):', priceInEth);
  
  if (!isMetaMaskInstalled()) {
    console.error('MetaMask not installed');
    return { success: false, error: 'MetaMask is not installed' };
  }

  if (!productId || productId === 'undefined') {
    console.error('Invalid product ID:', productId);
    return { success: false, error: 'Product ID is required' };
  }

  let validFarmerAddress;
  if (!farmerAddress || farmerAddress === 'undefined') {
    console.error('Invalid farmer address:', farmerAddress);
    return { success: false, error: 'Farmer wallet address is required for this purchase.' };
  }
  try {
    validFarmerAddress = ethers.getAddress(farmerAddress);
    console.log('Validated farmer address:', validFarmerAddress);
  } catch (e) {
    console.error('Invalid farmer address format:', e.message);
    return { success: false, error: 'Invalid farmer wallet address format.' };
  }

  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', currentChainId);
    
    const normalizedChain = currentChainId?.toLowerCase();
    if (normalizedChain !== '0xaa36a7') {
      console.error('Blocked: Not on Sepolia. Chain:', currentChainId);
      return { success: false, error: `Please switch MetaMask to Sepolia network (11155111). Current: ${currentChainId}` };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const currentAccount = accounts[0];
    console.log('Buyer wallet address (MetaMask):', currentAccount);
    
    if (!currentAccount) {
      console.error('No MetaMask account connected');
      return { success: false, error: 'No MetaMask account connected. Please connect wallet.' };
    }

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('Signer (buyer) address:', signerAddress);
    
    if (signerAddress.toLowerCase() === validFarmerAddress.toLowerCase()) {
      console.error('BLOCKED: Buyer and farmer cannot be the same wallet');
      return { success: false, error: 'Buyer and farmer cannot be the same wallet. Please use a different account.' };
    }
    
    const contractAddr = getContractAddress();
    if (!contractAddr) {
      console.error('No contract deployed');
      return { success: false, error: 'Smart contract not deployed. Please contact administrator.' };
    }
    
    console.log('---------- TRANSACTION SAFETY CHECKS ----------');
    console.log('✓ Signer address:', signerAddress);
    console.log('✓ Contract address:', contractAddr);
    console.log('✓ Chain ID: Sepolia (0xaa36a7 / 11155111)');
    
    if (!contractAddr || contractAddr === '0x0000000000000000000000000000000000000000') {
      console.error('BLOCKED: Invalid contract address');
      return { success: false, error: 'Invalid contract address. Transaction aborted.' };
    }

    const hardhatPatterns = ['0x5FbDB2315678afecb367f032d93F642f64180aa3', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'];
    if (hardhatPatterns.includes(contractAddr.toLowerCase())) {
      console.error('BLOCKED: Hardhat localhost contract detected. Please deploy to Sepolia first.');
      return { success: false, error: 'Contract is not deployed on Sepolia. Please contact administrator to deploy on Sepolia network.' };
    }

    if (signerAddress.toLowerCase() !== currentAccount.toLowerCase()) {
      console.error('BLOCKED: Signer address mismatch');
      return { success: false, error: 'Signer verification failed. Please reconnect wallet.' };
    }

    console.log('✓ All security checks passed');
    console.log('-------------------------------------------');
    console.log('Transaction: Buyer → Contract (funds held in contract)');
    console.log('From (Buyer):', signerAddress);
    console.log('To (Contract):', contractAddr);
    console.log('Farmer (recipient in contract):', validFarmerAddress);
    console.log('Product ID:', productId);
    console.log('Value:', priceInEth, 'ETH');
    console.log('Network: Sepolia (11155111)');
    console.log('Note: Farmer withdraws funds from contract later');
    console.log('-------------------------------------------');

    const priceNum = parseFloat(priceInEth);
    if (isNaN(priceNum) || priceNum <= 0) {
      console.error('Invalid price:', priceInEth);
      return { success: false, error: 'Invalid price amount' };
    }

    const priceInWei = ethers.parseEther(priceInEth);

    const productIdBytes = ethers.keccak256(ethers.toUtf8Bytes(productId));
    console.log('Product ID (bytes32):', productIdBytes);
    console.log('Product ID input (raw):', productId);

    const contract = new ethers.Contract(contractAddr, CONTRACT_ABI, signer);
    
    console.log('Sending transaction to contract...');
    console.log('  productIdBytes:', productIdBytes);
    console.log('  farmerAddress:', validFarmerAddress);
    console.log('  value:', priceInWei.toString());
    
    const tx = await contract.purchaseCrop(productIdBytes, validFarmerAddress, {
      value: priceInWei
    });

    console.log('Transaction sent! Hash:', tx.hash);

    const receipt = await tx.wait();

     if (!receipt || !receipt.hash) {
       console.error('Transaction failed - no receipt');
       return { success: false, error: 'Transaction failed - no receipt received' };
     }

     let finalPurchaseId = productIdBytes;
      try {
        if (receipt.logs && receipt.logs.length > 0) {
          for (const log of receipt.logs) {
            try {
              const parsed = contract.interface.parseLog(log);
              if (parsed && parsed.name === 'PurchaseCreated') {
                finalPurchaseId = parsed.args.purchaseId;
                console.log('✅ Got purchaseId from event:', finalPurchaseId);
                break;
              }
            } catch (e) {
            }
          }
        }
      } catch (eventError) {
        console.warn('Could not parse event logs:', eventError);
        console.log('Using frontend-generated purchaseId:', productIdBytes);
      }

      console.log('Verifying purchase stored on-chain with ID:', productIdBytes);
      const [onChainProductId, onChainBuyer, onChainFarmer, onChainPrice, onChainTimestamp, onChainWithdrawn] = await contract.getPurchase(productIdBytes);
      console.log('On-chain purchase data:', {
        productId: onChainProductId,
        buyer: onChainBuyer,
        farmer: onChainFarmer,
        price: onChainPrice?.toString(),
        timestamp: onChainTimestamp?.toString(),
        withdrawn: onChainWithdrawn
      });

      if (!onChainBuyer || onChainBuyer === ethers.ZeroAddress) {
        console.error('❌ Purchase NOT stored on blockchain!');
        return { success: false, error: 'Purchase NOT stored on blockchain. Contract may not be recording purchases.' };
      }

    console.log('✅ Purchase verified on-chain!');

    console.log('✓ Transaction confirmed! Hash:', receipt.hash);
    console.log('✓ Purchase stored on-chain verified');
    console.log('✓ Purchase ID for Supabase (SAME as used in purchase):', productIdBytes);
    console.log('========== TRANSACTION COMPLETE ==========');

    return {
      success: true,
      transactionHash: receipt.hash,
      productIdBytes: productIdBytes,
    };
  } catch (error) {
    console.error('Purchase failed:', error);
    
    if (error.code === 4001) {
      return { success: false, error: 'Transaction rejected by user' };
    }
    if (error.code === -32603 || error.message?.includes('insufficient funds')) {
      return { success: false, error: 'Insufficient ETH balance. Please ensure you have enough SepoliaETH.' };
    }
    if (error.message?.includes('malicious') || error.message?.includes('deceptive')) {
      console.error('Blocked: MetaMask flagged malicious address');
      return { success: false, error: 'Transaction blocked by MetaMask security warning. The recipient address may be flagged as potentially malicious.' };
    }
    
    return { success: false, error: error.message || 'Transaction failed. Please try again.' };
  }
};

export const convertEthToInr = async (ethAmount) => {
  const ETH_TO_INR_RATE = 180000;
  const eth = parseFloat(ethAmount);
  return eth * ETH_TO_INR_RATE;
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance) => {
  const num = parseFloat(balance);
  if (num === 0) return '0';
  if (num < 0.0001) return num.toFixed(8);
  if (num < 1) return num.toFixed(6);
  return num.toFixed(4);
};

export const withdrawFunds = async (purchaseIds) => {
  console.log('========== WITHDRAWAL OPERATION ==========');
  console.log('withdrawFunds called');
  console.log('Purchase IDs (input):', purchaseIds);

  if (!window.ethereum) {
    console.error('MetaMask not installed');
    return { success: false, error: 'MetaMask is not installed' };
  }

  if (!purchaseIds || !Array.isArray(purchaseIds) || purchaseIds.length === 0) {
    console.error('No purchase IDs provided:', purchaseIds);
    return { success: false, error: 'No purchases to withdraw. Please select purchases first.' };
  }

  const validIds = purchaseIds.filter(id => id && typeof id === 'string' && id.length > 0);
  if (validIds.length === 0) {
    console.error('No valid purchase IDs after filtering:', purchaseIds);
    return { success: false, error: 'Invalid purchase IDs. Please refresh and try again.' };
  }

  console.log('Purchase IDs for withdrawal:', validIds);
  for (const id of validIds) {
    if (id.length !== 66) {
      console.warn('Purchase ID length not 66 chars:', id.length, id);
    }
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    console.log('MetaMask accounts:', accounts);
    
    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      console.error('No MetaMask account connected');
      return { success: false, error: 'No MetaMask account connected. Please connect wallet.' };
    }
    
    const currentAccount = accounts[0];
    console.log('Farmer wallet address (MetaMask):', currentAccount);
    
    if (!currentAccount || typeof currentAccount !== 'string') {
      console.error('Invalid account:', currentAccount);
      return { success: false, error: 'Invalid MetaMask account. Please reconnect.' };
    }

    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId?.toLowerCase() !== '0xaa36a7') {
      console.error('Blocked: Not on Sepolia. Chain:', currentChainId);
      return { success: false, error: `Please switch MetaMask to Sepolia network (11155111). Current: ${currentChainId}` };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('Signer (farmer) address:', signerAddress);

    const contractAddr = getContractAddress();
    if (!contractAddr) {
      console.error('No contract deployed');
      return { success: false, error: 'Smart contract not deployed. Please contact administrator.' };
    }

    console.log('Contract address:', contractAddr);
    console.log('Contract address valid:', contractAddr.startsWith('0x') && contractAddr.length === 42);
    console.log('Signer address:', signerAddress);
    console.log('Signer valid:', signerAddress && signerAddress.startsWith('0x'));
    console.log('ABI entries:', CONTRACT_ABI.length);
    
    const contract = new ethers.Contract(contractAddr, CONTRACT_ABI, signer);
    
    console.log('Contract instance:', contract);
    console.log('Contract instance target:', contract?.target);
    
    if (!contract || !contract.target) {
      console.error('Contract instance creation failed');
      return { success: false, error: 'Failed to create contract instance. Please refresh and try again.' };
    }
    
    const contractInterface = contract.interface;
    console.log('Contract interface:', contractInterface);
    console.log('Contract functions available:', Object.keys(contractInterface.functions || {}));
    
    const hasGetPurchase = contractInterface.hasFunction('getPurchase(bytes32)');
    const hasWithdrawFunds = contractInterface.hasFunction('withdrawFunds(bytes32[])');
    console.log('Has getPurchase:', hasGetPurchase);
    console.log('Has withdrawFunds:', hasWithdrawFunds);
    
    if (!hasGetPurchase || !hasWithdrawFunds) {
      console.error('Contract missing required functions');
      return { success: false, error: 'Contract does not have required functions. Please contact administrator.' };
    }

    const contractFunctions = contractInterface.functions || {};
    console.log('Contract interface functions:', Object.keys(contractFunctions));

    console.log('---------- VERIFYING PURCHASES ON-CHAIN ----------');
    for (const purchaseId of purchaseIds) {
      console.log('Fetching purchase:', purchaseId);
      let onChainFarmer;
      let onChainWithdrawn;
      
      try {
        const [onChainProductId, onChainBuyer, farmerAddr, onChainPrice, onChainTimestamp, withdrawnFlag] = await contract.getPurchase(purchaseId);
        onChainFarmer = farmerAddr;
        onChainWithdrawn = withdrawnFlag;
        
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
        
        if (!onChainFarmer || onChainFarmer.toLowerCase() === ZERO_ADDRESS) {
          console.error('Invalid purchaseId - purchase does not exist on blockchain:', purchaseId);
          return { success: false, error: 'Invalid purchase ID. This purchase does not exist on the blockchain. The purchase may need to be re-created.' };
        }
        
        console.log('On-chain purchase:', {
          id: purchaseId,
          productId: onChainProductId,
          buyer: onChainBuyer,
          farmer: onChainFarmer,
          price: onChainPrice?.toString(),
          timestamp: onChainTimestamp?.toString(),
          withdrawn: onChainWithdrawn,
        });
        
        const signerLower = (signerAddress || '').toLowerCase();
        const farmerLower = onChainFarmer.toLowerCase();
        
        console.log('Comparing farmer addresses:');
        console.log('  On-chain farmer:', onChainFarmer);
        console.log('  Signer address:', signerAddress);
        console.log('  Match:', farmerLower === signerLower);
        
        if (farmerLower !== signerLower) {
          console.error('Farmer mismatch for purchase:', purchaseId);
          console.error('Contract farmer:', onChainFarmer);
          console.error('Signer:', signerAddress);
          return { success: false, error: `You are not the farmer for this purchase. Only the original farmer (${onChainFarmer}) can withdraw.` };
        }
        
        if (onChainWithdrawn) {
          console.warn('Purchase already withdrawn:', purchaseId);
          return { success: false, error: `Purchase has already been withdrawn.` };
        }
      } catch (err) {
        console.error('Error fetching purchase from chain:', purchaseId, err);
        console.error('Error message:', err.message);
        return { success: false, error: `Failed to verify purchase ${purchaseId} on-chain: ${err.message}` };
      }
     }
    console.log('---------- VERIFICATION COMPLETE ----------');

    console.log('---------- WITHDRAWAL SAFETY CHECKS ----------');
    console.log('✓ Signer address:', signerAddress);
console.log('✓ Contract address:', contractAddr);
    console.log('✓ Chain ID: Sepolia (0xaa36a7 / 11155111)');
    console.log('✓ Number of purchases:', purchaseIds.length);
    console.log('Purchase IDs from DB (stored at purchase time):', purchaseIds);
    
    const purchaseIdsBytes = purchaseIds.map(id => {
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error(`Invalid purchase ID in database: ${id}`);
      }
      if (id.length !== 66) {
        console.error('Invalid stored purchase_id_onchain length:', id.length, 'Value:', id);
        throw new Error(`Invalid purchase_id_onchain format. Expected 66 chars, got ${id.length}. This purchase may need to be re-created.`);
      }
      console.log('Using stored purchase ID:', id);
      return id;
    });

    console.log('Purchase IDs (bytes32 - exact match):', purchaseIdsBytes);
    console.log('---------- PRE-WITHDRAWAL CHECK ----------');
    console.log('Contract Address:', contractAddr);
    console.log('Signer:', signerAddress);
    const abiFunctions = contract.interface.functions || {};
    console.log('ABI Methods available:', Object.keys(abiFunctions));
    console.log('Calling withdrawFunds with:', purchaseIdsBytes);
    
    if (!contract.interface.hasFunction('withdrawFunds(bytes32[])')) {
      console.error('withdrawFunds function not found in contract ABI!');
      return { success: false, error: 'Contract does not support withdrawFunds. Please contact administrator.' };
    }

    console.log('Calling contract.withdrawFunds...');
    const tx = await contract.withdrawFunds(purchaseIdsBytes);

    console.log('Transaction sent! Hash:', tx.hash);

    const receipt = await tx.wait();

    if (!receipt || !receipt.hash) {
      console.error('Transaction failed - no receipt');
      return { success: false, error: 'Withdrawal transaction failed - no receipt received' };
    }

    console.log('✓ Withdrawal confirmed! Hash:', receipt.hash);
    console.log('========== WITHDRAWAL COMPLETE ==========');
    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Withdrawal failed:', error);
    
    if (error.code === 4001) {
      return { success: false, error: 'Transaction rejected by user' };
    }
    if (error.code === -32603 || error.message?.includes('insufficient') || error.message?.includes('gas')) {
      return { success: false, error: 'Insufficient gas. Please try again with higher gas limit.' };
    }
    if (error.message?.includes('malicious') || error.message?.includes('deceptive')) {
      console.error('Blocked: MetaMask flagged malicious address');
      return { success: false, error: 'Transaction blocked by MetaMask security warning.' };
    }
    if (error.message?.includes('not the farmer')) {
      return { success: false, error: 'Caller is not the farmer for this purchase. Please connect the correct wallet.' };
    }
    
    return { success: false, error: error.message || 'Withdrawal failed. Please try again.' };
  }
};