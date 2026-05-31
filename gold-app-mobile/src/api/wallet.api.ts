import { apiClient } from './client';
import {
  BackendWalletBalance,
  BackendWalletTransaction,
  PaginatedResponse,
  Wallet,
  WalletTransaction,
} from '../types';
import { mapWalletBalance, mapWalletTransaction } from '../utils/mappers';

export const walletApi = {
  getBalance: async (pricePerGram = 0): Promise<Wallet> => {
    const balance = await apiClient.get<never, BackendWalletBalance>('/wallet/balance');
    return mapWalletBalance(balance, pricePerGram);
  },

  getTransactions: async (page = 1, limit = 20): Promise<WalletTransaction[]> => {
    const data = await apiClient.get<never, PaginatedResponse<BackendWalletTransaction>>(
      `/wallet/transactions?page=${page}&limit=${limit}`,
    );
    return (data.items ?? []).map(mapWalletTransaction);
  },
};
