"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentLevel: string;
  onConfirm: (level: string) => Promise<void> | void;
};

const levels = ["NORMAL", "BRONZE", "SILVER", "GOLD"];

export default function MembershipModal({ open, onOpenChange, currentLevel, onConfirm }: Props) {
  const [level, setLevel] = useState(currentLevel);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Гишүүнчлэл өөрчлөх">
      <div className="space-y-3">
        <p className="text-sm">Одоогийн түвшин: <strong>{currentLevel}</strong></p>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        >
          {levels.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={() => onOpenChange(false)}>Болих</button>
          <Button onClick={() => onConfirm(level)}>Хадгалах</Button>
        </div>
      </div>
    </Modal>
  );
}
