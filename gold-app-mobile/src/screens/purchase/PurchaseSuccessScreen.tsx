import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { PurchaseFlowParams } from '../../navigation/MainNavigator';

type Props = NativeStackScreenProps<PurchaseFlowParams, 'PurchaseSuccess'>;

export const PurchaseSuccessScreen = ({ route, navigation }: Props) => {
  const { purchaseId, grams, totalAmount, transactionId } = route.params;
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          backgroundColor: '#27AE60',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 40 }}>✓</Text>
      </View>
      <Text style={{ fontSize: 30, fontWeight: '800' }}>Амжилттай!</Text>
      <Text style={{ marginTop: 6, textAlign: 'center' }}>{grams} грамм алт таны түрүүвчинд нэмэгдлээ</Text>
      <View style={{ width: '100%', borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 12, marginTop: 16 }}>
        <Text>Гүйлгээний дугаар: #{transactionId ?? purchaseId.slice(0, 8)}</Text>
        <Text>Хэмжээ: {grams} гр</Text>
        <Text>Нийт дүн: ₮{totalAmount.toLocaleString()}</Text>
        <Text>Огноо: {new Date().toLocaleString()}</Text>
      </View>
      <View style={{ width: '100%', marginTop: 12, gap: 8 }}>
        <Button title="Гэрээ татах" fullWidth variant="secondary" onPress={() => {}} />
        <Button title="Түрүүвч харах" fullWidth onPress={() => navigation.getParent()?.getParent()?.navigate('Түрүүвч')} />
        <Button title="Нүүр хуудас" fullWidth variant="ghost" onPress={() => navigation.getParent()?.getParent()?.navigate('Нүүр')} />
      </View>
    </View>
  );
};
