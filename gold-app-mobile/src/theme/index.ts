import { TextStyle } from 'react-native';

export const theme = {
  colors: {
    primary: '#B8860B',
    primaryDark: '#8B6914',
    primaryLight: '#FFD700',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    dark: '#1A2942',
    text: '#1A1A1A',
    textSecondary: '#666666',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    border: '#E0E0E0',
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 'bold' as TextStyle['fontWeight'] },
    h2: { fontSize: 22, fontWeight: 'bold' as TextStyle['fontWeight'] },
    h3: { fontSize: 18, fontWeight: '600' as TextStyle['fontWeight'] },
    body: { fontSize: 15 },
    caption: { fontSize: 12 },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export type Theme = typeof theme;
