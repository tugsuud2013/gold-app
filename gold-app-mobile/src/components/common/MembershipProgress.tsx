import { StyleSheet, Text, View } from 'react-native';
import { User } from '../../types';
import { formatGrams } from '../../utils/formatters';
import { MembershipBadge } from './MembershipBadge';

const nextLevelTarget: Record<User['membership'], number> = {
  NORMAL: 10,
  BRONZE: 30,
  SILVER: 60,
  GOLD: 100,
};

export const MembershipProgress = ({
  membership,
  totalGrams,
}: {
  membership: User['membership'];
  totalGrams: number;
}) => {
  const target = nextLevelTarget[membership];
  const progress = Math.min(1, totalGrams / target);
  const remaining = Math.max(0, target - totalGrams);

  return (
    <View style={styles.card}>
      <MembershipBadge membership={membership} />
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.text}>{formatGrams(remaining)} дараагийн түвшинд хүрнэ</Text>
      <Text style={styles.sub}>Давуу тал: бага шимтгэл, priority үйлчилгээ</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee' },
  barBg: { marginTop: 10, height: 10, borderRadius: 999, backgroundColor: '#eee', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#B8860B' },
  text: { marginTop: 8, fontWeight: '600' },
  sub: { marginTop: 6, color: '#666' },
});
