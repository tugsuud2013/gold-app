import { useState } from 'react';
import { Text, View } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../api/client';
import { useToast } from '../../components/common/Toast';

export const ChangePasswordScreen = ({ navigation }: any) => {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (newPassword !== confirmPassword) return setError('Шинэ нууц үг таарахгүй байна.');
    try {
      setLoading(true);
      setError('');
      await apiClient.put('/api/user/change-password', { currentPassword, newPassword });
      showToast('Нууц үг амжилттай солигдлоо', 'success');
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Нууц үг солих</Text>
      <Input label="Одоогийн нууц үг" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
      <Input label="Шинэ нууц үг" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <Input label="Шинэ нууц үг давтах" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      {error ? <Text style={{ color: '#E74C3C', marginBottom: 8 }}>{error}</Text> : null}
      <Button title="Хадгалах" fullWidth loading={loading} onPress={save} />
    </View>
  );
};
