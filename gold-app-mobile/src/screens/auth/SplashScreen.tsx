import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

export const SplashScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigation?.canGoBack !== undefined) {
        navigation.navigate?.('Login');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>◉</Text>
      <Text style={styles.title}>АЛТАН ТҮРҮҮВЧ</Text>
      <Text style={styles.subtitle}>Алтаа цахимаар эзэмш</Text>
      <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  logo: { fontSize: 56, color: theme.colors.primary },
  title: { ...theme.typography.h2, color: theme.colors.dark, marginTop: 12 },
  subtitle: { color: theme.colors.textSecondary, marginTop: 8 },
});
