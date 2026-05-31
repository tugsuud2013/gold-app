"use client";

import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import ChatListPanel from "@/components/chat/ChatListPanel";
import ChatWindow from "@/components/chat/ChatWindow";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useChatThreads } from "@/hooks/useChat";
import { type ChatFilters, type ChatThreadStatus } from "@/lib/chatUi";

const filterTabs: Array<{ key: "all" | ChatThreadStatus | "unread"; label: string }> = [
  { key: "all", label: "Бүгд" },
  { key: "OPEN", label: "Open" },
  { key: "CLOSED", label: "Closed" },
  { key: "unread", label: "Unread" },
];

export default function ChatPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof filterTabs)[number]["key"]>("all");

  const apiFilters: ChatFilters = useMemo(() => {
    if (activeTab === "OPEN" || activeTab === "CLOSED") return { status: activeTab };
    if (activeTab === "unread") return { unreadOnly: true };
    return {};
  }, [activeTab]);

  const threadsQ = useChatThreads({ ...apiFilters, search: search.trim() || undefined });
  const threads = threadsQ.data ?? [];
  const selectedThread = threads.find((t) => t.userId === selectedUserId) ?? null;

  return (
    <div className="admin-chat-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Чат дэмжлэг</h1>
          <p className="admin-users-subtitle">
            Хэрэглэгчийн чат · <span className="text-[#D4AF37]">{threads.length.toLocaleString("mn-MN")}</span> идэвхтэй
          </p>
        </div>
        <div className="admin-users-header-actions">
          <button
            type="button"
            className="admin-users-btn admin-users-btn--ghost"
            onClick={() => threadsQ.refetch()}
            disabled={threadsQ.isFetching}
          >
            <RefreshCw size={16} className={threadsQ.isFetching ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Шинэчлэх</span>
          </button>
        </div>
      </header>

      <section className="admin-chat-layout admin-users-card rounded-2xl">
        <aside className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-toolbar">
            <label className="admin-users-field admin-chat-search-field">
              <Search size={16} className="admin-users-field-icon" />
              <input
                className="admin-users-input"
                placeholder="Нэр, утсаар хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="admin-chat-filter-tabs">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`admin-chat-filter-tab ${activeTab === tab.key ? "admin-chat-filter-tab--active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {threadsQ.isLoading ? (
            <div className="admin-users-loading"><LoadingSpinner /></div>
          ) : (
            <ChatListPanel
              threads={threads}
              selectedUserId={selectedUserId}
              onSelect={setSelectedUserId}
            />
          )}
        </aside>

        <main className="admin-chat-main">
          <ChatWindow
            thread={selectedThread}
            onRefresh={() => threadsQ.refetch()}
            isRefreshing={threadsQ.isFetching}
          />
        </main>
      </section>
    </div>
  );
}
