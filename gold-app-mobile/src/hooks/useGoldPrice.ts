import { useQuery } from '@tanstack/react-query';
import { goldPriceApi } from '../api/goldPrice.api';

export const useCurrentPrice = () =>
  useQuery({
    queryKey: ['gold-price-current'],
    queryFn: goldPriceApi.current,
    refetchInterval: 5 * 60 * 1000,
  });

export const usePriceHistory = (filter: '1d' | '7d' | '1m' | '6m' | '1y') =>
  useQuery({
    queryKey: ['gold-price-history', filter],
    queryFn: () => goldPriceApi.history(filter),
  });

export const useGoldPrice = useCurrentPrice;
