import type { SellRequest } from "@/types";
import { formatDate, formatMNT } from "@/lib/utils";

export type SellRequestWithUser = SellRequest & {
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    membershipLevel?: string | null;
  } | null;
  requestNo?: string | null;
  pricePerGram?: number | string | null;
  totalAmountMnt?: number | string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  adminNote?: string | null;
};

export type SellRequestStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";

export const SELL_REQUEST_STATUSES: SellRequestStatus[] = [
  "PENDING",
  "APPROVED",
  "COMPLETED",
  "CANCELLED",
];

export const SELL_REQUEST_STATUS_LABELS: Record<SellRequestStatus, string> = {
  PENDING: "Хүлээгдэж буй",
  APPROVED: "Батлагдсан",
  COMPLETED: "Төлөгдсөн",
  CANCELLED: "Цуцлагдсан",
};

export type SellRequestFilters = {
  requestNo?: string;
  userSearch?: string;
  status?: SellRequestStatus;
  membershipLevel?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type SellRequestStats = {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  cancelled: number;
};

export const SELL_REQUESTS_PAGE_SIZE = 20;
export const DEFAULT_SELL_UNIT_PRICE = 385420;

export function getSellRequestNo(item: Pick<SellRequestWithUser, "id" | "requestNo">): string {
  if (item.requestNo) {
    return item.requestNo.startsWith("#") ? item.requestNo : `#${item.requestNo}`;
  }

  const mockMatch = item.id.match(/^s1000001-0001-4000-8000-0000000000(\d{2})$/i);
  if (mockMatch) {
    const seq = parseInt(mockMatch[1], 10);
    return `#S${String(1_000_000 + seq).padStart(7, "0")}`;
  }

  const compact = item.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `#${compact}`;
}

export function getSellRequestUserName(item: SellRequestWithUser): string {
  if (!item.user) return "-";
  const name = `${item.user.firstName ?? ""} ${item.user.lastName ?? ""}`.trim();
  return name || "-";
}

export function getSellRequestPhone(item: SellRequestWithUser): string {
  return item.user?.phoneNumber ?? "-";
}

export function getSellUnitPrice(item: SellRequestWithUser): number {
  if (item.pricePerGram != null) return Number(item.pricePerGram);
  return DEFAULT_SELL_UNIT_PRICE;
}

export function getSellTotalMnt(item: SellRequestWithUser): number {
  if (item.totalAmountMnt != null) return Number(item.totalAmountMnt);
  return Number(item.amountGrams) * getSellUnitPrice(item);
}

export function sellRequestStatusBadgeKey(status: string): string {
  return status.toLowerCase();
}

export function sellRequestStatusLabel(status: string): string {
  return SELL_REQUEST_STATUS_LABELS[status as SellRequestStatus] ?? status;
}

export function filterSellRequestsClient(
  items: SellRequestWithUser[],
  filters: SellRequestFilters,
): SellRequestWithUser[] {
  let rows = items;

  const requestQuery = filters.requestNo?.toLowerCase();
  if (requestQuery) {
    rows = rows.filter((item) => {
      const no = getSellRequestNo(item).toLowerCase();
      return no.includes(requestQuery) || item.id.toLowerCase().includes(requestQuery);
    });
  }

  const userQuery = filters.userSearch?.toLowerCase();
  if (userQuery) {
    rows = rows.filter((item) => {
      const name = getSellRequestUserName(item).toLowerCase();
      const phone = item.user?.phoneNumber ?? "";
      return name.includes(userQuery) || phone.includes(userQuery);
    });
  }

  if (filters.status) {
    rows = rows.filter((item) => item.status === filters.status);
  }

  if (filters.membershipLevel) {
    rows = rows.filter((item) => item.user?.membershipLevel === filters.membershipLevel);
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    rows = rows.filter((item) => new Date(item.createdAt) >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    rows = rows.filter((item) => new Date(item.createdAt) <= to);
  }

  return rows;
}

export function computeSellRequestStats(items: SellRequestWithUser[]): SellRequestStats {
  return {
    total: items.length,
    pending: items.filter((i) => i.status === "PENDING").length,
    approved: items.filter((i) => i.status === "APPROVED").length,
    completed: items.filter((i) => i.status === "COMPLETED").length,
    cancelled: items.filter((i) => i.status === "CANCELLED").length,
  };
}

export function hasClientOnlySellFilters(filters: SellRequestFilters): boolean {
  return Boolean(
    filters.requestNo ||
      filters.userSearch ||
      filters.membershipLevel ||
      filters.dateFrom ||
      filters.dateTo,
  );
}

export function buildSellRequestDrawerTimeline(item: SellRequestWithUser) {
  const isCancelled = item.status === "CANCELLED";
  const isApproved = item.status === "APPROVED" || item.status === "COMPLETED";
  const isCompleted = item.status === "COMPLETED";

  const steps: Array<{
    key: string;
    label: string;
    at: string | null;
    state: "done" | "current" | "upcoming" | "cancelled";
  }> = [
    {
      key: "created",
      label: "Хүсэлт үүссэн",
      at: item.createdAt,
      state: "done",
    },
    {
      key: "approved",
      label: "Батлагдсан",
      at: item.approvedAt ?? null,
      state: isApproved ? "done" : "upcoming",
    },
    {
      key: "paid",
      label: "Төлөгдсөн",
      at: item.completedAt ?? null,
      state: isCompleted ? "done" : "upcoming",
    },
    {
      key: "cancelled",
      label: "Цуцлагдсан",
      at: isCancelled ? item.createdAt : null,
      state: isCancelled ? "cancelled" : "upcoming",
    },
  ];

  if (!isCancelled && !isCompleted) {
    if (item.status === "PENDING") steps[0].state = "current";
    else if (item.status === "APPROVED") steps[1].state = "current";
  }

  return steps.map((step) => ({
    ...step,
    time: step.at ? formatDate(step.at) : "-",
  }));
}

export function paginateSellRequests<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    total,
    items: items.slice(start, start + limit),
  };
}
