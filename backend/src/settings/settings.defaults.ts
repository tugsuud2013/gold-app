export type SettingsSection =
  | 'general'
  | 'company'
  | 'contact'
  | 'qpay'
  | 'notifications'
  | 'roles';

export const SETTINGS_SECTIONS: SettingsSection[] = [
  'general',
  'company',
  'contact',
  'qpay',
  'notifications',
  'roles',
];

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

export type AppSettingsMap = {
  general: GeneralSettings;
  company: CompanySettings;
  contact: ContactSettings;
  qpay: QPaySettings;
  notifications: NotificationSettings;
  roles: RolesSettings;
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionRow[] = [
  { module: 'dashboard', label: 'Dashboard', superAdmin: true, admin: true, operator: true },
  { module: 'users', label: 'Хэрэглэгчид', superAdmin: true, admin: true, operator: true },
  { module: 'purchases', label: 'Худалдан авалт', superAdmin: true, admin: true, operator: true },
  { module: 'sell-requests', label: 'Зарах хүсэлт', superAdmin: true, admin: true, operator: true },
  { module: 'gold-price', label: 'Алтны үнэ', superAdmin: true, admin: true, operator: false },
  { module: 'news', label: 'Мэдээ', superAdmin: true, admin: true, operator: false },
  { module: 'chat', label: 'Чат', superAdmin: true, admin: true, operator: true },
  { module: 'reports', label: 'Тайлан', superAdmin: true, admin: true, operator: false },
  { module: 'settings', label: 'Тохиргоо', superAdmin: true, admin: true, operator: false },
  { module: 'settings.admins', label: 'Админ хэрэглэгчид', superAdmin: true, admin: false, operator: false },
  { module: 'settings.membership', label: 'Membership тохиргоо', superAdmin: true, admin: true, operator: false },
];

export function getDefaultSettings(): AppSettingsMap {
  return {
    general: {
      appName: 'GoldApp',
      appTagline: 'Алтны худалдааны платформ',
      timezone: 'Asia/Ulaanbaatar',
      currency: 'MNT',
      language: 'mn',
      maintenanceMode: false,
      maintenanceMessage: 'Систем засвар үйлчилгээнд байна.',
    },
    company: {
      companyName: 'GoldApp Mongolia',
      legalName: 'GoldApp LLC',
      registrationNumber: '1234567',
      address: 'СБД, 1-р хорoo',
      city: 'Улаанбаатар',
      country: 'Mongolia',
      logoUrl: '',
      website: 'https://goldapp.mn',
    },
    contact: {
      supportEmail: 'support@goldapp.mn',
      supportPhone: '7700-0000',
      salesEmail: 'sales@goldapp.mn',
      salesPhone: '7700-0001',
      facebookUrl: 'https://facebook.com/goldapp',
      instagramUrl: 'https://instagram.com/goldapp',
      workingHours: 'Даваа-Баасан 09:00-18:00',
    },
    qpay: {
      username: '',
      invoiceCode: '',
      apiBaseUrl: 'http://localhost:3000',
      webhookUrl: '',
      passwordConfigured: false,
    },
    notifications: {
      pushEnabled: true,
      purchaseNotify: true,
      sellNotify: true,
      chatNotify: true,
      kycNotify: true,
      emailEnabled: false,
      emailFrom: 'noreply@goldapp.mn',
    },
    roles: {
      permissions: DEFAULT_ROLE_PERMISSIONS,
    },
  };
}
