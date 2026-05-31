"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  nextStatus: "ACTIVE" | "SUSPENDED";
  onConfirm: (reason?: string) => Promise<void> | void;
};

export default function UserStatusModal({ open, onOpenChange, nextStatus, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={nextStatus === "SUSPENDED" ? "Хэрэглэгч хаах" : "Хэрэглэгч нээх"}>
      <div className="space-y-3">
        {nextStatus === "SUSPENDED" && (
          <Input
            placeholder="Шалтгаан"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={() => onOpenChange(false)}>
            Болих
          </button>
          <Button onClick={() => onConfirm(reason)}>Баталгаажуулах</Button>
        </div>
      </div>
    </Modal>
  );
}
