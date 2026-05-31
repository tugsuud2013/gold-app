import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PurchaseFlowParams } from '../../navigation/MainNavigator';
import { purchaseApi } from '../../api/purchase.api';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<PurchaseFlowParams, 'Payment'>;

export const PaymentScreen = ({ route, navigation }: Props) => {
  const { purchaseId, grams, totalAmount, qrImageBase64 } = route.params;
  const [status, setStatus] = useState<'PENDING' | 'PAID' | 'EXPIRED'>('PENDING');
  const [seconds, setSeconds] = useState(30 * 60);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds === 0 && status !== 'PAID') {
      setStatus('EXPIRED');
      return;
    }
    if (status !== 'PENDING') return;
    const poll = setInterval(async () => {
      try {
        const result = await purchaseApi.paymentStatus(purchaseId);
        setStatus(result.status);
        if (result.status === 'PAID') {
          navigation.replace('PurchaseSuccess', {
            purchaseId,
            grams,
            totalAmount,
            transactionId: result.transactionId,
          });
        }
      } catch (_e) {}
    }, 3000);
    return () => clearInterval(poll);
  }, [purchaseId, status, navigation, grams, totalAmount, seconds]);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Төлбөр төлөх</Text>
      <View style={{ borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 12, marginTop: 12 }}>
        <Text>Алтны хэмжээ: {grams} гр</Text>
        <Text style={{ color: '#B8860B', fontWeight: '800', fontSize: 24 }}>Нийт дүн: ₮{totalAmount.toLocaleString()}</Text>
      </View>
      <Text style={{ marginTop: 12, fontWeight: '700' }}>QPay</Text>
      {qrImageBase64 ? (
        <Image source={{ uri: qrImageBase64 }} style={{ width: 220, height: 220, alignSelf: 'center', marginTop: 8 }} />
      ) : (
        <View style={{ width: 220, height: 220, alignSelf: 'center', backgroundColor: '#F4F4F4', marginTop: 8 }} />
      )}
      <Text style={{ textAlign: 'center', marginTop: 8 }}>QR кодыг банкны аппаар скан хийнэ үү</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {['Хаан банк', 'Голомт банк', 'Хас банк', 'Төрийн банк', 'Бусад банк'].map((bank) => (
          <View key={bank} style={{ minWidth: '48%' }}>
            <Button title={bank} variant="secondary" fullWidth onPress={() => {}} />
          </View>
        ))}
      </View>
      <Text style={{ marginTop: 12 }}>
        {status === 'PENDING' ? 'Төлбөр хүлээгдэж байна...' : status === 'EXPIRED' ? 'Хугацаа дууслаа' : 'Төлбөр амжилттай'}
      </Text>
      <Text>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text>
      <View style={{ marginTop: 'auto' }}>
        <Button title="Цуцлах" variant="ghost" fullWidth onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};
