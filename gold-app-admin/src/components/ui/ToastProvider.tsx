"use client";

import * as Toast from "@radix-ui/react-toast";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastKind = "success" | "error";
type ToastState = { open: boolean; title: string; kind: ToastKind };

const ToastContext = createContext<{ showToast: (title: string, kind?: ToastKind) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<ToastState>({
    open: false,
    title: "",
    kind: "success",
  });

  const showToast = useCallback((title: string, kind: ToastKind = "success") => {
    setState({ open: true, title, kind });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root
          open={state.open}
          onOpenChange={(open) => setState((prev) => ({ ...prev, open }))}
          className={`fixed bottom-4 right-4 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            state.kind === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <Toast.Title>{state.title}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
