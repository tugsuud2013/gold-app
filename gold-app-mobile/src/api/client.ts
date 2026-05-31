import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getApiBaseUrl } from '../config/api';

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  async (response) => response.data?.data ?? response.data,
  async (error) => {
    if (error?.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');
      unauthorizedHandler?.();
      throw new Error('Нэвтрэх эрх хүчингүй болсон. Дахин нэвтэрнэ үү.');
    }

    const message =
      error?.response?.data?.message ||
      'Сервертэй холбогдоход алдаа гарлаа. Дахин оролдоно уу.';
    throw new Error(typeof message === 'string' ? message : 'Алдаа гарлаа.');
  },
);
