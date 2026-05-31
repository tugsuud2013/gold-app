"use client";

import { formatDateTime } from "@/lib/utils";
import type { ActivityLog } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Props = {
  logs: ActivityLog[];
  isLoading?: boolean;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  isMock?: boolean;
};

export default function SettingsAuditLog({ logs, isLoading, total = 0, page = 1, onPageChange, isMock }: Props) {
  const totalPages = Math.max(1, Math.ceil((total || logs.length) / 20));

  return (
    <section className="admin-users-card admin-settings-audit rounded-2xl">
      <div className="admin-settings-section-head">
        <div>
          <h2 className="admin-settings-section-title">Audit Log</h2>
          <p className="admin-users-subtitle">
            Системийн өөрчлөлтийн түүх
            {isMock && <span className="admin-settings-mock-badge"> · Demo data</span>}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-users-loading py-8"><LoadingSpinner /></div>
      ) : (
        <div className="admin-users-table-wrap admin-settings-audit-table">
          <table className="admin-users-table">
            <thead>
              <tr>
                {["Огноо", "Админ", "Үйлдэл", "Объект", "IP", "Дэлгэрэнгүй"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length ? logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.adminId?.slice(0, 8) ?? "—"}</td>
                  <td><span className="admin-settings-audit-badge">{log.action}</span></td>
                  <td>{log.entity ?? "—"}</td>
                  <td>{log.ipAddress ?? "—"}</td>
                  <td className="admin-settings-audit-meta">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="admin-settings-empty-cell">Audit log олдсонгүй</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && onPageChange && (
        <div className="admin-settings-audit-pagination">
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Өмнөх
          </button>
          <span className="admin-settings-page-indicator">{page} / {totalPages}</span>
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Дараах
          </button>
        </div>
      )}
    </section>
  );
}
