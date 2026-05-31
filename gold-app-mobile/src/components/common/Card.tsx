import { Pressable, StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../../theme';

interface Props extends ViewProps {
  onPress?: () => void;
}

export const Card = ({ children, onPress, style }: Props) => {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.card, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
