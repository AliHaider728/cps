import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { DebouncedSearchInput } from "../../../components/shared/DebouncedSearchInput";
import { Badge } from "../../../components/ui/Badge";
import { usePendingTimesheets, useTimesheetHistory } from "../../../hooks/useTimesheet";

interface Filters {
  month: number;
  year: number;
  status: string;
  clinician_id?: string;
  [key: string]: string | number | undefined;
}

interface Clinician {
  full_name?: string;
  clinician_type?: string;
}

interface Timesheet {
  id: string;
  status: string;
  clinician_name?: string;
  clinicians?: Clinician;
  role?: string;
  surgery_names?: string[];
  month: number;
  year: number;
  total_hours?: number | string;
  submitted_at?: string;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function TimesheetQueuePage() {
  const now = new Date();
  const [filters, setFilters] = useState<Filters>({
    month:  now.getMonth() + 1,
    year:   now.getFullYear(),
    status: "",
  });

  const { data: pending = [], isLoading } = usePendingTimesheets();
  const { data: history }                 = useTimesheetHistory(filters);

  const historyItems: Timesheet[] = (Array.isArray(history) ? history : (history as any)?.items || []) as Timesheet[];
  const rows: Timesheet[] = filters.status ? historyItems : (pending as Timesheet[]);

  const stats = useMemo(() => ({
    pending:  pending.length,
    approved: historyItems.filter((i: Timesheet) => i.status === "approved").length,
    rejected: historyItems.filter((i: Timesheet) => i.status === "rejected").length,
  }), [pending, historyItems]);

  return (
    <div className="space-y-5 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Timesheet Approvals</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve clinician timesheets.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="month"
          value={`${filters.year}-${String(filters.month).padStart(2, "0")}`}
          onChange={(e) => {
            const [year, month] = e.target.value.split("-");
            setFilters((f) => ({ ...f, year: Number(year), month: Number(month) }));
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
        />
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm flex-1">
          <Search size={14} className="text-slate-400" />
          <DebouncedSearchInput
            placeholder="Clinician search..."
            className="outline-none text-sm w-full"
            value={filters.clinician_id || ""}
            onSearchChange={(val) => setFilters((f) => ({ ...f, clinician_id: val }))}
            icon={false}
          />
        </label>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
        >
          <option value="">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Pending",        value: stats.pending,  color: "text-blue-700"    },
          { label: "Approved This Month",  value: stats.approved, color: "text-emerald-700" },
          { label: "Rejected This Month",  value: stats.rejected, color: "text-rose-700"    },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Clinician","Surgery / PCN","Month","Total Hours","Submitted","Status","Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">Loading…</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm italic">No timesheets found.</td></tr>
            )}
            {rows.map((sheet) => (
              <tr key={sheet.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">
                    {sheet.clinician_name || sheet.clinicians?.full_name || "Clinician"}
                  </div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {sheet.role || sheet.clinicians?.clinician_type || "IP"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  {(sheet.surgery_names || []).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-slate-700 font-semibold">
                  {MONTHS[sheet.month - 1] || sheet.month} {sheet.year}
                </td>
                <td className="px-4 py-3 font-bold text-slate-900">
                  {Number(sheet.total_hours || 0).toFixed(2)}h
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {sheet.submitted_at
                    ? new Date(sheet.submitted_at).toLocaleDateString("en-GB")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                    sheet.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : sheet.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {sheet.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/dashboard/super-admin/timesheets/${sheet.id}`}
                    className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all"
                  >
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


