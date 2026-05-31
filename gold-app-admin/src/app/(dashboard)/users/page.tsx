"use client";

import Link from "next/link";
import {
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserX,
} from "lucide-react";
import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/ui/Pagination";
import UserDetailDrawer from "@/components/users/UserDetailDrawer";
import MembershipModal from "@/components/users/MembershipModal";
import UserStatusModal from "@/components/users/UserStatusModal";
import {
  useUpdateMembership,
  useUpdateUserStatus,
  useUsers,
  type UserFilters,
} from "@/hooks/useUsers";
import {
  exportUsersToCsv,
  filterUsersByDateRange,
  getUserDisplayName,
  kycLabel,
  maskRegisterNumber,
  membershipLabel,
  statusLabel,
} from "@/lib/usersUi";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { User } from "@/types";

const USERS_PAGE_SIZE = 20;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({});
  const [statusTarget, setStatusTarget] = useState<User | null>(null);
  const [membershipTarget, setMembershipTarget] = useState<User | null>(null);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  const { showToast } = useToast();
  const { data, isLoading, isError } = useUsers(filters, page);
  const statusMutation = useUpdateUserStatus();
  const membershipMutation = useUpdateMembership();

  const allRows = data?.items ?? [];
  const rows = useMemo(
    () => filterUsersByDateRange(allRows, filters.dateFrom, filters.dateTo),
    [allRows, filters.dateFrom, filters.dateTo],
  );
  const total = data?.total ?? 0;
  const rowOffset = (page - 1) * USERS_PAGE_SIZE;

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const updateFilter = (patch: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  return (
    <div className="admin-users-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Хэрэглэгчид</h1>
          <p className="admin-users-subtitle">
            Нийт <span className="text-[#D4AF37]">{total.toLocaleString("mn-MN")}</span> хэрэглэгч
          </p>
        </div>
        <div className="admin-users-header-actions">
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            onClick={() => showToast("Шинэ хэрэглэгч нэмэх функц удахгүй")}
          >
            <Plus size={16} />
            Add User
          </button>
          <button
            type="button"
            className="admin-users-btn admin-users-btn--primary"
            onClick={() => {
              if (!rows.length) {
                showToast("Экспортлох өгөгдөл алга", "error");
                return;
              }
              exportUsersToCsv(rows);
              showToast("Excel файл татагдлаа");
            }}
          >
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </header>

      <section className="admin-users-card admin-users-filters">
        <div className="admin-users-filters-grid">
          <label className="admin-users-field admin-users-field--search">
            <Search size={16} className="admin-users-field-icon" />
            <input
              className="admin-users-input"
              placeholder="Хайх: утас, нэр, регистр..."
              value={filters.search ?? ""}
              onChange={(e) => updateFilter({ search: e.target.value || undefined })}
            />
          </label>
          <select
            className="admin-users-select"
            value={filters.membershipLevel ?? ""}
            onChange={(e) => updateFilter({ membershipLevel: e.target.value || undefined })}
          >
            <option value="">Бүх Membership</option>
            <option value="NORMAL">Энгийн</option>
            <option value="BRONZE">Хүрэл</option>
            <option value="SILVER">Мөнгөн</option>
            <option value="GOLD">Алтан</option>
          </select>
          <select
            className="admin-users-select"
            value={filters.kycStatus ?? ""}
            onChange={(e) => updateFilter({ kycStatus: e.target.value || undefined })}
          >
            <option value="">Бүх KYC</option>
            <option value="VERIFIED">Баталгаажсан</option>
            <option value="PENDING">Хүлээгдэж буй</option>
            <option value="REJECTED">Татгалзсан</option>
          </select>
          <select
            className="admin-users-select"
            value={filters.status ?? ""}
            onChange={(e) => updateFilter({ status: e.target.value || undefined })}
          >
            <option value="">Бүх статус</option>
            <option value="ACTIVE">Идэвхтэй</option>
            <option value="SUSPENDED">Хаагдсан</option>
          </select>
          <input
            type="date"
            className="admin-users-input"
            value={filters.dateFrom ?? ""}
            onChange={(e) => updateFilter({ dateFrom: e.target.value || undefined })}
            aria-label="Эхлэх огноо"
          />
          <input
            type="date"
            className="admin-users-input"
            value={filters.dateTo ?? ""}
            onChange={(e) => updateFilter({ dateTo: e.target.value || undefined })}
            aria-label="Дуусах огноо"
          />
          <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={clearFilters}>
            Цэвэрлэх
          </button>
        </div>
      </section>

      <section className="admin-users-card admin-users-table-card">
        {isLoading && (
          <div className="admin-users-loading">
            <LoadingSpinner />
          </div>
        )}
        {isError && <div className="admin-users-error">Алдаа гарлаа. Дахин оролдоно уу.</div>}
        {!isLoading && rows.length === 0 && (
          <div className="admin-users-empty">Өгөгдөл алга</div>
        )}

        {!isLoading && rows.length > 0 && (
          <div className="admin-users-table-wrap">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th className="admin-users-col-index">№</th>
                  {[
                    "Нэр",
                    "Утас",
                    "Регистр",
                    "Membership",
                    "KYC",
                    "Status",
                    "Created Date",
                    "Actions",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((u, index) => (
                  <tr
                    key={u.id}
                    className="admin-users-table-row admin-users-table-row--clickable"
                    onClick={() => setDrawerUserId(u.id)}
                  >
                    <td className="admin-users-col-index">{rowOffset + index + 1}</td>
                    <td className="admin-users-cell-name">{getUserDisplayName(u)}</td>
                    <td>{u.phoneNumber}</td>
                    <td className="text-[#9CA3AF]">{maskRegisterNumber(u.registerNumber)}</td>
                    <td>
                      <span className={`admin-users-badge admin-users-badge--${u.membershipLevel.toLowerCase()}`}>
                        {membershipLabel(u.membershipLevel)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-users-badge admin-users-badge--${u.kycStatus.toLowerCase()}`}>
                        {kycLabel(u.kycStatus)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-users-badge admin-users-badge--${u.status.toLowerCase()}`}>
                        {statusLabel(u.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-[#9CA3AF]">{formatDate(u.createdAt)}</td>
                    <td className="admin-users-table-actions" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button type="button" className="admin-users-icon-btn rounded-lg p-2" aria-label="Үйлдэл">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="admin-users-actions-menu z-50 min-w-[10rem] rounded-xl p-1.5" align="end">
                          <DropdownMenu.Item
                            className="admin-users-actions-item"
                            onSelect={() => setDrawerUserId(u.id)}
                          >
                            <Eye size={14} /> View
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="admin-users-actions-item"
                            onSelect={() => setMembershipTarget(u)}
                          >
                            <Pencil size={14} /> Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="admin-users-actions-item"
                            onSelect={() => setStatusTarget(u)}
                          >
                            <UserX size={14} /> Suspend
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="admin-users-actions-item admin-users-actions-item--danger"
                            onSelect={() => showToast("Устгах API одоогоор байхгүй", "error")}
                          >
                            <Trash2 size={14} /> Delete
                          </DropdownMenu.Item>
                          <DropdownMenu.Item className="admin-users-actions-item" asChild>
                            <Link href={`/users/${u.id}`}>Full page →</Link>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="admin-users-pagination">
        <Pagination page={page} total={total} limit={USERS_PAGE_SIZE} onChange={setPage} />
      </div>

      <UserDetailDrawer
        userId={drawerUserId}
        open={Boolean(drawerUserId)}
        onOpenChange={(open) => !open && setDrawerUserId(null)}
        onEditUser={(user) => setMembershipTarget(user)}
        onChangeMembership={(user) => setMembershipTarget(user)}
        onSuspendUser={(user) => setStatusTarget(user)}
      />

      <UserStatusModal
        open={Boolean(statusTarget)}
        onOpenChange={(v) => !v && setStatusTarget(null)}
        nextStatus={statusTarget?.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"}
        onConfirm={async () => {
          if (!statusTarget) return;
          try {
            await statusMutation.mutateAsync({
              id: statusTarget.id,
              status: statusTarget.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
            });
            showToast("Статус шинэчлэгдлээ");
            setStatusTarget(null);
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Алдаа", "error");
          }
        }}
      />

      <MembershipModal
        open={Boolean(membershipTarget)}
        onOpenChange={(v) => !v && setMembershipTarget(null)}
        currentLevel={membershipTarget?.membershipLevel ?? "NORMAL"}
        onConfirm={async (level) => {
          if (!membershipTarget) return;
          try {
            await membershipMutation.mutateAsync({ id: membershipTarget.id, membershipLevel: level });
            showToast("Гишүүнчлэл шинэчлэгдлээ");
            setMembershipTarget(null);
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Алдаа", "error");
          }
        }}
      />

    </div>
  );
}
