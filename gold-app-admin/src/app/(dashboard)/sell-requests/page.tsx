"use client";

import { Eye, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/ui/Pagination";
import SellRequestDetailDrawer from "@/components/sell-requests/SellRequestDetailDrawer";
import { useSellRequestStats, useSellRequests } from "@/hooks/useSellRequests";
import {
  getSellRequestNo,
  getSellRequestPhone,
  getSellRequestUserName,
  getSellTotalMnt,
  getSellUnitPrice,
  paginateSellRequests,
  sellRequestStatusBadgeKey,
  sellRequestStatusLabel,
  SELL_REQUEST_STATUSES,
  SELL_REQUESTS_PAGE_SIZE,
  type SellRequestFilters,
  type SellRequestStats,
  type SellRequestStatus,
} from "@/lib/sellRequestsUi";
import { formatDate, formatGrams, formatMNT } from "@/lib/utils";

const kpiCards: Array<{
  key: keyof SellRequestStats;
  label: string;
  filter?: SellRequestStatus;
}> = [
  { key: "total", label: "Нийт хүсэлт", filter: undefined },
  { key: "pending", label: "Хүлээгдэж буй", filter: "PENDING" },
  { key: "approved", label: "Батлагдсан", filter: "APPROVED" },
  { key: "completed", label: "Төлөгдсөн", filter: "COMPLETED" },
  { key: "cancelled", label: "Цуцлагдсан", filter: "CANCELLED" },
];

export default function SellRequestsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SellRequestFilters>({});
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const statsFilters = useMemo(
    () => ({
      requestNo: filters.requestNo,
      userSearch: filters.userSearch,
      membershipLevel: filters.membershipLevel,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    [filters.requestNo, filters.userSearch, filters.membershipLevel, filters.dateFrom, filters.dateTo],
  );

  const { data: allRows = [], isLoading, isError, error, refetch, isFetching } = useSellRequests(filters);
  const statsQ = useSellRequestStats(statsFilters);

  const { items: rows, total } = useMemo(
    () => paginateSellRequests(allRows, page, SELL_REQUESTS_PAGE_SIZE),
    [allRows, page],
  );

  const rowOffset = (page - 1) * SELL_REQUESTS_PAGE_SIZE;
  const stats = statsQ.data;

  const updateFilter = (patch: Partial<SellRequestFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="admin-sell-requests-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Алт зарах хүсэлт</h1>
          <p className="admin-users-subtitle">
            Зарах хүсэлт удирдах ·{" "}
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
                {statsQ.isLoading ? "—" : (stats?.[card.key] ?? 0).toLocaleString("mn-MN")}
              </p>
            </button>
          );
        })}
      </section>

      <section className="admin-users-card admin-users-filters">
        <div className="admin-users-filters-grid">
          <input
            className="admin-users-input"
            placeholder="Хүсэлтийн дугаар"
            value={filters.requestNo ?? ""}
            onChange={(e) => updateFilter({ requestNo: e.target.value || undefined })}
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
                status: (e.target.value || undefined) as SellRequestStatus | undefined,
              })
            }
          >
            <option value="">Бүх төлөв</option>
            {SELL_REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {sellRequestStatusLabel(s)}
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
            <table className="admin-users-table admin-sell-requests-table">
              <thead>
                <tr>
                  <th className="admin-users-col-index">№</th>
                  {[
                    "Хүсэлтийн дугаар",
                    "Хэрэглэгч",
                    "Утас",
                    "Алт (гр)",
                    "Нэгж үнэ",
                    "Нийт үнэ",
                    "Төлөв",
                    "Огноо",
                    "Үйлдэл",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((item, index) => (
                  <tr
                    key={item.id}
                    className="admin-users-table-row admin-users-table-row--clickable"
                    onClick={() => setDrawerId(item.id)}
                  >
                    <td className="admin-users-col-index">{rowOffset + index + 1}</td>
                    <td className="font-medium text-[#D4AF37]">{getSellRequestNo(item)}</td>
                    <td className="admin-users-cell-name">{getSellRequestUserName(item)}</td>
                    <td>{getSellRequestPhone(item)}</td>
                    <td>{formatGrams(item.amountGrams)}</td>
                    <td>{formatMNT(getSellUnitPrice(item))}</td>
                    <td className="font-medium text-white">{formatMNT(getSellTotalMnt(item))}</td>
                    <td>
                      <span
                        className={`admin-sell-requests-badge admin-sell-requests-badge--${sellRequestStatusBadgeKey(item.status)}`}
                      >
                        {sellRequestStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-[#9CA3AF]">{formatDate(item.createdAt)}</td>
                    <td className="admin-users-table-actions" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button type="button" className="admin-users-icon-btn rounded-lg p-2" aria-label="Үйлдэл">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content
                          className="admin-users-actions-menu z-50 min-w-[10rem] rounded-xl p-1.5"
                          align="end"
                        >
                          <DropdownMenu.Item
                            className="admin-users-actions-item"
                            onSelect={() => setDrawerId(item.id)}
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
        <Pagination page={page} total={total} limit={SELL_REQUESTS_PAGE_SIZE} onChange={setPage} />
      </div>

      <SellRequestDetailDrawer
        requestId={drawerId}
        open={Boolean(drawerId)}
        onOpenChange={(open) => !open && setDrawerId(null)}
      />
    </div>
  );
}
