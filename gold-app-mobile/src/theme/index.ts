export const theme = {
  colors: {
    primary: '#D4AF37',
    primaryDark: '#8B6914',
    primaryLight: '#F5D061',
    background: '#111111',
    surface: '#171717',
    surfaceElevated: '#1F1F1F',
    dark: '#FFFFFF',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    border: '#2A2A2A',
    tabBar: '#0D0D0D',
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 'bold' as const },
    h2: { fontSize: 22, fontWeight: 'bold' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
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
