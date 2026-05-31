import { create } from 'zustand';
import { Wallet, WalletTransaction } from '../types';

interface WalletState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  setWallet: (wallet: Wallet) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  transactions: [],
  setWallet: (wallet) => set({ wallet }),
  setTransactions: (transactions) => set({ transactions }),
}));
