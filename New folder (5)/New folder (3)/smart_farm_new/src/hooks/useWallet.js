import { useState, useEffect, useCallback } from 'react';
import { 
  connectWallet, 
  refreshWalletBalance, 
  isMetaMaskInstalled,
  convertEthToInr,
  formatAddress,
  formatBalance,
  switchToSepolia
} from '../lib/blockchain';

export const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const walletState = await connectWallet();
    
    if (walletState) {
      setWallet(walletState);
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            setWallet(null);
          } else {
            connect();
          }
        });
        
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    } else {
      setError('Failed to connect wallet');
    }
    
    setLoading(false);
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setError(null);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!wallet?.address) return;
    
    try {
      const newBalance = await refreshWalletBalance(wallet.address);
      
      setWallet(prev => prev ? {
        ...prev,
        balance: (parseFloat(newBalance) * 1e18).toString(),
        balanceInEth: newBalance,
      } : null);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [wallet?.address]);

  useEffect(() => {
    if (isMetaMaskInstalled() && typeof window !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setWallet(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum?.on('accountsChanged', handleAccountsChanged);
      window.ethereum?.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    wallet,
    loading,
    error,
    connect,
    disconnect,
    refreshBalance,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    formatAddress,
    formatBalance,
    convertEthToInr,
  };
};