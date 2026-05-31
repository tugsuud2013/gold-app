import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.logo}>◉</Text>
      <Text style={styles.title}>Нэвтрэх</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  logo: { fontSize: 40, color: theme.colors.primary, textAlign: 'center', marginBottom: 8 },
  title: { ...theme.typography.h1, color: theme.colors.dark, textAlign: 'center', marginBottom: 20 },
  link: { marginTop: 14, color: theme.colors.primary, textAlign: 'center' },
  error: { color: theme.colors.error, marginBottom: 10 },
});
