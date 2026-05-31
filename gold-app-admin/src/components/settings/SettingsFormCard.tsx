"use client";

import type { ReactNode } from "react";
import { Save } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  showSave?: boolean;
  saving?: boolean;
  onSave?: () => void;
  loading?: boolean;
  loadingNode?: ReactNode;
};

export default function SettingsFormCard({
  title,
  description,
  children,
  showSave,
  saving,
  onSave,
  loading,
  loadingNode,
}: Props) {
  return (
    <section className="admin-users-card admin-settings-form-card rounded-2xl">
      <header className="admin-settings-form-card-head">
        <div>
          <h2 className="admin-settings-form-card-title">{title}</h2>
          {description && <p className="admin-settings-form-card-desc">{description}</p>}
        </div>
        {showSave && onSave && (
          <button
            type="button"
            className="admin-users-btn admin-users-btn--primary admin-settings-form-save"
            disabled={saving || loading}
            onClick={onSave}
          >
            <Save size={16} />
            Хадгалах
          </button>
        )}
      </header>

      <div className="admin-settings-form-card-body">
        {loading ? loadingNode : children}
      </div>
    </section>
  );
}
