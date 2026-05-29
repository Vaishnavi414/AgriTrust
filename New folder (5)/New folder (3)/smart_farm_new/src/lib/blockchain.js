// Blockchain functionality disabled for public deployment
// This file exports stub functions to avoid breaking imports
export const connectWallet = async () => null;
export const getPurchase = async () => null;
export const withdrawFunds = async () => ({ success: false, error: 'Blockchain features disabled' });
export const purchaseCrop = async () => ({ success: false, error: 'Blockchain features disabled' });
export const formatAddress = (address) => address || '';
export const formatBalance = (balance) => balance || '0';
export const isMetaMaskInstalled = () => false;
export const refreshWalletBalance = async () => '0';