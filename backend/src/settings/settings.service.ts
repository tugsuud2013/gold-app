import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AppSettingsMap,
  getDefaultSettings,
  SETTINGS_SECTIONS,
  type SettingsSection,
} from './settings.defaults';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  private mergeSection<T extends Record<string, unknown>>(defaults: T, stored?: unknown): T {
    if (!stored || typeof stored !== 'object') return defaults;
    return { ...defaults, ...(stored as T) };
  }

  private async getSectionValue<K extends SettingsSection>(section: K): Promise<AppSettingsMap[K]> {
    const defaults = getDefaultSettings();
    const row = await this.prisma.appSetting.findUnique({ where: { key: section } });
    return this.mergeSection(defaults[section] as Record<string, unknown>, row?.value) as AppSettingsMap[K];
  }

  async ensureDefaults() {
    const defaults = getDefaultSettings();
    for (const section of SETTINGS_SECTIONS) {
      const existing = await this.prisma.appSetting.findUnique({ where: { key: section } });
      if (!existing) {
        await this.prisma.appSetting.create({
          data: { key: section, value: defaults[section] as Prisma.InputJsonValue },
        });
      }
    }
  }

  async getAllSettings(): Promise<AppSettingsMap> {
    await this.ensureDefaults();
    const [general, company, contact, qpay, notifications, roles] = await Promise.all([
      this.getSectionValue('general'),
      this.getSectionValue('company'),
      this.getSectionValue('contact'),
      this.getQPaySettings(),
      this.getSectionValue('notifications'),
      this.getSectionValue('roles'),
    ]);
    return { general, company, contact, qpay, notifications, roles };
  }

  async getQPaySettings() {
    const stored = await this.getSectionValue('qpay');
    const username = this.configService.get<string>('QPAY_USERNAME') ?? stored.username;
    const invoiceCode = this.configService.get<string>('QPAY_INVOICE_CODE') ?? stored.invoiceCode;
    const apiBaseUrl = this.configService.get<string>('API_BASE_URL') ?? stored.apiBaseUrl;
    const passwordConfigured = Boolean(this.configService.get<string>('QPAY_PASSWORD'));
    return {
      ...stored,
      username,
      invoiceCode,
      apiBaseUrl,
      webhookUrl: stored.webhookUrl || `${apiBaseUrl}/api/purchase/qpay-webhook`,
      passwordConfigured,
    };
  }

  async getSection(section: SettingsSection) {
    await this.ensureDefaults();
    if (section === 'qpay') return this.getQPaySettings();
    return this.getSectionValue(section);
  }

  async updateSection(
    section: SettingsSection,
    value: Record<string, unknown>,
    adminId?: string,
    ipAddress?: string,
  ) {
    await this.ensureDefaults();
    const defaults = getDefaultSettings();
    const current = section === 'qpay' ? await this.getQPaySettings() : await this.getSectionValue(section);
    const next = { ...current, ...value };

    if (section === 'qpay') {
      delete (next as Record<string, unknown>).passwordConfigured;
    }

    const saved = await this.prisma.appSetting.upsert({
      where: { key: section },
      create: { key: section, value: next as Prisma.InputJsonValue },
      update: { value: next as Prisma.InputJsonValue },
    });

    await this.activityLogService.log({
      adminId,
      action: 'SETTINGS_UPDATED',
      entity: 'AppSetting',
      entityId: section,
      ipAddress,
      metadata: { section, keys: Object.keys(value) },
    });

    if (section === 'qpay') {
      return this.getQPaySettings();
    }

    return this.mergeSection(defaults[section] as Record<string, unknown>, saved.value);
  }
}
