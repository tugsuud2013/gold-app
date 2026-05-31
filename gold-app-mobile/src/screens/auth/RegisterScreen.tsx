import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('Нууц үг таарахгүй байна.');
      return;
    }
    try {
      setLoading(true);
      await authApi.register(phone, password);
      navigation.navigate('Otp', { phone });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Бүртгэл үүсгэх</Text>
      <Input label="Утасны дугаар" value={phone} onChangeText={setPhone} />
      <Input label="Нууц үг" value={password} onChangeText={setPassword} secureTextEntry />
      <Input label="Нууц үг давтах" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="OTP код авах" fullWidth loading={loading} onPress={handleRequestOtp} />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Нэвтрэх
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  title: { ...theme.typography.h1, marginBottom: 20, textAlign: 'center', color: theme.colors.dark },
  link: { marginTop: 12, color: theme.colors.primary, textAlign: 'center' },
  error: { color: theme.colors.error, marginBottom: 10 },
});
