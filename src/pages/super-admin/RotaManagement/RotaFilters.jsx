const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat("en-GB", { month: "long" }).format(new Date(2000, i, 1))
);

export default function RotaFilters({ month, year, onMonthChange, onYearChange }) {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm flex-wrap">
        {MONTHS.map((name, i) => {
          const m      = i + 1;
          const active = m === month;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onMonthChange?.(m)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                active
                  ? "bg-blue-500 text-white shadow-sm shadow-blue-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {name.slice(0, 3)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onYearChange?.(y)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
              y === year
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}