"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Activity,
  BadgeCheck,
  Ban,
  Pencil,
  ShieldCheck,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  useUpdateKycStatus,
  useUpdateMembership,
  useUser,
  useUserActivityLogs,
  useUserPurchases,
  useUserSellRequests,
  useUserWallet,
} from "@/hooks/useUsers";
import {
  getUserDisplayName,
  getUserInitials,
  kycLabel,
  maskRegisterNumber,
  membershipLabel,
  statusLabel,
} from "@/lib/usersUi";
import { formatDate, formatDateTime, formatGrams, formatMNT, getPurchaseStatusLabel } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import type { User } from "@/types";

const sections = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "membership", label: "Membership", icon: BadgeCheck },
  { id: "kyc", label: "KYC", icon: ShieldCheck },
  { id: "purchases", label: "Purchase History", icon: Activity },
  { id: "sells", label: "Sell Requests", icon: Activity },
  { id: "activity", label: "Activity Log", icon: Activity },
] as const;

type SectionId = (typeof sections)[number]["id"];

type Props = {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditUser?: (user: User) => void;
  onChangeMembership?: (user: User) => void;
  onSuspendUser?: (user: User) => void;
};

export default function UserDetailDrawer({
  userId,
  open,
  onOpenChange,
  onEditUser,
  onChangeMembership,
  onSuspendUser,
}: Props) {
  const [section, setSection] = useState<SectionId>("profile");
  const { showToast } = useToast();
  const id = userId ?? "";

  const userQ = useUser(id);
  const walletQ = useUserWallet(id);
  const purchasesQ = useUserPurchases(id);
  const sellsQ = useUserSellRequests(id);
  const activityQ = useUserActivityLogs(id);
  const updateMembership = useUpdateMembership();
  const updateKyc = useUpdateKycStatus();

  const user = userQ.data;

  useEffect(() => {
    if (open) setSection("profile");
  }, [open, userId]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevBody = document.body.style.overflow;
    const prevHtml = html.style.overflow;
    document.body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-users-drawer-overlay fixed inset-0 z-40" />
        <Dialog.Content className="admin-users-drawer fixed inset-y-0 right-0 z-50 flex flex-col outline-none">
          <div className="admin-users-drawer-header flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {user && (
                <span className="admin-users-avatar admin-users-avatar--lg">{getUserInitials(user)}</span>
              )}
              <div className="min-w-0">
                <Dialog.Title className="truncate text-lg font-semibold text-white">
                  {user ? getUserDisplayName(user) : "Хэрэглэгч"}
                </Dialog.Title>
                <p className="truncate text-sm text-[#9CA3AF]">{user?.phoneNumber ?? "—"}</p>
              </div>
            </div>
            <Dialog.Close className="admin-users-icon-btn rounded-lg p-2" aria-label="Хаах">
              <X size={18} />
            </Dialog.Close>
          </div>

          <nav className="admin-users-drawer-nav" aria-label="User sections">
            {sections.map(({ id: sid, label, icon: Icon }) => (
              <button
                key={sid}
                type="button"
                className={`admin-users-drawer-nav-item ${section === sid ? "admin-users-drawer-nav-item--active" : ""}`}
                onClick={() => setSection(sid)}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="admin-users-drawer-body">
              {userQ.isLoading && <LoadingSpinner />}
              {!userQ.isLoading && !user && (
                <div className="admin-users-empty">Хэрэглэгч олдсонгүй</div>
              )}

              {user && section === "profile" && (
                <div className="admin-users-drawer-section space-y-4">
                  <h3 className="admin-users-drawer-section-title">Profile</h3>
                  <div className="admin-users-info-grid">
                    <InfoRow label="Утас" value={user.phoneNumber} />
                    <InfoRow label="Нэр" value={getUserDisplayName(user)} />
                    <InfoRow label="Регистр" value={user.registerNumber ?? "—"} />
                    <InfoRow label="Статус" value={statusLabel(user.status)} />
                    <InfoRow label="Бүртгэсэн" value={formatDateTime(user.createdAt)} />
                    <InfoRow
                      label="Шинэчлэгдсэн"
                      value={formatDateTime((user as User & { updatedAt?: string }).updatedAt ?? user.createdAt)}
                    />
                  </div>
                  {(() => {
                    const signatureUrl = (user as User & { signatureImageUrl?: string }).signatureImageUrl;
                    if (!signatureUrl) return null;
                    return (
                      <div>
                        <p className="admin-users-label mb-2">Гарын үсэг</p>
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${signatureUrl}`}
                          alt="signature"
                          className="admin-users-signature"
                        />
                      </div>
                    );
                  })()}
                </div>
              )}

              {user && section === "wallet" && (
                <div className="admin-users-drawer-section space-y-4">
                  <h3 className="admin-users-drawer-section-title">Wallet</h3>
                  {walletQ.isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <div className="admin-users-wallet-card">
                        <p className="admin-users-label">Одоогийн үлдэгдэл</p>
                        <p className="admin-users-wallet-balance">{formatGrams(walletQ.data?.balanceGrams ?? 0)}</p>
                        <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                          <p className="text-[#9CA3AF]">
                            Нийт худалдан авсан:{" "}
                            <span className="text-white">{formatGrams(walletQ.data?.totalPurchasedGrams ?? 0)}</span>
                          </p>
                          <p className="text-[#9CA3AF]">
                            Нийт зарсан:{" "}
                            <span className="text-white">{formatGrams(walletQ.data?.totalSoldGrams ?? 0)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="admin-users-mini-table-wrap overflow-x-auto">
                        <table className="admin-users-mini-table w-full min-w-[420px]">
                          <thead>
                            <tr>
                              {["Огноо", "Төрөл", "Хэмжээ", "Дараах"].map((h) => (
                                <th key={h}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(walletQ.data?.transactions ?? []).map((t: {
                              id: string;
                              createdAt: string;
                              type: string;
                              amountGrams: number | string;
                              balanceAfter: number | string;
                            }) => (
                              <tr key={t.id}>
                                <td>{formatDateTime(t.createdAt)}</td>
                                <td>{t.type}</td>
                                <td>{formatGrams(t.amountGrams)}</td>
                                <td>{formatGrams(t.balanceAfter)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {user && section === "membership" && (
                <div className="admin-users-drawer-section space-y-4">
                  <h3 className="admin-users-drawer-section-title">Membership</h3>
                  <div className="admin-users-wallet-card">
                    <p className="admin-users-label">Одоогийн түвшин</p>
                    <p className="admin-users-wallet-balance text-xl">{membershipLabel(user.membershipLevel)}</p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">{user.membershipLevel}</p>
                  </div>
                  <label className="block space-y-2">
                    <span className="admin-users-label">Түвшин солих</span>
                    <select
                      defaultValue={user.membershipLevel}
                      className="admin-users-select"
                      onChange={async (e) => {
                        try {
                          await updateMembership.mutateAsync({ id, membershipLevel: e.target.value });
                          showToast("Гишүүнчлэл шинэчлэгдлээ");
                          userQ.refetch();
                        } catch (err) {
                          showToast(err instanceof Error ? err.message : "Алдаа", "error");
                        }
                      }}
                    >
                      {["NORMAL", "BRONZE", "SILVER", "GOLD"].map((x) => (
                        <option key={x} value={x}>
                          {membershipLabel(x)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {user && section === "kyc" && (
                <div className="admin-users-drawer-section space-y-4">
                  <h3 className="admin-users-drawer-section-title">KYC</h3>
                  <div className="admin-users-info-grid">
                    <InfoRow label="KYC статус" value={kycLabel(user.kycStatus)} />
                    <InfoRow label="Регистр" value={maskRegisterNumber(user.registerNumber)} />
                  </div>
                  <span className={`admin-users-badge admin-users-badge--${user.kycStatus.toLowerCase()}`}>
                    {kycLabel(user.kycStatus)}
                  </span>
                </div>
              )}

              {user && section === "purchases" && (
                <div className="admin-users-drawer-section">
                  <h3 className="admin-users-drawer-section-title">Purchase History</h3>
                  {purchasesQ.isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="admin-users-mini-table-wrap mt-3 overflow-x-auto">
                      <table className="admin-users-mini-table w-full min-w-[480px]">
                        <thead>
                          <tr>
                            {["Огноо", "Грамм", "Дүн", "Статус"].map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(purchasesQ.data?.items ?? []).map((p) => (
                            <tr key={p.id}>
                              <td>{formatDate(p.createdAt)}</td>
                              <td>{formatGrams(p.amountGrams)}</td>
                              <td>{formatMNT(p.totalAmountMnt)}</td>
                              <td>{getPurchaseStatusLabel(p.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {user && section === "sells" && (
                <div className="admin-users-drawer-section">
                  <h3 className="admin-users-drawer-section-title">Sell Requests</h3>
                  {sellsQ.isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="admin-users-mini-table-wrap mt-3 overflow-x-auto">
                      <table className="admin-users-mini-table w-full min-w-[400px]">
                        <thead>
                          <tr>
                            {["Огноо", "Грамм", "Статус", "Тайлбар"].map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(sellsQ.data ?? []).map((s) => (
                            <tr key={s.id}>
                              <td>{formatDateTime(s.createdAt)}</td>
                              <td>{formatGrams(s.amountGrams)}</td>
                              <td>{s.status}</td>
                              <td>{s.adminNote ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {user && section === "activity" && (
                <div className="admin-users-drawer-section">
                  <h3 className="admin-users-drawer-section-title">Activity Log</h3>
                  {activityQ.isLoading ? (
                    <LoadingSpinner />
                  ) : (activityQ.data ?? []).length === 0 ? (
                    <div className="admin-users-empty mt-3">Activity log алга</div>
                  ) : (
                    <ul className="admin-users-activity-list mt-3">
                      {(activityQ.data ?? []).map((log) => (
                        <li key={log.id} className="admin-users-activity-item">
                          <p className="admin-users-activity-action">{log.action}</p>
                          <p className="admin-users-activity-meta">
                            {log.entity ?? "—"} · {formatDateTime(log.createdAt)}
                          </p>
                          {log.metadata && (
                            <p className="admin-users-activity-meta mt-1 truncate">
                              {JSON.stringify(log.metadata)}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
          </div>

          {user && (
            <div className="admin-users-drawer-actions">
              <button
                type="button"
                className="admin-users-drawer-action-btn"
                onClick={() => onEditUser?.(user)}
              >
                <Pencil size={14} />
                Edit User
              </button>
              <button
                type="button"
                className="admin-users-drawer-action-btn"
                onClick={() => {
                  setSection("membership");
                  onChangeMembership?.(user);
                }}
              >
                <BadgeCheck size={14} />
                Change Membership
              </button>
              <button
                type="button"
                className="admin-users-drawer-action-btn admin-users-drawer-action-btn--success"
                disabled={user.kycStatus !== "PENDING"}
                onClick={async () => {
                  try {
                    await updateKyc.mutateAsync({ id, status: "VERIFIED" });
                    showToast("KYC баталгаажлаа");
                    userQ.refetch();
                  } catch (e) {
                    showToast(e instanceof Error ? e.message : "Алдаа", "error");
                  }
                }}
              >
                <ShieldCheck size={14} />
                Approve KYC
              </button>
              <button
                type="button"
                className="admin-users-drawer-action-btn admin-users-drawer-action-btn--danger"
                disabled={user.kycStatus !== "PENDING"}
                onClick={async () => {
                  try {
                    await updateKyc.mutateAsync({ id, status: "REJECTED" });
                    showToast("KYC татгалзлаа");
                    userQ.refetch();
                  } catch (e) {
                    showToast(e instanceof Error ? e.message : "Алдаа", "error");
                  }
                }}
              >
                <Ban size={14} />
                Reject KYC
              </button>
              <button
                type="button"
                className="admin-users-drawer-action-btn admin-users-drawer-action-btn--danger"
                onClick={() => onSuspendUser?.(user)}
              >
                <Ban size={14} />
                Suspend User
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="admin-users-label">{label}</p>
      <p className="admin-users-value">{value}</p>
    </div>
  );
}
