/** Dashboard V2 mock data — replace with API when ready */

export const dashboardV2Stats = {
  totalUsers: 12_847,
  todayNewUsers: 34,
  totalPurchases: 892,
  totalGoldBalanceGrams: 1_523.4567,
  sellRequests: 12,
};

export const dashboardV2SalesChart = [
  { date: "05.24", revenue: 4_250_000, count: 18 },
  { date: "05.25", revenue: 5_120_000, count: 22 },
  { date: "05.26", revenue: 3_890_000, count: 15 },
  { date: "05.27", revenue: 6_340_000, count: 28 },
  { date: "05.28", revenue: 5_780_000, count: 24 },
  { date: "05.29", revenue: 7_210_000, count: 31 },
  { date: "05.30", revenue: 6_850_000, count: 27 },
];

export const dashboardV2MongolBankGold = {
  pricePerGram: 385_420,
  changePercent: 1.24,
  source: "Монголбанк",
  updatedAt: "2026-05-30 14:30",
  buyPrice: 384_100,
  sellPrice: 386_740,
};

export const dashboardV2QPayStats = {
  todayTransactions: 28,
  todayAmountMnt: 12_580_000,
  successRate: 98.5,
  pendingCount: 2,
  avgAmountMnt: 449_286,
};

export const dashboardV2ActivityLog = [
  {
    id: "1",
    action: "Шинэ худалдан авалт баталгаажлаа",
    user: "Б.Батбаяр",
    time: "2026-05-30 14:22",
    type: "purchase" as const,
  },
  {
    id: "2",
    action: "KYC баталгаажуулалт хийгдлээ",
    user: "С.Оюун",
    time: "2026-05-30 13:58",
    type: "kyc" as const,
  },
  {
    id: "3",
    action: "Алт зарах хүсэлт ирлээ",
    user: "Д.Тэмүүл",
    time: "2026-05-30 13:41",
    type: "sell" as const,
  },
  {
    id: "4",
    action: "QPay төлбөр амжилттай",
    user: "Э.Мөнх",
    time: "2026-05-30 12:15",
    type: "payment" as const,
  },
  {
    id: "5",
    action: "Шинэ хэрэглэгч бүртгэгдлээ",
    user: "Г.Анар",
    time: "2026-05-30 11:30",
    type: "user" as const,
  },
  {
    id: "6",
    action: "Админ ханшийг шинэчиллээ",
    user: "System",
    time: "2026-05-30 09:00",
    type: "system" as const,
  },
];

export const dashboardV2RecentRegistrations = [
  {
    id: "u1",
    name: "Батбаяр Б.",
    phone: "9911-2233",
    kycStatus: "VERIFIED" as const,
    createdAt: "2026-05-30 14:10",
  },
  {
    id: "u2",
    name: "Оюун С.",
    phone: "8812-4455",
    kycStatus: "PENDING" as const,
    createdAt: "2026-05-30 13:52",
  },
  {
    id: "u3",
    name: "Тэмүүл Д.",
    phone: "9900-7788",
    kycStatus: "VERIFIED" as const,
    createdAt: "2026-05-30 12:40",
  },
  {
    id: "u4",
    name: "Мөнх Э.",
    phone: "9922-6611",
    kycStatus: "PENDING" as const,
    createdAt: "2026-05-30 11:18",
  },
  {
    id: "u5",
    name: "Анар Г.",
    phone: "9933-9900",
    kycStatus: "REJECTED" as const,
    createdAt: "2026-05-30 10:05",
  },
];
