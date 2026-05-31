"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NewsRichTextEditor from "@/components/news/NewsRichTextEditor";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  useCreateNews,
  useDeleteNewsPermanent,
  useNewsItem,
  useUpdateNews,
} from "@/hooks/useNews";
import {
  formValuesToPayload,
  NEWS_STATUSES,
  newsStatusLabel,
  newsToFormValues,
  slugifyTitle,
  type NewsFormValues,
} from "@/lib/newsUi";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsId?: string | null;
};

type PendingAction = "draft" | "publish" | "archive" | "delete" | null;

export default function NewsFormModal({ open, onOpenChange, newsId }: Props) {
  const { showToast } = useToast();
  const [values, setValues] = useState<NewsFormValues>(newsToFormValues());
  const [coverPreviewError, setCoverPreviewError] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const initializedFor = useRef<string | null>(null);
  const itemQ = useNewsItem(newsId ?? "");
  const createM = useCreateNews();
  const updateM = useUpdateNews();
  const deleteM = useDeleteNewsPermanent();
  const isEdit = Boolean(newsId);
  const isBusy = createM.isPending || updateM.isPending || deleteM.isPending;
  const isLoadingEdit = isEdit && itemQ.isLoading;

  useEffect(() => {
    if (!open) {
      initializedFor.current = null;
      setPendingAction(null);
      return;
    }

    const initKey = newsId ?? "__new__";
    if (initializedFor.current === initKey) return;
    if (newsId && itemQ.isLoading) return;

    setValues(newsToFormValues(newsId ? itemQ.data : null));
    setCoverPreviewError(false);
    initializedFor.current = initKey;
  }, [open, newsId, itemQ.data, itemQ.isLoading]);

  useEffect(() => {
    setCoverPreviewError(false);
  }, [values.coverImage]);

  const setField = <K extends keyof NewsFormValues>(key: K, val: NewsFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const save = async (statusOverride?: NewsFormValues["status"]) => {
    if (!values.title.trim()) {
      showToast("Гарчиг оруулна уу", "error");
      return null;
    }
    const payload = formValuesToPayload({
      ...values,
      status: statusOverride ?? values.status,
      content: values.content.trim() || values.summary.trim() || "<p></p>",
    });
    if (isEdit && newsId) {
      return updateM.mutateAsync({ id: newsId, payload });
    }
    return createM.mutateAsync(payload);
  };

  const handleDraft = async () => {
    setPendingAction("draft");
    try {
      await save("DRAFT");
      showToast("Ноорог хадгалагдлаа");
      onOpenChange(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const handlePublish = async () => {
    setPendingAction("publish");
    try {
      await save("PUBLISHED");
      showToast("Мэдээ нийтлэгдлээ");
      onOpenChange(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const handleArchive = async () => {
    if (!newsId) return;
    setPendingAction("archive");
    try {
      await save("ARCHIVED");
      showToast("Мэдээ архивлагдлаа");
      onOpenChange(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!newsId) return;
    if (!window.confirm("Мэдээг бүрмөсөн устгах уу?")) return;
    setPendingAction("delete");
    try {
      await deleteM.mutateAsync(newsId);
      showToast("Мэдээ устгагдлаа");
      onOpenChange(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-news-modal-overlay" />
        <Dialog.Content className="admin-news-modal outline-none" aria-describedby={undefined}>
          <header className="admin-news-modal-header">
            <div className="admin-news-modal-header-main">
              <Dialog.Title className="admin-news-modal-title">
                {isEdit ? "Мэдээ засах" : "Мэдээ нэмэх"}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {isEdit ? "Мэдээний мэдээлэл засах" : "Шинэ мэдээ үүсгэх"}
              </Dialog.Description>
            </div>
            <Dialog.Close
              type="button"
              className="admin-users-icon-btn shrink-0 rounded-lg p-2"
              aria-label="Хаах"
              disabled={isBusy}
            >
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="admin-news-modal-body">
            {isLoadingEdit ? (
              <div className="admin-users-loading"><LoadingSpinner /></div>
            ) : (
              <>
                <label className="admin-users-field">
                  <span className="admin-users-label">Гарчиг</span>
                  <input
                    className="admin-users-input"
                    value={values.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setValues((prev) => ({
                        ...prev,
                        title,
                        slug: prev.slug || slugifyTitle(title),
                        metaTitle: prev.metaTitle || title,
                      }));
                    }}
                  />
                </label>
                <label className="admin-users-field">
                  <span className="admin-users-label">Товч тайлбар</span>
                  <textarea
                    className="admin-users-input"
                    rows={2}
                    value={values.summary}
                    onChange={(e) => setValues((prev) => ({ ...prev, summary: e.target.value }))}
                  />
                </label>
                <div className="admin-users-field">
                  <span className="admin-users-label">Контент</span>
                  <NewsRichTextEditor
                    value={values.content}
                    onChange={(content) => setField("content", content)}
                    placeholder="Мэдээний агуулга..."
                  />
                </div>
                <div className="admin-users-field">
                  <span className="admin-users-label">Cover Image URL</span>
                  <input
                    className="admin-users-input"
                    value={values.coverImage}
                    onChange={(e) => setField("coverImage", e.target.value)}
                    placeholder="https://..."
                  />
                  {values.coverImage.trim() ? (
                    <div className="admin-news-cover-preview">
                      {coverPreviewError ? (
                        <span className="admin-news-cover-preview-fallback">Зураг ачаалахад алдаа гарлаа</span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={values.coverImage.trim()}
                          alt="Cover preview"
                          className="admin-news-cover-preview-img"
                          onError={() => setCoverPreviewError(true)}
                        />
                      )}
                    </div>
                  ) : null}
                </div>
                <label className="admin-users-field">
                  <span className="admin-users-label">Gallery Images (мөр бүрт нэг URL)</span>
                  <textarea
                    className="admin-users-input"
                    rows={3}
                    value={values.galleryImages}
                    onChange={(e) => setField("galleryImages", e.target.value)}
                  />
                </label>
                <div className="admin-news-modal-grid">
                  <label className="admin-users-field">
                    <span className="admin-users-label">Төлөв</span>
                    <select
                      className="admin-users-select"
                      value={values.status}
                      onChange={(e) => setField("status", e.target.value as NewsFormValues["status"])}
                    >
                      {NEWS_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {newsStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-users-field">
                    <span className="admin-users-label">Publish Date</span>
                    <input
                      type="datetime-local"
                      className="admin-users-input admin-users-datetime"
                      value={values.publishedAt}
                      onChange={(e) => setField("publishedAt", e.target.value)}
                    />
                  </label>
                </div>
                <label className="admin-users-field">
                  <span className="admin-users-label">Tags (таслалаар)</span>
                  <input
                    className="admin-users-input"
                    value={values.tags}
                    onChange={(e) => setField("tags", e.target.value)}
                  />
                </label>
                <div className="admin-news-modal-seo">
                  <h3 className="admin-news-modal-seo-title">SEO</h3>
                  <label className="admin-users-field">
                    <span className="admin-users-label">Meta Title</span>
                    <input
                      className="admin-users-input"
                      value={values.metaTitle}
                      onChange={(e) => setField("metaTitle", e.target.value)}
                    />
                  </label>
                  <label className="admin-users-field">
                    <span className="admin-users-label">Meta Description</span>
                    <textarea
                      className="admin-users-input"
                      rows={2}
                      value={values.metaDescription}
                      onChange={(e) => setField("metaDescription", e.target.value)}
                    />
                  </label>
                  <label className="admin-users-field">
                    <span className="admin-users-label">Slug</span>
                    <input
                      className="admin-users-input"
                      value={values.slug}
                      onChange={(e) => setField("slug", e.target.value)}
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          <footer className="admin-news-modal-actions">
            <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={() => onOpenChange(false)} disabled={isBusy}>
              Болих
            </button>
            {isEdit && (
              <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={handleDelete} disabled={isBusy}>
                {pendingAction === "delete" ? <LoadingSpinner /> : "Устгах"}
              </button>
            )}
            {isEdit && (
              <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={handleArchive} disabled={isBusy}>
                {pendingAction === "archive" ? <LoadingSpinner /> : "Archive"}
              </button>
            )}
            <button type="button" className="admin-users-btn admin-users-btn--secondary" onClick={handleDraft} disabled={isBusy || isLoadingEdit}>
              {pendingAction === "draft" ? <LoadingSpinner /> : "Draft хадгалах"}
            </button>
            <button type="button" className="admin-users-btn admin-users-btn--primary" onClick={handlePublish} disabled={isBusy || isLoadingEdit}>
              {pendingAction === "publish" ? <LoadingSpinner /> : "Publish"}
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
