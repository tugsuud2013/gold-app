import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { WalletCard } from '../../components/home/WalletCard';
import { PriceCard } from '../../components/home/PriceCard';
import { Card } from '../../components/common/Card';
import { useAuthStore } from '../../store/auth.store';
import { useWallet } from '../../hooks/useWallet';
import { useGoldPrice } from '../../hooks/useGoldPrice';
import { theme } from '../../theme';
import { KycStatusBanner } from '../../components/common/KycStatusBanner';
import { useNewsList } from '../../hooks/useNews';

export const HomeScreen = () => {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
  const { walletQuery, transactionsQuery } = useWallet();
  const priceQuery = useGoldPrice();
  const newsList = useNewsList();
  const previewNews = (newsList.data?.pages.flat() ?? []).slice(0, 2);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Header title={`Сайн байна уу, ${user?.fullName ?? 'Хэрэглэгч'}!`} />
      <KycStatusBanner kycStatus={user?.kycStatus} onVerify={() => navigation.getParent()?.navigate('Kyc')} />
      <WalletCard
        grams={walletQuery.data?.goldBalanceGrams ?? 2.5}
        mnt={walletQuery.data?.mntBalance ?? 800000}
        membership={user?.membership ?? 'NORMAL'}
      />
      <PriceCard price={priceQuery.data?.pricePerGram ?? 320000} changePercent={priceQuery.data?.changePercent ?? 1.23} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {[
          { label: '🛒 Худалдах', onPress: () => navigation.navigate('Худалдах') },
          { label: '📤 Зарах', onPress: () => navigation.navigate('Түрүүвч') },
          { label: '📋 Түүх', onPress: () => navigation.navigate('Түрүүвч') },
          { label: '💬 Чат', onPress: () => navigation.navigate('Chat') },
        ].map((item) => (
          <Text
            key={item.label}
            onPress={item.onPress}
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }}
          >
            {item.label}
          </Text>
        ))}
      </View>
      <Card style={{ marginTop: 12 }}>
        <Text style={styles.sectionTitle}>Сүүлийн гүйлгээнүүд</Text>
        {(transactionsQuery.data ?? []).slice(0, 3).map((tx) => (
          <View key={tx.id} style={styles.row}>
            <Text>{tx.description}</Text>
            <Text>{tx.grams} гр</Text>
          </View>
        ))}
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Text style={styles.sectionTitle}>Сүүлийн мэдээ</Text>
        {previewNews.map((n) => (
          <Text key={n.id} onPress={() => navigation.navigate('NewsDetail', { id: n.id })} style={{ marginBottom: 8 }}>
            • {n.title}
          </Text>
        ))}
        <Text onPress={() => navigation.navigate('GoldPrice')} style={{ color: theme.colors.primary, fontWeight: '700' }}>
          Дэлгэрэнгүй ханш
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16 },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.dark, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});
