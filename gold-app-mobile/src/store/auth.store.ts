import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthTokens, User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  pendingTokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, refreshToken: string | null, user: User) => void;
  setPendingTokens: (tokens: AuthTokens | null) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  pendingTokens: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (token, refreshToken, user) => {
    set({
      token,
      refreshToken,
      user,
      pendingTokens: null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setPendingTokens: (tokens) => set({ pendingTokens: tokens }),

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('auth_user');
    set({
      user: null,
      token: null,
      refreshToken: null,
      pendingTokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    const [token, refreshToken, userJson] = await Promise.all([
      SecureStore.getItemAsync('auth_token'),
      SecureStore.getItemAsync('refresh_token'),
      SecureStore.getItemAsync('auth_user'),
    ]);

    if (token && userJson) {
      set({
        token,
        refreshToken,
        user: JSON.parse(userJson) as User,
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    set({
      user: null,
      token: null,
      refreshToken: null,
      pendingTokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

export const persistUserSnapshot = async (user: User) => {
  await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
};
