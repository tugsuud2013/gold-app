"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Ban, CheckCircle, Download, Eye, FileText, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getPurchaseContractUrl,
  usePurchase,
  usePurchaseActivityLogs,
} from "@/hooks/usePurchases";
import {
  buildPurchaseDrawerTimeline,
  getContractStatusLabel,
  getPurchaseOrderNo,
  getPurchaseUserName,
  getQPayStatusLabel,
  purchaseDisplayStatusLabel,
  purchaseStatusBadgeKey,
  qpayStatusBadgeKey,
  type PurchaseWithUser,
} from "@/lib/purchasesUi";
import { formatDateTime, formatGrams, formatMNT } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

const sections = [
  { id: "general", label: "Ерөнхий" },
  { id: "contract", label: "Гэрээ" },
  { id: "payment", label: "Төлбөр" },
  { id: "timeline", label: "Timeline" },
  { id: "activity", label: "Activity Log" },
] as const;

type SectionId = (typeof sections)[number]["id"];

type Props = {
  purchaseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function PurchaseDetailDrawer({ purchaseId, open, onOpenChange }: Props) {
  const [section, setSection] = useState<SectionId>("general");
  const { showToast } = useToast();
  const id = purchaseId ?? "";

  const purchaseQ = usePurchase(id);
  const activityQ = usePurchaseActivityLogs(id);
  const purchase = purchaseQ.data;

  useEffect(() => {
    if (open) setSection("general");
  }, [open, purchaseId]);

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

  const contractUrl = id ? getPurchaseContractUrl(id) : "";

  const handleCheckQPay = useCallback(async () => {
    await purchaseQ.refetch();
    showToast("QPay мэдээлэл шинэчлэгдлээ");
  }, [purchaseQ, showToast]);

  const handleApprove = () => showToast("Батлах API одоогоор байхгүй", "error");
  const handleCancel = () => showToast("Цуцлах API одоогоор байхгүй", "error");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-users-drawer-overlay fixed inset-0 z-40" />
        <Dialog.Content className="admin-users-drawer admin-purchases-drawer fixed inset-y-0 right-0 z-50 flex flex-col outline-none">
          <div className="admin-users-drawer-header flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-lg font-semibold text-[#D4AF37]">
                {purchase ? getPurchaseOrderNo(purchase) : "Худалдан авалт"}
              </Dialog.Title>
              {purchase ? (
                <div className="admin-purchases-drawer-header-meta">
                  <span className="admin-purchases-drawer-user truncate">{getPurchaseUserName(purchase)}</span>
                  <span
                    className={`admin-purchases-badge admin-purchases-badge--${purchaseStatusBadgeKey(purchase)}`}
                  >
                    {purchaseDisplayStatusLabel(purchase)}
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-[#9CA3AF]">—</p>
              )}
            </div>
            <Dialog.Close className="admin-users-icon-btn shrink-0 rounded-lg p-2" aria-label="Хаах">
              <X size={18} />
            </Dialog.Close>
          </div>

          <nav className="admin-users-drawer-nav" aria-label="Purchase sections">
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
            {purchaseQ.isLoading && <LoadingSpinner />}
            {!purchaseQ.isLoading && !purchase && (
              <div className="admin-users-empty">Худалдан авалт олдсонгүй</div>
            )}

            {purchase && section === "general" && <GeneralSection purchase={purchase} />}
            {purchase && section === "contract" && (
              <ContractSection purchase={purchase} contractUrl={contractUrl} />
            )}
            {purchase && section === "payment" && (
              <PaymentSection purchase={purchase} onCheckQPay={handleCheckQPay} checking={purchaseQ.isFetching} />
            )}
            {purchase && section === "timeline" && <TimelineSection purchase={purchase} />}
            {purchase && section === "activity" && (
              <ActivitySection loading={activityQ.isLoading} logs={activityQ.data ?? []} />
            )}
          </div>

          {purchase && (
            <div className="admin-users-drawer-actions">
              <button
                type="button"
                className="admin-users-drawer-action-btn admin-users-drawer-action-btn--success"
                onClick={handleApprove}
              >
                <CheckCircle size={14} />
                Батлах
              </button>
              <button
                type="button"
                className="admin-users-drawer-action-btn admin-users-drawer-action-btn--danger"
                onClick={handleCancel}
              >
                <Ban size={14} />
                Цуцлах
              </button>
              <a href={contractUrl} target="_blank" rel="noreferrer" className="admin-users-drawer-action-btn">
                <Eye size={14} />
                Гэрээ харах
              </a>
              <a href={contractUrl} download className="admin-users-drawer-action-btn">
                <Download size={14} />
                PDF татах
              </a>
              <button
                type="button"
                className="admin-users-drawer-action-btn"
                onClick={handleCheckQPay}
                disabled={purchaseQ.isFetching}
              >
                <RefreshCw size={14} className={purchaseQ.isFetching ? "animate-spin" : ""} />
                QPay шалгах
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function GeneralSection({ purchase }: { purchase: PurchaseWithUser }) {
  return (
    <div className="admin-users-drawer-section space-y-4">
      <h3 className="admin-users-drawer-section-title">Ерөнхий</h3>
      <div className="admin-users-info-grid">
        <InfoRow label="Хэрэглэгч" value={getPurchaseUserName(purchase)} />
        <InfoRow label="Утас" value={purchase.user?.phoneNumber ?? "—"} />
        <InfoRow label="Алтны хэмжээ" value={formatGrams(purchase.amountGrams)} />
        <InfoRow label="Нэгж үнэ" value={formatMNT(purchase.pricePerGram)} />
        <InfoRow label="Нийт үнэ" value={formatMNT(purchase.totalAmountMnt)} />
        <InfoRow label="Төлөв" value={purchaseDisplayStatusLabel(purchase)} />
        <InfoRow label="Огноо" value={formatDateTime(purchase.createdAt)} />
      </div>
    </div>
  );
}

function ContractSection({ purchase, contractUrl }: { purchase: PurchaseWithUser; contractUrl: string }) {
  const hasPdf = Boolean(purchase.contractPdfUrl);

  return (
    <div className="admin-users-drawer-section space-y-4">
      <h3 className="admin-users-drawer-section-title">Гэрээ</h3>
      <div className="admin-purchases-drawer-section-card">
        <div className="flex items-start gap-3">
          <FileText size={28} className="shrink-0 text-[#D4AF37]" />
          <div className="min-w-0 flex-1">
            <p className="admin-users-label">Гэрээний төлөв</p>
            <p className="admin-users-value mt-1">{getContractStatusLabel(purchase)}</p>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              {hasPdf ? "PDF файл бэлэн байна" : "Гэрээ байгуулаагүй эсвэл PDF үүсээгүй"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={contractUrl}
            target="_blank"
            rel="noreferrer"
            className={`admin-users-btn admin-users-btn--primary ${!hasPdf ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={!hasPdf}
          >
            <Eye size={14} />
            PDF харах
          </a>
          <a
            href={contractUrl}
            download
            className={`admin-users-btn admin-users-btn--ghost ${!hasPdf ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={!hasPdf}
          >
            <Download size={14} />
            PDF татах
          </a>
        </div>
      </div>
    </div>
  );
}

function PaymentSection({
  purchase,
  onCheckQPay,
  checking,
}: {
  purchase: PurchaseWithUser;
  onCheckQPay: () => void;
  checking: boolean;
}) {
  const paidAmount =
    purchase.qpayStatus === "PAID" ? formatMNT(purchase.totalAmountMnt) : "—";

  return (
    <div className="admin-users-drawer-section space-y-4">
      <h3 className="admin-users-drawer-section-title">Төлбөр</h3>
      <div className="admin-purchases-drawer-section-card space-y-4">
        <div className="admin-users-info-grid">
          <InfoRow label="QPay төлөв" value={getQPayStatusLabel(purchase.qpayStatus)} />
          <InfoRow label="Invoice ID" value={purchase.qpayInvoiceId ?? "—"} />
          <InfoRow label="Төлсөн дүн" value={paidAmount} />
          <InfoRow label="Төлсөн огноо" value={purchase.paidAt ? formatDateTime(purchase.paidAt) : "—"} />
        </div>
        <span className={`admin-purchases-badge admin-purchases-badge--qpay-${qpayStatusBadgeKey(purchase.qpayStatus)}`}>
          {getQPayStatusLabel(purchase.qpayStatus)}
        </span>
        <button
          type="button"
          className="admin-users-btn admin-users-btn--ghost"
          onClick={onCheckQPay}
          disabled={checking}
        >
          <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
          QPay шалгах
        </button>
      </div>
    </div>
  );
}

function TimelineSection({ purchase }: { purchase: PurchaseWithUser }) {
  const timeline = buildPurchaseDrawerTimeline(purchase);

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
            {log.entity ?? "—"} · {formatDateTime(log.createdAt)}
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
