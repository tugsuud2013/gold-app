import { formatDate, formatDateTime, formatMNT } from "@/lib/utils";

export type GoldPriceAdmin = {
  id: string;
  pricePerGram: number | string;
  mongolBankPrice: number | string;
  buyPrice: number | string;
  sellPrice: number | string;
  changePercent?: number | string | null;
  note?: string | null;
  source: string;
  createdAt: string;
  updatedAt?: string;
  admin?: { id: string; name: string; email: string } | null;
};

export type GoldPriceChartPoint = {
  mongolBankPrice: number | string;
  buyPrice: number | string;
  sellPrice: number | string;
  pricePerGram?: number | string;
  changePercent?: number | string | null;
  createdAt: string;
};

export type GoldPriceChartFilter = "7d" | "30d" | "90d" | "1y";

export const GOLD_PRICE_PAGE_SIZE = 20;

export const GOLD_PRICE_CHART_FILTERS: Array<{ key: GoldPriceChartFilter; label: string }> = [
  { key: "7d", label: "7 хоног" },
  { key: "30d", label: "30 хоног" },
  { key: "90d", label: "90 хоног" },
  { key: "1y", label: "1 жил" },
];

export function toNumber(value: number | string | null | undefined) {
  if (value == null || value === "") return 0;
  return Number(value);
}

export function getBankPrice(item: { mongolBankPrice?: number | string | null; pricePerGram?: number | string | null }) {
  return toNumber(item.mongolBankPrice ?? item.pricePerGram);
}

export function getBuyPrice(item: { mongolBankPrice?: number | string | null; pricePerGram?: number | string | null; buyPrice?: number | string | null }) {
  const buy = toNumber(item.buyPrice);
  if (buy > 0) return buy;
  const bank = getBankPrice(item);
  return Math.max(1, bank - 1000);
}

export function getSellPrice(item: { mongolBankPrice?: number | string | null; pricePerGram?: number | string | null; sellPrice?: number | string | null }) {
  const sell = toNumber(item.sellPrice);
  if (sell > 0) return sell;
  const bank = getBankPrice(item);
  return bank + 1000;
}

export function getLatestUpdatedAt(item: Pick<GoldPriceAdmin, "updatedAt" | "createdAt">) {
  return item.updatedAt ?? item.createdAt;
}

export type GoldPriceKpi = {
  mongolBankPrice: number;
  buyPrice: number;
  sellPrice: number;
  changePercent: number | null;
  updatedAt: string;
};

/** Top KPI cards — values from the latest price record only. */
export function buildGoldPriceKpi(latest: GoldPriceAdmin | null | undefined): GoldPriceKpi | null {
  if (!latest) return null;

  return {
    mongolBankPrice: toNumber(latest.mongolBankPrice),
    buyPrice: toNumber(latest.buyPrice),
    sellPrice: toNumber(latest.sellPrice),
    changePercent:
      latest.changePercent != null && latest.changePercent !== ""
        ? toNumber(latest.changePercent)
        : null,
    updatedAt: getLatestUpdatedAt(latest),
  };
}

export function formatChangePercent(value: number | string | null | undefined) {
  const n = toNumber(value);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function changePercentClass(value: number | string | null | undefined) {
  const n = toNumber(value);
  if (n > 0) return "admin-gold-price-change admin-gold-price-change--up";
  if (n < 0) return "admin-gold-price-change admin-gold-price-change--down";
  return "admin-gold-price-change";
}

export function getAdminName(item: GoldPriceAdmin) {
  return item.admin?.name ?? "—";
}

export function validateGoldPriceForm(input: {
  mongolBankPrice: string;
  buyPrice: string;
  sellPrice: string;
}) {
  const bank = Number(input.mongolBankPrice);
  const buy = Number(input.buyPrice);
  const sell = Number(input.sellPrice);

  if (!input.mongolBankPrice || Number.isNaN(bank) || bank <= 0) {
    return "Монголбанкны үнэ оруулна уу";
  }
  if (!input.buyPrice || Number.isNaN(buy) || buy <= 0) {
    return "Авах үнэ оруулна уу";
  }
  if (!input.sellPrice || Number.isNaN(sell) || sell <= 0) {
    return "Зарах үнэ оруулна уу";
  }
  if (buy > bank) {
    return "Авах үнэ Монголбанкны үнээс их байж болохгүй";
  }
  if (sell < buy) {
    return "Зарах үнэ авах үнээс бага байж болохгүй";
  }
  return null;
}

export function buildChartData(points: GoldPriceChartPoint[] | GoldPriceAdmin[]) {
  return points.map((p) => {
    const date = new Date(p.createdAt);
    const label = date
      .toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" })
      .replace(/\//g, ".");
    return {
      date: label,
      label,
      mongolBankPrice: getBankPrice(p),
      buyPrice: getBuyPrice(p),
      sellPrice: getSellPrice(p),
    };
  });
}

const CHART_FILTER_DAYS: Record<GoldPriceChartFilter, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

/** Client-side chart range filter on prices array (newest-first from API). */
export function filterPricesByChartRange(prices: GoldPriceAdmin[], filter: GoldPriceChartFilter) {
  const days = CHART_FILTER_DAYS[filter];
  const from = Date.now() - days * 24 * 60 * 60 * 1000;
  return prices
    .filter((p) => new Date(p.createdAt).getTime() >= from)
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function computeChangeVsPrevious(
  latest: GoldPriceAdmin,
  previous: GoldPriceAdmin | undefined,
): number | null {
  if (latest.changePercent != null && latest.changePercent !== "") {
    return toNumber(latest.changePercent);
  }
  if (!previous) return null;
  const current = toNumber(latest.mongolBankPrice) || getBankPrice(latest);
  const prev = toNumber(previous.mongolBankPrice) || getBankPrice(previous);
  if (prev === 0) return null;
  return Number((((current - prev) / prev) * 100).toFixed(4));
}

export function exportGoldPricesToCsv(items: GoldPriceAdmin[]) {
  const headers = [
    "№",
    "Огноо",
    "Монголбанк үнэ",
    "Авах үнэ",
    "Зарах үнэ",
    "Өөрчлөлт %",
    "Админ",
    "Үүсгэсэн огноо",
  ];
  const rows = items.map((item, index) => [
    String(index + 1),
    formatDate(item.createdAt),
    String(getBankPrice(item)),
    String(getBuyPrice(item)),
    String(getSellPrice(item)),
    item.changePercent != null ? formatChangePercent(item.changePercent) : "—",
    getAdminName(item),
    formatDateTime(item.createdAt),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `goldapp-gold-prices-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
