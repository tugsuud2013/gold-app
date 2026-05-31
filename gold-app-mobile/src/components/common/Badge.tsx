import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

type Variant = 'NORMAL' | 'BRONZE' | 'SILVER' | 'GOLD' | 'success' | 'warning' | 'error';

export const Badge = ({ label, variant = 'NORMAL' }: { label: string; variant?: Variant }) => (
  <View style={[styles.base, styles[variant]]}>
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  text: { color: '#fff', fontSize: 12, fontWeight: '700' },
  NORMAL: { backgroundColor: '#7F8C8D' },
  BRONZE: { backgroundColor: '#CD7F32' },
  SILVER: { backgroundColor: '#95A5A6' },
  GOLD: { backgroundColor: theme.colors.primary },
  success: { backgroundColor: theme.colors.success },
  warning: { backgroundColor: theme.colors.warning },
  error: { backgroundColor: theme.colors.error },
});
