"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (payload: { name: string; email: string; password: string; role: string }) => Promise<void> | void;
};

export default function AddAdminModal({ open, onOpenChange, onConfirm }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OPERATOR");

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("OPERATOR");
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm({ name, email, password, role });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-settings-admin-modal-overlay" />
        <Dialog.Content className="admin-settings-admin-modal">
          <header className="admin-settings-admin-modal-header">
            <Dialog.Title className="admin-settings-admin-modal-title">Админ нэмэх</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="admin-settings-admin-modal-close" aria-label="Хаах">
                <X size={18} />
              </button>
            </Dialog.Close>
          </header>

          <div className="admin-settings-admin-modal-body">
            <label className="admin-settings-admin-modal-field">
              <span className="admin-settings-admin-modal-label">Нэр</span>
              <input
                className="admin-settings-admin-modal-input"
                placeholder="Админы нэр"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="admin-settings-admin-modal-field">
              <span className="admin-settings-admin-modal-label">Имэйл</span>
              <input
                className="admin-settings-admin-modal-input"
                type="email"
                placeholder="admin@goldapp.mn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="admin-settings-admin-modal-field">
              <span className="admin-settings-admin-modal-label">Нууц үг</span>
              <input
                className="admin-settings-admin-modal-input"
                type="password"
                placeholder="8+ тэмдэгт"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="admin-settings-admin-modal-field">
              <span className="admin-settings-admin-modal-label">Эрх</span>
              <select
                className="admin-settings-admin-modal-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN - Бүх эрхтэй</option>
                <option value="ADMIN">ADMIN - Хэрэглэгч, мэдээ, тайлан</option>
                <option value="OPERATOR">OPERATOR - Хүсэлт боловсруулах</option>
              </select>
            </label>
          </div>

          <footer className="admin-settings-admin-modal-footer">
            <button type="button" className="admin-settings-admin-modal-btn admin-settings-admin-modal-btn--secondary" onClick={() => onOpenChange(false)}>
              Болих
            </button>
            <button
              type="button"
              className="admin-settings-admin-modal-btn admin-settings-admin-modal-btn--primary"
              disabled={!name || !email || password.length < 8}
              onClick={handleConfirm}
            >
              Нэмэх
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
