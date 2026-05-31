"use client";

import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function NewsRichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = useCallback(() => {
    onChange(ref.current?.innerHTML ?? "");
  }, [onChange]);

  const exec = (command: string) => {
    document.execCommand(command, false);
    ref.current?.focus();
    emitChange();
  };

  return (
    <div className="admin-news-editor">
      <div className="admin-news-editor-toolbar">
        <button type="button" className="admin-news-editor-btn" onClick={() => exec("bold")} aria-label="Bold">
          <Bold size={16} />
        </button>
        <button type="button" className="admin-news-editor-btn" onClick={() => exec("italic")} aria-label="Italic">
          <Italic size={16} />
        </button>
        <button type="button" className="admin-news-editor-btn" onClick={() => exec("insertUnorderedList")} aria-label="List">
          <List size={16} />
        </button>
        <button type="button" className="admin-news-editor-btn" onClick={() => exec("insertOrderedList")} aria-label="Ordered list">
          <ListOrdered size={16} />
        </button>
      </div>
      <div
        ref={ref}
        className="admin-news-editor-body admin-users-input"
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder}
        onInput={emitChange}
        suppressContentEditableWarning
      />
    </div>
  );
}
