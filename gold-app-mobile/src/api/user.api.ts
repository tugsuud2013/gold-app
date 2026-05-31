import { apiClient } from './client';
import { BackendUserProfile, KycPayload } from '../types';

export const userApi = {
  getProfile: () => apiClient.get<never, BackendUserProfile>('/user/profile'),
  submitKyc: (payload: KycPayload) => apiClient.post('/user/kyc', payload),
};
