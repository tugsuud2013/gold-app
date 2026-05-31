import { useState } from 'react';
import { Modal, Text, TextInput, View } from 'react-native';
import { Button } from '../common/Button';
import { sellRequestApi } from '../../api/sellRequest.api';

interface Props {
  visible: boolean;
  onClose: () => void;
  balance: number;
}

export const SellRequestModal = ({ visible, onClose, balance }: Props) => {
  const [grams, setGrams] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const value = Number(grams);
    if (!value || value <= 0) return setError('Хэмжээ оруулна уу.');
    if (value > balance) return setError('Үлдэгдлээс их хэмжээ оруулах боломжгүй.');
    try {
      setError('');
      setLoading(true);
      await sellRequestApi.create(value);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <View style={{ backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Алт зарах хүсэлт</Text>
          <Text style={{ marginTop: 8 }}>Үлдэгдэл: {balance} гр</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 10, padding: 10 }}
            keyboardType="numeric"
            value={grams}
            onChangeText={setGrams}
            placeholder="Хэмжээ (гр)"
          />
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 10, padding: 10, minHeight: 70 }}
            value={note}
            onChangeText={setNote}
            placeholder="Тайлбар (заавал биш)"
            multiline
          />
          <Text style={{ marginTop: 8, color: '#8B0000' }}>
            Та байгууллагын оффист очиж алтаа биетээр авна.
          </Text>
          {error ? <Text style={{ marginTop: 8, color: '#E74C3C' }}>{error}</Text> : null}
          <View style={{ marginTop: 12 }}>
            <Button title="Хүсэлт илгээх" fullWidth loading={loading} onPress={submit} />
          </View>
          <View style={{ marginTop: 8 }}>
            <Button title="Хаах" variant="ghost" fullWidth onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};
