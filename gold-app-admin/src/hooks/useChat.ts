"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  buildThreadsFromLegacyMessages,
  filterThreadsClient,
  mapLegacyMessages,
  parseChatThreads,
  type ChatFilters,
  type ChatMessageItem,
  type ChatThread,
} from "@/lib/chatUi";

function buildThreadsQuery(filters: ChatFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.unreadOnly) params.set("unreadOnly", "true");
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  const q = params.toString();
  return q ? `/api/admin/chat/threads?${q}` : "/api/admin/chat/threads";
}

async function fetchLegacyMessages() {
  const data = (await api.get("/api/admin/chat/messages?page=1&limit=500")) as {
    items?: unknown[];
  };
  return Array.isArray(data?.items) ? data.items : [];
}

async function fetchChatThreads(filters: ChatFilters): Promise<ChatThread[]> {
  try {
    const data = await api.get(buildThreadsQuery(filters));
    const threads = parseChatThreads(data);
    if (threads.length > 0) {
      return filterThreadsClient(threads, filters);
    }
  } catch {
    // fallback below
  }

  const legacyItems = await fetchLegacyMessages();
  const threads = buildThreadsFromLegacyMessages(legacyItems as Parameters<typeof buildThreadsFromLegacyMessages>[0]);
  return filterThreadsClient(threads, filters);
}

export function useChatThreads(filters: ChatFilters) {
  return useQuery<ChatThread[]>({
    queryKey: ["chat-threads", filters],
    queryFn: () => fetchChatThreads(filters),
    refetchInterval: 15000,
  });
}

export function useChatThreadMessages(userId: string | null) {
  return useQuery<{ items: ChatMessageItem[]; total: number }>({
    queryKey: ["chat-thread-messages", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      try {
        const data = (await api.get(`/api/admin/chat/threads/${userId}/messages?limit=200`)) as {
          items?: ChatMessageItem[];
          total?: number;
        };
        const items = Array.isArray(data?.items) ? data.items : [];
        return { items, total: data?.total ?? items.length };
      } catch {
        const legacyItems = await fetchLegacyMessages();
        const items = mapLegacyMessages(
          legacyItems as Parameters<typeof mapLegacyMessages>[0],
          userId!,
        );
        return { items, total: items.length };
      }
    },
    refetchInterval: 10000,
  });
}

function invalidateChat(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["chat-threads"] });
  qc.invalidateQueries({ queryKey: ["chat-thread-messages"] });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) =>
      api.post(`/api/admin/chat/threads/${userId}/messages`, { message }),
    onSuccess: () => invalidateChat(qc),
  });
}

export function useMarkChatRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => api.put(`/api/admin/chat/threads/${userId}/read`, {}),
    onSuccess: () => invalidateChat(qc),
  });
}

export function useCloseChatThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => api.put(`/api/admin/chat/threads/${userId}/close`, {}),
    onSuccess: () => invalidateChat(qc),
  });
}

export function useOpenChatThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => api.put(`/api/admin/chat/threads/${userId}/open`, {}),
    onSuccess: () => invalidateChat(qc),
  });
}

export function useBanChatUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => api.put(`/api/admin/chat/threads/${userId}/ban`, {}),
    onSuccess: () => invalidateChat(qc),
  });
}

export function useUnbanChatUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => api.put(`/api/admin/chat/threads/${userId}/unban`, {}),
    onSuccess: () => invalidateChat(qc),
  });
}
