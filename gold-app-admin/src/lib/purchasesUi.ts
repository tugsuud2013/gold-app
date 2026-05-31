import type { Purchase } from "@/types";
import { formatDate } from "@/lib/utils";

export type PurchaseWithUser = Purchase & {
  user?: {
    id: string;
    phoneNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    membershipLevel?: string;
  } | null;
  orderNo?: string | null;
  qpayInvoiceId?: string | null;
  paidAt?: string | null;
  updatedAt?: string;
  contractQrCode?: string | null;
};

/** Unified display status for KPI cards, filters, and table badges. */
export type PurchaseDisplayStatus =
  | "PENDING"
  | "CONTRACT_SIGNED"
  | "WAITING_PAYMENT"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED";

/** KPI «Хүлээгдэж буй» — PENDING + CONTRACT_SIGNED + WAITING_PAYMENT */
export type PurchaseStatusFilter = PurchaseDisplayStatus | "IN_PROGRESS";

export const PURCHASE_DISPLAY_STATUSES: PurchaseDisplayStatus[] = [
  "PENDING",
  "CONTRACT_SIGNED",
  "WAITING_PAYMENT",
  "PAID",
  "COMPLETED",
  "CANCELLED",
];

export const PURCHASE_DISPLAY_STATUS_LABELS: Record<PurchaseDisplayStatus, string> = {
  PENDING: "Хүлээгдэж буй",
  CONTRACT_SIGNED: "Гэрээ байгуулсан",
  WAITING_PAYMENT: "Төлбөр хүлээгдэж буй",
  PAID: "Төлөгдсөн",
  COMPLETED: "Дууссан",
  CANCELLED: "Цуцлагдсан",
};

export type PurchaseFilters = {
  orderNo?: string;
  userSearch?: string;
  status?: PurchaseStatusFilter;
  membershipLevel?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  /** @deprecated use orderNo + userSearch */
  search?: string;
};

export const PURCHASES_PAGE_SIZE = 20;

export type PurchaseStats = {
  total: number;
  pending: number;
  paid: number;
  completed: number;
  cancelled: number;
};

/** Resolve API purchase row → unified display status. */
export function resolvePurchaseDisplayStatus(purchase: PurchaseWithUser): PurchaseDisplayStatus {
  if (purchase.status === "CANCELLED") return "CANCELLED";
  if (purchase.status === "COMPLETED") return "COMPLETED";
  if (purchase.qpayStatus === "PAID") return "PAID";
  if (purchase.status === "PAYMENT_PENDING") return "WAITING_PAYMENT";
  if (purchase.status === "CONTRACT_SIGNED") return "CONTRACT_SIGNED";
  return "PENDING";
}

/** UI filter value → API query status (display-only filters stay client-side). */
export function mapPurchaseStatusFilter(status?: PurchaseStatusFilter): string | undefined {
  if (!status || status === "PAID" || status === "IN_PROGRESS") return undefined;
  if (status === "WAITING_PAYMENT") return "PAYMENT_PENDING";
  return status;
}

export function isInProgressPurchaseStatus(status: PurchaseDisplayStatus): boolean {
  return status === "PENDING" || status === "CONTRACT_SIGNED" || status === "WAITING_PAYMENT";
}

export function purchaseStatusBadgeKey(purchase: PurchaseWithUser): string {
  return resolvePurchaseDisplayStatus(purchase).toLowerCase();
}

export function purchaseDisplayStatusLabel(purchase: PurchaseWithUser): string {
  return PURCHASE_DISPLAY_STATUS_LABELS[resolvePurchaseDisplayStatus(purchase)];
}

export function purchaseStatusFilterLabel(status: PurchaseDisplayStatus | string): string {
  return PURCHASE_DISPLAY_STATUS_LABELS[status as PurchaseDisplayStatus] ?? status;
}

