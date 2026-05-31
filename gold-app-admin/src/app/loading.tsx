"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function GlobalLoadingPage() {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-sm text-slate-600">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
        Уншиж байна...
        {timedOut ? (
          <Link className="text-amber-700 underline" href="/login">
            Хэт удаан үргэлжилж байна. Нэвтрэх хуудас руу очих
          </Link>
        ) : null}
      </div>
    </div>
  );
}
