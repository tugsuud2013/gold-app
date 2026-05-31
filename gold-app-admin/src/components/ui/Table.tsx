import { PropsWithChildren } from "react";

export default function Table({ children }: PropsWithChildren) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}
