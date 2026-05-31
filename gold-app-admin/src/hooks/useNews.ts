"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  computeNewsStats,
  type NewsAdmin,
  type NewsFilters,
  type NewsStats,
} from "@/lib/newsUi";
import { ActivityLog } from "@/types";

const EMPTY_STATS: NewsStats = { total: 0, published: 0, draft: 0, archived: 0 };

function parseNewsList(data: unknown): NewsAdmin[] {
  if (Array.isArray(data)) return data as NewsAdmin[];
  if (data && typeof data === "object" && "items" in data) {
    const items = (data as { items?: unknown }).items;
    return Array.isArray(items) ? (items as NewsAdmin[]) : [];
  }
  return [];
}

async function fetchNewsList(filters: NewsFilters): Promise<NewsAdmin[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.title) params.set("title", filters.title);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.author) params.set("author", filters.author);
  const q = params.toString();
  const path = q ? `/api/admin/news?${q}` : "/api/admin/news";
  const data = await api.get(path);
  return parseNewsList(data);
}

export function useNewsList(filters: NewsFilters) {
  return useQuery<NewsAdmin[]>({
    queryKey: ["news-list", filters],
    queryFn: () => fetchNewsList(filters),
  });
}

export function useNewsStats() {
  return useQuery<NewsStats>({
    queryKey: ["news-stats"],
    queryFn: async () => {
      try {
        const stats = (await api.get("/api/admin/news/stats")) as NewsStats | null;
        if (stats && typeof stats.total === "number") return stats;
      } catch {
        // fallback below
      }
      const items = await fetchNewsList({});
      return computeNewsStats(items);
    },
    placeholderData: EMPTY_STATS,
  });
}

export function useNewsItem(id: string) {
  return useQuery<NewsAdmin>({
    queryKey: ["news-item", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get(`/api/admin/news/${id}`)) as NewsAdmin,
  });
}

export function useNewsActivityLogs(newsId: string) {
  return useQuery<ActivityLog[]>({
    queryKey: ["news-activity", newsId],
    enabled: Boolean(newsId),
    queryFn: async () => {
      try {
        const logs = (await api.get("/api/admin/logs?page=1&limit=100")) as {
          items?: ActivityLog[];
        } | ActivityLog[];
        const items = Array.isArray(logs) ? logs : (logs?.items ?? []);
        return items.filter((log) => log.entity === "News" && log.entityId === newsId);
      } catch {
        return [];
      }
    },
  });
}

function invalidateNews(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["news-list"] });
  qc.invalidateQueries({ queryKey: ["news-stats"] });
  qc.invalidateQueries({ queryKey: ["news-item"] });
  qc.invalidateQueries({ queryKey: ["news-activity"] });
}

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => api.post("/api/admin/news", payload),
    onSuccess: () => invalidateNews(qc),
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      api.put(`/api/admin/news/${id}`, payload),
    onSuccess: () => invalidateNews(qc),
  });
}

export function usePublishNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.put(`/api/admin/news/${id}/publish`, {}),
    onSuccess: () => invalidateNews(qc),
  });
}

export function useArchiveNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.put(`/api/admin/news/${id}/archive`, {}),
    onSuccess: () => invalidateNews(qc),
  });
}

export function useDraftNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.put(`/api/admin/news/${id}/draft`, {}),
    onSuccess: () => invalidateNews(qc),
  });
}

export function useDeleteNewsPermanent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/api/admin/news/${id}/permanent`),
    onSuccess: () => invalidateNews(qc),
  });
}
