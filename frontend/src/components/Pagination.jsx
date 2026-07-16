export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-8" role="navigation" aria-label="Phân trang">
      <button
        className="btn-secondary !py-2 !px-4"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Trước
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-ink/40">…</span>}
          <button
            className={`w-9 h-9 rounded-full text-sm font-medium ${
              p === page ? 'bg-teal-600 text-sand' : 'hover:bg-sandDeep'
            }`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        className="btn-secondary !py-2 !px-4"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Sau →
      </button>
    </div>
  );
}
