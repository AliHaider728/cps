export default function RotaFilters({ month, year, onMonthChange, onYearChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">Month</label>
        <select className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm" value={month} onChange={(e) => onMonthChange?.(Number(e.target.value))}>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">Year</label>
        <input className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm w-28" type="number" value={year} onChange={(e) => onYearChange?.(Number(e.target.value))} />
      </div>
    </div>
  );
}
