"use client";

import {
  chatStatusBadgeKey,
  chatStatusLabel,
  formatChatListTime,
  formatChatPreview,
  type ChatThread,
} from "@/lib/chatUi";

type Props = {
  threads: ChatThread[];
  selectedUserId: string | null;
  onSelect: (userId: string) => void;
  isLoading?: boolean;
};

export default function ChatListPanel({ threads, selectedUserId, onSelect, isLoading }: Props) {
  if (isLoading) {
    return <div className="admin-chat-list admin-chat-list--loading admin-users-loading"><span className="sr-only">Ачааллаж байна</span></div>;
  }

  if (!threads.length) {
    return (
      <div className="admin-chat-list admin-chat-list--empty">
        <p className="admin-users-empty">Чат олдсонгүй</p>
      </div>
    );
  }

  return (
    <div className="admin-chat-list">
      {threads.map((thread) => {
        const active = selectedUserId === thread.userId;
        return (
          <button
            key={thread.id}
            type="button"
            className={`admin-chat-list-item ${active ? "admin-chat-list-item--active" : ""}`}
            onClick={() => onSelect(thread.userId)}
          >
            <div className="admin-chat-list-item-top">
              <span className="admin-chat-list-name truncate">{thread.user.name}</span>
              <span className="admin-chat-list-time">{formatChatListTime(thread.lastMessageAt)}</span>
            </div>
            <p className="admin-chat-list-phone">{thread.user.phoneNumber}</p>
            <p className="admin-chat-list-preview">{formatChatPreview(thread.lastMessageText)}</p>
            <div className="admin-chat-list-item-bottom">
              <span className={`admin-chat-status-badge admin-chat-status-badge--${chatStatusBadgeKey(thread.status)}`}>
                {chatStatusLabel(thread.status)}
              </span>
              {thread.unreadByAdmin > 0 ? (
                <span className="admin-chat-unread-badge">{thread.unreadByAdmin > 99 ? "99+" : thread.unreadByAdmin}</span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
