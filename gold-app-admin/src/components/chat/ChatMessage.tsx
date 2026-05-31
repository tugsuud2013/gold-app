"use client";

import { Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Props = {
  message: {
    id: string;
    message: string;
    createdAt: string;
    user?: { firstName?: string; lastName?: string; membershipLevel?: string };
  };
  onDelete: (id: string) => void;
};

export default function ChatMessage({ message, onDelete }: Props) {
  const name = `${message.user?.lastName ?? ""} ${message.user?.firstName ?? ""}`.trim() || "Хэрэглэгч";
  const initials = name.slice(0, 1).toUpperCase();
  return (
    <div className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-slate-500">{formatDateTime(message.createdAt)}</p>
        </div>
        <p className="mt-1 text-sm text-slate-700">{message.message}</p>
      </div>
      <button
        className="opacity-0 transition group-hover:opacity-100"
        onClick={() => {
          if (confirm("Мессеж устгах уу?")) onDelete(message.id);
        }}
      >
        <Trash2 size={16} className="text-rose-600" />
      </button>
    </div>
  );
}
