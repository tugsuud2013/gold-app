import { apiClient } from './client';
import { AuthTokens } from '../types';

export const authApi = {
  login: (phoneNumber: string, password: string) =>
    apiClient.post<never, AuthTokens>('/auth/login', { phoneNumber, password }),

  register: (phoneNumber: string, password: string) =>
    apiClient.post<never, AuthTokens>('/auth/register', { phoneNumber, password }),

  sendOtp: (phoneNumber: string) =>
    apiClient.post<never, { expiresInSeconds: number }>('/auth/send-otp', { phoneNumber }),

  verifyOtp: (phoneNumber: string, otp: string) =>
    apiClient.post<never, { verified: boolean }>('/auth/verify-otp', { phoneNumber, otp }),

  logout: () => apiClient.post<never, { loggedOut: boolean }>('/auth/logout'),
};
