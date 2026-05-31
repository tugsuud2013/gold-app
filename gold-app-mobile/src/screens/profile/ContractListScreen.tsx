import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { usePurchase } from '../../hooks/usePurchase';
import { ContractViewer } from '../../components/purchase/ContractViewer';
import { formatDate, formatGrams } from '../../utils/formatters';

export const ContractListScreen = () => {
  const { purchasesQuery } = usePurchase();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = (purchasesQuery.data ?? []).find((p) => p.id === selectedId);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Миний гэрээнүүд</Text>
      <FlatList
        data={purchasesQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedId(item.id)}
            style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, marginBottom: 10 }}
          >
            <Text>№{item.id.slice(0, 8)}</Text>
            <Text>{formatDate(item.createdAt)}</Text>
            <Text>{formatGrams(item.grams)}</Text>
          </Pressable>
        )}
      />
      <ContractViewer
        visible={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        contractText={`Гэрээ №${selected?.id ?? ''}`}
        qrValue={selected?.id}
        onDownloadPdf={() => {}}
      />
    </View>
  );
};
