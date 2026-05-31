"use client";

import { ArrowDownRight, ArrowUpRight, Download, RefreshCw, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import GoldPriceChart from "@/components/gold-price/GoldPriceChart";
import UpdateGoldPriceModal from "@/components/gold-price/UpdateGoldPriceModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/ui/Pagination";
import { useGoldPriceHistory, useGoldPriceLatest, useGoldPriceRecords } from "@/hooks/useGoldPrice";
import api from "@/lib/api";
import {
  buildChartData,
  changePercentClass,
  computeChangeVsPrevious,
  exportGoldPricesToCsv,
  filterPricesByChartRange,
  formatChangePercent,
  getAdminName,
  getBankPrice,
  getBuyPrice,
  getSellPrice,
  GOLD_PRICE_PAGE_SIZE,
  type GoldPriceChartFilter,
} from "@/lib/goldPriceUi";
import { formatDate, formatDateTime, formatMNT } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

export default function GoldPricePage() {
  const [page, setPage] = useState(1);
  const [chartFilter, setChartFilter] = useState<GoldPriceChartFilter>("7d");
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const latestQ = useGoldPriceLatest();
  const recordsQ = useGoldPriceRecords();
  const historyQ = useGoldPriceHistory(page, GOLD_PRICE_PAGE_SIZE);

  const latestPrice = latestQ.data?.latest ?? recordsQ.data?.[0] ?? (page === 1 ? historyQ.data?.items?.[0] : undefined);
  const previousPrice = latestQ.data?.previous ?? recordsQ.data?.[1];
  const changePercent = latestPrice ? computeChangeVsPrevious(latestPrice, previousPrice) : null;
  const changeUp = (changePercent ?? 0) >= 0;

  const prices = recordsQ.data?.length ? recordsQ.data : (historyQ.data?.items ?? []);

  const chartData = useMemo(() => {
    const filtered = filterPricesByChartRange(prices, chartFilter);
    return buildChartData(filtered);
  }, [prices, chartFilter]);

  const rows = historyQ.data?.items ?? [];
  const total = historyQ.data?.total ?? 0;

  const handleExport = async () => {
    try {
      const all = (await api.get("/api/admin/gold-price/history?page=1&limit=100")) as {
        items: typeof rows;
      };
      const items = all?.items ?? rows;
      if (!items.length) {
        showToast("Экспортлох өгөгдөл байхгүй", "error");
        return;
      }
      exportGoldPricesToCsv(items);
      showToast("Excel файл татагдлаа");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Экспорт амжилтгүй", "error");
    }
  };

  const handleRefresh = () => {
    latestQ.refetch();
    recordsQ.refetch();
    historyQ.refetch();
  };

  return (
    <div className="admin-gold-price-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Алтны ханш удирдлага</h1>
          <p className="admin-users-subtitle">
            Монголбанкны алтны ханш, авах/зарах үнийг удирдах
          </p>
        </div>
        <div className="admin-users-header-actions">
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            onClick={handleRefresh}
            disabled={latestQ.isFetching || recordsQ.isFetching || historyQ.isFetching}
          >
            <RefreshCw size={16} className={latestQ.isFetching ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Шинэчлэх</span>
          </button>
          <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={handleExport}>
            <Download size={16} />
            Excel экспорт
          </button>
          <button
            type="button"
            className="admin-users-btn admin-users-btn--primary"
            onClick={() => setModalOpen(true)}
          >
            <TrendingUp size={16} />
            Үнэ шинэчлэх
          </button>
        </div>
      </header>

      <section className="admin-gold-price-stats grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="admin-users-card admin-gold-price-stat-card rounded-2xl">
          <p className="admin-gold-price-stat-label">Одоогийн үнэ</p>
          <p className="admin-gold-price-stat-value admin-gold-price-stat-value--gold">
            {latestQ.isLoading ? "—" : latestPrice ? formatMNT(getBankPrice(latestPrice)) : "—"}
          </p>
          <p className="admin-gold-price-stat-hint">Монголбанк (₮/гр)</p>
        </article>
        <article className="admin-users-card admin-gold-price-stat-card rounded-2xl">
          <p className="admin-gold-price-stat-label">Авах үнэ</p>
          <p className="admin-gold-price-stat-value">
            {latestQ.isLoading ? "—" : latestPrice ? formatMNT(getBuyPrice(latestPrice)) : "—"}
          </p>
          <p className="admin-gold-price-stat-hint">Худалдан авах</p>
        </article>
        <article className="admin-users-card admin-gold-price-stat-card rounded-2xl">
          <p className="admin-gold-price-stat-label">Зарах үнэ</p>
          <p className="admin-gold-price-stat-value">
            {latestQ.isLoading ? "—" : latestPrice ? formatMNT(getSellPrice(latestPrice)) : "—"}
          </p>
          <p className="admin-gold-price-stat-hint">Худалдан зарна</p>
        </article>
        <article className="admin-users-card admin-gold-price-stat-card rounded-2xl">
          <p className="admin-gold-price-stat-label">Өөрчлөлт %</p>
          <p className={`admin-gold-price-stat-value flex items-center gap-1 ${changeUp ? "text-emerald-400" : "text-rose-400"}`}>
            {changePercent != null ? (
              <>
                {changeUp ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                {formatChangePercent(changePercent)}
              </>
            ) : (
              "—"
            )}
          </p>
          <p className="admin-gold-price-stat-hint">Өмнөх үнээс</p>
        </article>
        <article className="admin-users-card admin-gold-price-stat-card rounded-2xl">
          <p className="admin-gold-price-stat-label">Сүүлийн шинэчлэлт</p>
          <p className="admin-gold-price-stat-value admin-gold-price-stat-value--sm">
            {latestPrice ? formatDateTime(latestPrice.createdAt) : "—"}
          </p>
          <p className="admin-gold-price-stat-hint">{latestPrice ? getAdminName(latestPrice) : "—"}</p>
        </article>
      </section>

      <GoldPriceChart
        filter={chartFilter}
        onFilterChange={setChartFilter}
        data={chartData}
        isLoading={recordsQ.isLoading && !prices.length}
      />

      <section className="admin-users-card admin-users-table-card admin-gold-price-history-card rounded-2xl">
        <div className="admin-users-table-header admin-gold-price-table-header">
          <div>
            <h2 className="admin-gold-price-section-title">Үнийн түүх</h2>
            <p className="admin-users-subtitle">
              Нийт <span className="text-[#D4AF37]">{total.toLocaleString("mn-MN")}</span> бүртгэл
            </p>
          </div>
        </div>

        {historyQ.isLoading ? (
          <div className="admin-users-loading">
            <LoadingSpinner />
          </div>
        ) : historyQ.isError ? (
          <div className="admin-users-error">Түүх ачаалахад алдаа гарлаа</div>
        ) : rows.length === 0 ? (
          <div className="admin-users-empty">Үнийн түүх байхгүй</div>
        ) : (
          <>
            <div className="admin-users-table-wrap admin-gold-price-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    {["№", "Огноо", "Монголбанк үнэ", "Авах үнэ", "Зарах үнэ", "Өөрчлөлт %", "Админ", "Үүсгэсэн огноо"].map(
                      (h) => (
                        <th key={h}>{h}</th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td>{(page - 1) * GOLD_PRICE_PAGE_SIZE + index + 1}</td>
                      <td className="admin-gold-price-table-date">{formatDate(row.createdAt)}</td>
                      <td className="font-medium text-[#D4AF37]">{formatMNT(getBankPrice(row))}</td>
                      <td>{formatMNT(getBuyPrice(row))}</td>
                      <td>{formatMNT(getSellPrice(row))}</td>
                      <td>
                        {row.changePercent != null ? (
                          <span className={changePercentClass(row.changePercent)}>
                            {formatChangePercent(row.changePercent)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{getAdminName(row)}</td>
                      <td className="admin-gold-price-table-date">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-gold-price-table-footer">
              <Pagination
                page={page}
                limit={GOLD_PRICE_PAGE_SIZE}
                total={total}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      <UpdateGoldPriceModal open={modalOpen} onOpenChange={setModalOpen} current={latestPrice} />
    </div>
  );
}
