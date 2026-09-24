export function Stars({ value, size = "text-base" }: { value: number | null; size?: string }) {
  if (value === null) return <span className={`text-mar-950/40 ${size}`}>Sin notas</span>;
  const full = Math.round(value);
  return (
    <span className={size} title={`${value.toFixed(1)} / 5`}>
      <span className="text-otono-600">{"★".repeat(full)}</span>
      <span className="text-mar-200">{"★".repeat(Math.max(0, 5 - full))}</span>
      <span className="ml-1 text-sm text-mar-950/60">{value.toFixed(1)}</span>
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} estrellas`}
          className={`text-2xl ${n <= value ? "text-otono-600" : "text-mar-200"}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
