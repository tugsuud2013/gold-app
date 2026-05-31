import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { establishSession } from '../../services/authSession';
import { useAuthStore } from '../../store/auth.store';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export const OtpScreen = ({ route }: Props) => {
  const pendingTokens = useAuthStore((s) => s.pendingTokens);
  const setPendingTokens = useAuthStore((s) => s.setPendingTokens);
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const submit = async (code = otp) => {
    if (code.length !== 6) return;
    setError('');
    try {
      setLoading(true);
      await authApi.verifyOtp(route.params.phone, code);
      if (!pendingTokens) {
        throw new Error('Бүртгэлийн мэдээлэл олдсонгүй. Дахин бүртгүүлнэ үү.');
      }
      await establishSession(pendingTokens);
      setPendingTokens(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      submit(otp);
    }
  }, [otp]);

  const resend = async () => {
    setError('');
    try {
      setResending(true);
      await authApi.sendOtp(route.params.phone);
      setSeconds(300);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Баталгаажуулах код</Text>
      <Text style={styles.phone}>{route.params.phone}</Text>
      <Text style={styles.hint}>Backend dev горимд OTP код server log дээр харагдана.</Text>
      <Input label="6 оронтой код" value={otp} onChangeText={setOtp} placeholder="123456" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.timer}>
        Үлдсэн хугацаа: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
      </Text>
      <Button title="Дахин код авах" disabled={seconds > 0} loading={resending} variant="secondary" onPress={resend} />
      <View style={{ height: 10 }} />
      <Button title="Баталгаажуулах" fullWidth loading={loading} onPress={() => submit()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 24, justifyContent: 'center' },
  title: { ...theme.typography.h2, textAlign: 'center', color: theme.colors.text, marginBottom: 8 },
  phone: { textAlign: 'center', marginBottom: 8, color: theme.colors.primary, fontWeight: '700' },
  hint: { textAlign: 'center', marginBottom: 16, color: theme.colors.textSecondary, fontSize: 12 },
  timer: { marginBottom: 12, textAlign: 'center', color: theme.colors.textSecondary },
  error: { color: theme.colors.error, marginBottom: 10, textAlign: 'center' },
});
