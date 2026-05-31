"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { GOLD_PRICE_CHART_FILTERS, type GoldPriceChartFilter } from "@/lib/goldPriceUi";
import { formatMNT } from "@/lib/utils";

const CHART_COLORS = {
  mongolBankPrice: "#D4AF37",
  buyPrice: "#34D399",
  sellPrice: "#F87171",
} as const;

const CHART_LABELS: Record<keyof typeof CHART_COLORS, string> = {
  mongolBankPrice: "Монголбанк",
  buyPrice: "Авах",
  sellPrice: "Зарах",
};

export type GoldPriceChartRow = {
  date: string;
  label: string;
  mongolBankPrice: number;
  buyPrice: number;
  sellPrice: number;
};

type Props = {
  filter: GoldPriceChartFilter;
  onFilterChange: (filter: GoldPriceChartFilter) => void;
  data: GoldPriceChartRow[];
  isLoading?: boolean;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-gold-price-chart-tooltip">
      <p className="admin-gold-price-chart-tooltip-date">{label}</p>
      <div className="admin-gold-price-chart-tooltip-rows">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="admin-gold-price-chart-tooltip-row">
            <span
              className="admin-gold-price-chart-tooltip-dot"
              style={{ backgroundColor: entry.color }}
            />
            <span className="admin-gold-price-chart-tooltip-label">
              {CHART_LABELS[entry.dataKey as keyof typeof CHART_LABELS] ?? entry.dataKey}
            </span>
            <span className="admin-gold-price-chart-tooltip-value" style={{ color: entry.color }}>
              {formatMNT(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GoldPriceChart({ filter, onFilterChange, data, isLoading }: Props) {
  return (
    <section className="admin-users-card admin-gold-price-chart-card rounded-2xl">
      <div className="admin-gold-price-chart-header">
        <div>
          <h2 className="admin-gold-price-section-title">Алтны ханшийн график</h2>
          <p className="admin-users-subtitle">Монголбанк, авах, зарах үнийн түүх</p>
        </div>
        <div className="admin-gold-price-chart-tabs">
          {GOLD_PRICE_CHART_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`admin-gold-price-chart-tab ${filter === item.key ? "admin-gold-price-chart-tab--active" : ""}`}
              onClick={() => onFilterChange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-gold-price-chart-body">
        {isLoading ? (
          <div className="admin-users-loading">
            <LoadingSpinner />
          </div>
        ) : data.length === 0 ? (
          <div className="admin-users-empty">Графикийн өгөгдөл байхгүй</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgb(212 175 55 / 0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                domain={[450000, 470000]}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgb(212 175 55 / 0.45)", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#9CA3AF", paddingTop: 8 }}
                formatter={(value) => CHART_LABELS[value as keyof typeof CHART_LABELS] ?? value}
              />
              <Line
                type="monotone"
                dataKey="mongolBankPrice"
                name="mongolBankPrice"
                stroke={CHART_COLORS.mongolBankPrice}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: CHART_COLORS.mongolBankPrice, stroke: "#111", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="buyPrice"
                name="buyPrice"
                stroke={CHART_COLORS.buyPrice}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: CHART_COLORS.buyPrice, stroke: "#111", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="sellPrice"
                name="sellPrice"
                stroke={CHART_COLORS.sellPrice}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: CHART_COLORS.sellPrice, stroke: "#111", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
