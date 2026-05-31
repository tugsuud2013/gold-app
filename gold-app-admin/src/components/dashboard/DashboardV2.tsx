"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  dashboardV2ActivityLog,
  dashboardV2MongolBankGold,
  dashboardV2QPayStats,
  dashboardV2RecentRegistrations,
  dashboardV2SalesChart,
  dashboardV2Stats,
} from "@/lib/dashboardMockData";
import { formatGrams, formatMNT } from "@/lib/utils";

const statCards = [
  {
    key: "users",
    label: "Нийт хэрэглэгч",
    value: dashboardV2Stats.totalUsers.toLocaleString("mn-MN"),
    hint: "Идэвхтэй бүртгэл",
    icon: Users,
  },
  {
    key: "new-users",
    label: "Өнөөдрийн шинэ бүртгэл",
    value: `+${dashboardV2Stats.todayNewUsers}`,
    hint: "Сүүлийн 24 цаг",
    icon: UserPlus,
  },
  {
    key: "purchases",
    label: "Нийт худалдан авалт",
    value: dashboardV2Stats.totalPurchases.toLocaleString("mn-MN"),
    hint: "Бүх цаг үе",
    icon: ShoppingCart,
  },
  {
    key: "gold",
    label: "Нийт алтны үлдэгдэл",
    value: formatGrams(dashboardV2Stats.totalGoldBalanceGrams),
    hint: "Системийн нийлбэр",
    icon: Coins,
  },
  {
    key: "sell",
    label: "Алт зарах хүсэлт",
    value: dashboardV2Stats.sellRequests.toLocaleString("mn-MN"),
    hint: "Хүлээгдэж буй",
    icon: TrendingUp,
  },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dashboard-v2-tooltip">
      <p className="dashboard-v2-tooltip-label">{label}</p>
      <p className="dashboard-v2-tooltip-value">{formatMNT(payload[0].value)}</p>
    </div>
  );
}

function activityIcon(type: (typeof dashboardV2ActivityLog)[number]["type"]) {
  switch (type) {
    case "purchase":
      return ShoppingCart;
    case "sell":
      return TrendingUp;
    case "payment":
      return Coins;
    case "kyc":
      return UserPlus;
    default:
      return Activity;
  }
}

function kycBadgeClass(status: (typeof dashboardV2RecentRegistrations)[number]["kycStatus"]) {
  if (status === "VERIFIED") return "dashboard-v2-badge dashboard-v2-badge--success";
  if (status === "REJECTED") return "dashboard-v2-badge dashboard-v2-badge--danger";
  return "dashboard-v2-badge dashboard-v2-badge--pending";
}

function kycLabel(status: (typeof dashboardV2RecentRegistrations)[number]["kycStatus"]) {
  if (status === "VERIFIED") return "Баталгаажсан";
  if (status === "REJECTED") return "Татгалзсан";
  return "Хүлээгдэж буй";
}

