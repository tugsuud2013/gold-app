import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuthStore } from '../store/auth.store';
import { setUnauthorizedHandler } from '../api/client';
import { SplashScreen } from '../screens/auth/SplashScreen';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, loadStoredAuth, logout } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
    setUnauthorizedHandler(() => {
      logout();
    });
  }, [loadStoredAuth, logout]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return <NavigationContainer>{isAuthenticated ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>;
};
