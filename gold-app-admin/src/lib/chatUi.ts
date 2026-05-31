import { formatDateTime } from "@/lib/utils";
import { kycLabel, membershipLabel } from "@/lib/usersUi";

export type ChatThreadStatus = "OPEN" | "CLOSED";

export type ChatThreadUser = {
  id: string;
  phoneNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  kycStatus: string;
  membershipLevel: string;
  isChatBanned: boolean;
  status: string;
  name: string;
};

export type ChatThread = {
  id: string;
  userId: string;
  status: ChatThreadStatus;
  adminLastReadAt?: string | null;
  lastMessageAt: string;
  lastMessageText?: string | null;
  unreadByAdmin: number;
  createdAt: string;
  updatedAt: string;
  user: ChatThreadUser;
};

export type ChatMessageItem = {
  id: string;
  userId: string;
  message: string;
  senderType: "USER" | "ADMIN";
  adminId?: string | null;
  createdAt: string;
};

export type ChatFilters = {
  status?: ChatThreadStatus;
  unreadOnly?: boolean;
  search?: string;
};

export function chatStatusLabel(status: ChatThreadStatus) {
  return status === "CLOSED" ? "Closed" : "Open";
}

export function chatStatusBadgeKey(status: ChatThreadStatus) {
  return status === "CLOSED" ? "closed" : "open";
}

export function formatChatPreview(text?: string | null) {
  if (!text?.trim()) return "—";
  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}

export function formatChatListTime(date: string) {
  const d = new Date(date);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return formatDateTime(date).split(",")[0] ?? formatDateTime(date);
}

export function getChatUserMeta(user: ChatThreadUser) {
  return {
    name: user.name,
    phone: user.phoneNumber,
    kyc: kycLabel(user.kycStatus),
    membership: membershipLabel(user.membershipLevel),
  };
}

export function filterThreadsClient(threads: ChatThread[], filters: ChatFilters) {
  return threads.filter((thread) => {
    if (filters.status && thread.status !== filters.status) return false;
    if (filters.unreadOnly && thread.unreadByAdmin <= 0) return false;
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      const hay = `${thread.user.name} ${thread.user.phoneNumber}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function parseChatThreads(data: unknown): ChatThread[] {
  if (Array.isArray(data)) return data as ChatThread[];
  if (data && typeof data === "object" && "items" in data) {
    const items = (data as { items?: unknown }).items;
    return Array.isArray(items) ? (items as ChatThread[]) : [];
  }
  return [];
}

type LegacyChatMessage = {
  id: string;
  userId: string;
  message: string;
  senderType?: ChatMessageItem["senderType"];
  adminId?: string | null;
  createdAt: string;
  user?: {
    id: string;
    phoneNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    kycStatus: string;
    membershipLevel: string;
    isChatBanned: boolean;
    status: string;
  };
};

export function buildThreadsFromLegacyMessages(messages: LegacyChatMessage[]): ChatThread[] {
  const byUser = new Map<string, LegacyChatMessage[]>();
  for (const msg of messages) {
    const bucket = byUser.get(msg.userId) ?? [];
    bucket.push(msg);
    byUser.set(msg.userId, bucket);
  }

  const threads: ChatThread[] = [];
  for (const [userId, msgs] of byUser) {
    const sorted = [...msgs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const last = sorted[sorted.length - 1];
    const u = last.user;
    if (!u) continue;

    const name = `${u.lastName ?? ""} ${u.firstName ?? ""}`.trim() || u.phoneNumber;
    let unread = 0;
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      const sender = sorted[i].senderType ?? "USER";
      if (sender === "USER") unread += 1;
      else break;
    }

    threads.push({
      id: userId,
      userId,
      status: "OPEN",
      adminLastReadAt: unread ? null : last.createdAt,
      lastMessageAt: last.createdAt,
      lastMessageText: last.message,
      unreadByAdmin: unread,
      createdAt: sorted[0].createdAt,
      updatedAt: last.createdAt,
      user: { ...u, name },
    });
  }

  return threads.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

export function mapLegacyMessages(items: LegacyChatMessage[], userId: string): ChatMessageItem[] {
  return items
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => ({
      id: m.id,
      userId: m.userId,
      message: m.message,
      senderType: m.senderType ?? "USER",
      adminId: m.adminId ?? null,
      createdAt: m.createdAt,
    }));
}
