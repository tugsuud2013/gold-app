"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ open: boolean; onOpenChange: (open: boolean) => void; title: string }>;

export default function Modal({ open, onOpenChange, title, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6">
          <Dialog.Title className="mb-3 text-lg font-semibold">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
