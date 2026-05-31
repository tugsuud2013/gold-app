import { membershipLabel } from "@/lib/usersUi";
import { formatGrams, formatMNT } from "@/lib/utils";

export type ReportTab = "users" | "purchases" | "sells" | "gold" | "revenue";

export type ReportFilters = {
  startDate: string;
  endDate: string;
  membershipLevel?: string;
  status?: string;
  userSearch?: string;
};

export type ReportSummary = {
  totalUsers: number;
  totalPurchases: number;
  totalSellRequests: number;
  totalGoldGrams: number;
  totalRevenue: number;
};

export const REPORT_TABS: Array<{ id: ReportTab; label: string }> = [
  { id: "users", label: "Хэрэглэгчид" },
  { id: "purchases", label: "Худалдан авалт" },
  { id: "sells", label: "Зарах хүсэлт" },
  { id: "gold", label: "Алтны үлдэгдэл" },
  { id: "revenue", label: "Орлого" },
];

export const MEMBERSHIP_FILTER_OPTIONS = [
  { value: "", label: "Бүх membership" },
  { value: "NORMAL", label: membershipLabel("NORMAL") },
  { value: "BRONZE", label: membershipLabel("BRONZE") },
  { value: "SILVER", label: membershipLabel("SILVER") },
  { value: "GOLD", label: membershipLabel("GOLD") },
];

export const USER_STATUS_OPTIONS = [
  { value: "", label: "Бүх статус" },
  { value: "ACTIVE", label: "Идэвхтэй" },
  { value: "SUSPENDED", label: "Хаагдсан" },
];

export const PURCHASE_STATUS_OPTIONS = [
  { value: "", label: "Бүх статус" },
  { value: "PENDING", label: "Хүлээгдэж буй" },
  { value: "COMPLETED", label: "Дууссан" },
  { value: "CANCELLED", label: "Цуцлагдсан" },
];

export const SELL_STATUS_OPTIONS = [
  { value: "", label: "Бүх статус" },
  { value: "PENDING", label: "Хүлээгдэж буй" },
  { value: "APPROVED", label: "Баталгаажсан" },
  { value: "COMPLETED", label: "Дууссан" },
  { value: "CANCELLED", label: "Цуцлагдсан" },
];

export const CHART_COLORS = {
  gold: "#D4AF37",
  purchase: "#34D399",
  sell: "#F87171",
  revenue: "#60A5FA",
  pie: ["#9CA3AF", "#F97316", "#3B82F6", "#D4AF37"],
} as const;

export function getDefaultReportRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  const end = now.toISOString().slice(0, 10);
  return { startDate: start, endDate: end };
}

export function fillDateSeries<T extends { date: string }>(
  startDate: string,
  endDate: string,
  rows: T[],
  defaults: Omit<T, "date">,
): T[] {
  const map = new Map(rows.map((row) => [row.date, row]));
  const result: T[] = [];
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10);
    result.push(map.get(date) ?? ({ date, ...defaults } as T));
  }

  return result;
}

export function buildReportQuery(filters: ReportFilters) {
  const params = new URLSearchParams();
  params.set("startDate", filters.startDate);
  params.set("endDate", filters.endDate);
  if (filters.membershipLevel) params.set("membershipLevel", filters.membershipLevel);
  if (filters.status) params.set("status", filters.status);
  if (filters.userSearch?.trim()) params.set("userSearch", filters.userSearch.trim());
  return params.toString();
}

export function exportReportExcel(rows: Array<Record<string, unknown>>, filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers, ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportReportPdf(title: string, headers: string[], rows: string[][]) {
  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1 { font-size: 18px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background: #f5f5f5; }
    </style></head><body>
    <h1>${title}</h1>
    <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export function formatReportGrams(value: number) {
  return formatGrams(Number(value.toFixed(4)));
}

export function formatReportMnt(value: number) {
  return formatMNT(value);
}

export function membershipPieData(distribution?: Record<string, number>) {
  return Object.entries(distribution ?? {})
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: membershipLabel(name),
      value,
    }));
}
