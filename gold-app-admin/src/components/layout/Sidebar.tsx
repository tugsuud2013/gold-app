"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpCircle,
  BarChart2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Newspaper,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import GoldAppLogo from "@/components/public/GoldAppLogo";
import RoleBadge from "@/components/ui/RoleBadge";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Хэрэглэгчид", icon: Users },
  { href: "/purchases", label: "Худалдан авалт", icon: ShoppingCart },
  { href: "/sell-requests", label: "Зарах хүсэлт", icon: ArrowUpCircle },
  { href: "/gold-price", label: "Алтны ханш", icon: TrendingUp },
  { href: "/news", label: "Мэдээ мэдээлэл", icon: Newspaper },
  { href: "/chat", label: "Чат", icon: MessageSquare },
  { href: "/reports", label: "Тайлан", icon: BarChart2 },
  { href: "/settings", label: "Тохиргоо", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const { data: pendingKyc } = useQuery<{ total: number }>({
    queryKey: ["sidebar-pending-kyc"],
    queryFn: async () => (await api.get("/api/admin/users?kycStatus=PENDING&page=1&limit=1")) as { total: number },
  });

  return (
    <aside
      className={`admin-sidebar flex min-h-screen flex-col transition-all duration-200 ${collapsed ? "w-20" : "w-64"}`}
    >
      <div
        className={`admin-sidebar-brand flex shrink-0 ${collapsed ? "h-[4.25rem] flex-col items-center justify-center gap-1.5 px-2" : "h-16 flex-row items-center justify-between gap-2 px-3"}`}
      >
        <GoldAppLogo
          size={collapsed ? "sidebarCompact" : "sidebar"}
          href="/dashboard"
        />
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={`admin-sidebar-toggle shrink-0 rounded-lg p-1.5 ${collapsed ? "" : "ml-auto"}`}
          aria-label={collapsed ? "Sidebar нээх" : "Sidebar хураах"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active ? "admin-sidebar-link--active" : ""}`}
            >
              <Icon size={18} />
              {!collapsed && (
                <div className="flex w-full items-center justify-between">
                  <span>{item.label}</span>
                  {item.href === "/users" && (pendingKyc?.total ?? 0) > 0 && (
                    <span className="admin-sidebar-badge rounded-full px-2 py-0.5 text-[10px] font-bold">
                      {pendingKyc?.total}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-footer mt-auto shrink-0 p-3">
        {!collapsed && (
          <div className="mb-3 text-xs">
            <p className="font-medium text-white">{admin?.name ?? "Admin"}</p>
            <div className="mt-1">
              <RoleBadge role={admin?.role ?? "OPERATOR"} />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="admin-sidebar-logout flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm"
        >
          <LogOut size={16} /> {!collapsed && "Гарах"}
        </button>
      </div>
    </aside>
  );
}
