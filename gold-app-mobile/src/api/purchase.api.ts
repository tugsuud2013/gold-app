import { apiClient } from './client';
import { Purchase, PurchaseInitiateResponse } from '../types';

export const purchaseApi = {
  list: () => apiClient.get<never, Purchase[]>('/purchases'),
  create: (grams: number) => apiClient.post('/purchases', { grams }),
  initiate: (grams: number) =>
    apiClient.post<never, PurchaseInitiateResponse>('/api/purchase/initiate', { grams }),
  signContract: (id: string, signatureImageBase64: string) =>
    apiClient.post(`/api/purchase/${id}/sign-contract`, { signatureImageBase64 }),
  paymentStatus: (id: string) =>
    apiClient.get<never, { status: 'PENDING' | 'PAID' | 'EXPIRED'; transactionId?: string }>(
      `/api/purchase/${id}/payment-status`,
    ),
};
