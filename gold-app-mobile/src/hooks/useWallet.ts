import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';

export const useWallet = () => {
  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
  });

  const transactionsQuery = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: walletApi.getTransactions,
  });

  return { walletQuery, transactionsQuery };
};