export function getPurchaseOrderNo(purchase: Pick<PurchaseWithUser, "id" | "orderNo">): string {
  if (purchase.orderNo) {
    return purchase.orderNo.startsWith("#") ? purchase.orderNo : `#${purchase.orderNo}`;
  }

  const mockMatch = purchase.id.match(/^a1000001-0001-4000-8000-0000000000(\d{2})$/i);
  if (mockMatch) {
    const seq = parseInt(mockMatch[1], 10);
    return `#A${String(1_000_000 + seq).padStart(7, "0")}`;
  }

  const compact = purchase.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `#${compact}`;
}

export function getPurchaseUserName(purchase: PurchaseWithUser): string {
  if (!purchase.user) return "—";
  const name = `${purchase.user.lastName ?? ""} ${purchase.user.firstName ?? ""}`.trim();
  return name || "—";
}

export function matchesPurchaseDisplayStatus(
  purchase: PurchaseWithUser,
  status: PurchaseStatusFilter,
): boolean {
  if (status === "IN_PROGRESS") {
    return isInProgressPurchaseStatus(resolvePurchaseDisplayStatus(purchase));
  }
  return resolvePurchaseDisplayStatus(purchase) === status;
}

export function filterPurchasesClient(
  items: PurchaseWithUser[],
  filters: PurchaseFilters,
): PurchaseWithUser[] {
  let rows = items;

  const orderQuery = (filters.orderNo ?? filters.search)?.toLowerCase();
  if (orderQuery) {
    rows = rows.filter((p) => {
      const order = getPurchaseOrderNo(p).toLowerCase();
      return order.includes(orderQuery) || p.id.toLowerCase().includes(orderQuery);
    });
  }

  const userQuery = filters.userSearch?.toLowerCase();
  if (userQuery) {
    rows = rows.filter((p) => {
      const name = getPurchaseUserName(p).toLowerCase();
      const phone = p.user?.phoneNumber ?? "";
      return name.includes(userQuery) || phone.includes(userQuery);
    });
  }

  if (filters.status) {
    rows = rows.filter((p) => matchesPurchaseDisplayStatus(p, filters.status!));
  }

  if (filters.membershipLevel) {
    rows = rows.filter((p) => p.user?.membershipLevel === filters.membershipLevel);
  }

  return rows;
}

export function computePurchaseStats(items: PurchaseWithUser[]): PurchaseStats {
  let pending = 0;
  let paid = 0;
  let completed = 0;
  let cancelled = 0;

  for (const purchase of items) {
    const status = resolvePurchaseDisplayStatus(purchase);
    if (status === "COMPLETED") completed += 1;
    else if (status === "CANCELLED") cancelled += 1;
    else if (status === "PAID") paid += 1;
    else pending += 1;
  }

  return {
    total: items.length,
    pending,
    paid,
    completed,
    cancelled,
  };
}

export function hasClientOnlyPurchaseFilters(
  filters: Omit<PurchaseFilters, "status">,
): boolean {
  return Boolean(filters.orderNo || filters.userSearch || filters.membershipLevel);
}

export function getQPayStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Хүлээгдэж буй",
    PAID: "Төлөгдсөн",
    FAILED: "Амжилтгүй",
    EXPIRED: "Хугацаа дууссан",
  };
  return map[status] ?? status;
}

export function qpayStatusBadgeKey(status: string): string {
  return status.toLowerCase();
}

