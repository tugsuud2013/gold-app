import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../hooks/useWallet';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SellRequestModal } from '../../components/wallet/SellRequestModal';
import { ContractViewer } from '../../components/purchase/ContractViewer';
import { useAuthStore } from '../../store/auth.store';

export const WalletScreen = () => {
  const navigation = useNavigation<any>();
  const { walletQuery, transactionsQuery } = useWallet();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<'ALL' | 'PURCHASE' | 'SELL'>('ALL');
  const [sellVisible, setSellVisible] = useState(false);
  const [contractVisible, setContractVisible] = useState(false);

  const filteredTransactions = useMemo(
    () =>
      (transactionsQuery.data ?? []).filter((t) => {
        if (filter === 'ALL') return true;
        return t.type === filter;
      }),
    [transactionsQuery.data, filter],
  );

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 10 }}>Түрүүвч</Text>
        <LinearGradient
          colors={['#8B6914', '#FFD700']}
          style={{ borderRadius: 16, padding: 16, marginBottom: 12 }}
        >
          <Text style={{ color: '#fff' }}>Миний алт</Text>
          <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>
            {walletQuery.data?.goldBalanceGrams ?? 0} гр
          </Text>
          <Text style={{ color: '#fff' }}>≈ ₮{(walletQuery.data?.mntBalance ?? 0).toLocaleString()}</Text>
          <View style={{ marginTop: 8 }}>
            <Badge label={user?.membership ?? 'NORMAL'} variant={user?.membership ?? 'NORMAL'} />
          </View>
        </LinearGradient>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Pressable
              style={{ padding: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 10, alignItems: 'center' }}
              onPress={() => navigation.navigate('Худалдах')}
            >
              <Text>🛒 Худалдах</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Pressable
              style={{ padding: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 10, alignItems: 'center' }}
              onPress={() => setSellVisible(true)}
            >
              <Text>📤 Зарах</Text>
            </Pressable>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Гүйлгээний түүх</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {[
            { key: 'ALL', label: 'Бүгд' },
            { key: 'PURCHASE', label: 'Худалдан авалт' },
            { key: 'SELL', label: 'Зарсан' },
          ].map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key as any)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: filter === item.key ? '#B8860B' : '#DDD',
              }}
            >
              <Text>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        {filteredTransactions.map((t) => (
          <Card key={t.id} style={{ marginBottom: 10 }}>
            <Pressable onPress={() => setContractVisible(true)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text>{t.type === 'PURCHASE' ? '↑' : '↓'} {t.description}</Text>
                  <Text style={{ color: '#666' }}>{new Date(t.createdAt).toLocaleString()}</Text>
                </View>
                <Text style={{ color: t.type === 'PURCHASE' ? '#27AE60' : '#E74C3C' }}>
                  {t.type === 'PURCHASE' ? '+' : '-'}{t.grams} гр
                </Text>
              </View>
            </Pressable>
          </Card>
        ))}

        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Худалдан авалтын түүх</Text>
        {(transactionsQuery.data ?? [])
          .filter((t) => t.type === 'PURCHASE')
          .map((p) => (
            <Card key={`purchase-${p.id}`} style={{ marginBottom: 10 }}>
              <Pressable onPress={() => setContractVisible(true)}>
                <Text>{new Date(p.createdAt).toLocaleDateString()} - {p.grams} гр - ₮{p.amountMnt.toLocaleString()}</Text>
                <Badge label="SUCCESS" variant="success" />
              </Pressable>
            </Card>
          ))}
      </ScrollView>
      <SellRequestModal
        visible={sellVisible}
        onClose={() => setSellVisible(false)}
        balance={walletQuery.data?.goldBalanceGrams ?? 0}
      />
      <ContractViewer
        visible={contractVisible}
        onClose={() => setContractVisible(false)}
        contractText="Таны худалдан авалтын гэрээний дэлгэрэнгүй мэдээлэл."
        qrValue="purchase-contract"
      />
    </>
  );
};
