"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Archive, Edit, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  useArchiveNews,
  useNewsActivityLogs,
  useNewsItem,
  usePublishNews,
} from "@/hooks/useNews";
import {
  getAuthorName,
  getNewsCover,
  getNewsGallery,
  newsStatusBadgeKey,
  newsStatusLabel,
  tagsToString,
} from "@/lib/newsUi";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

const sections = [
  { id: "general", label: "Ерөнхий" },
  { id: "content", label: "Контент" },
  { id: "seo", label: "SEO" },
  { id: "activity", label: "Activity Log" },
] as const;

type SectionId = (typeof sections)[number]["id"];

type Props = {
  newsId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
};

export default function NewsDetailDrawer({ newsId, open, onOpenChange, onEdit }: Props) {
  const [section, setSection] = useState<SectionId>("general");
  const { showToast } = useToast();
  const id = newsId ?? "";
  const itemQ = useNewsItem(id);
  const activityQ = useNewsActivityLogs(id);
  const publishM = usePublishNews();
  const archiveM = useArchiveNews();
  const item = itemQ.data;
  const isBusy = publishM.isPending || archiveM.isPending;

  useEffect(() => {
    if (open) setSection("general");
  }, [open, newsId]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cover = item ? getNewsCover(item) : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-users-drawer-overlay fixed inset-0 z-40" />
        <Dialog.Content className="admin-users-drawer admin-news-drawer fixed inset-y-0 right-0 z-50 flex flex-col outline-none">
          <div className="admin-users-drawer-header flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-lg font-semibold text-[#D4AF37]">
                {item?.title ?? "Мэдээ"}
              </Dialog.Title>
              {item && (
                <div className="admin-purchases-drawer-header-meta">
                  <span className={`admin-news-badge admin-news-badge--${newsStatusBadgeKey(item.status)}`}>
                    {newsStatusLabel(item.status)}
                  </span>
                  <span className="admin-purchases-drawer-user truncate">{getAuthorName(item)}</span>
                </div>
              )}
            </div>
            <Dialog.Close className="admin-users-icon-btn shrink-0 rounded-lg p-2" aria-label="Хаах">
              <X size={18} />
            </Dialog.Close>
          </div>

          <nav className="admin-users-drawer-nav">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`admin-users-drawer-nav-btn ${section === s.id ? "admin-users-drawer-nav-btn--active" : ""}`}
                onClick={() => setSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="admin-users-drawer-body">
            {itemQ.isLoading ? (
              <div className="admin-users-loading"><LoadingSpinner /></div>
            ) : !item ? (
              <div className="admin-users-empty">Мэдээ олдсонгүй</div>
            ) : section === "general" ? (
              <div className="admin-users-drawer-section">
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="admin-news-drawer-cover mb-4 rounded-xl" />
                )}
                <dl className="admin-users-detail-grid">
                  <div><dt>Гарчиг</dt><dd>{item.title}</dd></div>
                  <div><dt>Товч тайлбар</dt><dd>{item.summary || "—"}</dd></div>
                  <div><dt>Төлөв</dt><dd>{newsStatusLabel(item.status)}</dd></div>
                  <div><dt>Зохиогч</dt><dd>{getAuthorName(item)}</dd></div>
                  <div><dt>Tags</dt><dd>{tagsToString(item.tags) || "—"}</dd></div>
                  <div><dt>Publish Date</dt><dd>{item.publishedAt ? formatDateTime(item.publishedAt) : "—"}</dd></div>
                  <div><dt>Үүсгэсэн</dt><dd>{formatDateTime(item.createdAt)}</dd></div>
                  <div><dt>Шинэчилсэн</dt><dd>{formatDateTime(item.updatedAt)}</dd></div>
                </dl>
              </div>
            ) : section === "content" ? (
              <div className="admin-users-drawer-section">
                <div className="admin-news-content-preview" dangerouslySetInnerHTML={{ __html: item.content }} />
                {getNewsGallery(item).length > 0 && (
                  <div className="admin-news-gallery mt-4">
                    {getNewsGallery(item).map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} src={url} alt="" className="admin-news-gallery-item rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            ) : section === "seo" ? (
              <dl className="admin-users-detail-grid">
                <div><dt>Meta Title</dt><dd>{item.metaTitle || "—"}</dd></div>
                <div><dt>Meta Description</dt><dd>{item.metaDescription || "—"}</dd></div>
                <div><dt>Slug</dt><dd>{item.slug || "—"}</dd></div>
              </dl>
            ) : (
              <ul className="admin-purchases-activity-list">
                {(activityQ.data ?? []).length === 0 ? (
                  <li className="admin-users-empty">Activity log байхгүй</li>
                ) : (
                  activityQ.data!.map((log) => (
                    <li key={log.id} className="admin-purchases-activity-item">
                      <p className="font-medium text-white">{log.action}</p>
                      <p className="text-xs text-[#9CA3AF]">{formatDateTime(log.createdAt)}</p>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {item && (
            <div className="admin-users-drawer-actions">
              <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={() => onEdit(item.id)} disabled={isBusy}>
                <Edit size={16} /> Засах
              </button>
              {item.status !== "PUBLISHED" && (
                <button
                  type="button"
                  className="admin-users-btn admin-users-btn--primary"
                  disabled={isBusy}
                  onClick={async () => {
                    try {
                      await publishM.mutateAsync(item.id);
                      showToast("Нийтлэгдлээ");
                    } catch (e) {
                      showToast(e instanceof Error ? e.message : "Алдаа", "error");
                    }
                  }}
                >
                  <Send size={16} /> Publish
                </button>
              )}
              {item.status !== "ARCHIVED" && (
                <button
                  type="button"
                  className="admin-users-btn admin-users-btn--ghost"
                  disabled={isBusy}
                  onClick={async () => {
                    try {
                      await archiveM.mutateAsync(item.id);
                      showToast("Архивлагдлаа");
                    } catch (e) {
                      showToast(e instanceof Error ? e.message : "Алдаа", "error");
                    }
                  }}
                >
                  <Archive size={16} /> Archive
                </button>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
