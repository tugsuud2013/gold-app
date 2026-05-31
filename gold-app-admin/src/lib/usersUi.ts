import type { User } from "@/types";
import { formatDate } from "@/lib/utils";

export function getUserDisplayName(user: User) {
  const name = `${user.lastName ?? ""} ${user.firstName ?? ""}`.trim();
  return name || "—";
}

export function getUserInitials(user: User) {
  const name = getUserDisplayName(user);
  if (name === "—") return user.phoneNumber.slice(-2);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function membershipLabel(level: string) {
  if (level === "GOLD") return "Алтан";
  if (level === "SILVER") return "Мөнгөн";
  if (level === "BRONZE") return "Хүрэл";
  return "Энгийн";
}

export function kycLabel(status: string) {
  if (status === "VERIFIED") return "Баталгаажсан";
  if (status === "REJECTED") return "Татгалзсан";
  return "Хүлээгдэж буй";
}

export function statusLabel(status: string) {
  if (status === "ACTIVE") return "Идэвхтэй";
  if (status === "SUSPENDED") return "Хаагдсан";
  if (status === "DELETED") return "Устгасан";
  return status;
}

export function maskRegisterNumber(value?: string | null) {
  if (!value || value.length < 4) return "—";
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

export function filterUsersByDateRange<T extends { createdAt: string }>(
  items: T[],
  dateFrom?: string,
  dateTo?: string,
) {
  if (!dateFrom && !dateTo) return items;
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;
  return items.filter((item) => {
    const ts = new Date(item.createdAt).getTime();
    if (from !== null && ts < from) return false;
    if (to !== null && ts > to) return false;
    return true;
  });
}

export function exportUsersToCsv(users: Array<User & { wallet?: { balanceGrams?: number | string } | null }>) {
  const headers = ["Нэр", "Утас", "Регистр", "Membership", "KYC", "Status", "Created Date"];
  const rows = users.map((u) => [
    getUserDisplayName(u),
    u.phoneNumber,
    maskRegisterNumber(u.registerNumber),
    membershipLabel(u.membershipLevel),
    kycLabel(u.kycStatus),
    statusLabel(u.status),
    formatDate(u.createdAt),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `goldapp-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
