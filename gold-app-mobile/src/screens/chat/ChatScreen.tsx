import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../hooks/useWallet';
import { useChat } from '../../hooks/useChat';
import { useAuthStore } from '../../store/auth.store';
import { MembershipBadge } from '../../components/common/MembershipBadge';
import { formatDate, getTimeAgo } from '../../utils/formatters';

export const ChatScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { walletQuery } = useWallet();
  const { messages, isConnected, isLoading, sendMessage, loadMoreMessages } = useChat();
  const [text, setText] = useState('');

  const balance = walletQuery.data?.goldBalanceGrams ?? 0;
  const isBanned = false;
  const grouped = useMemo(() => messages, [messages]);

  if (balance <= 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 44 }}>🔒</Text>
        <Text style={{ marginTop: 10 }}>Чат ашиглахын тулд алт худалдан авна уу</Text>
        <Pressable onPress={() => navigation.navigate('Худалдах')} style={{ marginTop: 12 }}>
          <Text style={{ color: '#B8860B', fontWeight: '700' }}>Алт худалдах</Text>
        </Pressable>
      </View>
    );
  }

  if (isBanned) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text>Таны чат хандалт хязгаарлагдсан байна</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F6F6' }}>
      <View style={{ padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Алт эзэмшигчдийн чат</Text>
        <Text style={{ color: isConnected ? '#27AE60' : '#E74C3C' }}>● {isConnected ? '24 онлайн' : 'offline'}</Text>
      </View>
      <FlatList
        data={grouped}
        inverted
        onEndReached={loadMoreMessages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item, index }) => {
          const own = item.senderId === user?.id;
          const prev = grouped[index + 1];
          const showDate = !prev || formatDate(prev.createdAt) !== formatDate(item.createdAt);
          return (
            <View>
              {showDate ? <Text style={{ textAlign: 'center', color: '#777', marginVertical: 8 }}>{formatDate(item.createdAt)}</Text> : null}
              <View style={{ alignItems: own ? 'flex-end' : 'flex-start' }}>
                {!own ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 12 }}>{item.senderName ?? 'Хэрэглэгч'}</Text>
                    <MembershipBadge membership={item.senderMembership ?? 'NORMAL'} />
                  </View>
                ) : null}
                <View
                  style={{
                    maxWidth: '80%',
                    padding: 10,
                    borderRadius: 12,
                    backgroundColor: own ? '#B8860B' : '#fff',
                    shadowColor: '#000',
                    shadowOpacity: 0.07,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Text style={{ color: own ? '#fff' : '#1a1a1a' }}>{item.message}</Text>
                </View>
                <Text style={{ fontSize: 11, color: '#777', marginTop: 2 }}>{getTimeAgo(item.createdAt)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#777' }}>{isLoading ? 'Уншиж байна...' : 'Мессеж алга'}</Text>}
      />
      <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Зурвас бичих..."
          style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}
        />
        <Pressable
          onPress={() => {
            sendMessage(text);
            setText('');
          }}
          style={{ marginLeft: 8, backgroundColor: '#B8860B', borderRadius: 20, paddingHorizontal: 14, justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
};
