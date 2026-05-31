import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { MembershipBadge } from '../common/MembershipBadge';
import { theme } from '../../theme';

export const WalletCard = ({
  grams,
  mnt,
  membership,
}: {
  grams: number;
  mnt: number;
  membership: 'NORMAL' | 'BRONZE' | 'SILVER' | 'GOLD';
}) => (
  <LinearGradient colors={[theme.colors.primaryDark, theme.colors.primaryLight]} style={styles.card}>
    <Text style={styles.label}>Таны алт</Text>
    <Text style={styles.grams}>{grams} гр</Text>
    <Text style={styles.mnt}>~ ₮{mnt.toLocaleString()}</Text>
    <View style={{ marginTop: 10 }}>
      <MembershipBadge membership={membership} />
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 18 },
  label: { color: '#fff', opacity: 0.9 },
  grams: { color: '#fff', fontWeight: '800', fontSize: 32 },
  mnt: { color: '#fff', marginTop: 4 },
});
