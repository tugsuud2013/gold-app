export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

export interface User {
  id: string;
  phoneNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  registerNumber?: string | null;
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
  membershipLevel: "NORMAL" | "BRONZE" | "SILVER" | "GOLD";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  isChatBanned: boolean;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balanceGrams: number | string;
  totalPurchasedGrams: number | string;
  totalSoldGrams: number | string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: "PURCHASE" | "SELL_DEDUCT" | "ADMIN_ADJUST";
  amountGrams: number | string;
  balanceBefore: number | string;
  balanceAfter: number | string;
  note?: string | null;
  createdAt: string;
}

export interface Purchase {
  id: string;
  orderNo?: string | null;
  userId: string;
  amountGrams: number | string;
  pricePerGram: number | string;
  totalAmountMnt: number | string;
  status: string;
  qpayStatus: string;
  qpayInvoiceId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  contractPdfUrl?: string | null;
  contractQrCode?: string | null;
  user?: {
    id: string;
    phoneNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    membershipLevel?: string;
  } | null;
}

export interface SellRequest {
  id: string;
  requestNo?: string | null;
  userId: string;
  amountGrams: number | string;
  pricePerGram?: number | string | null;
  totalAmountMnt?: number | string | null;
  status: string;
  adminNote?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  user?: {
    id: string;
    phoneNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    membershipLevel?: string;
  } | null;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  adminId?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  isPublished: boolean;
  createdAt: string;
}

export interface GoldPrice {
  id: string;
  pricePerGram: number | string;
  source: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "OPERATOR";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt?: string;
}

export interface DashboardStats {
  todayNewUsers: number;
  todayPurchases: { count: number; revenue: number };
  totalActiveUsers: number;
  totalGoldInSystem: number;
  pendingSellRequests: number;
  currentGoldPrice?: GoldPrice | null;
}

export interface PurchaseReport {
  totalPurchases: number;
  totalGramsSold: number;
  totalRevenue: number;
  successfulCount: number;
  failedCount: number;
  dailyBreakdown: Array<{ date: string; count: number; grams: number; revenue: number }>;
}

export interface UserReport {
  totalUsers: number;
  newRegistrations: number;
  kycVerifiedCount: number;
  activeCount: number;
  suspendedCount: number;
  membershipDistribution: Record<string, number>;
}
