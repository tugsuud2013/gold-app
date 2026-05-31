import { apiClient } from './client';
import { KycPayload, User } from '../types';

export const userApi = {
  me: () => apiClient.get<never, User>('/users/me'),
  submitKyc: (payload: KycPayload) => apiClient.post('/api/user/kyc', payload),
};
