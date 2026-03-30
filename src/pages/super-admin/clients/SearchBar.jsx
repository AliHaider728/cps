/**
 * SearchBar.jsx
 */
import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative max-w-sm">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search ICB, PCN, Practice, ODS…"
        className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl
          bg-white placeholder-slate-400 text-slate-700
          focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2
            text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}