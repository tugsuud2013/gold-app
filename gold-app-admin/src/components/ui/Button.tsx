import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren<{ loading?: boolean }>;

export default function Button({ children, className = "", loading, ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {loading ? "Түр хүлээнэ үү..." : children}
    </button>
  );
}
