import { MembershipLevel, PurchaseStatus, SellRequestStatus, UserStatus } from '@prisma/client';

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
  membershipLevel?: MembershipLevel;
  status?: string;
  userId?: string;
  userSearch?: string;
};

export function parseMembershipLevel(value?: string): MembershipLevel | undefined {
  if (!value) return undefined;
  if (Object.values(MembershipLevel).includes(value as MembershipLevel)) {
    return value as MembershipLevel;
  }
  return undefined;
}

export function parseUserStatus(value?: string): UserStatus | undefined {
  if (!value) return undefined;
  if (Object.values(UserStatus).includes(value as UserStatus)) {
    return value as UserStatus;
  }
  return undefined;
}

export function parsePurchaseStatus(value?: string): PurchaseStatus | undefined {
  if (!value) return undefined;
  if (Object.values(PurchaseStatus).includes(value as PurchaseStatus)) {
    return value as PurchaseStatus;
  }
  return undefined;
}

export function parseSellStatus(value?: string): SellRequestStatus | undefined {
  if (!value) return undefined;
  if (Object.values(SellRequestStatus).includes(value as SellRequestStatus)) {
    return value as SellRequestStatus;
  }
  return undefined;
}
