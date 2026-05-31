import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (token, user) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isLoading: false });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  loadStoredAuth: async () => {
    set({ isLoading: true });
    const [token, userJson] = await Promise.all([
      SecureStore.getItemAsync('auth_token'),
      SecureStore.getItemAsync('auth_user'),
    ]);
    if (token && userJson) {
      set({
        token,
        user: JSON.parse(userJson) as User,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
