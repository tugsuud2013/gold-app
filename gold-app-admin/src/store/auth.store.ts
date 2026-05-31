"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { clearAuthSession, setAuthSession } from "@/lib/auth";
import { AdminUser } from "@/types";

type AuthState = {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (admin: AdminUser, token: string) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (admin, token) => {
        setAuthSession(token, admin);
        Cookies.set("admin_token", token, { expires: 7 });
        set({ admin, token, isAuthenticated: true });
      },
      logout: () => {
        clearAuthSession();
        set({ admin: null, token: null, isAuthenticated: false });
      },
      hydrateFromStorage: () => {
        if (typeof window === "undefined") return;
        const token = Cookies.get("admin_token") ?? localStorage.getItem("admin_token");
        const adminRaw = localStorage.getItem("admin_user");
        const admin = adminRaw ? (JSON.parse(adminRaw) as AdminUser) : null;
        set({
          token: token ?? null,
          admin,
          isAuthenticated: Boolean(token),
          hasHydrated: true,
        });
      },
    }),
    {
      name: "gold-admin-auth",
      onRehydrateStorage: () => (state) => {
        state?.hydrateFromStorage();
      },
    },
  ),
);
