import { ethers } from 'ethers';

export const GeneratedWallet = {
  address: '',
};

export const generateFarmerWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  
  return {
    address: wallet.address,
  };
};

export const isValidEthereumAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/i.test(address);
};