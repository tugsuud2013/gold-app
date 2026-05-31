import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { useGoldPrice } from '../../hooks/useGoldPrice';
import { KycStatusBanner } from '../../components/common/KycStatusBanner';
import { useAuthStore } from '../../store/auth.store';
import { PurchaseFlowParams } from '../../navigation/MainNavigator';

const quickOptions = [0.5, 1, 2, 5, 10];

type Props = NativeStackScreenProps<PurchaseFlowParams, 'PurchaseMain'>;

export const PurchaseScreen = ({ navigation }: Props) => {
  const [grams, setGrams] = useState(2.5);
  const user = useAuthStore((s) => s.user);
  const price = useGoldPrice();
  const currentPrice = price.data?.pricePerGram ?? 320000;
  const canPurchase = user?.kycStatus === 'APPROVED' || user?.kycStatus === 'VERIFIED';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }} contentContainerStyle={{ gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Алт худалдан авах</Text>
      <KycStatusBanner
        kycStatus={user?.kycStatus}
        onVerify={() => navigation.getParent()?.getParent()?.navigate('Kyc')}
      />
      <View style={{ borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 12 }}>
        <Text style={{ color: '#666' }}>Алтны ханш</Text>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>₮{currentPrice.toLocaleString()}/г</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>
          Шинэчлэгдсэн: {new Date(price.data?.updatedAt ?? Date.now()).toLocaleTimeString()}
        </Text>
        <Text style={{ marginTop: 4, color: (price.data?.changePercent ?? 0) >= 0 ? '#27AE60' : '#E74C3C' }}>
          {(price.data?.changePercent ?? 0) >= 0 ? '▲' : '▼'} {(price.data?.changePercent ?? 0).toFixed(2)}%
        </Text>
      </View>
      <Text style={{ fontWeight: '700' }}>Хэдэн грамм авах вэ?</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Button title="-" size="sm" onPress={() => setGrams((g) => Math.max(0.5, +(g - 0.5).toFixed(1)))} />
        <View style={{ flex: 1 }}>
          <Slider minimumValue={0.5} maximumValue={10} step={0.5} value={grams} onValueChange={setGrams} />
        </View>
        <Button title="+" size="sm" onPress={() => setGrams((g) => Math.min(10, +(g + 0.5).toFixed(1)))} />
      </View>
      <Text style={{ fontSize: 30, fontWeight: '800', textAlign: 'center' }}>{grams} гр</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {quickOptions.map((value) => (
          <Pressable
            key={value}
            onPress={() => setGrams(value)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderRadius: 999,
              borderColor: value === grams ? '#B8860B' : '#DDD',
            }}
          >
            <Text>{value}г</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 12 }}>
        <Text>Хэмжээ: {grams} гр</Text>
        <Text>Нэгж үнэ: ₮{currentPrice.toLocaleString()}/г</Text>
        <Text style={{ fontWeight: '800', color: '#B8860B', fontSize: 24 }}>
          Нийт дүн: ₮{(grams * currentPrice).toLocaleString()}
        </Text>
      </View>
      <Button
        title="Гэрээтэй танилцах"
        fullWidth
        disabled={!canPurchase}
        onPress={() => navigation.navigate('Contract', { grams, pricePerGram: currentPrice })}
      />
    </ScrollView>
  );
};