export default function DashboardV2() {
  const goldUp = dashboardV2MongolBankGold.changePercent >= 0;

  return (
    <div className="dashboard-v2">
      <section className="dashboard-v2-stats grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.key} className="dashboard-v2-card dashboard-v2-stat-card rounded-2xl">
              <div className="dashboard-v2-stat-card-top">
                <span className="dashboard-v2-stat-icon">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <p className="dashboard-v2-stat-label">{card.label}</p>
              </div>
              <p className="dashboard-v2-stat-value">{card.value}</p>
              <p className="dashboard-v2-stat-hint">{card.hint}</p>
            </article>
          );
        })}
      </section>

      <section className="dashboard-v2-mid grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="dashboard-v2-card dashboard-v2-panel rounded-2xl lg:col-span-2">
          <div className="dashboard-v2-panel-header">
            <div>
              <h2 className="dashboard-v2-panel-title">Худалдааны график</h2>
              <p className="dashboard-v2-panel-subtitle">Сүүлийн 7 хоногийн орлого (mock)</p>
            </div>
          </div>
          <div className="dashboard-v2-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardV2SalesChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardGoldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(212, 175, 55, 0.04)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}M`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={3}
                  fill="url(#dashboardGoldFill)"
                  activeDot={{ r: 5, fill: "#D4AF37", stroke: "#0B0B0B", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className="dashboard-v2-side flex min-w-0 flex-col gap-4">
          <article className="dashboard-v2-card dashboard-v2-panel dashboard-v2-gold-card rounded-2xl">
            <div className="dashboard-v2-panel-header">
              <div>
                <h2 className="dashboard-v2-panel-title">Монголбанкны алтны ханш</h2>
                <p className="dashboard-v2-panel-subtitle">{dashboardV2MongolBankGold.source}</p>
              </div>
              <span
                className={`dashboard-v2-change ${goldUp ? "dashboard-v2-change--up" : "dashboard-v2-change--down"}`}
              >
                {goldUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {goldUp ? "+" : ""}
                {dashboardV2MongolBankGold.changePercent}%
              </span>
            </div>
            <p className="dashboard-v2-gold-price">{formatMNT(dashboardV2MongolBankGold.pricePerGram)}</p>
            <p className="dashboard-v2-gold-unit">грамм тутамд</p>
            <div className="dashboard-v2-gold-meta">
              <div>
                <span className="dashboard-v2-meta-label">Авах</span>
                <span className="dashboard-v2-meta-value">{formatMNT(dashboardV2MongolBankGold.buyPrice)}</span>
              </div>
              <div>
                <span className="dashboard-v2-meta-label">Зарах</span>
                <span className="dashboard-v2-meta-value">{formatMNT(dashboardV2MongolBankGold.sellPrice)}</span>
              </div>
            </div>
            <p className="dashboard-v2-updated">Шинэчлэгдсэн: {dashboardV2MongolBankGold.updatedAt}</p>
          </article>

          <article className="dashboard-v2-card dashboard-v2-panel rounded-2xl">
            <div className="dashboard-v2-panel-header">
              <div>
                <h2 className="dashboard-v2-panel-title">QPay төлбөрийн статистик</h2>
                <p className="dashboard-v2-panel-subtitle">Өнөөдрийн гүйлгээ</p>
              </div>
            </div>
            <div className="dashboard-v2-qpay-grid">
              <div className="dashboard-v2-qpay-item">
                <span className="dashboard-v2-meta-label">Гүйлгээ</span>
                <span className="dashboard-v2-qpay-value">{dashboardV2QPayStats.todayTransactions}</span>
              </div>
              <div className="dashboard-v2-qpay-item">
                <span className="dashboard-v2-meta-label">Дүн</span>
                <span className="dashboard-v2-qpay-value">{formatMNT(dashboardV2QPayStats.todayAmountMnt)}</span>
              </div>
              <div className="dashboard-v2-qpay-item">
                <span className="dashboard-v2-meta-label">Амжилт</span>
                <span className="dashboard-v2-qpay-value">{dashboardV2QPayStats.successRate}%</span>
              </div>
              <div className="dashboard-v2-qpay-item">
                <span className="dashboard-v2-meta-label">Хүлээгдэж буй</span>
                <span className="dashboard-v2-qpay-value">{dashboardV2QPayStats.pendingCount}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="dashboard-v2-bottom grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="dashboard-v2-card dashboard-v2-panel rounded-2xl">
          <div className="dashboard-v2-panel-header">
            <div>
              <h2 className="dashboard-v2-panel-title">Сүүлийн үйл ажиллагаа</h2>
              <p className="dashboard-v2-panel-subtitle">Activity Log</p>
            </div>
          </div>
          <ul className="dashboard-v2-activity-list">
            {dashboardV2ActivityLog.map((item) => {
              const Icon = activityIcon(item.type);
              return (
                <li key={item.id} className="dashboard-v2-activity-item">
                  <span className="dashboard-v2-activity-icon">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="dashboard-v2-activity-action">{item.action}</p>
                    <p className="dashboard-v2-activity-meta">
                      {item.user} · {item.time}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="dashboard-v2-card dashboard-v2-panel rounded-2xl">
          <div className="dashboard-v2-panel-header">
            <div>
              <h2 className="dashboard-v2-panel-title">Сүүлийн бүртгэлүүд</h2>
              <p className="dashboard-v2-panel-subtitle">Шинэ хэрэглэгчид</p>
            </div>
          </div>
          <div className="dashboard-v2-table-wrap overflow-x-auto">
            <table className="dashboard-v2-table w-full min-w-[320px]">
              <thead>
                <tr>
                  <th>Хэрэглэгч</th>
                  <th>Утас</th>
                  <th>KYC</th>
                  <th>Огноо</th>
                </tr>
              </thead>
              <tbody>
                {dashboardV2RecentRegistrations.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={kycBadgeClass(user.kycStatus)}>{kycLabel(user.kycStatus)}</span>
                    </td>
                    <td className="dashboard-v2-table-date whitespace-nowrap">{user.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
