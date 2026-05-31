import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => undefined });

const colorMap: Record<ToastType, string> = {
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [visible, setVisible] = useState(false);
  const translateY = useMemo(() => new Animated.Value(-100), []);

  const showToast = (msg: string, nextType: ToastType = 'info') => {
    setMessage(msg);
    setType(nextType);
    setVisible(true);
    Animated.timing(translateY, { toValue: 16, duration: 220, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(translateY, { toValue: -100, duration: 220, useNativeDriver: true }).start(() => setVisible(false));
      }, 3000);
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible ? (
        <Animated.View style={[styles.toast, { backgroundColor: colorMap[type], transform: [{ translateY }] }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 10,
    zIndex: 1000,
  },
  text: { color: '#fff', fontWeight: '700' },
});
