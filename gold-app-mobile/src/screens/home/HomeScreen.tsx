import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { WalletCard } from '../../components/home/WalletCard';
import { PriceCard } from '../../components/home/PriceCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/auth.store';
import { useWallet } from '../../hooks/useWallet';
import { theme } from '../../theme';
import { KycStatusBanner } from '../../components/common/KycStatusBanner';
import { useNewsList } from '../../hooks/useNews';

const txLabel = (type: string) => {
  if (type === 'PURCHASE') return 'Худалдан авалт';
  if (type === 'SELL') return 'Зарсан';
  return 'Гүйлгээ';
};

export const HomeScreen = () => {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
  const { walletQuery, transactionsQuery, priceQuery } = useWallet();
  const newsList = useNewsList();
  const previewNews = (newsList.data?.pages.flat() ?? []).slice(0, 2);

  const grams = walletQuery.data?.goldBalanceGrams ?? 0;
  const mnt = walletQuery.data?.mntBalance ?? 0;
  const price = priceQuery.data?.pricePerGram ?? 0;
  const changePercent = priceQuery.data?.changePercent ?? 0;

  const goToTab = (tabName: string) => {
    navigation.getParent()?.navigate(tabName);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Header title={`Сайн байна уу, ${user?.fullName ?? 'Хэрэглэгч'}!`} />
        <KycStatusBanner kycStatus={user?.kycStatus} onVerify={() => navigation.getParent()?.getParent()?.navigate('Kyc')} />

        {walletQuery.isLoading || priceQuery.isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 24 }} />
        ) : (
          <>
            <WalletCard grams={grams} mnt={mnt} membership={user?.membership ?? 'NORMAL'} />
            <PriceCard price={price} changePercent={changePercent} />
          </>
        )}

        <View style={styles.actions}>
          <View style={styles.actionBtn}>
            <Button title="Худалдах" fullWidth onPress={() => goToTab('Худалдаа')} />
          </View>
          <View style={styles.actionBtn}>
            <Button title="Зарах" fullWidth variant="secondary" onPress={() => goToTab('Wallet')} />
          </View>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Сүүлийн гүйлгээ</Text>
          {(transactionsQuery.data ?? []).length === 0 ? (
            <Text style={styles.empty}>Одоогоор гүйлгээ байхгүй.</Text>
          ) : (
            (transactionsQuery.data ?? []).slice(0, 5).map((tx) => (
              <View key={tx.id} style={styles.row}>
                <View>
                  <Text style={styles.txTitle}>{txLabel(tx.type)}</Text>
                  <Text style={styles.txMeta}>{new Date(tx.createdAt).toLocaleString()}</Text>
                </View>
                <Text style={[styles.txAmount, tx.type === 'SELL' && styles.txSell]}>
                  {tx.type === 'SELL' ? '-' : '+'}
                  {tx.grams.toFixed(3)} гр
                </Text>
              </View>
            ))
          )}
          <Pressable onPress={() => goToTab('Wallet')}>
            <Text style={styles.link}>Бүх гүйлгээг харах</Text>
          </Pressable>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Сүүлийн мэдээ</Text>
          {previewNews.map((n) => (
            <Pressable key={n.id} onPress={() => navigation.navigate('NewsDetail', { id: n.id })}>
              <Text style={styles.newsItem}>• {n.title}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => goToTab('Мэдээ')}>
            <Text style={styles.link}>Бүх мэдээг унших</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 32 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1 },
  section: { marginTop: 16 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  txTitle: { color: theme.colors.text, fontWeight: '600' },
  txMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  txAmount: { color: theme.colors.success, fontWeight: '700' },
  txSell: { color: theme.colors.error },
  empty: { color: theme.colors.textSecondary, marginBottom: 8 },
  link: { color: theme.colors.primary, fontWeight: '700', marginTop: 4 },
  newsItem: { color: theme.colors.text, marginBottom: 8 },
});
