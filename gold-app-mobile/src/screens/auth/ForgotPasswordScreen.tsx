import { StyleSheet, Text, View } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useState } from 'react';
import { theme } from '../../theme';

export const ForgotPasswordScreen = () => {
  const [phone, setPhone] = useState('');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Нууц үг сэргээх</Text>
      <Input label="Утасны дугаар" value={phone} onChangeText={setPhone} />
      <Button title="Код илгээх" fullWidth onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { ...theme.typography.h2, marginBottom: 16, textAlign: 'center', color: theme.colors.dark },
});
