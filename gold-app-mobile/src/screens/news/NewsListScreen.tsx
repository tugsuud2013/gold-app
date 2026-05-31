import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNewsList } from '../../hooks/useNews';
import { formatDate } from '../../utils/formatters';

export const NewsListScreen = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const news = useNewsList();
  const items = useMemo(() => news.data?.pages.flat() ?? [], [news.data]);
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <FlatList
      data={rest}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await news.refetch();
            setRefreshing(false);
          }}
        />
      }
      onEndReached={() => news.fetchNextPage()}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListHeaderComponent={
        <View>
          <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Мэдээ мэдээлэл</Text>
          {featured ? (
            <Pressable onPress={() => navigation.navigate('NewsDetail', { id: featured.id })}>
              <View style={{ borderRadius: 14, overflow: 'hidden' }}>
                {featured.imageUrl ? (
                  <Image source={{ uri: featured.imageUrl }} style={{ width: '100%', height: 180 }} />
                ) : (
                  <View style={{ width: '100%', height: 180, backgroundColor: '#ddd' }} />
                )}
                <View style={{ position: 'absolute', bottom: 0, width: '100%', padding: 12, backgroundColor: 'rgba(0,0,0,0.45)' }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{featured.title}</Text>
                  <Text style={{ color: '#fff', marginTop: 4 }}>{formatDate(featured.publishedAt)}</Text>
                </View>
              </View>
            </Pressable>
          ) : null}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('NewsDetail', { id: item.id })}
          style={{ flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={{ width: 90, height: 64, borderRadius: 8 }} />
          ) : (
            <View style={{ width: 90, height: 64, borderRadius: 8, backgroundColor: '#ddd' }} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700' }} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={{ color: '#666', marginTop: 4 }}>{formatDate(item.publishedAt)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
};
