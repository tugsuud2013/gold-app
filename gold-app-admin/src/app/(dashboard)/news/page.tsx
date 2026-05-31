"use client";

import { Download, Eye, MoreHorizontal, Newspaper, Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/ui/Pagination";
import NewsDetailDrawer from "@/components/news/NewsDetailDrawer";
import NewsFormModal from "@/components/news/NewsFormModal";
import { useNewsList, useNewsStats } from "@/hooks/useNews";
import {
  exportNewsToCsv,
  getAuthorName,
  getNewsCover,
  NEWS_PAGE_SIZE,
  newsStatusBadgeKey,
  newsStatusLabel,
  paginateNews,
  type NewsFilters,
  type NewsStats,
} from "@/lib/newsUi";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

const kpiCards: Array<{ key: keyof NewsStats; label: string; filter?: NewsFilters["status"] }> = [
  { key: "total", label: "Нийт мэдээ" },
  { key: "published", label: "Нийтлэгдсэн", filter: "PUBLISHED" },
  { key: "draft", label: "Ноорог", filter: "DRAFT" },
  { key: "archived", label: "Архивласан", filter: "ARCHIVED" },
];

export default function NewsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<NewsFilters>({});
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const { showToast } = useToast();

  const listQ = useNewsList(filters);
  const statsQ = useNewsStats();

  const allRows = listQ.data ?? [];
  const { items: rows, total } = useMemo(
    () => paginateNews(allRows, page, NEWS_PAGE_SIZE),
    [allRows, page],
  );
  const stats = statsQ.data;

  const updateFilter = (patch: Partial<NewsFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  return (
    <div className="admin-news-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Мэдээ мэдээлэл</h1>
          <p className="admin-users-subtitle">
            Мэдээ удирдах · <span className="text-[#D4AF37]">{(stats?.total ?? 0).toLocaleString("mn-MN")}</span> нийт
          </p>
        </div>
        <div className="admin-users-header-actions">
          <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={() => listQ.refetch()} disabled={listQ.isFetching}>
            <RefreshCw size={16} className={listQ.isFetching ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Шинэчлэх</span>
          </button>
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            onClick={() => {
              if (!allRows.length) {
                showToast("Экспортлох өгөгдөл байхгүй", "error");
                return;
              }
              exportNewsToCsv(allRows);
              showToast("Excel файл татагдлаа");
            }}
          >
            <Download size={16} /> Excel экспорт
          </button>
          <button
            type="button"
            className="admin-users-btn admin-users-btn--primary"
            onClick={() => {
              setDrawerId(null);
              setEditItemId(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> Мэдээ нэмэх
          </button>
        </div>
      </header>

      <section className="admin-purchases-stats grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const isActive = card.filter ? filters.status === card.filter : !filters.status;
          return (
            <button
              key={card.key}
              type="button"
              className={`admin-users-card admin-purchases-stat-card rounded-2xl text-left ${isActive ? "admin-purchases-stat-card--active" : ""}`}
              onClick={() => updateFilter({ status: card.filter ? (filters.status === card.filter ? undefined : card.filter) : undefined })}
            >
              <Newspaper size={18} className="text-[#D4AF37]" />
              <p className="admin-purchases-stat-label">{card.label}</p>
              <p className="admin-purchases-stat-value">{(stats?.[card.key] ?? 0).toLocaleString("mn-MN")}</p>
            </button>
          );
        })}
      </section>

      <section className="admin-users-card admin-users-filters rounded-2xl">
        <div className="admin-users-filters-grid">
          <label className="admin-users-field">
            <span className="admin-users-label">Гарчиг</span>
            <input
              className="admin-users-input"
              value={filters.title ?? ""}
              onChange={(e) => updateFilter({ title: e.target.value || undefined })}
              placeholder="Хайх..."
            />
          </label>
          <label className="admin-users-field">
            <span className="admin-users-label">Төлөв</span>
            <select
              className="admin-users-input"
              value={filters.status ?? ""}
              onChange={(e) => updateFilter({ status: (e.target.value || undefined) as NewsFilters["status"] })}
            >
              <option value="">Бүгд</option>
              <option value="DRAFT">Ноорог</option>
              <option value="PUBLISHED">Нийтлэгдсэн</option>
              <option value="ARCHIVED">Архивласан</option>
            </select>
          </label>
          <label className="admin-users-field">
            <span className="admin-users-label">Огноо (эхлэх)</span>
            <input type="date" className="admin-users-input" value={filters.dateFrom ?? ""} onChange={(e) => updateFilter({ dateFrom: e.target.value || undefined })} />
          </label>
          <label className="admin-users-field">
            <span className="admin-users-label">Огноо (дуусах)</span>
            <input type="date" className="admin-users-input" value={filters.dateTo ?? ""} onChange={(e) => updateFilter({ dateTo: e.target.value || undefined })} />
          </label>
          <label className="admin-users-field">
            <span className="admin-users-label">Зохиогч</span>
            <input
              className="admin-users-input"
              value={filters.author ?? ""}
              onChange={(e) => updateFilter({ author: e.target.value || undefined })}
              placeholder="Нэр..."
            />
          </label>
        </div>
      </section>

      <section className="admin-users-card admin-users-table-card admin-news-table-card rounded-2xl">
        {listQ.isLoading ? (
          <div className="admin-users-loading"><LoadingSpinner /></div>
        ) : listQ.isError ? (
          <div className="admin-users-error">Мэдээ ачаалахад алдаа гарлаа</div>
        ) : rows.length === 0 ? (
          <div className="admin-users-empty">Мэдээ байхгүй</div>
        ) : (
          <>
            <div className="admin-users-table-wrap admin-news-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    {["№", "Зураг", "Гарчиг", "Товч тайлбар", "Төлөв", "Зохиогч", "Үүсгэсэн", "Шинэчилсэн", "Үйлдэл"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const cover = getNewsCover(row);
                    return (
                      <tr
                        key={row.id}
                        className="admin-users-table-row--clickable"
                        onClick={() => setDrawerId(row.id)}
                      >
                        <td>{(page - 1) * NEWS_PAGE_SIZE + index + 1}</td>
                        <td>
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cover} alt="" className="admin-news-thumb" />
                          ) : (
                            <span className="admin-news-thumb-placeholder">—</span>
                          )}
                        </td>
                        <td className="max-w-[200px] truncate font-medium text-white">{row.title}</td>
                        <td className="max-w-[220px] truncate text-[#9CA3AF]">{row.summary || "—"}</td>
                        <td>
                          <span className={`admin-news-badge admin-news-badge--${newsStatusBadgeKey(row.status)}`}>
                            {newsStatusLabel(row.status)}
                          </span>
                        </td>
                        <td>{getAuthorName(row)}</td>
                        <td className="whitespace-nowrap text-[#9CA3AF]">{formatDate(row.createdAt)}</td>
                        <td className="whitespace-nowrap text-[#9CA3AF]">{formatDate(row.updatedAt)}</td>
                        <td className="admin-users-table-actions" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button type="button" className="admin-users-icon-btn rounded-lg p-2" aria-label="Үйлдэл">
                                <MoreHorizontal size={16} />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content className="admin-dropdown z-50 min-w-[10rem] rounded-xl p-1.5 shadow-lg" align="end">
                              <DropdownMenu.Item
                                className="admin-dropdown-item flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setDrawerId(row.id);
                                }}
                              >
                                <Eye size={14} /> Дэлгэрэнгүй
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="admin-dropdown-item flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setDrawerId(null);
                                  setEditItemId(row.id);
                                  setModalOpen(true);
                                }}
                              >
                                Засах
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="admin-news-table-footer">
              <Pagination page={page} limit={NEWS_PAGE_SIZE} total={total} onChange={setPage} />
            </div>
          </>
        )}
      </section>

      <NewsDetailDrawer
        newsId={drawerId}
        open={Boolean(drawerId)}
        onOpenChange={(open) => !open && setDrawerId(null)}
        onEdit={(id) => {
          setDrawerId(null);
          setEditItemId(id);
          setModalOpen(true);
        }}
      />

      <NewsFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditItemId(null);
        }}
        newsId={editItemId}
      />
    </div>
  );
}
