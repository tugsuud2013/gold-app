import { Text } from 'react-native';
import { Card } from '../common/Card';

export const PriceSummary = ({ grams, pricePerGram }: { grams: number; pricePerGram: number }) => (
  <Card style={{ marginTop: 12 }}>
    <Text>{grams} гр x ₮{pricePerGram.toLocaleString()}</Text>
    <Text style={{ fontSize: 20, fontWeight: '700', marginTop: 8 }}>
      Нийт: ₮{(grams * pricePerGram).toLocaleString()}
    </Text>
  </Card>
);
