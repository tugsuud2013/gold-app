"use client";

import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardRouteLayout({ children }: PropsWithChildren) {
  const { isAuthenticated, token, hasHydrated, hydrateFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, token, router]);

  if (!hasHydrated) return <div className="p-6 text-sm text-slate-500">Шалгаж байна...</div>;
  if (!isAuthenticated || !token) return null;
  return <DashboardLayout>{children}</DashboardLayout>;
}
