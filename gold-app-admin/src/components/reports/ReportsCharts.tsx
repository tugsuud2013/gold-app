"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, membershipPieData } from "@/lib/reportsUi";
import { formatMNT } from "@/lib/utils";

type Props = {
  purchaseTrend: Array<{ date: string; count: number }>;
  sellTrend: Array<{ date: string; count: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
  membershipDistribution?: Record<string, number>;
};

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-reports-chart-card admin-users-card rounded-2xl">
      <h3 className="admin-reports-chart-title">{title}</h3>
      <div className="admin-reports-chart-body">{children}</div>
    </div>
  );
}

export default function ReportsCharts({
  purchaseTrend,
  sellTrend,
  revenueTrend,
  membershipDistribution,
}: Props) {
  const pieData = membershipPieData(membershipDistribution);

  return (
    <section className="admin-reports-charts grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="Purchase Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={purchaseTrend}>
            <CartesianGrid stroke="rgba(212,175,55,0.08)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)" }} />
            <Line type="monotone" dataKey="count" stroke={CHART_COLORS.purchase} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Sell Trend">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sellTrend}>
            <CartesianGrid stroke="rgba(212,175,55,0.08)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)" }} />
            <Bar dataKey="count" fill={CHART_COLORS.sell} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueTrend}>
            <CartesianGrid stroke="rgba(212,175,55,0.08)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)" }}
              formatter={(value) => formatMNT(Number(value ?? 0))}
            />
            <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.revenue} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Membership Distribution">
        {pieData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS.pie[i % CHART_COLORS.pie.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(212,175,55,0.2)" }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="admin-reports-chart-empty">Сонгосон хугацаанд өгөгдөл байхгүй</div>
        )}
      </ChartCard>
    </section>
  );
}
