import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../../hooks/useWallet';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SellRequestModal } from '../../components/wallet/SellRequestModal';
import { ContractViewer } from '../../components/purchase/ContractViewer';
import { useAuthStore } from '../../store/auth.store';
import { theme } from '../../theme';

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

  const goToTrade = () => navigation.getParent()?.navigate('Худалдаа');

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Wallet</Text>
          <LinearGradient colors={['#1A1A1A', '#2A2210', '#8B6914']} style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Миний алт</Text>
            <Text style={styles.balanceGrams}>{walletQuery.data?.goldBalanceGrams?.toFixed(3) ?? '0.000'} гр</Text>
            <Text style={styles.balanceMnt}>≈ ₮{(walletQuery.data?.mntBalance ?? 0).toLocaleString()}</Text>
            <View style={{ marginTop: 8 }}>
              <Badge label={user?.membership ?? 'NORMAL'} variant={user?.membership ?? 'NORMAL'} />
            </View>
          </LinearGradient>
          <View style={styles.actions}>
            <Pressable style={styles.actionChip} onPress={goToTrade}>
              <Text style={styles.actionText}>Худалдах</Text>
            </Pressable>
            <Pressable style={styles.actionChip} onPress={() => setSellVisible(true)}>
              <Text style={styles.actionText}>Зарах</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Гүйлгээний түүх</Text>
          <View style={styles.filters}>
            {[
              { key: 'ALL', label: 'Бүгд' },
              { key: 'PURCHASE', label: 'Худалдан авалт' },
              { key: 'SELL', label: 'Зарсан' },
            ].map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key as typeof filter)}
                style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          {filteredTransactions.map((t) => (
            <Card key={t.id} style={{ marginBottom: 10 }}>
              <Pressable onPress={() => setContractVisible(true)}>
                <View style={styles.txRow}>
                  <View>
                    <Text style={styles.txTitle}>{t.description}</Text>
                    <Text style={styles.txMeta}>{new Date(t.createdAt).toLocaleString()}</Text>
                  </View>
                  <Text style={[styles.txAmount, t.type === 'SELL' && styles.txSell]}>
                    {t.type === 'PURCHASE' ? '+' : '-'}
                    {t.grams.toFixed(3)} гр
                  </Text>
                </View>
              </Pressable>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: theme.colors.text },
  balanceCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)' },
  balanceLabel: { color: theme.colors.textSecondary },
  balanceGrams: { color: theme.colors.primaryLight, fontSize: 34, fontWeight: '800' },
  balanceMnt: { color: theme.colors.text },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionChip: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionText: { color: theme.colors.primary, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: theme.colors.text },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(212,175,55,0.12)' },
  filterText: { color: theme.colors.textSecondary },
  filterTextActive: { color: theme.colors.primary, fontWeight: '700' },
  txRow: { flexDirection: 'row', justifyContent: 'space-between' },
  txTitle: { color: theme.colors.text, fontWeight: '600' },
  txMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  txAmount: { color: theme.colors.success, fontWeight: '700' },
  txSell: { color: theme.colors.error },
});
