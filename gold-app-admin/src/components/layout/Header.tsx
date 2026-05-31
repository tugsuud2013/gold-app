"use client";

import { Bell, ChevronDown, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuthStore } from "@/store/auth.store";
import RoleBadge from "@/components/ui/RoleBadge";

const titles: Record<string, string> = {
  "/": "Нүүр",
  "/dashboard": "Dashboard",
  "/users": "Хэрэглэгчид",
  "/purchases": "Худалдан авалт",
  "/sell-requests": "Зарах хүсэлт",
  "/gold-price": "Алтны ханш удирдлага",
  "/news": "Мэдээ мэдээлэл",
  "/chat": "Чат дэмжлэг",
  "/reports": "Тайлан удирдлага",
  "/settings": "Тохиргоо удирдлага",
  "/settings/logs": "Тохиргоо удирдлага",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuthStore();
  const crumbs = pathname.split("/").filter(Boolean);

  return (
    <header className="admin-topbar flex h-16 shrink-0 items-center justify-between px-4 md:px-6">
      <div className="min-w-0">
        <h1 className="admin-topbar-title truncate text-lg font-semibold text-white">
          {titles[pathname] ?? "Админ"}
        </h1>
        <p className="admin-topbar-crumb truncate text-xs">
          {["Dashboard", ...crumbs.map((c) => decodeURIComponent(c))].join(" › ")}
        </p>
      </div>
      <div className="admin-topbar-actions flex shrink-0 items-center gap-2 sm:gap-3">
        <button type="button" className="admin-topbar-icon-btn rounded-lg p-2" aria-label="Мэдэгдэл">
          <Bell size={18} />
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="admin-topbar-user-btn flex items-center gap-2.5 rounded-lg px-2.5 py-2 sm:gap-3 sm:px-3"
            >
              <UserCircle size={20} className="shrink-0 text-[#D4AF37]" />
              <span className="hidden max-w-[120px] truncate text-sm text-white md:inline lg:max-w-[160px]">
                {admin?.name ?? "Admin"}
              </span>
              <span className="hidden sm:inline-flex">
                <RoleBadge role={admin?.role ?? "OPERATOR"} />
              </span>
              <ChevronDown size={16} className="shrink-0 text-[#9CA3AF]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className="admin-dropdown z-50 min-w-[11rem] rounded-xl p-1.5 shadow-lg"
            align="end"
            sideOffset={8}
          >
            <DropdownMenu.Item className="admin-dropdown-item cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none">
              Profile
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="admin-dropdown-item admin-dropdown-item--danger cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
