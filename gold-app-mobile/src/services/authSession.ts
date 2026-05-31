import * as SecureStore from 'expo-secure-store';
import { userApi } from '../api/user.api';
import { AuthTokens } from '../types';
import { mapProfileToUser } from '../utils/mappers';
import { persistUserSnapshot, useAuthStore } from '../store/auth.store';
export const establishSession = async (tokens: AuthTokens) => {
  await SecureStore.setItemAsync('auth_token', tokens.accessToken);
  if (tokens.refreshToken) {
    await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
  }

  const profile = await userApi.getProfile();
  const user = mapProfileToUser(profile);
  useAuthStore.getState().setSession(tokens.accessToken, tokens.refreshToken ?? null, user);
  await persistUserSnapshot(user);
};
