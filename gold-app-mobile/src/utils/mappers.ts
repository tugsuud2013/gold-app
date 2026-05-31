import {
  BackendUserProfile,
  BackendWalletBalance,
  BackendWalletTransaction,
  GoldPrice,
  News,
  User,
  Wallet,
  WalletTransaction,
} from '../types';

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const txTypeLabels: Record<string, string> = {
  PURCHASE: 'Худалдан авалт',
  SELL_DEDUCT: 'Зарсан',
  ADMIN_ADJUST: 'Админ засвар',
};

export const mapProfileToUser = (profile: BackendUserProfile): User => {
  const firstName = profile.firstName?.trim() ?? '';
  const lastName = profile.lastName?.trim() ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || profile.phoneNumber;

  return {
    id: profile.id,
    phone: profile.phoneNumber,
    fullName,
    firstName: profile.firstName ?? undefined,
    lastName: profile.lastName ?? undefined,
    membership: profile.membershipLevel ?? 'NORMAL',
    kycStatus: profile.kycStatus,
    registerNumber: profile.registerNumber ?? undefined,
    signatureImageBase64: profile.signatureImageUrl ?? undefined,
    createdAt: profile.createdAt ?? new Date().toISOString(),
  };
};

export const mapWalletBalance = (
  balance: BackendWalletBalance,
  pricePerGram = 0,
): Wallet => ({
  id: balance.id,
  userId: balance.userId,
  goldBalanceGrams: toNumber(balance.balanceGrams),
  mntBalance: Math.round(toNumber(balance.balanceGrams) * pricePerGram),
  updatedAt: balance.updatedAt,
});

export const mapWalletTransaction = (tx: BackendWalletTransaction): WalletTransaction => {
  const type =
    tx.type === 'SELL_DEDUCT'
      ? 'SELL'
      : tx.type === 'ADMIN_ADJUST'
        ? 'DEPOSIT'
        : 'PURCHASE';

  return {
    id: tx.id,
    type,
    description: tx.note?.trim() || txTypeLabels[tx.type] || tx.type,
    grams: toNumber(tx.amountGrams),
    amountMnt: 0,
    createdAt: tx.createdAt,
  };
};

export const mapGoldPrice = (raw: Record<string, unknown> | null): GoldPrice | null => {
  if (!raw) return null;

  const pricePerGram = toNumber(raw.pricePerGram ?? raw.mongolBankPrice);
  const buyPrice = toNumber(raw.buyPrice, pricePerGram);
  const changePercent = raw.changePercent == null ? 0 : toNumber(raw.changePercent);

  return {
    pricePerGram: buyPrice > 0 ? buyPrice : pricePerGram,
    buyPrice,
    sellPrice: toNumber(raw.sellPrice, pricePerGram),
    changePercent,
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()),
  };
};

export const mapNewsItem = (raw: Record<string, unknown>): News => ({
  id: String(raw.id),
  title: String(raw.title ?? ''),
  summary: String(raw.summary ?? ''),
  content: String(raw.content ?? ''),
  imageUrl: (raw.coverImageUrl as string | undefined) ?? undefined,
  publishedAt: String(raw.publishedAt ?? raw.createdAt ?? new Date().toISOString()),
});
