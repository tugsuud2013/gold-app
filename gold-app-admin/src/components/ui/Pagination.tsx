type Props = {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex items-center gap-2">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">
        Өмнөх
      </button>
      <span className="text-sm">{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">
        Дараах
      </button>
    </div>
  );
}
