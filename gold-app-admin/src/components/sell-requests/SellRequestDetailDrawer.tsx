"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Ban, CheckCircle, Coins, Wallet, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  useApproveSellRequest,
  useCancelSellRequest,
  useCompleteSellRequest,
  useSellRequest,
  useSellRequestActivityLogs,
  useUserWalletForSell,
} from "@/hooks/useSellRequests";
import {
  buildSellRequestDrawerTimeline,
  getSellRequestNo,
  getSellRequestPhone,
  getSellRequestUserName,
  getSellTotalMnt,
  getSellUnitPrice,
  sellRequestStatusBadgeKey,
  sellRequestStatusLabel,
  type SellRequestWithUser,
} from "@/lib/sellRequestsUi";
import { formatDateTime, formatGrams, formatMNT } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

const sections = [
  { id: "general", label: "Ерөнхий" },
  { id: "wallet", label: "Wallet" },
  { id: "timeline", label: "Timeline" },
  { id: "activity", label: "Activity Log" },
] as const;

type SectionId = (typeof sections)[number]["id"];

type Props = {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SellRequestDetailDrawer({ requestId, open, onOpenChange }: Props) {
  const [section, setSection] = useState<SectionId>("general");
  const { showToast } = useToast();
  const id = requestId ?? "";

  const requestQ = useSellRequest(id);
  const activityQ = useSellRequestActivityLogs(id);
  const walletQ = useUserWalletForSell(requestQ.data?.userId ?? "");
  const approveM = useApproveSellRequest();
  const completeM = useCompleteSellRequest();
  const cancelM = useCancelSellRequest();

  const item = requestQ.data;
  const isBusy = approveM.isPending || completeM.isPending || cancelM.isPending;

  useEffect(() => {
    if (open) setSection("general");
  }, [open, requestId]);

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

  const handleApprove = useCallback(async () => {
    if (!id) return;
    try {
      await approveM.mutateAsync(id);
      showToast("Хүсэлт батлагдлаа");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    }
  }, [approveM, id, showToast]);

  const handleComplete = useCallback(async () => {
    if (!id) return;
    try {
      await completeM.mutateAsync(id);
      showToast("Төлөгдсөн болголоо");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    }
  }, [completeM, id, showToast]);

  const handleCancel = useCallback(async () => {
    if (!id) return;
    try {
      await cancelM.mutateAsync(id);
      showToast("Хүсэлт цуцлагдлаа");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    }
  }, [cancelM, id, showToast]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-users-drawer-overlay fixed inset-0 z-40" />
        <Dialog.Content className="admin-users-drawer admin-sell-requests-drawer fixed inset-y-0 right-0 z-50 flex flex-col outline-none">
          <div className="admin-users-drawer-header flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-lg font-semibold text-[#D4AF37]">
                {item ? getSellRequestNo(item) : "Зарах хүсэлт"}
              </Dialog.Title>
              {item ? (
                <div className="admin-purchases-drawer-header-meta">
                  <span className="admin-purchases-drawer-user truncate">{getSellRequestUserName(item)}</span>
                  <span
                    className={`admin-sell-requests-badge admin-sell-requests-badge--${sellRequestStatusBadgeKey(item.status)}`}
                  >
                    {sellRequestStatusLabel(item.status)}
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-[#9CA3AF]">-</p>
              )}
            </div>
            <Dialog.Close className="admin-users-icon-btn shrink-0 rounded-lg p-2" aria-label="Хаах">
              <X size={18} />
            </Dialog.Close>
          </div>

          <nav className="admin-users-drawer-nav" aria-label="Sell request sections">
            {sections.map(({ id: sid, label }) => (
              <button
                key={sid}
                type="button"
                className={`admin-users-drawer-nav-item ${section === sid ? "admin-users-drawer-nav-item--active" : ""}`}
                onClick={() => setSection(sid)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="admin-users-drawer-body">
            {requestQ.isLoading && <LoadingSpinner />}
            {!requestQ.isLoading && !item && (
              <div className="admin-users-empty">Хүсэлт олдсонгүй</div>
            )}

            {item && section === "general" && <GeneralSection item={item} />}
            {item && section === "wallet" && (
              <WalletSection item={item} walletQ={walletQ} />
            )}
            {item && section === "timeline" && <TimelineSection item={item} />}
            {item && section === "activity" && (
              <ActivitySection loading={activityQ.isLoading} logs={activityQ.data ?? []} />
            )}
          </div>

          {item && (
            <div className="admin-users-drawer-actions">
              <button
                type="button"
                className="admin-users-drawer-action-btn admin-users-drawer-action-btn--success"
                onClick={handleApprove}
                disabled={isBusy || item.status !== "PENDING"}
              >
                <CheckCircle size={14} />
                Батлах
              </button>
              <button
                type="button"
                className="admin-users-drawer-action-btn admin-users-drawer-action-btn--success"
                onClick={handleComplete}
                disabled={isBusy || item.status !== "APPROVED"}
              >
                <Coins size={14} />
                Төлөгдсөн болгох
              </button>
              <button
                type="button"
                className="admin-users-drawer-action-btn admin-users-drawer-action-btn--danger"
                onClick={handleCancel}
                disabled={isBusy || item.status === "COMPLETED" || item.status === "CANCELLED"}
              >
                <Ban size={14} />
                Цуцлах
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function GeneralSection({ item }: { item: SellRequestWithUser }) {
  return (
    <div className="admin-users-drawer-section space-y-4">
      <h3 className="admin-users-drawer-section-title">Ерөнхий</h3>
      <div className="admin-users-info-grid">
        <InfoRow label="Хэрэглэгч" value={getSellRequestUserName(item)} />
        <InfoRow label="Утас" value={getSellRequestPhone(item)} />
        <InfoRow label="Алтны хэмжээ" value={formatGrams(item.amountGrams)} />
        <InfoRow label="Нэгж үнэ" value={formatMNT(getSellUnitPrice(item))} />
        <InfoRow label="Нийт үнэ" value={formatMNT(getSellTotalMnt(item))} />
        <InfoRow label="Төлөв" value={sellRequestStatusLabel(item.status)} />
        <InfoRow label="Огноо" value={formatDateTime(item.createdAt)} />
      </div>
    </div>
  );
}

function WalletSection({
  item,
  walletQ,
}: {
  item: SellRequestWithUser;
  walletQ: ReturnType<typeof useUserWalletForSell>;
}) {
  const balanceGrams = Number(walletQ.data?.balanceGrams ?? 0);
  const mntBalance = balanceGrams * getSellUnitPrice(item);

  return (
    <div className="admin-users-drawer-section space-y-4">
      <h3 className="admin-users-drawer-section-title">Wallet</h3>
      {walletQ.isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="admin-purchases-drawer-section-card">
            <Wallet size={22} className="text-[#D4AF37]" />
            <p className="admin-users-label mt-3">Алтны үлдэгдэл</p>
            <p className="admin-users-wallet-balance mt-1">{formatGrams(balanceGrams)}</p>
          </div>
          <div className="admin-purchases-drawer-section-card">
            <Coins size={22} className="text-[#D4AF37]" />
            <p className="admin-users-label mt-3">Мөнгөн үлдэгдэл</p>
            <p className="admin-users-wallet-balance mt-1">{formatMNT(mntBalance)}</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">Алтны үлдэгдэл × нэгж үнэ</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineSection({ item }: { item: SellRequestWithUser }) {
  const timeline = buildSellRequestDrawerTimeline(item);

  return (
    <div className="admin-users-drawer-section space-y-3">
      <h3 className="admin-users-drawer-section-title">Timeline</h3>
      <ul className="admin-purchases-timeline">
        {timeline.map((step) => (
          <li
            key={step.key}
            className={`admin-purchases-timeline-item admin-purchases-timeline-item--${step.state}`}
          >
            <span className="admin-purchases-timeline-dot" />
            <div>
              <p className="admin-purchases-timeline-label">{step.label}</p>
              <p className="admin-purchases-timeline-time">{step.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivitySection({
  loading,
  logs,
}: {
  loading: boolean;
  logs: Array<{ id: string; action: string; entity?: string | null; createdAt: string }>;
}) {
  if (loading) return <LoadingSpinner />;
  if (!logs.length) return <div className="admin-users-empty">Activity log алга</div>;

  return (
    <ul className="admin-users-activity-list">
      {logs.map((log) => (
        <li key={log.id} className="admin-users-activity-item">
          <p className="admin-users-activity-action">{log.action}</p>
          <p className="admin-users-activity-meta">
            {log.entity ?? "-"} · {formatDateTime(log.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="admin-users-label">{label}</p>
      <p className="admin-users-value break-all">{value}</p>
    </div>
  );
}
