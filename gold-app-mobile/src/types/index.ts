export interface User {
  id: string;
  phone: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  membership: 'NORMAL' | 'BRONZE' | 'SILVER' | 'GOLD';
  kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'VERIFIED' | 'REJECTED';
  registerNumber?: string;
  signatureImageBase64?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  goldBalanceGrams: number;
  mntBalance: number;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'PURCHASE' | 'SELL' | 'DEPOSIT' | 'WITHDRAW';
  description: string;
  grams: number;
  amountMnt: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  grams: number;
  pricePerGram: number;
  totalAmount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  contractPdfUrl?: string;
  qpayQrImageBase64?: string;
  transactionId?: string;
  createdAt: string;
}

export interface SellRequest {
  id: string;
  grams: number;
  expectedAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface KycPayload {
  firstName: string;
  lastName: string;
  registerNumber: string;
  signatureImageBase64: string;
}

export interface PurchaseInitiateResponse {
  id: string;
  grams: number;
  pricePerGram: number;
  totalAmount: number;
  qr_image?: string;
  qrImageBase64?: string;
  expiresAt?: string;
}

export interface GoldPrice {
  pricePerGram: number;
  buyPrice?: number;
  sellPrice?: number;
  changePercent: number;
  changeAmount?: number;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
}

export interface BackendUserProfile {
  id: string;
  phoneNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  registerNumber?: string | null;
  kycStatus?: User['kycStatus'];
  membershipLevel?: User['membership'];
  status?: string;
  signatureImageUrl?: string | null;
  createdAt?: string;
  wallet?: {
    balanceGrams: number | string;
    totalPurchasedGrams?: number | string;
    totalSoldGrams?: number | string;
  } | null;
}

export interface BackendWalletBalance {
  id: string;
  userId: string;
  balanceGrams: number | string;
  totalPurchasedGrams?: number | string;
  totalSoldGrams?: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendWalletTransaction {
  id: string;
  type: 'PURCHASE' | 'SELL_DEDUCT' | 'ADMIN_ADJUST' | string;
  amountGrams: number | string;
  note?: string | null;
  createdAt: string;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  senderMembership?: User['membership'];
  message: string;
  createdAt: string;
}

export interface AuthResponse extends AuthTokens {}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
