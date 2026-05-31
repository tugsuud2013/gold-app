import { StyleSheet, Text, View } from 'react-native';
import { User } from '../../types';

type Membership = User['membership'];

const config: Record<Membership, { label: string; bg: string }> = {
  NORMAL: { label: 'Энгийн', bg: '#7f8c8d' },
  BRONZE: { label: '🥉 Хүрэл', bg: '#CD7F32' },
  SILVER: { label: '🥈 Мөнгөн', bg: '#A0AEC0' },
  GOLD: { label: '🥇 Алтан', bg: '#B8860B' },
};

export const MembershipBadge = ({ membership }: { membership: Membership }) => (
  <View style={[styles.badge, { backgroundColor: config[membership].bg }]}>
    <Text style={styles.text}>{config[membership].label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  text: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
