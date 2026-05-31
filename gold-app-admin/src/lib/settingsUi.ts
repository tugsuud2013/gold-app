export type SettingsTab =
  | "general"
  | "company"
  | "contact"
  | "qpay"
  | "membership"
  | "notifications"
  | "admins"
  | "roles";

export const SETTINGS_TABS: Array<{
  id: SettingsTab;
  label: string;
  description: string;
  superAdminOnly?: boolean;
}> = [
  {
    id: "general",
    label: "Ерөнхий тохиргоо",
    description: "App нэр, хэл, валют, maintenance mode зэрэг ерөнхий тохиргоо",
  },
  {
    id: "company",
    label: "Компанийн мэдээлэл",
    description: "Компанийн албан ёсны мэдээлэл, хаяг, logo, website",
  },
  {
    id: "contact",
    label: "Холбоо барих мэдээлэл",
    description: "Support, sales холбоо барих мэдээлэл, social холбоос",
  },
  {
    id: "qpay",
    label: "QPay тохиргоо",
    description: "QPay merchant тохиргоо, invoice code, webhook",
    superAdminOnly: true,
  },
  {
    id: "membership",
    label: "Гишүүнчлэлийн тохиргоо",
    description: "NORMAL, BRONZE, SILVER, GOLD membership шалгуур (доод хэмжээ)",
  },
  {
    id: "notifications",
    label: "Мэдэгдлийн тохиргоо",
    description: "Push, email мэдэгдлийн тохиргоо",
  },
  {
    id: "admins",
    label: "Админ хэрэглэгчид",
    description: "Админ хэрэглэгчид нэмэх, role, статус удирдах",
    superAdminOnly: true,
  },
  {
    id: "roles",
    label: "Эрх ба зөвшөөрөл",
    description: "Super Admin, Admin, Operator эрхийн матриц",
    superAdminOnly: true,
  },
];

export const SETTINGS_SAVE_TOAST = "Тохиргоо амжилттай хадгалагдлаа";
export const MEMBERSHIP_SAVE_TOAST = "Membership тохиргоо хадгалагдлаа";

export type GeneralSettings = {
  appName: string;
  appTagline: string;
  timezone: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

export type CompanySettings = {
  companyName: string;
  legalName: string;
  registrationNumber: string;
  address: string;
  city: string;
  country: string;
  logoUrl: string;
  website: string;
};

export type ContactSettings = {
  supportEmail: string;
  supportPhone: string;
  salesEmail: string;
  salesPhone: string;
  facebookUrl: string;
  instagramUrl: string;
  workingHours: string;
};

export type QPaySettings = {
  username: string;
  invoiceCode: string;
  apiBaseUrl: string;
  webhookUrl: string;
  passwordConfigured: boolean;
};

export type NotificationSettings = {
  pushEnabled: boolean;
  purchaseNotify: boolean;
  sellNotify: boolean;
  chatNotify: boolean;
  kycNotify: boolean;
  emailEnabled: boolean;
  emailFrom: string;
};

export type RolePermissionRow = {
  module: string;
  label: string;
  superAdmin: boolean;
  admin: boolean;
  operator: boolean;
};

export type RolesSettings = {
  permissions: RolePermissionRow[];
};

export type AppSettings = {
  general: GeneralSettings;
  company: CompanySettings;
  contact: ContactSettings;
  qpay: QPaySettings;
  notifications: NotificationSettings;
  roles: RolesSettings;
};

export type AppSettingsSection = keyof AppSettings;

export const TIMEZONE_OPTIONS = [
  "Asia/Ulaanbaatar",
  "Asia/Shanghai",
  "UTC",
];

export const CURRENCY_OPTIONS = ["MNT", "USD"];

export const LANGUAGE_OPTIONS = [
  { value: "mn", label: "Монгол" },
  { value: "en", label: "English" },
];

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OPERATOR: "Operator",
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: "Бүх модуль, тохиргоо, админ удирдлага",
  ADMIN: "Хэрэглэгч, мэдээ, тайлан, худалдан авалт",
  OPERATOR: "Хүсэлт боловсруулах, чат, хэрэглэгч харах",
};

export function membershipLevelLabel(level: string) {
  const map: Record<string, string> = {
    NORMAL: "Normal",
    BRONZE: "Bronze",
    SILVER: "Silver",
    GOLD: "Gold",
  };
  return map[level] ?? level;
}

export const DEFAULT_GENERAL: GeneralSettings = {
  appName: "GoldApp",
  appTagline: "Алтны худалдааны платформ",
  timezone: "Asia/Ulaanbaatar",
  currency: "MNT",
  language: "mn",
  maintenanceMode: false,
  maintenanceMessage: "Систем засвар үйлчилгээнд байна.",
};

export const DEFAULT_COMPANY: CompanySettings = {
  companyName: "GoldApp Mongolia",
  legalName: "GoldApp LLC",
  registrationNumber: "",
  address: "",
  city: "Улаанбаатар",
  country: "Mongolia",
  logoUrl: "",
  website: "https://goldapp.mn",
};

export const DEFAULT_CONTACT: ContactSettings = {
  supportEmail: "support@goldapp.mn",
  supportPhone: "",
  salesEmail: "sales@goldapp.mn",
  salesPhone: "",
  facebookUrl: "",
  instagramUrl: "",
  workingHours: "Даваа-Баасан 09:00-18:00",
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  pushEnabled: true,
  purchaseNotify: true,
  sellNotify: true,
  chatNotify: true,
  kycNotify: true,
  emailEnabled: false,
  emailFrom: "noreply@goldapp.mn",
};

export const APP_SETTINGS_TABS: SettingsTab[] = [
  "general",
  "company",
  "contact",
  "qpay",
  "notifications",
  "roles",
];

export function getMockAuditLogs(): import("@/types").ActivityLog[] {
  const now = Date.now();
  return [
    {
      id: "mock-1",
      adminId: "admin-demo",
      action: "SETTINGS_UPDATED",
      entity: "AppSetting",
      entityId: "general",
      ipAddress: "127.0.0.1",
      metadata: { section: "general", keys: ["appName"] },
      createdAt: new Date(now - 3600000).toISOString(),
    },
    {
      id: "mock-2",
      adminId: "admin-demo",
      action: "SETTINGS_UPDATED",
      entity: "AppSetting",
      entityId: "membership",
      ipAddress: "127.0.0.1",
      metadata: { section: "membership" },
      createdAt: new Date(now - 7200000).toISOString(),
    },
    {
      id: "mock-3",
      adminId: "admin-demo",
      action: "ADMIN_CREATED",
      entity: "AdminUser",
      entityId: "new-admin",
      ipAddress: "192.168.1.10",
      metadata: { email: "operator@goldapp.mn" },
      createdAt: new Date(now - 86400000).toISOString(),
    },
    {
      id: "mock-4",
      adminId: "admin-demo",
      action: "NEWS_PUBLISHED",
      entity: "News",
      entityId: "news-001",
      ipAddress: "192.168.1.10",
      metadata: { title: "Алтны үнэ шинэчлэгдлээ" },
      createdAt: new Date(now - 172800000).toISOString(),
    },
  ];
}
