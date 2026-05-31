import { useRef, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { PurchaseFlowParams } from '../../navigation/MainNavigator';
import { useAuthStore } from '../../store/auth.store';
import { purchaseApi } from '../../api/purchase.api';

type Props = NativeStackScreenProps<PurchaseFlowParams, 'Contract'>;

export const ContractScreen = ({ route, navigation }: Props) => {
  const { grams, pricePerGram } = route.params;
  const totalAmount = grams * pricePerGram;
  const user = useAuthStore((s) => s.user);
  const [atBottom, setAtBottom] = useState(false);
  const [resign, setResign] = useState(false);
  const [signature, setSignature] = useState(user?.signatureImageBase64 ?? '');
  const [loading, setLoading] = useState(false);
  const signatureRef = useRef<any>(null);

  const submit = async () => {
    try {
      setLoading(true);
      const initiated = await purchaseApi.initiate(grams);
      await purchaseApi.signContract(initiated.id, signature);
      navigation.navigate('Payment', {
        purchaseId: initiated.id,
        grams,
        totalAmount,
        qrImageBase64: initiated.qr_image ?? initiated.qrImageBase64,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        onScroll={({ nativeEvent }) => {
          const isBottom =
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 24;
          setAtBottom(isBottom);
        }}
        scrollEventThrottle={120}
      >
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 10 }}>Худалдан авах гэрээ</Text>
        <Text style={{ fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>АЛТ ХУДАЛДАН АВАХ ГЭРЭЭ</Text>
        <Text>Худалдан авагч: {user?.fullName ?? '-'}</Text>
        <Text>Регистр: {user?.registerNumber ? `${user.registerNumber.slice(0, 2)}****${user.registerNumber.slice(-4)}` : '-'}</Text>
        <Text>Утас: {user?.phone ?? '-'}</Text>
        <View style={{ marginTop: 10 }}>
          <Text>Хэмжээ: {grams} грамм</Text>
          <Text>Нэгж үнэ: ₮{pricePerGram.toLocaleString()}</Text>
          <Text>Нийт дүн: ₮{totalAmount.toLocaleString()}</Text>
          <Text>Огноо: {new Date().toLocaleDateString()}</Text>
        </View>
        <View style={{ marginTop: 12, gap: 8 }}>
          <Text>1. Энэхүү гэрээ нь алтыг цахимаар худалдан авах нөхцөлийг тодорхойлно.</Text>
          <Text>2. Төлбөр бүрэн баталгаажсаны дараа алт хэрэглэгчийн түрүүвчинд шилжинэ.</Text>
          <Text>3. Мэдээлэл зөрүүтэй тохиолдолд байгууллагын дотоод журам мөрдөнө.</Text>
        </View>
        <Text style={{ marginTop: 14, fontWeight: '700' }}>Гарын үсэг зурах</Text>
        {signature && !resign ? (
          <>
            <Image source={{ uri: signature }} style={{ width: '100%', height: 120, borderWidth: 1, borderColor: '#DDD' }} />
            <View style={{ marginTop: 8 }}>
              <Button title="Дахин зурах" variant="secondary" onPress={() => setResign(true)} />
            </View>
          </>
        ) : (
          <View style={{ height: 200, borderWidth: 1, borderColor: '#DDD', marginTop: 8, overflow: 'hidden' }}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={(sig) => {
                setSignature(sig);
                setResign(false);
              }}
              descriptionText=""
              clearText="Арилгах"
              confirmText="Хадгалах"
            />
          </View>
        )}
      </ScrollView>
      <View style={{ padding: 16 }}>
        <Button title="Гэрээ баталгаажуулах" fullWidth disabled={!atBottom || !signature} loading={loading} onPress={submit} />
      </View>
    </View>
  );
};
