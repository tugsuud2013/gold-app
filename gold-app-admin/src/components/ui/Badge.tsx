import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ className?: string }>;

export default function Badge({ children, className = "" }: Props) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
