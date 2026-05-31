import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../types';
import { useAuthStore } from '../store/auth.store';

export const useChat = () => {
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useMemo<Socket | null>(() => {
    if (!token) return null;
    return io(process.env.EXPO_PUBLIC_API_URL ?? '', {
      auth: { token },
      transports: ['websocket'],
    });
  }, [token]);

  useEffect(() => {
    if (!socket) return;
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('getHistory');
    });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('history', (items: ChatMessage[]) => {
      setMessages(items);
      setIsLoading(false);
    });
    socket.on('newMessage', (message: ChatMessage) => {
      setMessages((prev) => [message, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const sendMessage = (text: string) => {
    if (!socket || !text.trim()) return;
    socket.emit('sendMessage', text.trim());
  };

  const loadMoreMessages = () => {
    socket?.emit('getHistory', { before: messages[messages.length - 1]?.createdAt });
  };

  return { messages, isConnected, isLoading, sendMessage, loadMoreMessages };
};
