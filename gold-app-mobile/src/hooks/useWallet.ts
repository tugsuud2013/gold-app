import { useQuery } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';
import { useGoldPrice } from './useGoldPrice';

export const useWallet = () => {
  const priceQuery = useGoldPrice();
  const pricePerGram = priceQuery.data?.pricePerGram ?? 0;

  const walletQuery = useQuery({
    queryKey: ['wallet', pricePerGram],
    queryFn: () => walletApi.getBalance(pricePerGram),
  });

  const transactionsQuery = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletApi.getTransactions(1, 20),
  });

  return { walletQuery, transactionsQuery, priceQuery };
};
