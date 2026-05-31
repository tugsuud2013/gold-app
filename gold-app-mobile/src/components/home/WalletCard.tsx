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
  <LinearGradient colors={['#1A1A1A', '#2A2210', '#8B6914']} style={styles.card}>
    <Text style={styles.label}>Таны алтны үлдэгдэл</Text>
    <Text style={styles.grams}>{grams.toFixed(3)} гр</Text>
    <Text style={styles.mnt}>≈ ₮{mnt.toLocaleString()}</Text>
    <View style={styles.badgeWrap}>
      <MembershipBadge membership={membership} />
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  label: { color: theme.colors.textSecondary, fontSize: 13 },
  grams: { color: theme.colors.primaryLight, fontWeight: '800', fontSize: 34, marginTop: 4 },
  mnt: { color: theme.colors.text, marginTop: 6, fontSize: 16 },
  badgeWrap: { marginTop: 12 },
});
