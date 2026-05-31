import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../../theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  leftIcon,
  rightIcon,
}: Props) => {
  const [show, setShow] = useState(false);
  const isPassword = Boolean(secureTextEntry);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.errorBorder]}>
        {leftIcon}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? 'Энд оруулна уу'}
          secureTextEntry={isPassword && !show}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType={label.includes('Утас') ? 'phone-pad' : 'default'}
        />
        {isPassword ? (
          <Pressable onPress={() => setShow((v) => !v)}>
            <Text style={styles.toggle}>{show ? 'Нуух' : 'Харах'}</Text>
          </Pressable>
        ) : (
          rightIcon
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.md },
  label: { marginBottom: 6, color: theme.colors.textSecondary, fontWeight: '600' },
  inputWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, color: theme.colors.text },
  toggle: { color: theme.colors.primary, fontWeight: '600' },
  error: { marginTop: 4, color: theme.colors.error, fontSize: 12 },
  errorBorder: { borderColor: theme.colors.error },
});
