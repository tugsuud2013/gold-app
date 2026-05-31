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
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
