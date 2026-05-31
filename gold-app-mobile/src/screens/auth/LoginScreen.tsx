import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { loginMutation } = useAuth();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>GoldApp</Text>
        <Text style={styles.title}>Нэвтрэх</Text>
        <Text style={styles.subtitle}>Алтаа цахимаар удирдаарай</Text>
        <Input label="Утасны дугаар" value={phone} onChangeText={setPhone} placeholder="99112233" />
        <Input
          label="Нууц үг"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Нууц үгээ оруулна уу"
        />
        {loginMutation.error ? <Text style={styles.error}>{loginMutation.error.message}</Text> : null}
        <Button
          title="Нэвтрэх"
          fullWidth
          loading={loginMutation.isPending}
          onPress={() => loginMutation.mutate({ phone, password })}
        />
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Бүртгэл үүсгэх
        </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
          Нууц үг мартсан?
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  brand: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  title: { ...theme.typography.h1, color: theme.colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  link: { marginTop: 14, color: theme.colors.primary, textAlign: 'center' },
  error: { color: theme.colors.error, marginBottom: 10 },
});
