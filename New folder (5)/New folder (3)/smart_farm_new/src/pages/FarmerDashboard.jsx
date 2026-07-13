import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, TrendingUp, DollarSign, Eye, Gavel, LogOut, MapPin, Calendar, Tag, Wallet, CheckCircle, XCircle, Loader2, Link, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWalletContext } from '../lib/WalletContext';
import { supabase } from '../lib/supabase';
import { predictPrice, calculateTotalPrice } from '../lib/aiPricePredictor';
import { detectProductCategory, formatUploadDate } from '../lib/utils';
import { withdrawFunds, formatAddress, getPurchase } from '../lib/blockchain';



export function FarmerDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { wallet, connectWallet: connectWalletContext } = useWalletContext();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [aiSuggestedPrice, setAiSuggestedPrice] = useState(0);
  const [farmerPrice, setFarmerPrice] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [blockchainPurchases, setBlockchainPurchases] = useState([]);
  const [withdrawablePurchases, setWithdrawablePurchases] = useState([]);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState(null);
  const [linkWalletLoading, setLinkWalletLoading] = useState(false);
  const [linkWalletMessage, setLinkWalletMessage] = useState(null);
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  const [syncPurchasesLoading, setSyncPurchasesLoading] = useState(false);
  const [oldWalletAddress, setOldWalletAddress] = useState('');
  const [showWalletSwitchModal, setShowWalletSwitchModal] = useState(false);
  const [requiredWalletAddress, setRequiredWalletAddress] = useState('');

  useEffect(() => {
    if (profile?.id) {
      loadProducts();
      loadTransactions();
      loadBlockchainPurchases();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!showWalletSwitchModal || !requiredWalletAddress) return;

    const handleAccountsChanged = (accounts) => {
      const currentAccount = accounts[0]?.toLowerCase();
      const required = requiredWalletAddress.toLowerCase();
      
      if (currentAccount === required) {
        setShowWalletSwitchModal(false);
        setWithdrawMessage(null);
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [showWalletSwitchModal, requiredWalletAddress]);

  useEffect(() => {
    if (!profile) return;

    if (!navigator.geolocation) {
      setCurrentLocation(profile.address?.trim() || 'Unknown Location');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(
          `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`
        );
      },
      () => {
        setCurrentLocation(profile.address?.trim() || 'Unknown Location');
      },
      { timeout: 5000 }
    );
  }, [profile]);

  const getProductLocation = () => {
    return currentLocation || profile?.address?.trim() || 'Unknown Location';
  };

  const getProductCategory = (name, description) => {
    return detectProductCategory(`${name} ${description || ''}`);
  };

   const loadBlockchainPurchases = async () => {
     if (!profile?.id) return;
     
     if (!profile?.farmer_wallet_address) {
       setBlockchainPurchases([]);
       setWithdrawablePurchases([]);
       return;
     }
     
     const farmerAddr = (profile.farmer_wallet_address || '').toLowerCase();
     
     const { data, error } = await supabase
       .from('purchases')
       .select('*')
       .eq('farmer_address', farmerAddr)
       .order('created_at', { ascending: false });
      
     if (error) {
       setBlockchainPurchases([]);
       setWithdrawablePurchases([]);
       return;
     }

     if (!data || !Array.isArray(data)) {
       setBlockchainPurchases([]);
       setWithdrawablePurchases([]);
       return;
     }

     setBlockchainPurchases(data);

     let withdrawable = data.filter(p => p && p.withdrawn !== true);
       
     const trulyWithdrawable = [];
     for (const purchase of withdrawable) {
       if (!purchase.purchase_id_onchain) continue;
       try {
         const onchainStatus = await getPurchase(purchase.purchase_id_onchain);
         if (!onchainStatus.withdrawn) {
           trulyWithdrawable.push(purchase);
         }
       } catch (err) {
         trulyWithdrawable.push(purchase);
       }
     }
     withdrawable = trulyWithdrawable;
     
     setWithdrawablePurchases(withdrawable);
   };

  const togglePurchaseSelection = (purchaseId) => {
    setSelectedPurchases(prev => 
      prev.includes(purchaseId)
        ? prev.filter(id => id !== purchaseId)
        : [...prev, purchaseId]
    );
  };

   const executeWithdraw = async (idsToProcess) => {
     if (!profile?.farmer_wallet_address) {
       setWithdrawMessage({ type: 'error', text: 'No wallet address linked to your profile.' });
       return;
     }

     if (!window.ethereum) {
       setWithdrawMessage({ type: 'error', text: 'MetaMask is not installed.' });
       return;
     }

     let accounts = [];
     try {
       accounts = await window.ethereum.request({
         method: 'eth_accounts'
       });
     } catch (e) {
       setWithdrawMessage({ type: 'error', text: 'Failed to connect to MetaMask. Please refresh and try again.' });
       return;
     }

     if (!accounts || accounts.length === 0) {
       setWithdrawMessage({ type: 'error', text: 'Please connect your MetaMask wallet first.' });
       return;
     }

     const connectedAddress = accounts[0]?.toLowerCase();
     const farmerAddress = (profile.farmer_wallet_address || '').toLowerCase();

     const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
     if (currentChainId?.toLowerCase() !== '0xaa36a7') {
       setWithdrawMessage({ type: 'error', text: `Please switch MetaMask to Sepolia. Current network: ${currentChainId}` });
       return;
     }

     if (!connectedAddress || !farmerAddress || connectedAddress !== farmerAddress) {
       setRequiredWalletAddress(farmerAddress);
       setShowWalletSwitchModal(true);
       setWithdrawMessage({ type: 'error', text: 'Wrong wallet connected. Please switch to the correct account.' });
       return;
     }

if (!idsToProcess || !Array.isArray(idsToProcess) || idsToProcess.length === 0) {
       setWithdrawMessage({ type: 'error', text: 'Please select at least one purchase to withdraw.' });
       return;
     }

     if (!withdrawablePurchases || !Array.isArray(withdrawablePurchases)) {
       setWithdrawMessage({ type: 'error', text: 'No purchases available for withdrawal.' });
       return;
     }

     const selectedPurchaseData = withdrawablePurchases.filter(p => 
       p && idsToProcess.includes(p.id) && p.purchase_id_onchain
     );
     
     if (selectedPurchaseData.length === 0) {
       setWithdrawMessage({ type: 'error', text: 'No valid on-chain purchase IDs found.' });
       return;
     }

     const invalidOnchainIds = selectedPurchaseData.filter(p => !p.purchase_id_onchain || !/^0x[a-fA-F0-9]{64}$/.test(p.purchase_id_onchain));
     if (invalidOnchainIds.length > 0) {
       setWithdrawMessage({ type: 'error', text: `Invalid on-chain purchase ID in ${invalidOnchainIds.length} purchase(s).` });
       return;
     }

     const validPurchaseIds = [];
     const skippedIds = [];
     
     for (const purchase of selectedPurchaseData) {
       try {
         const onchain = await getPurchase(purchase.purchase_id_onchain);
         if (onchain.withdrawn) {
           skippedIds.push(purchase.id);
         } else {
           validPurchaseIds.push(purchase.purchase_id_onchain);
         }
       } catch (err) {
         validPurchaseIds.push(purchase.purchase_id_onchain);
       }
     }

     if (validPurchaseIds.length === 0) {
       setWithdrawMessage({ 
         type: 'error', 
         text: skippedIds.length > 0 
           ? `All selected purchases (${skippedIds.length}) have already been withdrawn.` 
           : 'No valid purchases to withdraw.' 
       });
       return;
     }

     if (skippedIds.length > 0) {
     }

     const uniqueOnchainIds = [...new Set(validPurchaseIds)];

     setWithdrawLoading(true);
     setWithdrawMessage(null);

      try {
        const result = await withdrawFunds(uniqueOnchainIds);

       if (result.success && result.transactionHash) {
         const { error: updateError } = await supabase
           .from('purchases')
           .update({ withdrawn: true })
           .in('id', idsToProcess);

         if (updateError) {
           setWithdrawMessage({ type: 'error', text: 'Withdrawal succeeded but failed to update database.' });
         } else {
           setWithdrawMessage({ 
             type: 'success', 
             text: `Successfully withdrew ${uniqueOnchainIds.length} purchase(s)! ${skippedIds.length > 0 ? `(Skipped ${skippedIds.length} already withdrawn)` : ''} Tx: ${result.transactionHash.substring(0, 20)}...` 
           });
           await loadBlockchainPurchases();
           setSelectedPurchases([]);
         }
       } else {
         setWithdrawMessage({ type: 'error', text: result.error || 'Withdrawal failed.' });
       }
     } catch (error) {
       console.error('Withdrawal error:', error);
       setWithdrawMessage({ type: 'error', text: error.message || 'Withdrawal failed.' });
     } finally {
       setWithdrawLoading(false);
     }
   };

   const handleWithdraw = () => {
     executeWithdraw(selectedPurchases);
   };

    const handleWithdrawAll = () => {
      const allIds = withdrawablePurchases.map(p => p.id);
      setSelectedPurchases(allIds);
      executeWithdraw(allIds);
    };

   const handleLinkWallet = async () => {
     setLinkWalletLoading(true);
     setLinkWalletMessage(null);

     try {
       if (!window.ethereum) {
         setLinkWalletMessage({ type: 'error', text: 'MetaMask is not installed.' });
         setLinkWalletLoading(false);
         return;
       }

       const accounts = await window.ethereum.request({
         method: 'eth_requestAccounts'
       });

       if (!accounts || accounts.length === 0) {
         setLinkWalletMessage({ type: 'error', text: 'No MetaMask account connected.' });
         setLinkWalletLoading(false);
         return;
       }

       const walletState = {
         address: accounts[0],
         isConnected: true,
         chainId: await window.ethereum.request({ method: 'eth_chainId' })
       };
      
      if (!walletState || !walletState.address) {
        setLinkWalletMessage({ type: 'error', text: 'Failed to connect wallet.' });
        setLinkWalletLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ farmer_wallet_address: walletState.address.toLowerCase() })
        .eq('id', profile?.id);

      if (updateError) {
        setLinkWalletMessage({ type: 'error', text: 'Failed to link wallet.' });
      } else {
        setLinkWalletMessage({ type: 'success', text: `Wallet ${formatAddress(walletState.address)} linked successfully!` });
        window.location.reload();
      }
    } catch (error) {
      console.error('Link wallet error:', error);
      setLinkWalletMessage({ type: 'error', text: error.message || 'Failed to link wallet.' });
    } finally {
      setLinkWalletLoading(false);
    }
   };

  const handleManualLinkWallet = async () => {
    if (!manualWalletAddress) {
      setLinkWalletMessage({ type: 'error', text: 'Please enter a wallet address.' });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(manualWalletAddress)) {
      setLinkWalletMessage({ type: 'error', text: 'Invalid Ethereum address format.' });
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ farmer_wallet_address: manualWalletAddress.toLowerCase() })
        .eq('id', profile?.id);

      if (updateError) {
        setLinkWalletMessage({ type: 'error', text: 'Failed to link wallet.' });
      } else {
        setLinkWalletMessage({ type: 'success', text: `Wallet ${formatAddress(manualWalletAddress)} linked successfully!` });
        setManualWalletAddress('');
        window.location.reload();
      }
    } catch (error) {
      console.error('Link wallet error:', error);
      setLinkWalletMessage({ type: 'error', text: error.message || 'Failed to link wallet.' });
    }
   };

  const handleSyncPurchases = async () => {
    if (!profile?.farmer_wallet_address || !profile?.id) {
      setLinkWalletMessage({ type: 'error', text: 'No wallet address linked to profile.' });
      return;
    }

    const searchAddress = oldWalletAddress.trim() 
      ? oldWalletAddress.toLowerCase() 
      : profile.farmer_wallet_address.toLowerCase();

    setSyncPurchasesLoading(true);
    try {
      const { data: purchases, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .or(`farmer_address.eq.${searchAddress},farmer_address.is.null`);

      if (fetchError) {
        setLinkWalletMessage({ type: 'error', text: 'Failed to fetch purchases.' });
        setSyncPurchasesLoading(false);
        return;
      }

      if (purchases && purchases.length > 0) {
        const purchaseIds = purchases.map(p => p.id);
        
        const { error: updateError } = await supabase
          .from('purchases')
          .update({ farmer_address: profile.farmer_wallet_address.toLowerCase() })
          .in('id', purchaseIds);

        if (updateError) {
          setLinkWalletMessage({ type: 'error', text: 'Failed to update purchases.' });
        } else {
          setLinkWalletMessage({ type: 'success', text: `Synced ${purchaseIds.length} purchases with wallet!` });
          loadBlockchainPurchases();
        }
      } else {
        setLinkWalletMessage({ type: 'error', text: 'No purchases found.' });
      }
    } catch (error) {
      console.error('Sync error:', error);
      setLinkWalletMessage({ type: 'error', text: 'Sync failed.' });
    } finally {
      setSyncPurchasesLoading(false);
    }
   };

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', profile?.id)
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      setProducts(data);
    } else if (error) {
      console.error('Error loading products:', error);
    }
    setLoading(false);
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('farmer_id', profile?.id)
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      setTransactions(data);
    }
  };



   const handleLogout = async () => {
     try {
       await signOut();
     } catch (error) {
       console.error('Error signing out:', error);
     }
   };

   const handleSwitchAccount = () => {
     if (window.confirm('Switch account? This will log you out and return to the login page.')) {
       signOut().then(() => {
         navigate('/login');
       });
     }
   };

