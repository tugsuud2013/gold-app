"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentRole: string;
  disabled?: boolean;
  onConfirm: (role: string) => Promise<void> | void;
};

export default function EditAdminModal({ open, onOpenChange, currentRole, disabled, onConfirm }: Props) {
  const [role, setRole] = useState(currentRole);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Админ эрх өөрчлөх">
      <div className="space-y-3">
        <select
          className="w-full rounded border px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={disabled}
        >
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          <option value="ADMIN">ADMIN</option>
          <option value="OPERATOR">OPERATOR</option>
        </select>
        {disabled && <p className="text-xs text-rose-600">Өөрийн эрхийг өөрчлөх боломжгүй</p>}
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={() => onOpenChange(false)}>Болих</button>
          <Button onClick={() => onConfirm(role)} disabled={disabled}>Хадгалах</Button>
        </div>
      </div>
    </Modal>
  );
}
