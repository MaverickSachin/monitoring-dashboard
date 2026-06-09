interface PagerProps {
  page: number; // zero-based
  pages: number;
  from: number;
  to: number;
  total: number;
  unit: string;
  onChange: (page: number) => void;
}

/** Newer ‹ / › Older day-window pagination. */
export function Pager({ page, pages, from, to, total, unit, onChange }: PagerProps) {
  return (
    <div className="pager">
      <button className="pbtn" disabled={page === 0} onClick={() => onChange(page - 1)}>
        ‹ Newer
      </button>
      <span className="pinfo">
        {unit}{" "}
        <b>
          {from}–{to}
        </b>{" "}
        of {total} · page {page + 1}/{pages}
      </span>
      <button className="pbtn" disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>
        Older ›
      </button>
    </div>
  );
}