const handlePredictPrice = async () => {
      if (cropName && quantity) {
        const predicted = await predictPrice(cropName, parseFloat(quantity));
        setAiSuggestedPrice(predicted);
        setFarmerPrice(predicted.toString());
      }
    };

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setImageFile(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        setSubmitError('Failed to upload image. Please try another one.');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrlData.publicUrl);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!profile) {
      setSubmitError('User profile not loaded. Please refresh the page.');
      return;
    }

    let walletAddress = profile.farmer_wallet_address;
    
    if (!walletAddress && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          walletAddress = accounts[0].toLowerCase();
          await supabase
            .from('profiles')
            .update({ farmer_wallet_address: walletAddress })
            .eq('id', profile.id);
        }
      } catch (err) {
        console.warn('Could not get MetaMask account:', err);
      }
    }

    const quantityNum = parseFloat(quantity);
    const farmerPriceNum = parseFloat(farmerPrice);

    if (isNaN(quantityNum) || quantityNum <= 0) {
      setSubmitError('Please enter a valid quantity greater than 0.');
      return;
    }

    if (isNaN(farmerPriceNum) || farmerPriceNum <= 0) {
      setSubmitError('Please enter a valid price greater than 0.');
      return;
    }

    if (!cropName.trim()) {
      setSubmitError('Please enter a crop name.');
      return;
    }

    if (!manualCategory.trim()) {
      setSubmitError('Please select or enter a category.');
      return;
    }

    try {
      const productData = {
        farmer_id: profile.id,
        farmer_wallet_address: walletAddress || null,
        crop_name: cropName.trim(),
        quantity: quantityNum,
        unit: 'kg',
        ai_suggested_price: aiSuggestedPrice || farmerPriceNum,
        farmer_price: farmerPriceNum,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        location: manualLocation.trim() || getProductLocation(),
        created_at: new Date().toISOString(),
        upload_date: new Date().toISOString(),
        category: manualCategory.trim(),
        status: 'available',
      };

      const { data: insertedProducts, error } = await supabase
        .from('products')
        .insert(productData)
        .select('*');

      if (error) {
        setSubmitError(`Failed to add product: ${error.message}`);
        return;
      }

      if (insertedProducts && insertedProducts.length > 0) {
        setProducts((prevProducts) => [insertedProducts[0], ...prevProducts]);
      }

      setCropName('');
      setQuantity('');
      setDescription('');
      setImageUrl('');
      setAiSuggestedPrice(0);
      setFarmerPrice('');
      setShowAddForm(false);
      await loadProducts();
    } catch (err) {
      console.error('Unexpected error:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
    }
  };

  const stats = {
    totalProducts: products.length,
    activeListings: products.filter((p) => p.status === 'available').length,
    totalSales: transactions.filter((t) => t.status === 'completed').length + blockchainPurchases.length,
    revenue: transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.final_price, 0) + 
      blockchainPurchases.reduce((sum, p) => sum + p.price_paid_inr, 0),
  };

  let greenCredits = 0;
  products.forEach(product => {
    if (product.crop_name.toLowerCase().includes('organic') && product.crop_name.toLowerCase().includes('fertilizer')) {
      greenCredits += 5;
    }
  });
  if (transactions.length > 10) {
    greenCredits += 20;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
              <p className="text-gray-600">Manage your produce listings and track sales</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
           </div>

           <div className="mt-4">
              <button
               onClick={handleSwitchAccount}
               className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
             >
               <RefreshCw size={18} />
               Switch Account
             </button>
           </div>

           <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-yellow-800">
                <Wallet size={20} />
                <span className="font-medium">
                  {profile?.farmer_wallet_address 
                    ? `Linked Wallet: ${profile.farmer_wallet_address.substring(0, 6)}...${profile.farmer_wallet_address.substring(38)}`
                    : 'Link your wallet to receive payments'
                  }
                </span>
              </div>
              <button
                onClick={async () => {
                  if (!window.ethereum) {
                    alert('MetaMask is not installed.');
                    return;
                  }
                  try {
                    const accounts = await window.ethereum.request({
                      method: 'eth_requestAccounts'
                    });
                    if (accounts && accounts.length > 0) {
                      alert(`Connected to MetaMask account: ${accounts[0]}`);
                    }
                  } catch (e) {
                    console.error('Failed to connect:', e);
                  }
                }}
                disabled={linkWalletLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {linkWalletLoading ? <Loader2 className="animate-spin" size={18} /> : <Link size={18} />}
                <span>{linkWalletLoading ? 'Connecting...' : profile?.farmer_wallet_address ? 'Link/Verify Wallet' : 'Connect Wallet'}</span>
              </button>
            </div>
            
<div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
              <p className="font-semibold text-yellow-800">MetaMask Status:</p>
              <p className="text-gray-600 mt-2">
                <strong>How to Connect/Switch Wallet:</strong><br/>
                1. Click the blue MetaMask icon in your browser toolbar<br/>
                2. In the MetaMask popup, click the account name<br/>
                3. Select the account you want to use
              </p>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center space-x-2 text-xs text-yellow-700 mb-2">
                <span>Or enter manually:</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualWalletAddress}
                  onChange={(e) => setManualWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-3 py-2 border border-yellow-300 rounded text-sm font-mono"
                />
                <button
                  onClick={handleManualLinkWallet}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  Save
                </button>
              </div>
            </div>
            {profile?.farmer_wallet_address && (
              <div className="mt-3">
                <div className="flex items-center space-x-2 text-xs text-yellow-700 mb-2">
                  <span>Having issues? Enter old wallet address to sync purchases:</span>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={oldWalletAddress}
                    onChange={(e) => setOldWalletAddress(e.target.value)}
                    placeholder="Old wallet address (0x...)"
                    className="flex-1 px-3 py-2 border border-yellow-300 rounded text-sm font-mono"
                  />
                  <button
                    onClick={handleSyncPurchases}
                    disabled={syncPurchasesLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    {syncPurchasesLoading ? 'Syncing...' : 'Sync'}
                  </button>
                </div>
              </div>
            )}
            {linkWalletMessage && (
              <div className={`mt-3 p-2 rounded text-sm ${
                linkWalletMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {linkWalletMessage.text}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Listings</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeListings}</p>
              </div>
              <Eye className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
              <TrendingUp className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.revenue.toFixed(2)}</p>
              </div>
              <DollarSign className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Green Credits</p>
                <p className="text-2xl font-bold text-green-800">{greenCredits}</p>
                <p className="text-xs text-green-600 mt-1">
                  Earned from sustainable practices
                </p>
              </div>
              <div className="text-green-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">My Products</h2>
            <button
              onClick={() => {
                if (!profile?.farmer_wallet_address) {
                  alert("Please connect your MetaMask wallet first.");
                  return;
                }
                setShowAddForm(!showAddForm);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-6 bg-gray-50 border-b border-gray-100">
              {submitError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {submitError}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Rice, Wheat, Corn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={handlePredictPrice}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <TrendingUp size={16} />
                  <span>Get Price Suggestion</span>
                </button>
                {aiSuggestedPrice > 0 && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    AI Suggested Price: ₹{aiSuggestedPrice}/kg (Total: ₹
                    {calculateTotalPrice(aiSuggestedPrice, parseFloat(quantity || '0')).toFixed(2)})
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Price (₹/kg)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={farmerPrice}
                  onChange={(e) => setFarmerPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="40"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image (optional)
                </label>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Upload from device (requires Supabase storage setup)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Or paste image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {submitError && (
                    <p className="text-xs text-red-500">{submitError}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your produce..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="City, Village, State"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Leave blank to use your current location or profile address.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    list="category-options"
                    required
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Vegetables, Grains, Fruits, Dairy, Herbs"
                  />
                  <datalist id="category-options">
                    <option value="Vegetables" />
                    <option value="Grains" />
                    <option value="Fruits" />
                    <option value="Dairy" />
                    <option value="Protein" />
                    <option value="Fertilizers" />
                    <option value="Herbs & Spices" />
                  </datalist>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No products listed yet. Add your first product!
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.crop_name}
                        className="w-full h-48 object-cover"
                      />
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
                        <p>Quantity: {product.quantity} {product.unit}</p>
                        <p>Price: ₹{product.farmer_price}/{product.unit}</p>
                        <p className="text-blue-600">
                           Suggested price: ₹{product.ai_suggested_price}/{product.unit}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : product.status === 'sold'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>



        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          </div>
          <div className="p-6">
            {transactions.length === 0 && blockchainPurchases.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No transactions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Crop
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {transaction.crop_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {transaction.quantity} kg
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          ₹{transaction.final_price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {transaction.transaction_hash?.substring(0, 16)}...
                        </td>
                      </tr>
                    ))}
                    {blockchainPurchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {purchase.crop_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {purchase.quantity} kg
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">
                          ₹{purchase.price_paid_inr.toFixed(2)} ({purchase.price_paid_eth} ETH)
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-mono">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${purchase.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {purchase.transaction_hash?.substring(0, 16)}...
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet size={24} className="text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Available for Withdrawal</h2>
            </div>
            {withdrawablePurchases.length > 0 && (
              <button
                onClick={handleWithdrawAll}
                disabled={withdrawLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {withdrawLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                <span>Withdraw All ({withdrawablePurchases.length})</span>
              </button>
            )}
          </div>
          
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>To withdraw funds:</strong> Make sure the MetaMask account connected matches your linked wallet address above.
            </p>
          </div>
          
          <div className="p-6">
            {withdrawMessage && (
              <div className={`mb-4 p-4 rounded-lg ${
                withdrawMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <div className="flex items-center space-x-2">
                  {withdrawMessage.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span>{withdrawMessage.text}</span>
                </div>
              </div>
            )}

            {withdrawablePurchases.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No funds available for withdrawal</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {withdrawablePurchases.length} purchase(s) totaling ₹{
                    withdrawablePurchases.reduce((sum, p) => sum + (p.price_paid_inr || 0), 0).toFixed(2)
                  } available for withdrawal
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Select
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Buyer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {withdrawablePurchases.map((purchase) => (
                        <tr key={purchase.id} className={selectedPurchases.includes(purchase.id) ? 'bg-green-50' : ''}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedPurchases.includes(purchase.id)}
                              onChange={() => togglePurchaseSelection(purchase.id)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {purchase.crop_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                            {purchase.buyer_id?.substring(0, 8)}...
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">
                            ₹{purchase.price_paid_inr?.toFixed(2)} ({purchase.price_paid_eth} ETH)
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                              Pending Withdrawal
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedPurchases.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {selectedPurchases.length} purchase(s) selected
                    </p>
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {withdrawLoading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Wallet size={20} />
                      )}
                      <span>
                        {withdrawLoading ? 'Withdrawing...' : `Withdraw ${selectedPurchases.length} Purchase(s)`}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showWalletSwitchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Switch MetaMask Account</h3>
                <p className="text-gray-600 mb-4">
                  Funds can only be withdrawn by the farmer's wallet address.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-500 mb-1">Required Wallet:</div>
                  <div className="font-mono text-sm text-gray-900 break-all">
                    {requiredWalletAddress}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      try {
                        await window.ethereum?.request({
                          method: 'eth_requestAccounts'
                        });
                        const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
                        if (accounts && accounts.length > 0) {
                          const currentAccount = accounts[0].toLowerCase();
                          const required = requiredWalletAddress.toLowerCase();
                          if (currentAccount === required) {
                            setShowWalletSwitchModal(false);
                            handleWithdraw();
                          } else {
                            alert(`Wrong account. Please switch to: ${requiredWalletAddress}`);
                          }
                        }
                      } catch (e) {
                        console.error('Failed to request accounts:', e);
                      }
                    }}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Switch in MetaMask
                  </button>
                  
                  <button
                    onClick={() => setShowWalletSwitchModal(false)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}