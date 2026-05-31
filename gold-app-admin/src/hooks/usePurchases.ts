"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  computePurchaseStats,
  filterPurchasesClient,
  hasClientOnlyPurchaseFilters,
  mapPurchaseStatusFilter,
  type PurchaseFilters,
  type PurchaseStats,
  type PurchaseWithUser,
} from "@/lib/purchasesUi";
import { PaginatedResponse, ActivityLog } from "@/types";

const EMPTY_STATS: PurchaseStats = {
  total: 0,
  pending: 0,
  paid: 0,
  completed: 0,
  cancelled: 0,
};

function buildPurchaseParams(filters: PurchaseFilters, page: number, limit: number) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const apiStatus = mapPurchaseStatusFilter(filters.status);
  if (apiStatus) params.set("status", apiStatus);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.dateFrom) params.set("startDate", filters.dateFrom);
  if (filters.dateTo) params.set("endDate", filters.dateTo);
  return params;
}

function buildStatsParams(filters: Omit<PurchaseFilters, "status">) {
  const params = new URLSearchParams();
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.dateFrom) params.set("startDate", filters.dateFrom);
  if (filters.dateTo) params.set("endDate", filters.dateTo);
  return params;
}

function normalizePurchaseList(
  result: unknown,
  page: number,
  limit: number,
): PaginatedResponse<PurchaseWithUser> {
  if (!result || typeof result !== "object") {
    return { page, limit, total: 0, items: [] };
  }

  const data = result as PaginatedResponse<PurchaseWithUser>;
  return {
    page: data.page ?? page,
    limit: data.limit ?? limit,
    total: data.total ?? 0,
    items: Array.isArray(data.items) ? data.items : [],
  };
}

async function fetchAllPurchases(
  filters: Omit<PurchaseFilters, "status">,
): Promise<PurchaseWithUser[]> {
  const limit = 100;
  let page = 1;
  let total = 0;
  const items: PurchaseWithUser[] = [];

  while (page <= 50) {
    const params = buildPurchaseParams({ ...filters }, page, limit);
    const raw = await api.get(`/api/admin/purchases?${params.toString()}`);
    const data = normalizePurchaseList(raw, page, limit);
    total = data.total;

    if (!data.items.length) break;

    items.push(...data.items);
    if (items.length >= total) break;

    page += 1;
  }

  return items;
}

async function fetchPurchaseStats(filters: Omit<PurchaseFilters, "status">): Promise<PurchaseStats> {
  const clientOnly = hasClientOnlyPurchaseFilters(filters);

  if (!clientOnly) {
    try {
      const params = buildStatsParams(filters);
      const query = params.toString();
      const path = query ? `/api/admin/purchases/stats?${query}` : "/api/admin/purchases/stats";
      const stats = (await api.get(path)) as PurchaseStats | null;

      if (stats && typeof stats.total === "number") {
        return stats;
      }
    } catch {
      // Fall back to client-side aggregation below.
    }
  }

  const allItems = await fetchAllPurchases(filters);
  const scoped = filterPurchasesClient(allItems, { ...filters, status: undefined });
  return computePurchaseStats(scoped);
}

export function usePurchases(filters: PurchaseFilters, page: number, limit = 20) {
  return useQuery<PaginatedResponse<PurchaseWithUser>>({
    queryKey: ["purchases", filters, page, limit],
    queryFn: async () => {
      const raw = await api.get(
        `/api/admin/purchases?${buildPurchaseParams(filters, page, limit).toString()}`,
      );
      return normalizePurchaseList(raw, page, limit);
    },
  });
}

export function usePurchase(id: string) {
  return useQuery<PurchaseWithUser>({
    queryKey: ["purchase", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get(`/api/admin/purchases/${id}`)) as PurchaseWithUser,
  });
}

export function usePurchaseStats(filters: Omit<PurchaseFilters, "status">) {
  return useQuery<PurchaseStats>({
    queryKey: ["purchase-stats", filters],
    queryFn: () => fetchPurchaseStats(filters),
    placeholderData: EMPTY_STATS,
  });
}

export function usePurchaseActivityLogs(purchaseId: string) {
  return useQuery<ActivityLog[]>({
    queryKey: ["purchase-activity-logs", purchaseId],
    enabled: Boolean(purchaseId),
    queryFn: async () => {
      const data = (await api.get("/api/admin/logs?page=1&limit=100")) as PaginatedResponse<ActivityLog>;
      return (data.items ?? []).filter((log) => log.entityId === purchaseId);
    },
  });
}

export function getPurchaseContractUrl(purchaseId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  return `${base}/api/admin/purchases/${purchaseId}/contract`;
}
