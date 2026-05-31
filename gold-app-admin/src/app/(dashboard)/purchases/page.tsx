"use client";

import { Eye, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/ui/Pagination";
import PurchaseDetailDrawer from "@/components/purchases/PurchaseDetailDrawer";
import { usePurchaseStats, usePurchases } from "@/hooks/usePurchases";
import {
  filterPurchasesClient,
  getPurchaseOrderNo,
  getPurchaseUserName,
  getQPayStatusLabel,
  PURCHASE_DISPLAY_STATUSES,
  purchaseDisplayStatusLabel,
  purchaseStatusBadgeKey,
  purchaseStatusFilterLabel,
  qpayStatusBadgeKey,
  PURCHASES_PAGE_SIZE,
  type PurchaseDisplayStatus,
  type PurchaseFilters,
  type PurchaseStats,
  type PurchaseStatusFilter,
} from "@/lib/purchasesUi";
import { formatDate, formatGrams, formatMNT } from "@/lib/utils";

const kpiCards: Array<{
  key: keyof PurchaseStats;
  label: string;
  filter?: PurchaseStatusFilter;
}> = [
  { key: "total", label: "Нийт захиалга", filter: undefined },
  { key: "pending", label: "Хүлээгдэж буй", filter: "IN_PROGRESS" },
  { key: "paid", label: "Төлөгдсөн", filter: "PAID" },
  { key: "completed", label: "Дууссан", filter: "COMPLETED" },
  { key: "cancelled", label: "Цуцлагдсан", filter: "CANCELLED" },
] as const;

export default function PurchasesPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PurchaseFilters>({});
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const statsFilters = useMemo(
    () => ({
      orderNo: filters.orderNo,
      userSearch: filters.userSearch,
      membershipLevel: filters.membershipLevel,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      userId: filters.userId,
    }),
    [filters.orderNo, filters.userSearch, filters.membershipLevel, filters.dateFrom, filters.dateTo, filters.userId],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = usePurchases(filters, page, PURCHASES_PAGE_SIZE);
  const statsQ = usePurchaseStats(statsFilters);

  const allRows = data?.items ?? [];
  const rows = useMemo(() => filterPurchasesClient(allRows, filters), [allRows, filters]);
  const total = data?.total ?? 0;
  const rowOffset = (page - 1) * PURCHASES_PAGE_SIZE;
  const stats = statsQ.data;

  const updateFilter = (patch: Partial<PurchaseFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="admin-purchases-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Худалдан авалт</h1>
          <p className="admin-users-subtitle">
            Захиалга удирдах самбар ·{" "}
            <span className="text-[#D4AF37]">{(stats?.total ?? 0).toLocaleString("mn-MN")}</span> нийт
          </p>
        </div>
      </header>

      <section className="admin-purchases-stats grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((card) => {
          const isActive = card.filter ? filters.status === card.filter : !filters.status;
          return (
            <button
              key={card.key}
              type="button"
              className={`admin-users-card admin-purchases-stat-card rounded-2xl text-left ${isActive ? "admin-purchases-stat-card--active" : ""}`}
              onClick={() =>
                updateFilter({
                  status: card.filter ? (filters.status === card.filter ? undefined : card.filter) : undefined,
                })
              }
            >
              <p className="admin-users-label">{card.label}</p>
              <p className="admin-purchases-stat-value">
                {statsQ.isLoading ? "—" : (stats?.[card.key as keyof typeof stats] ?? 0).toLocaleString("mn-MN")}
              </p>
            </button>
          );
        })}
      </section>

      <section className="admin-users-card admin-users-filters">
        <div className="admin-users-filters-grid">
          <input
            className="admin-users-input"
            placeholder="Захиалгын дугаар"
            value={filters.orderNo ?? ""}
            onChange={(e) => updateFilter({ orderNo: e.target.value || undefined })}
          />
          <input
            className="admin-users-input"
            placeholder="Хэрэглэгч (нэр, утас)"
            value={filters.userSearch ?? ""}
            onChange={(e) => updateFilter({ userSearch: e.target.value || undefined })}
          />
          <select
            className="admin-users-select"
            value={filters.membershipLevel ?? ""}
            onChange={(e) => updateFilter({ membershipLevel: e.target.value || undefined })}
          >
            <option value="">Бүх Membership</option>
            <option value="NORMAL">Энгийн</option>
            <option value="BRONZE">Хүрэл</option>
            <option value="SILVER">Мөнгөн</option>
            <option value="GOLD">Алтан</option>
          </select>
          <select
            className="admin-users-select"
            value={filters.status ?? ""}
            onChange={(e) =>
              updateFilter({
                status: (e.target.value || undefined) as PurchaseStatusFilter | undefined,
              })
            }
          >
            <option value="">Бүх төлөв</option>
            {PURCHASE_DISPLAY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {purchaseStatusFilterLabel(s)}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="admin-users-input"
            value={filters.dateFrom ?? ""}
            onChange={(e) => updateFilter({ dateFrom: e.target.value || undefined })}
            aria-label="Эхлэх огноо"
          />
          <input
            type="date"
            className="admin-users-input"
            value={filters.dateTo ?? ""}
            onChange={(e) => updateFilter({ dateTo: e.target.value || undefined })}
            aria-label="Дуусах огноо"
          />
          <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={clearFilters}>
            Цэвэрлэх
          </button>
        </div>
      </section>

      <section className="admin-users-card admin-users-table-card">
        {isLoading && (
          <div className="admin-users-loading">
            <LoadingSpinner />
          </div>
        )}
        {isError && (
          <div className="admin-users-error">
            <p>Алдаа гарлаа. Дахин оролдоно уу.</p>
            {error instanceof Error && error.message ? (
              <p className="mt-1 text-sm opacity-80">{error.message}</p>
            ) : null}
            <button
              type="button"
              className="admin-users-btn admin-users-btn--ghost mt-3"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Ачааллаж байна..." : "Дахин оролдох"}
            </button>
          </div>
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="admin-users-empty">Өгөгдөл алга</div>
        )}

        {!isLoading && !isError && rows.length > 0 && (
          <div className="admin-users-table-wrap">
            <table className="admin-users-table admin-purchases-table">
              <thead>
                <tr>
                  <th className="admin-users-col-index">№</th>
                  {[
                    "Захиалгын дугаар",
                    "Хэрэглэгч",
                    "Утас",
                    "Алт (гр)",
                    "Нэгж үнэ",
                    "Нийт үнэ",
                    "QPay",
                    "Төлөв",
                    "Огноо",
                    "Үйлдэл",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p, index) => (
                  <tr
                    key={p.id}
                    className="admin-users-table-row admin-users-table-row--clickable"
                    onClick={() => setDrawerId(p.id)}
                  >
                    <td className="admin-users-col-index">{rowOffset + index + 1}</td>
                    <td className="font-medium text-[#D4AF37]">{getPurchaseOrderNo(p)}</td>
                    <td className="admin-users-cell-name">{getPurchaseUserName(p)}</td>
                    <td>{p.user?.phoneNumber ?? "—"}</td>
                    <td>{formatGrams(p.amountGrams)}</td>
                    <td>{formatMNT(p.pricePerGram)}</td>
                    <td className="font-medium text-white">{formatMNT(p.totalAmountMnt)}</td>
                    <td>
                      <span className={`admin-purchases-badge admin-purchases-badge--qpay-${qpayStatusBadgeKey(p.qpayStatus)}`}>
                        {getQPayStatusLabel(p.qpayStatus)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-purchases-badge admin-purchases-badge--${purchaseStatusBadgeKey(p)}`}>
                        {purchaseDisplayStatusLabel(p)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-[#9CA3AF]">{formatDate(p.createdAt)}</td>
                    <td className="admin-users-table-actions" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button type="button" className="admin-users-icon-btn rounded-lg p-2" aria-label="Үйлдэл">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="admin-users-actions-menu z-50 min-w-[10rem] rounded-xl p-1.5" align="end">
                          <DropdownMenu.Item
                            className="admin-users-actions-item"
                            onSelect={() => setDrawerId(p.id)}
                          >
                            <Eye size={14} /> Дэлгэрэнгүй
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-users-pagination">
        <Pagination page={page} total={total} limit={PURCHASES_PAGE_SIZE} onChange={setPage} />
      </div>

      <PurchaseDetailDrawer
        purchaseId={drawerId}
        open={Boolean(drawerId)}
        onOpenChange={(open) => !open && setDrawerId(null)}
      />
    </div>
  );
}
