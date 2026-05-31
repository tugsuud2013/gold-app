import { apiClient } from './client';
import { Purchase, PurchaseInitiateResponse } from '../types';

export const purchaseApi = {
  list: () => apiClient.get<never, Purchase[]>('/purchase/history'),
  calculate: (grams: number) => apiClient.get<never, Record<string, unknown>>(`/purchase/calculate?grams=${grams}`),
  initiate: (grams: number) =>
    apiClient.post<never, PurchaseInitiateResponse>('/purchase/initiate', { grams }),
  signContract: (id: string, signatureImageBase64: string) =>
    apiClient.post(`/purchase/${id}/sign-contract`, { signatureImageBase64 }),
  paymentStatus: (id: string) =>
    apiClient.get<never, { status: 'PENDING' | 'PAID' | 'EXPIRED'; transactionId?: string }>(
      `/purchase/${id}/payment-status`,
    ),
};
