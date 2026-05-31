import { Text, View } from 'react-native';
import { theme } from '../../theme';

export const EmptyState = ({ message = 'Өгөгдөл алга.' }: { message?: string }) => (
  <View style={{ padding: 20, alignItems: 'center' }}>
    <Text style={{ color: theme.colors.textSecondary }}>{message}</Text>
  </View>
);
