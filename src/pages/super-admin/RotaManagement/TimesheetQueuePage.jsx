import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { usePendingTimesheets, useTimesheetHistory } from "../../../hooks/useTimesheet";

export default function TimesheetQueuePage() {
  const now = new Date();
  const [filters, setFilters] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), status: "" });
  const { data: pending = [], isLoading } = usePendingTimesheets();
  const { data: history } = useTimesheetHistory(filters);
  const rows = filters.status ? history?.items || [] : pending;
  const stats = useMemo(() => ({
    pending: pending.length,
    approved: (history?.items || []).filter((item) => item.status === "approved").length,
    rejected: (history?.items || []).filter((item) => item.status === "rejected").length,
  }), [pending, history]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Timesheet Approvals</h1>
      <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <input type="month" value={`${filters.year}-${String(filters.month).padStart(2, "0")}`} onChange={(e) => { const [year, month] = e.target.value.split("-"); setFilters({ ...filters, year, month }); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"><Search size={16} /><input placeholder="Clinician search" className="outline-none" onChange={(e) => setFilters({ ...filters, clinician_id: e.target.value })} /></label>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Submitted</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="draft">Draft</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4"><p className="text-xs uppercase text-slate-500">Total Pending</p><p className="text-2xl font-bold">{stats.pending}</p></div>
        <div className="rounded-lg border bg-white p-4"><p className="text-xs uppercase text-slate-500">Approved This Month</p><p className="text-2xl font-bold">{stats.approved}</p></div>
        <div className="rounded-lg border bg-white p-4"><p className="text-xs uppercase text-slate-500">Rejected This Month</p><p className="text-2xl font-bold">{stats.rejected}</p></div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Clinician</th><th className="px-4 py-3">Surgery / PCN</th><th className="px-4 py-3">Month Year</th><th className="px-4 py-3">Total Hours</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center">Loading...</td></tr>}
            {rows.map((sheet) => (
              <tr key={sheet.id}>
                <td className="px-4 py-3 font-semibold">{sheet.clinician_name || sheet.clinicians?.full_name || "Clinician"} <Badge color="blue">{sheet.role || sheet.clinicians?.clinician_type || "IP"}</Badge></td>
                <td className="px-4 py-3">{(sheet.surgery_names || []).join(", ") || "-"}</td>
                <td className="px-4 py-3">{sheet.month}/{sheet.year}</td>
                <td className="px-4 py-3">{Number(sheet.total_hours || 0).toFixed(2)}</td>
                <td className="px-4 py-3">{sheet.submitted_at ? new Date(sheet.submitted_at).toLocaleDateString("en-GB") : "-"}</td>
                <td className="px-4 py-3"><Badge color={sheet.status === "approved" ? "success" : sheet.status === "rejected" ? "danger" : "warning"}>{sheet.status}</Badge></td>
                <td className="px-4 py-3">
                  <Link className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50" to={`/super-admin/rota/timesheets/${sheet.id}`}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No timesheets found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
