import { Text } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const MembershipCard = ({ tier }: { tier: 'NORMAL' | 'BRONZE' | 'SILVER' | 'GOLD' }) => (
  <Card style={{ marginTop: 12 }}>
    <Text style={{ marginBottom: 8 }}>Гишүүнчлэл</Text>
    <Badge label={tier} variant={tier} />
  </Card>
);
