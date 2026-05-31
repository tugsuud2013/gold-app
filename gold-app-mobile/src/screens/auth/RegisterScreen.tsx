import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props) => {
  const setPendingTokens = useAuthStore((s) => s.setPendingTokens);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('Нууц үг таарахгүй байна.');
      return;
    }
    if (!/^[0-9]{8}$/.test(phone.trim())) {
      setError('Утасны дугаар 8 оронтой байх ёстой.');
      return;
    }

    try {
      setLoading(true);
      const tokens = await authApi.register(phone.trim(), password);
      setPendingTokens(tokens);
      await authApi.sendOtp(phone.trim());
      navigation.navigate('Otp', { phone: phone.trim() });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Бүртгэл үүсгэх</Text>
        <Input label="Утасны дугаар" value={phone} onChangeText={setPhone} placeholder="99112233" />
        <Input label="Нууц үг" value={password} onChangeText={setPassword} secureTextEntry />
        <Input label="Нууц үг давтах" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Бүртгүүлэх" fullWidth loading={loading} onPress={handleRegister} />
        <Text style={styles.hint}>Бүртгэлийн дараа OTP код илгээгдэнэ.</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Нэвтрэх
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { ...theme.typography.h1, marginBottom: 20, textAlign: 'center', color: theme.colors.text },
  hint: { marginTop: 10, color: theme.colors.textSecondary, textAlign: 'center', fontSize: 12 },
  link: { marginTop: 12, color: theme.colors.primary, textAlign: 'center' },
  error: { color: theme.colors.error, marginBottom: 10 },
});
