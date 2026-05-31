import { ActivityIndicator, View } from 'react-native';
import { theme } from '../../theme';

export const LoadingSpinner = () => (
  <View style={{ padding: 16, alignItems: 'center' }}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);
