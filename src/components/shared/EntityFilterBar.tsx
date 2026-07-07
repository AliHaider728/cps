import React from "react";
import { Search, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface EntityFilterBarProps {
  title: string;
  itemTypeLabel?: string;
  breadcrumbs: { label: string; path?: string }[];
  visibleCount: number;
  totalCount: number;
  onAdd: () => void;
  addButtonLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  children?: React.ReactNode;
}

export const EntityFilterBar: React.FC<EntityFilterBarProps> = ({
  title,
  itemTypeLabel,
  breadcrumbs,
  visibleCount,
  totalCount,
  onAdd,
  addButtonLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  children,
}) => {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = React.useState(searchValue);

  React.useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [localSearch, searchValue, onSearchChange]);

  return (
    <div className="space-y-5 px-2 sm:px-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={i}>
                {bc.path ? (
                  <button onClick={() => navigate(bc.path!)} className="transition-colors hover:text-blue-600">
                    {bc.label}
                  </button>
                ) : (
                  <span className="font-medium text-slate-600">{bc.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight size={12} />}
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {visibleCount} visible of {totalCount} {itemTypeLabel || title.toLowerCase()}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-teal-700"
        >
          <Plus size={14} /> {addButtonLabel}
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-[13px] outline-none transition-colors focus:border-blue-400 focus:bg-white"
          />
        </div>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
};
