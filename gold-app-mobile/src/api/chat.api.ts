import { apiClient } from './client';
import { ChatMessage } from '../types';

export const chatApi = {
  messages: () => apiClient.get<never, ChatMessage[]>('/chat/messages'),
  send: (message: string) => apiClient.post('/chat/messages', { message }),
};
