import { Image, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNewsDetail } from '../../hooks/useNews';
import { formatDate } from '../../utils/formatters';

type Props = NativeStackScreenProps<any>;

export const NewsDetailScreen = ({ route, navigation }: Props) => {
  const id = route?.params?.id as string;
  const detail = useNewsDetail(id);
  const item = detail.data;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: '#1A2942', fontWeight: '700' }}>Буцах</Text>
        </Pressable>
        <Pressable onPress={() => Share.share({ message: `https://example.com/news/${id}` })}>
          <Text style={{ color: '#1A2942', fontWeight: '700' }}>Хуваалцах</Text>
        </Pressable>
      </View>
      {item?.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 220 }} />
      ) : (
        <View style={{ width: '100%', height: 220, backgroundColor: '#ddd' }} />
      )}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '800' }}>{item?.title}</Text>
        <Text style={{ color: '#666', marginTop: 6 }}>{formatDate(item?.publishedAt ?? new Date())}</Text>
        <Text style={{ marginTop: 12, lineHeight: 22 }}>{item?.content ?? '...'}</Text>
      </View>
    </ScrollView>
  );
};
