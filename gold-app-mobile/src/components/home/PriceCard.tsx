import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../common/Card';
import { theme } from '../../theme';

export const PriceCard = ({ price, changePercent }: { price: number; changePercent: number }) => (
  <Card style={styles.card}>
    <Text style={styles.label}>Одоогийн алтны ханш</Text>
    <Text style={styles.price}>₮{price.toLocaleString()}/г</Text>
    <View>
      <Text style={{ color: changePercent >= 0 ? theme.colors.success : theme.colors.error }}>
        {changePercent >= 0 ? '+' : ''}
        {changePercent.toFixed(2)}%
      </Text>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: { marginTop: 12 },
  label: { color: theme.colors.textSecondary },
  price: { ...theme.typography.h2, color: theme.colors.primary, marginTop: 4 },
});
