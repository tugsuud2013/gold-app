import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 ${className}`}
      {...props}
    />
  );
}
