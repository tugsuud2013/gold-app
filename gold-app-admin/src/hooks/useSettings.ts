"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ActivityLog, AdminUser } from "@/types";
import type { AppSettings, AppSettingsSection } from "@/lib/settingsUi";

export function useAppSettings() {
  return useQuery<AppSettings>({
    queryKey: ["app-settings"],
    queryFn: () => api.get("/api/admin/settings"),
  });
}

export function useUpdateAppSettingsSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ section, value }: { section: AppSettingsSection; value: Record<string, unknown> }) =>
      api.put(`/api/admin/settings/${section}`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app-settings"] }),
  });
}

export function useActivityLogs(page = 1, adminId?: string, enabled = true) {
  return useQuery<{ items: ActivityLog[]; total: number; page: number; limit: number }>({
    queryKey: ["activity-logs", page, adminId],
    enabled,
    retry: false,
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (adminId) params.set("adminId", adminId);
        return await api.get(`/api/admin/logs?${params.toString()}`);
      } catch {
        return { items: [], total: 0, page: 1, limit: 20 };
      }
    },
  });
}

export function useMembershipConfig() {
  return useQuery<Array<{ id: string; level: string; minGrams: number | string; updatedAt: string }>>({
    queryKey: ["settings-membership-config"],
    queryFn: () => api.get("/api/admin/membership/config"),
  });
}

export function useUpdateMembershipConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (configs: Array<{ level: string; minGrams: number }>) =>
      api.put("/api/admin/membership/config", { configs }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings-membership-config"] }),
  });
}

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ["settings-admin-users"],
    queryFn: () => api.get("/api/admin/admins"),
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; password: string; role: string }) =>
      api.post("/api/admin/admins", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings-admin-users"] }),
  });
}

export function useUpdateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role, status }: { id: string; role?: string; status?: string }) =>
      api.put(`/api/admin/admins/${id}`, { role, status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings-admin-users"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.post("/api/admin/auth/change-password", payload),
  });
}
