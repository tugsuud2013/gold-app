import { Platform } from 'react-native';

const API_PATH = '/api';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export const getApiBaseUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (fromEnv) {
    const normalized = normalizeBaseUrl(fromEnv);
    return normalized.endsWith(API_PATH) ? normalized : `${normalized}${API_PATH}`;
  }

  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:3000${API_PATH}`;
};
