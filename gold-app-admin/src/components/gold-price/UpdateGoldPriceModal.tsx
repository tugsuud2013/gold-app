"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useUpdateGoldPrice } from "@/hooks/useGoldPrice";
import { getBankPrice, getBuyPrice, getSellPrice, validateGoldPriceForm, type GoldPriceAdmin } from "@/lib/goldPriceUi";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current?: GoldPriceAdmin | null;
};

export default function UpdateGoldPriceModal({ open, onOpenChange, current }: Props) {
  const { showToast } = useToast();
  const updateM = useUpdateGoldPrice();
  const [mongolBankPrice, setMongolBankPrice] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    if (current) {
      const bank = getBankPrice(current);
      setMongolBankPrice(String(bank));
      setBuyPrice(String(getBuyPrice(current)));
      setSellPrice(String(getSellPrice(current)));
    } else {
      setMongolBankPrice("");
      setBuyPrice("");
      setSellPrice("");
    }
    setNote("");
  }, [open, current]);

  const handleSubmit = async () => {
    const error = validateGoldPriceForm({ mongolBankPrice, buyPrice, sellPrice });
    if (error) {
      showToast(error, "error");
      return;
    }
    try {
      await updateM.mutateAsync({
        mongolBankPrice: Number(mongolBankPrice),
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
        note: note.trim() || undefined,
      });
      showToast("Алтны ханш шинэчлэгдлээ");
      onOpenChange(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Алдаа", "error");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-gold-price-modal-overlay" />
        <Dialog.Content className="admin-gold-price-modal">
          <Dialog.Title className="admin-gold-price-modal-title">Үнэ шинэчлэх</Dialog.Title>
          <Dialog.Description className="admin-gold-price-modal-desc">
            Монголбанкны үнэ, авах болон зарах үнийг оруулна уу.
          </Dialog.Description>

          <div className="admin-gold-price-modal-form">
            <label className="admin-users-field">
              <span className="admin-users-label">Монголбанк үнэ (₮/гр)</span>
              <input
                type="number"
                min={1}
                value={mongolBankPrice}
                onChange={(e) => setMongolBankPrice(e.target.value)}
                className="admin-users-input"
                placeholder="385420"
              />
            </label>
            <label className="admin-users-field">
              <span className="admin-users-label">Авах үнэ (₮/гр)</span>
              <input
                type="number"
                min={1}
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="admin-users-input"
                placeholder="384100"
              />
            </label>
            <label className="admin-users-field">
              <span className="admin-users-label">Зарах үнэ (₮/гр)</span>
              <input
                type="number"
                min={1}
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="admin-users-input"
                placeholder="386740"
              />
            </label>
            <label className="admin-users-field">
              <span className="admin-users-label">Тайлбар</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="admin-users-input admin-gold-price-modal-textarea"
                rows={3}
                placeholder="Шинэчлэлтийн тайлбар (заавал биш)"
              />
            </label>
          </div>

          <div className="admin-gold-price-modal-actions">
            <button
              type="button"
              className="admin-users-btn admin-users-btn--ghost"
              onClick={() => onOpenChange(false)}
              disabled={updateM.isPending}
            >
              Болих
            </button>
            <button
              type="button"
              className="admin-users-btn admin-users-btn--primary"
              onClick={handleSubmit}
              disabled={updateM.isPending}
            >
              {updateM.isPending ? <LoadingSpinner /> : "Хадгалах"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