export function buildPurchaseDrawerTimeline(purchase: PurchaseWithUser) {
  const displayStatus = resolvePurchaseDisplayStatus(purchase);
  const isCancelled = displayStatus === "CANCELLED";
  const isCompleted = displayStatus === "COMPLETED";
  const contractDone =
    purchase.status === "CONTRACT_SIGNED" ||
    purchase.status === "PAYMENT_PENDING" ||
    purchase.status === "COMPLETED";
  const paidDone = purchase.qpayStatus === "PAID";

  const steps = [
    {
      key: "created",
      label: "Захиалга үүссэн",
      at: purchase.createdAt,
      state: "done",
    },
    {
      key: "contract",
      label: "Гэрээ баталгаажсан",
      at: contractDone ? purchase.updatedAt ?? purchase.createdAt : null,
      state: contractDone ? "done" : "upcoming",
    },
    {
      key: "paid",
      label: "Төлбөр төлөгдсөн",
      at: purchase.paidAt ?? null,
      state: paidDone ? "done" : "upcoming",
    },
    {
      key: "final",
      label: isCancelled ? "Цуцлагдсан" : "Дууссан",
      at: isCancelled || isCompleted ? purchase.updatedAt ?? null : null,
      state: isCancelled ? "cancelled" : isCompleted ? "done" : "upcoming",
    },
  ];

  if (!isCancelled && !isCompleted && paidDone) {
    steps[2].state = displayStatus === "PAID" ? "current" : "done";
  } else if (!isCancelled && !isCompleted && contractDone && !paidDone) {
    steps[1].state = displayStatus === "CONTRACT_SIGNED" || displayStatus === "WAITING_PAYMENT" ? "current" : "done";
  } else if (!isCancelled && !isCompleted && !contractDone) {
    steps[0].state = displayStatus === "PENDING" ? "current" : "done";
  }

  return steps.map((step) => ({
    ...step,
    time: step.at ? formatDate(step.at) : "—",
  }));
}

export function getContractStatusLabel(purchase: PurchaseWithUser): string {
  if (purchase.status === "CANCELLED") return "Цуцлагдсан";
  if (
    purchase.contractPdfUrl ||
    purchase.status === "CONTRACT_SIGNED" ||
    purchase.status === "PAYMENT_PENDING" ||
    purchase.status === "COMPLETED"
  ) {
    return "Баталгаажсан";
  }
  return "Хүлээгдэж буй";
}

export function buildPurchaseTimeline(purchase: PurchaseWithUser) {
  const displayStatus = resolvePurchaseDisplayStatus(purchase);
  const steps = [
    { key: "PENDING", label: PURCHASE_DISPLAY_STATUS_LABELS.PENDING, at: purchase.createdAt },
    { key: "CONTRACT_SIGNED", label: PURCHASE_DISPLAY_STATUS_LABELS.CONTRACT_SIGNED, at: null as string | null },
    { key: "WAITING_PAYMENT", label: PURCHASE_DISPLAY_STATUS_LABELS.WAITING_PAYMENT, at: null as string | null },
    { key: "PAID", label: PURCHASE_DISPLAY_STATUS_LABELS.PAID, at: purchase.paidAt ?? null },
    { key: "COMPLETED", label: PURCHASE_DISPLAY_STATUS_LABELS.COMPLETED, at: purchase.status === "COMPLETED" ? purchase.updatedAt ?? null : null },
    { key: "CANCELLED", label: PURCHASE_DISPLAY_STATUS_LABELS.CANCELLED, at: purchase.status === "CANCELLED" ? purchase.updatedAt ?? null : null },
  ];

  const statusOrder: PurchaseDisplayStatus[] = [
    "PENDING",
    "CONTRACT_SIGNED",
    "WAITING_PAYMENT",
    "PAID",
    "COMPLETED",
  ];
  const currentIdx =
    displayStatus === "CANCELLED" ? -1 : statusOrder.indexOf(displayStatus);

  return steps
    .filter((s) => s.key !== "CANCELLED" || displayStatus === "CANCELLED")
    .map((step) => {
      let state: "done" | "current" | "upcoming" | "cancelled" = "upcoming";
      if (displayStatus === "CANCELLED" && step.key === "CANCELLED") state = "cancelled";
      else if (step.key === "PAID") {
        state = purchase.qpayStatus === "PAID" ? "done" : "upcoming";
        if (displayStatus === "PAID" && purchase.qpayStatus === "PAID") state = "current";
      } else if (step.key === "COMPLETED") {
        state = displayStatus === "COMPLETED" ? "done" : "upcoming";
      } else {
        const stepIdx = statusOrder.indexOf(step.key as PurchaseDisplayStatus);
        if (stepIdx >= 0 && currentIdx >= 0) {
          if (stepIdx < currentIdx) state = "done";
          else if (stepIdx === currentIdx) state = "current";
        }
      }
      return { ...step, state, time: step.at ? formatDate(step.at) : "—" };
    });
}
