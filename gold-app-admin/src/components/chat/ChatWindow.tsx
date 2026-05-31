"use client";

import { Ban, MessageSquareOff, RefreshCw, Search, Send, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  useBanChatUser,
  useChatThreadMessages,
  useCloseChatThread,
  useMarkChatRead,
  useOpenChatThread,
  useSendChatMessage,
} from "@/hooks/useChat";
import {
  chatStatusBadgeKey,
  chatStatusLabel,
  getChatUserMeta,
  type ChatMessageItem,
  type ChatThread,
} from "@/lib/chatUi";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  thread: ChatThread | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export default function ChatWindow({ thread, onRefresh, isRefreshing }: Props) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const userId = thread?.userId ?? null;
  const messagesQ = useChatThreadMessages(userId);
  const sendM = useSendChatMessage();
  const readM = useMarkChatRead();
  const closeM = useCloseChatThread();
  const openM = useOpenChatThread();
  const banM = useBanChatUser();

  const messages = messagesQ.data?.items ?? [];
  const isBusy =
    sendM.isPending || readM.isPending || closeM.isPending || openM.isPending || banM.isPending;

  useEffect(() => {
    if (!userId) return;
    readM.mutate(userId);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, userId]);

  useEffect(() => {
    setDraft("");
  }, [userId]);

  if (!thread) {
    return (
      <div className="admin-chat-window admin-chat-window--empty">
        <MessageSquareOff size={40} className="text-[#6B7280]" />
        <p className="admin-chat-empty-title">Чат сонгоно уу</p>
        <p className="admin-chat-empty-desc">Зүүн талаас хэрэглэгчийн чат сонгож дэлгэрэнгүй харна уу.</p>
      </div>
    );
  }

  const meta = getChatUserMeta(thread.user);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    try {
      await sendM.mutateAsync({ userId: thread.userId, message: text });
      setDraft("");
      showToast("Мессеж илгээгдлээ");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    }
  };

  const handleClose = async () => {
    try {
      if (thread.status === "CLOSED") {
        await openM.mutateAsync(thread.userId);
        showToast("Чат дахин нээгдлээ");
      } else {
        await closeM.mutateAsync(thread.userId);
        showToast("Чат хаагдлаа");
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    }
  };

  const handleBan = async () => {
    if (!window.confirm(`${meta.name} хэрэглэгчийг чатаас хориглох уу?`)) return;
    try {
      await banM.mutateAsync(thread.userId);
      showToast("Хэрэглэгч чатаас хориглогдлоо");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    }
  };

  return (
    <div className="admin-chat-window">
      <header className="admin-chat-window-header">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-white">{meta.name}</h2>
          <div className="admin-chat-window-meta">
            <span>{meta.phone}</span>
            <span className="admin-chat-meta-dot">·</span>
            <span>KYC: {meta.kyc}</span>
            <span className="admin-chat-meta-dot">·</span>
            <span>{meta.membership}</span>
            {thread.user.isChatBanned ? (
              <>
                <span className="admin-chat-meta-dot">·</span>
                <span className="text-rose-400">Хориглосон</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="admin-chat-window-actions">
          <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={handleClose} disabled={isBusy}>
            <XCircle size={16} />
            {thread.status === "CLOSED" ? "Нээх" : "Close chat"}
          </button>
          <button type="button" className="admin-users-btn admin-users-btn--ghost" onClick={handleBan} disabled={isBusy || thread.user.isChatBanned}>
            <Ban size={16} /> Ban chat
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="admin-chat-messages">
        {messagesQ.isLoading ? (
          <div className="admin-users-loading"><LoadingSpinner /></div>
        ) : messages.length === 0 ? (
          <div className="admin-users-empty">Мессеж байхгүй</div>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} message={m} />)
        )}
      </div>

      <footer className="admin-chat-composer">
        <textarea
          className="admin-users-input admin-chat-composer-input"
          rows={2}
          placeholder="Мессеж бичих..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isBusy || thread.status === "CLOSED" || thread.user.isChatBanned}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <button
          type="button"
          className="admin-users-btn admin-users-btn--primary admin-chat-send-btn"
          onClick={() => void handleSend()}
          disabled={isBusy || !draft.trim() || thread.status === "CLOSED" || thread.user.isChatBanned}
        >
          {sendM.isPending ? <LoadingSpinner /> : <><Send size={16} /> Send</>}
        </button>
      </footer>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessageItem }) {
  const isAdmin = message.senderType === "ADMIN";
  return (
    <div className={`admin-chat-bubble-row ${isAdmin ? "admin-chat-bubble-row--admin" : "admin-chat-bubble-row--user"}`}>
      <div className={`admin-chat-bubble ${isAdmin ? "admin-chat-bubble--admin" : "admin-chat-bubble--user"}`}>
        <p className="admin-chat-bubble-text">{message.message}</p>
        <time className="admin-chat-bubble-time">{formatDateTime(message.createdAt)}</time>
      </div>
    </div>
  );
}
