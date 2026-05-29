import { useState, useEffect, useCallback, useRef } from 'react';
import { isMetaMaskInstalled } from './blockchain';

export const WalletInfo = {
  address: null,
  chainId: null,
  isConnected: false,
};

const SEPOLIA_CHAIN_ID = '0xaa36a7';

export function useWallet() {
  const [wallet, setWallet] = useState({
    address: null,
    chainId: null,
    isConnected: false,
  });
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      alert('MetaMask is not installed. Please install MetaMask to use this feature.');
      return null;
    }

    setLoading(true);
    
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('[Wallet] Current chain ID:', currentChainId);

      if (currentChainId?.toLowerCase() !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
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
          }
        }
      }

      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      } catch (err) {
        if (err.code === 4001) {
          setLoading(false);
          alert('Connection request rejected. Please approve in MetaMask.');
          return null;
        }
        console.warn('wallet_requestPermissions failed:', err);
      }

      const accountsPromise = window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 8000)
      );
      
      const accounts = await Promise.race([accountsPromise, timeoutPromise]);

      console.log('[Wallet] Connected accounts:', accounts);

      if (!accounts || accounts.length === 0) {
        alert('No accounts found. Please unlock MetaMask and try again.');
        setLoading(false);
        return null;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      const newWallet = {
        address: accounts[0].toLowerCase(),
        chainId: chainId?.toLowerCase(),
        isConnected: true,
      };

      setWallet(newWallet);
      setLoading(false);
      return newWallet;
    } catch (error) {
      console.error('[Wallet] Connection error:', error);
      setLoading(false);
      if (error.message === 'Connection timeout') {
        alert('MetaMask connection timed out. Try again.');
      } else if (error.code === 4001) {
        alert('Connection request rejected. Please approve in MetaMask.');
      }
      return null;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
    });
  }, []);

  useEffect(() => {
    if (!isMetaMaskInstalled() || initialized.current) return;
    initialized.current = true;

    const handleAccountsChanged = (accounts) => {
      console.log('[Wallet] Accounts changed:', accounts);
      
      if (accounts && accounts.length > 0) {
        setWallet(prev => ({
          ...prev,
          address: accounts[0].toLowerCase(),
          isConnected: true,
        }));
      } else {
        setWallet({
          address: null,
          chainId: null,
          isConnected: false,
        });
      }
    };

    const handleChainChanged = (chainId) => {
      console.log('[Wallet] Chain changed:', chainId);
      setWallet(prev => ({
        ...prev,
        chainId: chainId.toLowerCase(),
      }));
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return {
    wallet,
    loading,
    connectWallet,
    disconnectWallet,
  };
}