import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: Variant;
  size?: Size;
}

export const Button = ({
  title,
  onPress,
  loading,
  disabled,
  fullWidth,
  variant = 'primary',
  size = 'md',
}: Props) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? theme.colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: theme.borderRadius.md, alignItems: 'center' },
  fullWidth: { width: '100%' },
  text: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: theme.colors.primary },
  disabled: { opacity: 0.65 },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.primary },
  danger: { backgroundColor: theme.colors.error },
  ghost: { backgroundColor: 'transparent' },
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 12, paddingHorizontal: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 20 },
});
