import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export const OtpScreen = ({ navigation, route }: Props) => {
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(300);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const submit = async () => {
    try {
      setLoading(true);
      await authApi.verifyOtp(route.params.phone, code);
      navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      submit();
    }
  }, [code]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Баталгаажуулах код</Text>
      <Text style={styles.phone}>{route.params.phone}</Text>
      <Input label="6 оронтой код" value={code} onChangeText={setCode} placeholder="123456" />
      <Text style={styles.timer}>Үлдсэн хугацаа: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text>
      <Button title="Дахин код авах" disabled={seconds > 0} variant="secondary" onPress={() => setSeconds(300)} />
      <View style={{ height: 10 }} />
      <Button title="Баталгаажуулах" fullWidth loading={loading} onPress={submit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  title: { ...theme.typography.h2, textAlign: 'center', color: theme.colors.dark, marginBottom: 8 },
  phone: { textAlign: 'center', marginBottom: 20, color: theme.colors.textSecondary },
  timer: { marginBottom: 12, textAlign: 'center' },
});
