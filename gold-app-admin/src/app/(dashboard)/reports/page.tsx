"use client";

import { Download, FileText, RefreshCw, Users, ShoppingCart, ArrowDownUp, Coins, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import ReportsCharts from "@/components/reports/ReportsCharts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  useGoldMovementReport,
  usePurchaseReport,
  useReportSummary,
  useRevenueReport,
  useSellReport,
  useUserReport,
} from "@/hooks/useReports";
import {
  exportReportExcel,
  exportReportPdf,
  fillDateSeries,
  formatReportGrams,
  formatReportMnt,
  getDefaultReportRange,
  MEMBERSHIP_FILTER_OPTIONS,
  PURCHASE_STATUS_OPTIONS,
  REPORT_TABS,
  SELL_STATUS_OPTIONS,
  USER_STATUS_OPTIONS,
  type ReportFilters,
  type ReportSummary,
  type ReportTab,
} from "@/lib/reportsUi";
import { membershipLabel } from "@/lib/usersUi";
import { formatGrams, formatMNT } from "@/lib/utils";

const kpiCards = [
  { key: "totalUsers" as const, label: "Нийт хэрэглэгч", icon: Users },
  { key: "totalPurchases" as const, label: "Нийт худалдан авалт", icon: ShoppingCart },
  { key: "totalSellRequests" as const, label: "Нийт зарах хүсэлт", icon: ArrowDownUp },
  { key: "totalGoldGrams" as const, label: "Нийт алт (гр)", icon: Coins },
  { key: "totalRevenue" as const, label: "Нийт орлого", icon: Wallet },
];

function statusOptionsForTab(tab: ReportTab) {
  if (tab === "users") return USER_STATUS_OPTIONS;
  if (tab === "purchases" || tab === "revenue") return PURCHASE_STATUS_OPTIONS;
  if (tab === "sells") return SELL_STATUS_OPTIONS;
  return [{ value: "", label: "Бүх статус" }];
}

