"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { GoldPriceAdmin, GoldPriceChartFilter, GoldPriceChartPoint } from "@/lib/goldPriceUi";

type HistoryResponse = {
  page: number;
  limit: number;
  total: number;
  items: GoldPriceAdmin[];
};

type ChartResponse = {
  prices: GoldPriceChartPoint[];
  filter: GoldPriceChartFilter;
};

export function useCurrentGoldPrice() {
  return useQuery<GoldPriceAdmin | null>({
    queryKey: ["gold-price-current"],
    queryFn: async () => (await api.get("/api/admin/gold-price/current")) as GoldPriceAdmin | null,
  });
}

export function useGoldPriceLatest() {
  return useQuery<{ latest: GoldPriceAdmin | undefined; previous: GoldPriceAdmin | undefined }>({
    queryKey: ["gold-price-latest"],
    queryFn: async () => {
      const data = (await api.get("/api/admin/gold-price/history?page=1&limit=2")) as HistoryResponse;
      const items = data?.items ?? [];
      return { latest: items[0], previous: items[1] };
    },
  });
}

export function useGoldPriceRecords() {
  return useQuery<GoldPriceAdmin[]>({
    queryKey: ["gold-price-records"],
    queryFn: async () => {
      const data = (await api.get("/api/admin/gold-price/history?page=1&limit=100")) as HistoryResponse;
      return data?.items ?? [];
    },
  });
}

export function useGoldPriceHistory(page: number, limit = 20) {
  return useQuery<HistoryResponse>({
    queryKey: ["gold-price-history", page, limit],
    queryFn: async () =>
      (await api.get(`/api/admin/gold-price/history?page=${page}&limit=${limit}`)) as HistoryResponse,
  });
}

export function useGoldPriceChart(filter: GoldPriceChartFilter) {
  return useQuery<ChartResponse>({
    queryKey: ["gold-price-chart", filter],
    queryFn: async () =>
      (await api.get(`/api/admin/gold-price/chart?filter=${filter}`)) as ChartResponse,
  });
}

export function useUpdateGoldPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      mongolBankPrice: number;
      buyPrice: number;
      sellPrice: number;
      note?: string;
    }) => api.post("/api/admin/gold-price", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gold-price-latest"] });
      qc.invalidateQueries({ queryKey: ["gold-price-records"] });
      qc.invalidateQueries({ queryKey: ["gold-price-history"] });
    },
  });
}
