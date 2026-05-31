"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  current: boolean;
  onConfirm: (isChatBanned: boolean, reason?: string) => Promise<void> | void;
};

export default function ChatBanModal({ open, onOpenChange, current, onConfirm }: Props) {
  const [isChatBanned, setIsChatBanned] = useState(current);
  const [reason, setReason] = useState("");

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Чат эрх тохируулах">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isChatBanned}
            onChange={(e) => setIsChatBanned(e.target.checked)}
          />
          Чат хориглох
        </label>
        <Input
          placeholder="Шалтгаан"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={() => onOpenChange(false)}>Болих</button>
          <Button onClick={() => onConfirm(isChatBanned, reason)}>Хадгалах</Button>
        </div>
      </div>
    </Modal>
  );
}