export default function ReportsPage() {
  const defaults = getDefaultReportRange();
  const [tab, setTab] = useState<ReportTab>("users");
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: defaults.startDate,
    endDate: defaults.endDate,
  });

  const summaryQ = useReportSummary(filters);
  const purchaseQ = usePurchaseReport(filters);
  const userQ = useUserReport(filters);
  const sellQ = useSellReport(filters);
  const revenueQ = useRevenueReport(filters);
  const goldQ = useGoldMovementReport(filters);

  const kpi = useMemo<ReportSummary>(() => ({
    totalUsers: summaryQ.data?.totalUsers ?? userQ.data?.totalUsers ?? 0,
    totalPurchases: summaryQ.data?.totalPurchases ?? purchaseQ.data?.totalPurchases ?? 0,
    totalSellRequests: summaryQ.data?.totalSellRequests ?? sellQ.data?.totalRequests ?? 0,
    totalGoldGrams:
      summaryQ.data?.totalGoldGrams ??
      purchaseQ.data?.totalGramsSold ??
      goldQ.data?.netGoldInSystem ??
      0,
    totalRevenue:
      summaryQ.data?.totalRevenue ??
      revenueQ.data?.totalRevenue ??
      purchaseQ.data?.totalRevenue ??
      0,
  }), [summaryQ.data, userQ.data, purchaseQ.data, sellQ.data, revenueQ.data, goldQ.data]);

  const kpiLoading =
    summaryQ.isLoading &&
    !userQ.data &&
    !purchaseQ.data &&
    !sellQ.data &&
    !revenueQ.data &&
    !goldQ.data;

  const isLoading =
    summaryQ.isLoading ||
    purchaseQ.isLoading ||
    userQ.isLoading ||
    sellQ.isLoading ||
    revenueQ.isLoading;

  const updateFilter = (patch: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const chartPurchase = useMemo(
    () =>
      fillDateSeries(
        filters.startDate,
        filters.endDate,
        purchaseQ.data?.dailyBreakdown?.map((d) => ({ date: d.date, count: d.count })) ?? [],
        { count: 0 },
      ),
    [filters.startDate, filters.endDate, purchaseQ.data],
  );

  const chartSell = useMemo(
    () =>
      fillDateSeries(
        filters.startDate,
        filters.endDate,
        sellQ.data?.dailyBreakdown?.map((d) => ({ date: d.date, count: d.count })) ?? [],
        { count: 0 },
      ),
    [filters.startDate, filters.endDate, sellQ.data],
  );

  const chartRevenue = useMemo(
    () =>
      fillDateSeries(
        filters.startDate,
        filters.endDate,
        revenueQ.data?.dailyBreakdown ?? [],
        { revenue: 0, count: 0 },
      ),
    [filters.startDate, filters.endDate, revenueQ.data],
  );

  const exportRows = useMemo(() => {
    if (tab === "users") {
      return Object.entries(userQ.data?.membershipDistribution ?? {}).map(([level, count]) => ({
        Ангилал: membershipLabel(level),
        Тоо: count,
      }));
    }
    if (tab === "purchases") {
      return (purchaseQ.data?.dailyBreakdown ?? []).map((d) => ({
        Огноо: d.date,
        Тоо: d.count,
        Грамм: d.grams,
        Орлого: d.revenue,
      }));
    }
    if (tab === "sells") {
      return (sellQ.data?.dailyBreakdown ?? []).map((d) => ({
        Огноо: d.date,
        Тоо: d.count,
        Грамм: d.grams,
        Дүн: d.amount,
      }));
    }
    if (tab === "revenue") {
      return (revenueQ.data?.dailyBreakdown ?? []).map((d) => ({
        Огноо: d.date,
        Орлого: d.revenue,
        Гүйлгээ: d.count,
      }));
    }
    return (goldQ.data?.topUsersByBalance ?? []).map((w, i) => ({
      "№": i + 1,
      Утас: w.user.phoneNumber,
      Үлдэгдэл: w.balanceGrams,
      Membership: w.user.membershipLevel ?? "",
    }));
  }, [tab, userQ.data, purchaseQ.data, sellQ.data, revenueQ.data, goldQ.data]);

  const handleExcel = () => {
    if (!exportRows.length) return;
    exportReportExcel(exportRows, `goldapp-report-${tab}-${filters.startDate}-${filters.endDate}`);
  };

  const handlePdf = () => {
    if (!exportRows.length) return;
    const headers = Object.keys(exportRows[0]);
    const rows = exportRows.map((row) => headers.map((h) => String(row[h as keyof typeof row] ?? "")));
    exportReportPdf(`GoldApp Report — ${REPORT_TABS.find((t) => t.id === tab)?.label}`, headers, rows);
  };

  return (
    <div className="admin-reports-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Тайлан удирдлага</h1>
          <p className="admin-users-subtitle">
            Analytics & export · <span className="text-[#D4AF37]">{filters.startDate}</span> — {filters.endDate}
          </p>
        </div>
        <div className="admin-users-header-actions">
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            onClick={() => {
              summaryQ.refetch();
              purchaseQ.refetch();
              userQ.refetch();
              sellQ.refetch();
              revenueQ.refetch();
              goldQ.refetch();
            }}
          >
            <RefreshCw size={16} className={summaryQ.isFetching ? "animate-spin" : ""} />
            Шинэчлэх
          </button>
        </div>
      </header>

      <section className="admin-reports-kpis grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map(({ key, label, icon: Icon }) => (
          <div key={key} className="admin-users-card admin-reports-kpi rounded-2xl">
            <div className="admin-reports-kpi-head">
              <Icon size={18} className="text-[#D4AF37]" />
              <p className="admin-users-label">{label}</p>
            </div>
            <p className="admin-reports-kpi-value">
              {kpiLoading ? "—" : key === "totalGoldGrams"
                ? formatReportGrams(kpi[key])
                : key === "totalRevenue"
                  ? formatReportMnt(kpi[key])
                  : kpi[key].toLocaleString("mn-MN")}
            </p>
          </div>
        ))}
      </section>

      <section className="admin-users-card admin-users-filters rounded-2xl">
        <div className="admin-users-filters-grid">
          <label className="admin-users-field admin-reports-filter-field">
            <span className="admin-users-label">Эхлэх огноо</span>
            <input type="date" className="admin-users-input admin-users-datetime" value={filters.startDate} onChange={(e) => updateFilter({ startDate: e.target.value })} />
          </label>
          <label className="admin-users-field admin-reports-filter-field">
            <span className="admin-users-label">Дуусах огноо</span>
            <input type="date" className="admin-users-input admin-users-datetime" value={filters.endDate} onChange={(e) => updateFilter({ endDate: e.target.value })} />
          </label>
          <label className="admin-users-field admin-reports-filter-field">
            <span className="admin-users-label">Membership</span>
            <select className="admin-users-select" value={filters.membershipLevel ?? ""} onChange={(e) => updateFilter({ membershipLevel: e.target.value || undefined })}>
              {MEMBERSHIP_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="admin-users-field admin-reports-filter-field">
            <span className="admin-users-label">Status</span>
            <select className="admin-users-select" value={filters.status ?? ""} onChange={(e) => updateFilter({ status: e.target.value || undefined })}>
              {statusOptionsForTab(tab).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="admin-users-field admin-reports-filter-field">
            <span className="admin-users-label">Хэрэглэгч</span>
            <input className="admin-users-input" placeholder="Нэр, утсаар..." value={filters.userSearch ?? ""} onChange={(e) => updateFilter({ userSearch: e.target.value || undefined })} />
          </label>
        </div>
      </section>

      {isLoading ? (
        <div className="admin-users-loading"><LoadingSpinner /></div>
      ) : (
        <ReportsCharts
          purchaseTrend={chartPurchase}
          sellTrend={chartSell}
          revenueTrend={chartRevenue}
          membershipDistribution={userQ.data?.membershipDistribution}
        />
      )}

      <section className="admin-reports-tabs">
        {REPORT_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-reports-tab ${tab === t.id ? "admin-reports-tab--active" : ""}`}
            onClick={() => {
              setTab(t.id);
              updateFilter({ status: undefined });
            }}
          >
            {t.label}
          </button>
        ))}
      </section>

      <section className="admin-users-card admin-reports-table-card rounded-2xl">
        <div className="admin-reports-table-toolbar">
          <h2 className="admin-reports-table-title">{REPORT_TABS.find((t) => t.id === tab)?.label}</h2>
          <div className="admin-reports-export-actions">
            <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={handleExcel} disabled={!exportRows.length}>
              <Download size={16} /> Export Excel
            </button>
            <button type="button" className="admin-users-btn admin-users-btn--primary" onClick={handlePdf} disabled={!exportRows.length}>
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>

        <div className="admin-users-table-wrap admin-reports-table-wrap">
          {tab === "users" && (
            <table className="admin-users-table">
              <thead>
                <tr>{["Ангилал", "Хэрэглэгчийн тоо", "Хувь"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {Object.entries(userQ.data?.membershipDistribution ?? {}).map(([level, count]) => {
                  const total = userQ.data?.totalUsers ?? 1;
                  return (
                    <tr key={level}>
                      <td>{membershipLabel(level)}</td>
                      <td>{count.toLocaleString("mn-MN")}</td>
                      <td>{total ? ((count / total) * 100).toFixed(1) : "0"}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {tab === "purchases" && (
            <table className="admin-users-table">
              <thead>
                <tr>{["Огноо", "Тоо", "Грамм", "Орлого"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(purchaseQ.data?.dailyBreakdown ?? []).map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{d.count}</td>
                    <td>{formatGrams(d.grams)}</td>
                    <td>{formatMNT(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "sells" && (
            <table className="admin-users-table">
              <thead>
                <tr>{["Огноо", "Хүсэлт", "Грамм", "Дүн"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(sellQ.data?.dailyBreakdown ?? []).map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{d.count}</td>
                    <td>{formatGrams(d.grams)}</td>
                    <td>{formatMNT(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "gold" && (
            <table className="admin-users-table">
              <thead>
                <tr>{["№", "Хэрэглэгч", "Утас", "Үлдэгдэл", "Membership"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(goldQ.data?.topUsersByBalance ?? []).map((w, i) => (
                  <tr key={w.user.id}>
                    <td>{i + 1}</td>
                    <td>{`${w.user.lastName ?? ""} ${w.user.firstName ?? ""}`.trim() || "—"}</td>
                    <td>{w.user.phoneNumber}</td>
                    <td>{formatGrams(w.balanceGrams)}</td>
                    <td>{membershipLabel(w.user.membershipLevel ?? "NORMAL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "revenue" && (
            <table className="admin-users-table">
              <thead>
                <tr>{["Огноо", "Орлого", "Гүйлгээ"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(revenueQ.data?.dailyBreakdown ?? []).map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{formatMNT(d.revenue)}</td>
                    <td>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
