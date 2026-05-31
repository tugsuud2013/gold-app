import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/components/common/Toast';
import { useNotifications } from './src/hooks/useNotifications';

const queryClient = new QueryClient();

const AppBootstrap = () => {
  useNotifications();

  useEffect(() => {
    const sub = AppState.addEventListener('change', (_state) => {
      // Socket болон query урсгалууд screen-level hook дээр дахин холбогдоно.
    });
    return () => sub.remove();
  }, []);

  return <RootNavigator />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <StatusBar style="dark" />
            <AppBootstrap />
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
