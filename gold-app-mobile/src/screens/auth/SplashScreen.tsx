import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

export const SplashScreen = () => (
  <View style={styles.container}>
    <Text style={styles.brand}>GoldApp</Text>
    <Text style={styles.title}>АЛТАН ТҮРҮҮВЧ</Text>
    <Text style={styles.subtitle}>Алтаа цахимаар эзэмш</Text>
    <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  brand: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: theme.colors.primary,
    fontWeight: '700',
  },
  title: { ...theme.typography.h2, color: theme.colors.text, marginTop: 12 },
  subtitle: { color: theme.colors.textSecondary, marginTop: 8 },
});
