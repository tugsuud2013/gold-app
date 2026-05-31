"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: { id: string; phoneNumber: string; firstName?: string | null; lastName?: string | null } | null;
  onConfirm: (reason: string) => Promise<void> | void;
};

export default function BanUserModal({ open, onOpenChange, user, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Хэрэглэгчийг чатаас хаах">
      <div className="space-y-3">
        <div className="rounded bg-slate-50 p-3 text-sm">
          <p>{`${user?.lastName ?? ""} ${user?.firstName ?? ""}`.trim() || "-"}</p>
          <p className="text-slate-500">{user?.phoneNumber}</p>
        </div>
        <Input placeholder="Шалтгаан" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={() => onOpenChange(false)}>Болих</button>
          <Button onClick={() => onConfirm(reason)} disabled={!reason.trim()}>Чатаас хаах</Button>
        </div>
      </div>
    </Modal>
  );
}
