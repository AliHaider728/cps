/**
 * components/ui/ShiftStatusBadge.jsx
 * Used in Timesheettab + MyTimesheetPage
 */

const CONFIGS = {
  working:      { label: "Working",      cls: "bg-blue-50 text-blue-700 border-blue-200"       },
  annual_leave: { label: "Annual Leave", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  sick:         { label: "Sick",         cls: "bg-orange-50 text-orange-700 border-orange-200" },
  cppe:         { label: "CPPE",         cls: "bg-green-50 text-green-700 border-green-200"    },
  cover:        { label: "Cover",        cls: "bg-purple-50 text-purple-700 border-purple-200" },
  gap:          { label: "Gap",          cls: "bg-red-50 text-red-700 border-red-200"          },
  cancelled:    { label: "Cancelled",    cls: "bg-slate-50 text-slate-400 border-slate-200"    },
  submitted:    { label: "Submitted",    cls: "bg-amber-50 text-amber-700 border-amber-200"    },
  approved:     { label: "Approved",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected:     { label: "Rejected",     cls: "bg-red-50 text-red-700 border-red-200"          },
  draft:        { label: "Draft",        cls: "bg-slate-50 text-slate-500 border-slate-200"    },
  active:       { label: "Active",       cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed:    { label: "Completed",    cls: "bg-slate-100 text-slate-600 border-slate-200"   },
};

export default function ShiftStatusBadge({ status }) {
  const cfg = CONFIGS[status] || { label: status || "—", cls: "bg-slate-50 text-slate-400 border-slate-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}