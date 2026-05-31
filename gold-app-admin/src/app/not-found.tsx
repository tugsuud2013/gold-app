import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Хуудас олдсонгүй</h1>
        <p className="mt-2 text-sm text-slate-500">Таны хайсан хуудас байхгүй байна.</p>
        <Link href="/" className="mt-4 inline-block rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white">
          Dashboard руу буцах
        </Link>
      </div>
    </div>
  );
}
