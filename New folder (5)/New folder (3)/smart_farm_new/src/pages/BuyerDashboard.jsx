import { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, DollarSign, Package, History, Wallet, AlertCircle, CheckCircle, RefreshCw, LogOut, MapPin, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateTotalPrice } from '../lib/aiPricePredictor';
import { formatUploadDate } from '../lib/utils';
import { 
  isMetaMaskInstalled, 
  connectWallet, 
  refreshWalletBalance,
  purchaseCrop,
  formatAddress,
  formatBalance,
  WalletState,
  PurchaseResult
} from '../lib/blockchain';

const PurchaseData = {
  id: '',
  buyer_id: '',
  product_id: '',
  crop_name: '',
  quantity: 0,
  price_paid_eth: 0,
  price_paid_inr: 0,
  transaction_hash: '',
  farmer_address: '',
  status: '',
  created_at: '',
};

export function BuyerDashboard() {
  const { profile, signOut } = useAuth();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [purchaseStatus, setPurchaseStatus] = useState({ type: null, message: '' });
  const [ethRate, setEthRate] = useState(180000);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  useEffect(() => {
    if (!isMetaMaskInstalled()) return;
    
    const promptAccount = async () => {
      try {
        const chainId = await window.ethereum?.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') return;
        
        await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const walletState = await connectWallet();
        if (walletState) {
          setWallet(walletState);
        }
      } catch (e) {
        console.log('Account prompt skipped:', e);
      }
    };
    
    promptAccount();
  }, []);
  
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      console.log('Account changed:', accounts);
      if (accounts.length === 0) {
        setWallet(null);
      } else {
        const walletState = await connectWallet();
        if (walletState) {
          setWallet(walletState);
        }
      }
    };

    const handleChainChanged = () => {
      console.log('Network changed, reloading...');
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  useEffect(() => {
    setEthRate(180000);
  }, []);

  const handleConnectWallet = useCallback(async () => {
    setWalletLoading(true);
    setWalletError(null);
    
    if (!isMetaMaskInstalled()) {
      setWalletError('MetaMask is not installed. Please install MetaMask to use blockchain features.');
      setWalletLoading(false);
      return;
    }

    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current MetaMask chain:', currentChainId);
      
      const normalizedChainId = currentChainId?.toLowerCase();
      const SEPOLIA_CHAIN_ID = '0xaa36a7';
      
      if (normalizedChainId !== SEPOLIA_CHAIN_ID) {
        console.log('Current chain ID:', currentChainId);
        console.log('Rejecting: Not Sepolia');
        
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
          const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (newChainId?.toLowerCase() !== SEPOLIA_CHAIN_ID) {
            setWalletError(`Please switch to Sepolia manually.`);
            setWalletLoading(false);
            return;
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
              console.log('Added Sepolia network');
            } catch (addError) {
              setWalletError('Sepolia network not available.');
              setWalletLoading(false);
              return;
            }
          } else {
            setWalletError(`Please switch to Sepolia in MetaMask.`);
            setWalletLoading(false);
            return;
          }
        }
      }
      
      console.log('Confirmed: Connected to Sepolia');
      
      const walletState = await connectWallet();
      
      if (walletState) {
        setWallet(walletState);
        console.log('✓ Wallet connected successfully!');
      } else {
        setWalletError('Failed to connect wallet.');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setWalletError(error.message || 'Failed to connect wallet');
    }
    
    setWalletLoading(false);
  }, []);

  const handleRefreshBalance = useCallback(async () => {
    if (!wallet?.address) return;
    
    try {
      const newBalance = await refreshWalletBalance(wallet.address);
      setWallet(prev => prev ? {
        ...prev,
        balance: (parseFloat(newBalance) * 1e18).toString(),
        balanceInEth: newBalance,
      } : null);
      console.log('✓ Balance refreshed:', newBalance, 'ETH');
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [wallet?.address]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      loadProducts();
      loadTransactions();
      loadPurchases();
    }
  }, [profile]);

  const loadProducts = async () => {
    setLoading(true);
    console.log('Loading products from Supabase...');
    
    const timestamp = Date.now();
    
    const { data: productsData, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
      setLoading(false);
      return;
    }
    
    if (productsData && productsData.length > 0) {
      console.log('Products loaded:', productsData.length);
      setProducts([...productsData]);
    } else {
      setProducts([]);
    }
    setLoading(false);
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('buyer_id', profile?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

  const loadPurchases = async () => {
    if (!profile?.id) {
      console.log('loadPurchases skipped - no profile');
      return;
    }
    
    console.log('Loading purchases for buyer_id:', profile.id);
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('buyer_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading purchases:', error);
    } else {
      console.log('Loaded purchases:', data);
      setPurchases(data || []);
    }
  };

  const isValidEthAddress = (addr) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handlePurchase = async () => {
    if (!profile || !selectedProduct || !wallet?.address) {
      setPurchaseStatus({ type: 'error', message: 'Please connect your MetaMask wallet first.' });
      return;
    }

    const quantityNum = parseFloat(purchaseQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0 || quantityNum > selectedProduct.quantity) {
      setPurchaseStatus({ type: 'error', message: 'Please enter a valid purchase quantity within availability.' });
      return;
    }

    const totalPriceInr = calculateTotalPrice(selectedProduct.farmer_price, quantityNum);
    const priceInEth = (totalPriceInr / ethRate).toFixed(6);
    
    console.log('=== BUY CROP FLOW ===');
    console.log('Product:', selectedProduct.crop_name);
    console.log('Quantity:', quantityNum, selectedProduct.unit);
    console.log('Price (ETH):', priceInEth);
    
    const farmerWalletAddress = selectedProduct.farmer_wallet_address;
    console.log('Farmer Address:', farmerWalletAddress);
    
    if (!farmerWalletAddress || farmerWalletAddress === 'undefined' || farmerWalletAddress === 'null' || farmerWalletAddress === '') {
      setPurchaseStatus({ type: 'error', message: 'This farmer has not connected their wallet yet.' });
      return;
    }
    
    if (!isValidEthAddress(farmerWalletAddress)) {
      setPurchaseStatus({ type: 'error', message: 'Farmer wallet address is invalid.' });
      return;
    }
    
    const buyerWalletAddress = wallet.address?.toLowerCase();
    const farmerAddressLower = farmerWalletAddress.toLowerCase();
    
    if (buyerWalletAddress === farmerAddressLower) {
      setPurchaseStatus({ type: 'error', message: 'You cannot buy your own product.' });
      return;
    }
    
    console.log('Buyer-Farmer validation passed');

    const freshAccount = await requestFreshAccount();
    if (!freshAccount) {
      setPurchaseStatus({ type: 'error', message: 'No account selected.' });
      return;
    }
    
    if (freshAccount.toLowerCase() !== buyerWalletAddress) {
      const newWalletState = await connectWallet();
      if (newWalletState) {
        setWallet(newWalletState);
      }
    }
    
    setPurchasing(true);
    setPurchaseStatus({ type: null, message: '' });
    
    try {
      const balanceNum = parseFloat(wallet.balanceInEth);
      if (balanceNum < parseFloat(priceInEth)) {
        setPurchaseStatus({ type: 'error', message: `Insufficient ETH balance.` });
        setPurchasing(false);
        return;
      }

      console.log('Sending transaction to MetaMask...');
      const result = await purchaseCrop(
        priceInEth,
        selectedProduct.id,
        farmerWalletAddress
      );

      if (result.success && result.transactionHash) {
        console.log('✓ Transaction successful!');
        
        const pricePaidInr = parseFloat(priceInEth) * ethRate;
        
        console.log('Storing transaction in Supabase...');
        
        const { data: purchaseData, error: insertError } = await supabase.from('purchases').insert({
          buyer_id: profile.id,
          product_id: selectedProduct.id,
          crop_name: selectedProduct.crop_name,
          quantity: quantityNum,
          price_paid_eth: parseFloat(priceInEth),
          price_paid_inr: pricePaidInr,
          transaction_hash: result.transactionHash,
          purchase_id_onchain: result.productIdBytes,
          farmer_address: farmerWalletAddress,
          status: 'completed',
        }).select();

        if (insertError) {
          console.error('Failed to store purchase:', insertError);
          setPurchaseStatus({ type: 'error', message: 'Purchase succeeded but failed to save.' });
        } else {
          console.log('✓ Purchase stored in Supabase');

          const remainingQuantity = selectedProduct.quantity - quantityNum;
          
          let updateSuccess = false;
          let updateError = null;
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`Update attempt ${attempt}...`);
            
            const { error: attemptError } = await supabase
              .from('products')
              .update({ 
                quantity: remainingQuantity,
                status: remainingQuantity <= 0 ? 'sold' : 'available'
              })
              .eq('id', selectedProduct.id);
            
            if (attemptError) {
              updateError = attemptError;
              await new Promise(r => setTimeout(r, 500));
            } else {
              console.log(`Attempt ${attempt} succeeded!`);
              updateSuccess = true;
              break;
            }
          }
          
          if (updateSuccess) {
            console.log('✓ SUCCESS Product quantity updated');
          }

          const { error: txError } = await supabase.from('transactions').insert({
            farmer_id: selectedProduct.farmer_id,
            buyer_id: profile.id,
            product_id: selectedProduct.id,
            crop_name: selectedProduct.crop_name,
            quantity: quantityNum,
            final_price: pricePaidInr,
            status: 'completed',
            transaction_hash: result.transactionHash,
          });

          if (txError) {
            console.warn('Failed to store in transactions table:', txError);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await loadProducts();
        await loadPurchases();
        await handleRefreshBalance();
        
        if (selectedProduct) {
          const { data: updatedProduct } = await supabase
            .from('products')
            .select('*')
            .eq('id', selectedProduct.id)
            .single();
          
          if (updatedProduct) {
            setSelectedProduct(updatedProduct);
          }
        }
        
        setPurchaseStatus({ 
          type: 'success', 
          message: `Purchase successful! Transaction: ${result.transactionHash.substring(0, 20)}...` 
        });
        
        setTimeout(() => {
          setSelectedProduct(null);
          setShowPurchaseModal(false);
          setPurchaseQuantity('');
          setPurchaseStatus({ type: null, message: '' });
        }, 3000);
      } else {
        console.error('Purchase failed:', result.error);
        setPurchaseStatus({ type: 'error', message: result.error || 'Purchase failed.' });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseStatus({ type: 'error', message: error.message || 'Purchase failed.' });
    }

    setPurchasing(false);
  };

  const ethPurchases = purchases.map(p => ({
    ...p,
    price_paid_eth: Number(p.price_paid_eth) || 0
  }));
  
  const totalPurchases = transactions.filter((t) => t.status === 'completed').length + purchases.length;
  const totalSpentInr = (
    transactions.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.final_price, 0) +
    purchases.reduce((sum, p) => sum + (Number(p.price_paid_inr) || 0), 0)
  );
  const totalSpentEth = ethPurchases.reduce((sum, p) => sum + p.price_paid_eth, 0);

  const priceMin = parseFloat(filterMinPrice);
  const priceMax = parseFloat(filterMaxPrice);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const cropName = product.crop_name?.toString().toLowerCase() || '';
      const location = (product.location || '').toString().toLowerCase();
      const category = (product.category || '').toString().toLowerCase();
      const search = searchQuery.trim().toLowerCase();

      if (search && !cropName.includes(search)) {
        return false;
      }
      if (filterLocation.trim() && !location.includes(filterLocation.trim().toLowerCase())) {
        return false;
      }
      if (filterCategory.trim() && !category.includes(filterCategory.trim().toLowerCase())) {
        return false;
      }
      const productPrice = Number(product.farmer_price);
      if (!Number.isNaN(priceMin) && productPrice < priceMin) {
        return false;
      }
      if (!Number.isNaN(priceMax) && productPrice > priceMax) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, filterLocation, filterCategory, priceMin, priceMax]);

  const locationOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.location || '').filter(Boolean))),
    [products]
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.category || '').filter(Boolean))),
    [products]
  );

  const resetFilters = () => {
    setSearchQuery('');
    setFilterLocation('');
    setFilterCategory('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
  };

  const walletBalanceInr = wallet ? parseFloat(wallet.balanceInEth) * ethRate : 0;



  async function requestFreshAccount() {
    if (!isMetaMaskInstalled()) return null;
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      console.log('[Account] Fresh account requested, got:', accounts);
      return accounts?.[0] || null;
    } catch (error) {
      console.error('[Account] Failed to request accounts:', error);
      return null;
    }
  }

  function handlePurchaseClick(product) {
    if (!wallet?.connected) {
      setPurchaseStatus({ type: 'error', message: 'Please connect your MetaMask wallet first.' });
      return;
    }

    if (product.status === 'sold') {
      setPurchaseStatus({ type: 'error', message: 'This product has already been sold.' });
      return;
    }

    setSelectedProduct(product);
    setPurchaseQuantity('');
    setShowPurchaseModal(true);
    setPurchaseStatus({ type: null, message: '' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Dashboard</h1>
              <p className="text-gray-600">Browse fresh produce directly from farmers</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {purchaseStatus.type && (
          <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
            purchaseStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {purchaseStatus.type === 'success' ? (
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            )}
            <div>
              <p className={purchaseStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {purchaseStatus.message}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Wallet className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Blockchain Wallet</h3>
                {wallet?.connected ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Address: <span className="font-mono text-xs">{formatAddress(wallet.address)}</span>
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {formatBalance(wallet.balanceInEth)} ETH 
                      <span className="text-sm text-gray-500 font-normal ml-2">
                        (₹{walletBalanceInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Connect MetaMask to purchase crops</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              {wallet?.connected ? (
                <>
                  <button
                    onClick={handleRefreshBalance}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh
                  </button>
                  <div className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg">
                      <CheckCircle size={16} className="mr-2" />
                      Connected
                  </div>
                </>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={walletLoading}
                  className="flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  <Wallet size={16} className="mr-2" />
                  {walletLoading ? 'Connecting...' : 'Connect MetaMask'}
                </button>
              )}
            </div>
          </div>
          
          {walletError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{walletError}</p>
            </div>
          )}
          
          {!wallet?.connected && (
            <p className="mt-4 text-sm text-gray-500">
              Note: Connect your MetaMask wallet to Sepolia testnet to purchase crops using ETH.
            </p>
          )}
          
          {wallet?.connected && (
            <div className="mt-3">
              <button
                type="button"
                onClick={async () => {
                  console.log('[Account] Requesting account access...');
                  try {
                    await window.ethereum.request({
                      method: 'wallet_requestPermissions',
                      params: [{ eth_accounts: {} }]
                    });
                    
                    const accounts = await window.ethereum.request({
                      method: 'eth_requestAccounts'
                    });

                    if (accounts && accounts.length > 0) {
                      const walletState = await connectWallet();
                      if (walletState) {
                        setWallet(walletState);
                      }
                    }
                  } catch (err) {
                    console.error('[Account] Error:', err);
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Switch MetaMask Account
              </button>
            </div>
          )}
          
          {selectedProduct && wallet?.connected && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <span className="font-medium">Important:</span> If you are acting as both Buyer and Farmer, 
                switch to the correct MetaMask account before purchasing.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {wallet?.connected 
                    ? `${formatBalance(wallet.balanceInEth)} ETH`
                    : 'Not Connected'
                  }
                </p>
              </div>
              <DollarSign className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
                <p className="text-2xl font-bold text-green-600">{totalPurchases}</p>
              </div>
              <ShoppingCart className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Number(totalSpentEth).toFixed(6)} ETH
                  <span className="text-xs text-gray-500 ml-1">
                    (₹{Number(totalSpentInr).toFixed(2)})
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {purchases.length} blockchain purchase(s)
                </p>
              </div>
              <DollarSign className="text-orange-500" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Available Products</h2>
                <p className="text-sm text-gray-500">
                  Browse fresh produce and filter by crop, location, category, or price.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search crop</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rice, Wheat, Corn..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  list="location-options"
                  type="text"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="City, Village, State"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <datalist id="location-options">
                  {locationOptions.map((location) => (
                    <option key={location} value={location} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="₹0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="₹1000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Showing {filteredProducts.length} of {products.length} available products</p>
              </div>
            </div>
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No products available at the moment. Check back soon!
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No products match your filters. Try a different search or clear filters.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.crop_name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <span className="text-6xl">🌾</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {product.crop_name}
                      </h3>
                      <div className="space-y-3 text-sm text-gray-600 mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                          <div className="inline-flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{product.location || 'Unknown Location'}</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span>{formatUploadDate(product.upload_date || product.created_at)}</span>
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Tag size={14} className="text-gray-400" />
                            <span>{product.category || 'Other'}</span>
                          </div>
                        </div>
                        <p>Available: {product.quantity} {product.unit}</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{product.farmer_price}/{product.unit}
                        </p>
                        <p className="text-xs text-blue-600">
                          AI Fair Price: ₹{product.ai_suggested_price}/{product.unit}
                        </p>
                        {product.farmer_wallet_address ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Wallet Connected
                          </p>
                        ) : (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Wallet Not Connected
                          </p>
                        )}
                        <p className="text-lg font-bold text-gray-900">
                          Total: ₹{calculateTotalPrice(product.farmer_price, product.quantity).toFixed(2)}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            ({(calculateTotalPrice(product.farmer_price, product.quantity) / ethRate).toFixed(4)} ETH)
                          </span>
                        </p>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                      )}
<div className="flex space-x-2">
                         <button
                           onClick={() => handlePurchaseClick(product)}
                           disabled={!wallet?.connected || purchasing || product.status === 'sold' || !product.farmer_wallet_address}
                           className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                           title={!product.farmer_wallet_address ? 'Farmer has not connected their wallet yet' : ''}
                         >
                           {product.status === 'sold' ? 'Sold' : !product.farmer_wallet_address ? 'Wallet Required' : purchasing ? 'Processing...' : 'Buy Now'}
                         </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center space-x-2">
            <History size={24} className="text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">My Purchase History</h2>
          </div>
          <div className="p-6">
            {transactions.length === 0 && purchases.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No purchases yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (ETH)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction Hash</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{transaction.crop_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{transaction.quantity} kg</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">-</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-bold">₹{transaction.final_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{transaction.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{transaction.transaction_hash?.substring(0, 16)}...</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(transaction.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {purchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{purchase.crop_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{purchase.quantity} kg</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-bold font-mono">{purchase.price_paid_eth} ETH</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-bold">₹{purchase.price_paid_inr?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{purchase.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-mono">
                          <a href={`https://sepolia.etherscan.io/tx/${purchase.transaction_hash}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {purchase.transaction_hash?.substring(0, 16)}...
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(purchase.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Purchase Quantity</h3>
            <p className="text-gray-600 mb-4">
              Purchasing: <span className="font-medium">{selectedProduct.crop_name}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Available: {selectedProduct.quantity} {selectedProduct.unit}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Farmer: <span className="font-mono text-xs">{selectedProduct.farmer_wallet_address}</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter quantity ({selectedProduct.unit})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={selectedProduct.quantity}
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`Max ${selectedProduct.quantity}`}
              />
            </div>

            {purchaseQuantity && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-bold text-green-600 ml-2">₹{calculateTotalPrice(selectedProduct.farmer_price, parseFloat(purchaseQuantity) || 0).toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  ETH: <span className="font-bold text-orange-600 ml-2">{(calculateTotalPrice(selectedProduct.farmer_price, parseFloat(purchaseQuantity) || 0) / ethRate).toFixed(6)} ETH</span>
                </p>
              </div>
            )}

            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <span className="font-medium">Warning:</span> Make sure you're using the correct MetaMask account.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePurchase}
                disabled={!purchaseQuantity || purchasing || !wallet?.connected}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? 'Processing...' : wallet?.connected ? 'Confirm & Pay' : 'Connect First'}
              </button>
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setSelectedProduct(null);
                  setPurchaseQuantity('');
                  setPurchaseStatus({ type: null, message: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}