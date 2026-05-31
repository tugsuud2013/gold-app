import { apiClient } from './client';
import { Wallet, WalletTransaction } from '../types';

export const walletApi = {
  getWallet: () => apiClient.get<never, Wallet>('/wallet'),
  getTransactions: () =>
    apiClient.get<never, WalletTransaction[]>('/wallet/transactions'),
};
