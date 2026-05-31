import { formatDate, formatDateTime } from "@/lib/utils";

export type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type NewsAdmin = {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  coverImageUrl?: string | null;
  imageUrls: string[];
  status: NewsStatus;
  isPublished: boolean;
  publishedAt?: string | null;
  tags: string[];
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  admin?: { id: string; name: string; email: string } | null;
};

export type NewsStats = {
  total: number;
  published: number;
  draft: number;
  archived: number;
};

export type NewsFilters = {
  title?: string;
  status?: NewsStatus;
  dateFrom?: string;
  dateTo?: string;
  author?: string;
};

export const NEWS_PAGE_SIZE = 20;

export const NEWS_STATUSES: NewsStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export function newsStatusLabel(status: NewsStatus) {
  if (status === "PUBLISHED") return "Нийтлэгдсэн";
  if (status === "ARCHIVED") return "Архивласан";
  return "Ноорог";
}

export function newsStatusBadgeKey(status: NewsStatus) {
  if (status === "PUBLISHED") return "published";
  if (status === "ARCHIVED") return "archived";
  return "draft";
}

export function getNewsCover(item: Pick<NewsAdmin, "coverImageUrl" | "imageUrls">) {
  return item.coverImageUrl ?? item.imageUrls?.[0] ?? null;
}

export function computeNewsStats(items: NewsAdmin[]): NewsStats {
  return {
    total: items.length,
    published: items.filter((i) => i.status === "PUBLISHED").length,
    draft: items.filter((i) => i.status === "DRAFT").length,
    archived: items.filter((i) => i.status === "ARCHIVED").length,
  };
}

export function getNewsGallery(item: Pick<NewsAdmin, "imageUrls">) {
  return item.imageUrls?.slice(1) ?? [];
}

export function getAuthorName(item: NewsAdmin) {
  return item.admin?.name ?? "—";
}

export function buildNewsImageUrls(coverImage: string, galleryText: string) {
  const gallery = galleryText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return [coverImage.trim(), ...gallery].filter(Boolean);
}

export function tagsToString(tags?: string[]) {
  return (tags ?? []).join(", ");
}

export function stringToTags(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180);
}

export function filterNewsClient(items: NewsAdmin[], filters: NewsFilters) {
  return items.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.title?.trim()) {
      const q = filters.title.trim().toLowerCase();
      if (!item.title.toLowerCase().includes(q)) return false;
    }
    if (filters.author?.trim()) {
      const q = filters.author.trim().toLowerCase();
      const name = getAuthorName(item).toLowerCase();
      if (!name.includes(q)) return false;
    }
    if (filters.dateFrom) {
      if (new Date(item.createdAt) < new Date(`${filters.dateFrom}T00:00:00`)) return false;
    }
    if (filters.dateTo) {
      if (new Date(item.createdAt) > new Date(`${filters.dateTo}T23:59:59`)) return false;
    }
    return true;
  });
}

export function paginateNews<T>(items: T[], page: number, pageSize = NEWS_PAGE_SIZE) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total };
}

export function exportNewsToCsv(items: NewsAdmin[]) {
  const headers = ["№", "Гарчиг", "Төлөв", "Зохиогч", "Үүсгэсэн", "Шинэчилсэн"];
  const rows = items.map((item, i) => [
    String(i + 1),
    item.title,
    newsStatusLabel(item.status),
    getAuthorName(item),
    formatDateTime(item.createdAt),
    formatDateTime(item.updatedAt),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `goldapp-news-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export type NewsFormValues = {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  galleryImages: string;
  status: NewsStatus;
  publishedAt: string;
  tags: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
};

export function newsToFormValues(item?: NewsAdmin | null): NewsFormValues {
  if (!item) {
    return {
      title: "",
      summary: "",
      content: "",
      coverImage: "",
      galleryImages: "",
      status: "DRAFT",
      publishedAt: "",
      tags: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
    };
  }
  return {
    title: item.title,
    summary: item.summary ?? "",
    content: item.content,
    coverImage: getNewsCover(item) ?? "",
    galleryImages: getNewsGallery(item).join("\n"),
    status: item.status,
    publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : "",
    tags: tagsToString(item.tags),
    slug: item.slug ?? "",
    metaTitle: item.metaTitle ?? "",
    metaDescription: item.metaDescription ?? "",
  };
}

export function formValuesToPayload(values: NewsFormValues) {
  const imageUrls = buildNewsImageUrls(values.coverImage, values.galleryImages);
  return {
    title: values.title.trim(),
    summary: values.summary.trim() || undefined,
    content: values.content,
    coverImageUrl: values.coverImage.trim() || imageUrls[0] || undefined,
    imageUrls,
    status: values.status,
    publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
    tags: stringToTags(values.tags),
    slug: values.slug.trim() || slugifyTitle(values.title),
    metaTitle: values.metaTitle.trim() || undefined,
    metaDescription: values.metaDescription.trim() || undefined,
  };
}
