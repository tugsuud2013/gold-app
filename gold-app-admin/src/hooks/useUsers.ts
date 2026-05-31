"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedResponse, Purchase, SellRequest, User, Wallet, ActivityLog } from "@/types";

export type UserFilters = {
  search?: string;
  status?: string;
  kycStatus?: string;
  membershipLevel?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function useUsers(filters: UserFilters, page: number) {
  return useQuery<PaginatedResponse<User & { wallet?: Wallet | null }>>({
    queryKey: ["users", filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.kycStatus) params.set("kycStatus", filters.kycStatus);
      if (filters.membershipLevel) params.set("membershipLevel", filters.membershipLevel);
      return (await api.get(`/api/admin/users?${params.toString()}`)) as PaginatedResponse<
        User & { wallet?: Wallet | null }
      >;
    },
  });
}

export function useUser(id: string) {
  return useQuery<User & { wallet?: Wallet | null }>({
    queryKey: ["user", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get(`/api/admin/users/${id}`)) as User & { wallet?: Wallet | null },
  });
}

export function useUserWallet(id: string) {
  return useQuery<Wallet & { transactions: any[] }>({
    queryKey: ["user-wallet", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get(`/api/admin/users/${id}/wallet`)) as Wallet & { transactions: any[] },
  });
}

export function useUserPurchases(id: string) {
  return useQuery<PaginatedResponse<Purchase>>({
    queryKey: ["user-purchases", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get(`/api/admin/purchases?userId=${id}&page=1&limit=50`)) as PaginatedResponse<Purchase>,
  });
}

export function useUserSellRequests(id: string) {
  return useQuery<SellRequest[]>({
    queryKey: ["user-sell-requests", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get(`/api/admin/sell-requests?userId=${id}`)) as SellRequest[],
  });
}

export function useUserActivityLogs(userId: string) {
  return useQuery<ActivityLog[]>({
    queryKey: ["user-activity-logs", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const data = (await api.get("/api/admin/logs?page=1&limit=100")) as PaginatedResponse<ActivityLog>;
      return (data.items ?? []).filter(
        (log) => log.entityId === userId || log.userId === userId,
      );
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" }) =>
      api.put(`/api/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useUpdateMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, membershipLevel }: { id: string; membershipLevel: string }) =>
      api.put(`/api/admin/users/${id}/membership`, { membershipLevel }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useChatBan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isChatBanned }: { id: string; isChatBanned: boolean }) =>
      api.put(`/api/admin/users/${id}/chat-ban`, { isChatBanned }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useUpdateKycStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: "VERIFIED" | "REJECTED"; note?: string }) =>
      api.put(`/api/admin/users/${id}/kyc-status`, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
