"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { buildReportQuery, type ReportFilters, type ReportSummary } from "@/lib/reportsUi";
import type { PurchaseReport, UserReport } from "@/types";

function reportPath(path: string, filters: ReportFilters) {
  return `/api/admin/reports/${path}?${buildReportQuery(filters)}`;
}

export function useReportSummary(filters: ReportFilters) {
  return useQuery<ReportSummary>({
    queryKey: ["report-summary", filters],
    queryFn: () => api.get(reportPath("summary", filters)),
  });
}

export function usePurchaseReport(filters: ReportFilters) {
  return useQuery<PurchaseReport>({
    queryKey: ["report-purchase", filters],
    queryFn: () => api.get(reportPath("purchases", filters)),
  });
}

export function useUserReport(filters: ReportFilters) {
  return useQuery<UserReport & { dailyBreakdown?: Array<{ date: string; count: number }> }>({
    queryKey: ["report-user", filters],
    queryFn: () => api.get(reportPath("users", filters)),
  });
}

export function useSellReport(filters: ReportFilters) {
  return useQuery<{
    totalRequests: number;
    totalGrams: number;
    totalAmount: number;
    completedCount: number;
    pendingCount: number;
    dailyBreakdown: Array<{ date: string; count: number; grams: number; amount: number }>;
  }>({
    queryKey: ["report-sells", filters],
    queryFn: () => api.get(reportPath("sells", filters)),
  });
}

export function useRevenueReport(filters: ReportFilters) {
  return useQuery<{
    totalRevenue: number;
    totalTransactions: number;
    dailyBreakdown: Array<{ date: string; revenue: number; count: number }>;
  }>({
    queryKey: ["report-revenue", filters],
    queryFn: () => api.get(reportPath("revenue", filters)),
  });
}

export function useGoldMovementReport(filters: ReportFilters) {
  return useQuery<{
    totalPurchasedGrams: number;
    totalSoldGrams: number;
    netGoldInSystem: number;
    topUsersByBalance: Array<{
      balanceGrams: number;
      totalPurchasedGrams: number;
      user: {
        id: string;
        phoneNumber: string;
        firstName?: string | null;
        lastName?: string | null;
        membershipLevel?: string;
      };
    }>;
  }>({
    queryKey: ["report-gold-movement", filters],
    queryFn: () => api.get(reportPath("gold-movement", filters)),
  });
}
