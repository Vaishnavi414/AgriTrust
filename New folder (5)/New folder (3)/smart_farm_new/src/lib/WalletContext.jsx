import { createContext, useContext } from 'react';
import { useWallet } from './useWallet';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const walletHook = useWallet();

  return (
    <WalletContext.Provider value={walletHook}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}