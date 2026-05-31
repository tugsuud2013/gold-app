"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  computeSellRequestStats,
  filterSellRequestsClient,
  hasClientOnlySellFilters,
  type SellRequestFilters,
  type SellRequestStats,
  type SellRequestWithUser,
} from "@/lib/sellRequestsUi";
import { ActivityLog } from "@/types";

const EMPTY_STATS: SellRequestStats = {
  total: 0,
  pending: 0,
  approved: 0,
  completed: 0,
  cancelled: 0,
};

async function fetchAllSellRequests(): Promise<SellRequestWithUser[]> {
  const data = (await api.get("/api/admin/sell-requests")) as SellRequestWithUser[] | null;
  return Array.isArray(data) ? data : [];
}

export function useSellRequests(filters: SellRequestFilters) {
  return useQuery<SellRequestWithUser[]>({
    queryKey: ["sell-requests", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      const query = params.toString();
      const path = query ? `/api/admin/sell-requests?${query}` : "/api/admin/sell-requests";
      const data = (await api.get(path)) as SellRequestWithUser[] | null;
      const items = Array.isArray(data) ? data : [];
      return filterSellRequestsClient(items, {
        ...filters,
        status: undefined,
      });
    },
  });
}

export function useSellRequestStats(filters: Omit<SellRequestFilters, "status">) {
  return useQuery<SellRequestStats>({
    queryKey: ["sell-request-stats", filters],
    queryFn: async () => {
      if (hasClientOnlySellFilters(filters)) {
        const all = await fetchAllSellRequests();
        const scoped = filterSellRequestsClient(all, filters);
        return computeSellRequestStats(scoped);
      }

      try {
        const stats = (await api.get("/api/admin/sell-requests/stats")) as SellRequestStats | null;
        if (stats && typeof stats.total === "number") return stats;
      } catch {
        // fallback below
      }

      const all = await fetchAllSellRequests();
      return computeSellRequestStats(filterSellRequestsClient(all, filters));
    },
    placeholderData: EMPTY_STATS,
  });
}

export function useSellRequest(id: string) {
  return useQuery<SellRequestWithUser>({
    queryKey: ["sell-request", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get(`/api/admin/sell-requests/${id}`)) as SellRequestWithUser,
  });
}

export function useUserWalletForSell(userId: string) {
  return useQuery({
    queryKey: ["sell-request-wallet", userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      (await api.get(`/api/admin/users/${userId}/wallet`)) as {
        balanceGrams: number | string;
        totalPurchasedGrams?: number | string;
        totalSoldGrams?: number | string;
      },
  });
}

export function useSellRequestActivityLogs(requestId: string) {
  return useQuery<ActivityLog[]>({
    queryKey: ["sell-request-activity-logs", requestId],
    enabled: Boolean(requestId),
    queryFn: async () => {
      const data = (await api.get("/api/admin/logs?page=1&limit=100")) as {
        items?: ActivityLog[];
      };
      return (data.items ?? []).filter((log) => log.entityId === requestId);
    },
  });
}

export function useApproveSellRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/api/admin/sell-requests/${id}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sell-requests"] });
      qc.invalidateQueries({ queryKey: ["sell-request-stats"] });
      qc.invalidateQueries({ queryKey: ["sell-request"] });
    },
  });
}

export function useCompleteSellRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/api/admin/sell-requests/${id}/complete`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sell-requests"] });
      qc.invalidateQueries({ queryKey: ["sell-request-stats"] });
      qc.invalidateQueries({ queryKey: ["sell-request"] });
    },
  });
}

export function useCancelSellRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/api/admin/sell-requests/${id}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sell-requests"] });
      qc.invalidateQueries({ queryKey: ["sell-request-stats"] });
      qc.invalidateQueries({ queryKey: ["sell-request"] });
    },
  });
}
