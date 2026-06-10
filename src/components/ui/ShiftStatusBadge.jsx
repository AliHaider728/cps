/**
 * components/ui/ShiftStatusBadge.jsx
 * Used in Timesheettab + MyTimesheetPage + ClinicianTimeEntries
 */

const CONFIGS = {
  working:      { label: "Working",      cls: "bg-green-50 text-green-700 border-green-200"     },
  annual_leave: { label: "Annual Leave", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  sick:         { label: "Sick",         cls: "bg-orange-50 text-orange-700 border-orange-200" },
  cppe:         { label: "CPPE",         cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  cppe_training:{ label: "CPPE",         cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  cover:        { label: "Cover",        cls: "bg-blue-50 text-blue-700 border-blue-200"       },
  gap:          { label: "Gap",          cls: "bg-red-50 text-red-700 border-red-200"          },
  cancelled:    { label: "Cancelled",    cls: "bg-gray-50 text-gray-500 border-gray-200"       },
  submitted:    { label: "Submitted",    cls: "bg-yellow-50 text-yellow-700 border-yellow-300" },
  approved:     { label: "Approved",     cls: "bg-green-50 text-green-700 border-green-300"    },
  rejected:     { label: "Rejected",     cls: "bg-red-50 text-red-700 border-red-300"          },
  draft:        { label: "Draft",        cls: "bg-gray-100 text-gray-600 border-gray-300"      },
  pending:      { label: "Pending",      cls: "bg-yellow-50 text-yellow-700 border-yellow-300" },
  active:       { label: "Active",       cls: "bg-blue-50 text-blue-700 border-blue-300"       },
  completed:    { label: "Completed",    cls: "bg-gray-100 text-gray-600 border-gray-200"      },
};

export default function ShiftStatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  const cfg = CONFIGS[key] || CONFIGS[status] || {
    label: status || "—",
    cls: "bg-gray-50 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
