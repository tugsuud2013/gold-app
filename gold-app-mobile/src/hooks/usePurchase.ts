import { useMutation, useQuery } from '@tanstack/react-query';
import { purchaseApi } from '../api/purchase.api';

export const usePurchase = () => {
  const purchasesQuery = useQuery({
    queryKey: ['purchases'],
    queryFn: purchaseApi.list,
  });

  const createPurchaseMutation = useMutation({
    mutationFn: (grams: number) => purchaseApi.create(grams),
  });

  return { purchasesQuery, createPurchaseMutation };
};
