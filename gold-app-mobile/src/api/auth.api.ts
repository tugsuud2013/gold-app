import { apiClient } from './client';
import { AuthResponse } from '../types';

export const authApi = {
  login: (phone: string, password: string) =>
    apiClient.post<never, AuthResponse>('/auth/login', { phone, password }),
  register: (phone: string, password: string) =>
    apiClient.post('/auth/register', { phone, password }),
  verifyOtp: (phone: string, code: string) =>
    apiClient.post('/auth/verify-otp', { phone, code }),
};
