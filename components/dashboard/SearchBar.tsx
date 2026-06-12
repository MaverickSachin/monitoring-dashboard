interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
}

/** Free-text filter over run id, window, pipeline, asset name, and message. */
export function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <label className="search">
      <span className="mag" aria-hidden="true">
        🔍
      </span>
      <input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search run, window, asset, message..."
        aria-label="Search runs"
      />
      {query && (
        <button type="button" className="clr" onClick={() => onChange("")} aria-label="Clear search">
          ✕
        </button>
      )}
    </label>
  );
}
