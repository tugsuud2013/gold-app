"use client";

import type { ReactNode } from "react";
import { RefreshCw, Save, Shield, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AddAdminModal from "@/components/settings/AddAdminModal";
import EditAdminModal from "@/components/settings/EditAdminModal";
import SettingsAuditLog from "@/components/settings/SettingsAuditLog";
import SettingsFormCard from "@/components/settings/SettingsFormCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RoleBadge from "@/components/ui/RoleBadge";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useActivityLogs,
  useAdminUsers,
  useAppSettings,
  useCreateAdmin,
  useMembershipConfig,
  useUpdateAdmin,
  useUpdateAppSettingsSection,
  useUpdateMembershipConfig,
} from "@/hooks/useSettings";
import {
  APP_SETTINGS_TABS,
  CURRENCY_OPTIONS,
  DEFAULT_COMPANY,
  DEFAULT_CONTACT,
  DEFAULT_GENERAL,
  DEFAULT_NOTIFICATIONS,
  getMockAuditLogs,
  LANGUAGE_OPTIONS,
  membershipLevelLabel,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  MEMBERSHIP_SAVE_TOAST,
  SETTINGS_SAVE_TOAST,
  SETTINGS_TABS,
  TIMEZONE_OPTIONS,
  type AppSettingsSection,
  type CompanySettings,
  type ContactSettings,
  type GeneralSettings,
  type NotificationSettings,
  type QPaySettings,
  type RolesSettings,
  type SettingsTab,
} from "@/lib/settingsUi";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="admin-users-field admin-settings-field">
      <span className="admin-users-label">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="admin-settings-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function SettingsPage() {
  const { admin } = useAuthStore();
  const { showToast } = useToast();
  const isSuperAdmin = admin?.role === "SUPER_ADMIN";

  const [tab, setTab] = useState<SettingsTab>("general");
  const [logPage, setLogPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; role: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const settingsQ = useAppSettings();
  const updateSection = useUpdateAppSettingsSection();
  const membershipsQ = useMembershipConfig();
  const updateMembership = useUpdateMembershipConfig();
  const adminsQ = useAdminUsers();
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const logsQ = useActivityLogs(logPage, undefined, isSuperAdmin);

  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT);
  const [qpay, setQpay] = useState<QPaySettings>({
    username: "",
    invoiceCode: "",
    apiBaseUrl: "http://localhost:3000",
    webhookUrl: "",
    passwordConfigured: false,
  });
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [roles, setRoles] = useState<RolesSettings | null>(null);
  const [membershipDraft, setMembershipDraft] = useState<Array<{ level: string; minGrams: number }>>([]);

  useEffect(() => {
    if (!settingsQ.data) return;
    setGeneral(settingsQ.data.general);
    setCompany(settingsQ.data.company);
    setContact(settingsQ.data.contact);
    setQpay(settingsQ.data.qpay);
    setNotifications(settingsQ.data.notifications);
    setRoles(settingsQ.data.roles);
  }, [settingsQ.data]);

  useEffect(() => {
    if (membershipsQ.data?.length) {
      setMembershipDraft(
        membershipsQ.data.map((x) => ({ level: x.level, minGrams: Number(x.minGrams) })),
      );
    }
  }, [membershipsQ.data]);

  const visibleTabs = useMemo(
    () => SETTINGS_TABS.filter((t) => !t.superAdminOnly || isSuperAdmin),
    [isSuperAdmin],
  );

  const activeTabMeta = useMemo(
    () => SETTINGS_TABS.find((t) => t.id === tab) ?? SETTINGS_TABS[0],
    [tab],
  );

  const needsAppSettings = APP_SETTINGS_TABS.includes(tab);
  const tabLoading =
    (needsAppSettings && settingsQ.isLoading && !settingsQ.data) ||
    (tab === "membership" && membershipsQ.isLoading && !membershipsQ.data) ||
    (tab === "admins" && isSuperAdmin && adminsQ.isLoading && !adminsQ.data);

  const canSaveTab = (current: SettingsTab) => {
    if (current === "admins") return false;
    if (["qpay", "roles"].includes(current)) return isSuperAdmin;
    return true;
  };

  const auditLogs = useMemo(() => {
    const real = logsQ.data?.items ?? [];
    if (real.length) return { logs: real, isMock: false, total: logsQ.data?.total ?? real.length };
    return { logs: getMockAuditLogs(), isMock: true, total: getMockAuditLogs().length };
  }, [logsQ.data]);

  const saveSection = async (section: AppSettingsSection, value: Record<string, unknown>) => {
    setSaving(true);
    try {
      await updateSection.mutateAsync({ section, value });
      showToast(SETTINGS_SAVE_TOAST);
      logsQ.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Алдаа", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (tab === "membership") {
      setSaving(true);
      try {
        await updateMembership.mutateAsync(membershipDraft);
        showToast(MEMBERSHIP_SAVE_TOAST);
        logsQ.refetch();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Алдаа", "error");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (tab === "general") await saveSection("general", general);
    if (tab === "company") await saveSection("company", company);
    if (tab === "contact") await saveSection("contact", contact);
    if (tab === "qpay") await saveSection("qpay", qpay);
    if (tab === "notifications") await saveSection("notifications", notifications);
    if (tab === "roles" && roles) await saveSection("roles", roles);
  };

  const loadingNode = (
    <div className="admin-users-loading py-16">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="admin-settings-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Тохиргоо удирдлага</h1>
          <p className="admin-users-subtitle">Системийн тохиргоо · {visibleTabs.length} хэсэг</p>
        </div>
        <div className="admin-users-header-actions">
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            onClick={() => {
              settingsQ.refetch();
              membershipsQ.refetch();
              adminsQ.refetch();
              logsQ.refetch();
            }}
          >
            <RefreshCw size={16} className={settingsQ.isFetching ? "animate-spin" : ""} />
            Шинэчлэх
          </button>
          {canSaveTab(tab) && (
            <button
              type="button"
              className="admin-users-btn admin-users-btn--primary"
              disabled={saving || tabLoading}
              onClick={handleSave}
            >
              <Save size={16} />
              Хадгалах
            </button>
          )}
        </div>
      </header>

      <nav className="admin-settings-tabs">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-settings-tab ${tab === t.id ? "admin-settings-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <SettingsFormCard
        title={activeTabMeta.label}
        description={activeTabMeta.description}
        showSave={canSaveTab(tab)}
        saving={saving}
        onSave={handleSave}
        loading={tabLoading}
        loadingNode={loadingNode}
      >
        {tab === "general" && (
          <div className="admin-settings-form-grid">
            <Field label="App нэр">
              <input className="admin-users-input" value={general.appName} onChange={(e) => setGeneral({ ...general, appName: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <input className="admin-users-input" value={general.appTagline} onChange={(e) => setGeneral({ ...general, appTagline: e.target.value })} />
            </Field>
            <Field label="Timezone">
              <select className="admin-users-select" value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}>
                {TIMEZONE_OPTIONS.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </Field>
            <Field label="Валют">
              <select className="admin-users-select" value={general.currency} onChange={(e) => setGeneral({ ...general, currency: e.target.value })}>
                {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Хэл">
              <select className="admin-users-select" value={general.language} onChange={(e) => setGeneral({ ...general, language: e.target.value })}>
                {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </Field>
            <div className="admin-settings-toggle-group">
              <Toggle checked={general.maintenanceMode} onChange={(v) => setGeneral({ ...general, maintenanceMode: v })} label="Maintenance mode" />
            </div>
            <Field label="Maintenance мессеж">
              <textarea className="admin-users-input admin-settings-textarea admin-settings-field-full" rows={3} value={general.maintenanceMessage} onChange={(e) => setGeneral({ ...general, maintenanceMessage: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === "company" && (
          <div className="admin-settings-form-grid">
            <Field label="Company name"><input className="admin-users-input" value={company.companyName} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} /></Field>
            <Field label="Legal name"><input className="admin-users-input" value={company.legalName} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} /></Field>
            <Field label="Registration number"><input className="admin-users-input" value={company.registrationNumber} onChange={(e) => setCompany({ ...company, registrationNumber: e.target.value })} /></Field>
            <Field label="Address"><input className="admin-users-input" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></Field>
            <Field label="City"><input className="admin-users-input" value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} /></Field>
            <Field label="Country"><input className="admin-users-input" value={company.country} onChange={(e) => setCompany({ ...company, country: e.target.value })} /></Field>
            <Field label="Logo URL"><input className="admin-users-input" value={company.logoUrl} onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })} placeholder="https://..." /></Field>
            <Field label="Website"><input className="admin-users-input" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="https://goldapp.mn" /></Field>
          </div>
        )}

        {tab === "contact" && (
          <div className="admin-settings-form-grid">
            <Field label="Support email"><input className="admin-users-input" type="email" value={contact.supportEmail} onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })} /></Field>
            <Field label="Support phone"><input className="admin-users-input" value={contact.supportPhone} onChange={(e) => setContact({ ...contact, supportPhone: e.target.value })} placeholder="7700-0000" /></Field>
            <Field label="Sales email"><input className="admin-users-input" type="email" value={contact.salesEmail} onChange={(e) => setContact({ ...contact, salesEmail: e.target.value })} /></Field>
            <Field label="Sales phone"><input className="admin-users-input" value={contact.salesPhone} onChange={(e) => setContact({ ...contact, salesPhone: e.target.value })} /></Field>
            <Field label="Facebook"><input className="admin-users-input" value={contact.facebookUrl} onChange={(e) => setContact({ ...contact, facebookUrl: e.target.value })} placeholder="https://facebook.com/..." /></Field>
            <Field label="Instagram"><input className="admin-users-input" value={contact.instagramUrl} onChange={(e) => setContact({ ...contact, instagramUrl: e.target.value })} placeholder="https://instagram.com/..." /></Field>
            <Field label="Working hours"><input className="admin-users-input admin-settings-field-full" value={contact.workingHours} onChange={(e) => setContact({ ...contact, workingHours: e.target.value })} /></Field>
          </div>
        )}

        {tab === "qpay" && isSuperAdmin && (
          <div className="admin-settings-form-grid">
            <div className="admin-settings-info-banner admin-settings-field-full">
              QPay нууц үг `.env` файлд хадгалагдана. Энд username, invoice code зэрэг тохиргоог засварлана.
            </div>
            <Field label="Username"><input className="admin-users-input" value={qpay.username} onChange={(e) => setQpay({ ...qpay, username: e.target.value })} /></Field>
            <Field label="Invoice code"><input className="admin-users-input" value={qpay.invoiceCode} onChange={(e) => setQpay({ ...qpay, invoiceCode: e.target.value })} /></Field>
            <Field label="API base URL"><input className="admin-users-input" value={qpay.apiBaseUrl} onChange={(e) => setQpay({ ...qpay, apiBaseUrl: e.target.value })} /></Field>
            <Field label="Webhook URL"><input className="admin-users-input" value={qpay.webhookUrl} onChange={(e) => setQpay({ ...qpay, webhookUrl: e.target.value })} /></Field>
            <Field label="Password status">
              <input className="admin-users-input" readOnly value={qpay.passwordConfigured ? "Configured (env)" : "Not configured"} />
            </Field>
          </div>
        )}

        {tab === "membership" && (
          <>
            <div className="admin-settings-info-banner admin-settings-info-banner--warn admin-settings-field-full">
              Шалгуур өөрчлөгдсөний дараа хэрэглэгчийн membership дахин тооцогдоно.
            </div>
            <div className="admin-settings-membership-grid">
              {membershipDraft.map((cfg, idx) => (
                <div key={cfg.level} className="admin-settings-membership-card">
                  <div className="admin-settings-membership-head">
                    <Shield size={16} className="text-[#D4AF37]" />
                    <span>{membershipLevelLabel(cfg.level)}</span>
                  </div>
                  <Field label="Доод хэмжээ (гр)">
                    <input
                      className="admin-users-input"
                      type="number"
                      step="0.0001"
                      min="0"
                      value={cfg.minGrams}
                      onChange={(e) => {
                        const next = [...membershipDraft];
                        next[idx] = { ...cfg, minGrams: Number(e.target.value) };
                        setMembershipDraft(next);
                      }}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "notifications" && (
          <div className="admin-settings-form-grid admin-settings-form-grid--toggles">
            <Toggle checked={notifications.pushEnabled} onChange={(v) => setNotifications({ ...notifications, pushEnabled: v })} label="Push notification идэвхжүүлэх" />
            <Toggle checked={notifications.purchaseNotify} onChange={(v) => setNotifications({ ...notifications, purchaseNotify: v })} label="Худалдан авалтын мэдэгдэл" />
            <Toggle checked={notifications.sellNotify} onChange={(v) => setNotifications({ ...notifications, sellNotify: v })} label="Зарах хүсэлтийн мэдэгдэл" />
            <Toggle checked={notifications.chatNotify} onChange={(v) => setNotifications({ ...notifications, chatNotify: v })} label="Чат мэдэгдэл" />
            <Toggle checked={notifications.kycNotify} onChange={(v) => setNotifications({ ...notifications, kycNotify: v })} label="KYC мэдэгдэл" />
            <Toggle checked={notifications.emailEnabled} onChange={(v) => setNotifications({ ...notifications, emailEnabled: v })} label="Email мэдэгдэл" />
            <Field label="Email from"><input className="admin-users-input" type="email" value={notifications.emailFrom} onChange={(e) => setNotifications({ ...notifications, emailFrom: e.target.value })} /></Field>
          </div>
        )}

        {tab === "admins" && isSuperAdmin && (
          <>
            <div className="admin-settings-section-head admin-settings-section-head--inline">
              <p className="admin-users-subtitle">Админ хэрэглэгчид удирдах</p>
              <button type="button" className="admin-users-btn admin-users-btn--primary" onClick={() => setAddOpen(true)}>
                <UserPlus size={16} /> Админ нэмэх
              </button>
            </div>
            <div className="admin-users-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>{["Нэр", "Имэйл", "Эрх", "Статус", "Бүртгэсэн", "Үйлдэл"].map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {(adminsQ.data ?? []).map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td>{a.email}</td>
                      <td><RoleBadge role={a.role} /></td>
                      <td>{a.status}</td>
                      <td>{a.createdAt ? formatDateTime(a.createdAt) : "—"}</td>
                      <td>
                        <div className="admin-settings-row-actions">
                          <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={() => setEditTarget({ id: a.id, role: a.role })}>Role</button>
                          <button
                            type="button"
                            className="admin-users-btn admin-users-btn--ghost"
                            disabled={a.id === admin?.id}
                            onClick={async () => {
                              try {
                                await updateAdmin.mutateAsync({ id: a.id, status: a.status === "ACTIVE" ? "DELETED" : "ACTIVE" });
                                showToast("Статус шинэчлэгдлээ");
                              } catch (e) {
                                showToast(e instanceof Error ? e.message : "Алдаа", "error");
                              }
                            }}
                          >
                            {a.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "roles" && roles && isSuperAdmin && (
          <>
            <div className="admin-settings-role-cards admin-settings-field-full">
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <div key={role} className="admin-settings-role-card">
                  <h3>{label}</h3>
                  <p>{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              ))}
            </div>
            <div className="admin-users-table-wrap admin-settings-roles-table admin-settings-field-full">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Модуль</th>
                    <th>Super Admin</th>
                    <th>Admin</th>
                    <th>Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.permissions.map((row, idx) => (
                    <tr key={row.module}>
                      <td>{row.label}</td>
                      {(["superAdmin", "admin", "operator"] as const).map((key) => (
                        <td key={key}>
                          <input
                            type="checkbox"
                            checked={row[key]}
                            onChange={(e) => {
                              const next = { ...roles, permissions: [...roles.permissions] };
                              next.permissions[idx] = { ...row, [key]: e.target.checked };
                              setRoles(next);
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SettingsFormCard>

      <SettingsAuditLog
        logs={auditLogs.logs}
        isLoading={isSuperAdmin && logsQ.isLoading}
        total={auditLogs.total}
        page={logPage}
        onPageChange={auditLogs.isMock ? undefined : setLogPage}
        isMock={auditLogs.isMock}
      />

      <AddAdminModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onConfirm={async (payload) => {
          try {
            await createAdmin.mutateAsync(payload);
            showToast("Админ нэмэгдлээ");
            setAddOpen(false);
            logsQ.refetch();
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Алдаа", "error");
          }
        }}
      />

      <EditAdminModal
        open={Boolean(editTarget)}
        onOpenChange={(v) => !v && setEditTarget(null)}
        currentRole={editTarget?.role ?? "OPERATOR"}
        disabled={editTarget?.id === admin?.id}
        onConfirm={async (role) => {
          if (!editTarget) return;
          try {
            await updateAdmin.mutateAsync({ id: editTarget.id, role });
            showToast("Role шинэчлэгдлээ");
            setEditTarget(null);
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Алдаа", "error");
          }
        }}
      />
    </div>
  );
}
