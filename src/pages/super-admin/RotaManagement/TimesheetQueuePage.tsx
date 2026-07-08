import React, { useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DebouncedSearchInput } from "../../../components/shared/DebouncedSearchInput";
import { usePendingTimesheets, useTimesheetHistory } from "../../../hooks/useTimesheet";
import { useAdminManualTimesheets, useBulkReviewManualTimesheets } from "../../../hooks/useEnterMyHours";
import { useClinicians } from "../../../hooks/useClinicians";
import { toast } from "sonner";

interface Filters {
  month: number;
  year: number;
  status: string;
  clinician_id?: string;
  [key: string]: string | number | undefined;
}

interface Clinician {
  id?: string;
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

interface AggregatedManualTimesheet {
  id: string;
  clinician_id: string;
  clinician_name: string;
  role: string;
  month: number;
  year: number;
  total_hours: number;
  surgery_names: string[];
  submitted_at: string;
  status: string;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function TimesheetQueuePage() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<"rota" | "manual">("rota");
  const [filters, setFilters] = useState<Filters>({
    month:  now.getMonth() + 1,
    year:   now.getFullYear(),
    status: "",
  });

  // Rota queries
  const { data: pending = [], isLoading: rotaPendingLoading } = usePendingTimesheets();
  const { data: history, isLoading: rotaHistoryLoading }      = useTimesheetHistory(filters);

  // Manual queries
  const { data: manualEntries = [], isLoading: manualLoading } = useAdminManualTimesheets();
  const { data: cliniciansData } = useClinicians();
  const bulkReviewM = useBulkReviewManualTimesheets();

  // Aggregate manual entries
  const manualRows = useMemo(() => {
    if (!manualEntries || manualEntries.length === 0) return [];
    
    // clinicianService.getAll() typically returns { clinicians: [...] } or { data: [...] }
    const clinicians = (cliniciansData as any)?.clinicians ?? (cliniciansData as any)?.data ?? cliniciansData ?? [];
    const groups: Record<string, AggregatedManualTimesheet> = {};

    for (const entry of manualEntries) {
      // Apply filters early if possible (month/year)
      if (filters.month && Number(entry.month) !== filters.month) continue;
      if (filters.year && Number(entry.year) !== filters.year) continue;

      const key = `${entry.clinician}_${entry.month}_${entry.year}`;
      if (!groups[key]) {
        const clinician = clinicians.find((c: any) => (c._id || c.id) === entry.clinician);
        groups[key] = {
          id: key,
          clinician_id: entry.clinician,
          clinician_name: clinician?.full_name || "Unknown Clinician",
          role: clinician?.clinician_type || "",
          month: Number(entry.month),
          year: Number(entry.year),
          total_hours: 0,
          surgery_names: [],
          submitted_at: entry.updatedAt || "",
          status: "approved", // Will be overridden
        };
      }
      
      const group = groups[key];
      group.total_hours += Number(entry.totalWorkedHours || 0);
      if (entry.practiceName && !group.surgery_names.includes(entry.practiceName)) {
        group.surgery_names.push(entry.practiceName);
      }

      // Rollup logic: pending overrides everything
      if (entry.managerApprovalStatus === "pending") {
        group.status = "pending";
      } else if (entry.managerApprovalStatus === "rejected" && group.status !== "pending") {
        group.status = "rejected";
      }
    }

    let result = Object.values(groups);
    if (filters.status) {
      const matchStatus = filters.status === "draft" ? "pending" : filters.status; // manual uses 'pending' instead of 'draft/submitted'
      result = result.filter(r => r.status === matchStatus || (filters.status === "submitted" && r.status === "pending"));
    }
    if (filters.clinician_id) {
      const q = String(filters.clinician_id).toLowerCase();
      result = result.filter(r => r.clinician_name.toLowerCase().includes(q));
    }
    return result;
  }, [manualEntries, cliniciansData, filters]);

  // Rota data aggregation
  const historyItems: Timesheet[] = (Array.isArray(history) ? history : (history as any)?.items || []) as Timesheet[];
  let rotaRows: Timesheet[] = filters.status ? historyItems : (pending as Timesheet[]);
  if (filters.clinician_id && !filters.status) {
    const q = String(filters.clinician_id).toLowerCase();
    rotaRows = rotaRows.filter((r) => String(r.clinician_name || r.clinicians?.full_name).toLowerCase().includes(q));
  }

  // Current view stats
  const stats = useMemo(() => {
    if (activeTab === "rota") {
      return {
        pending:  pending.length,
        approved: historyItems.filter((i: Timesheet) => i.status === "approved").length,
        rejected: historyItems.filter((i: Timesheet) => i.status === "rejected").length,
      };
    } else {
      // Manual stats across ALL months? The existing queue page calculates based on current fetched data.
      // We will calculate stats based on `manualRows` or all `manualEntries`.
      // To match exactly, we should use the aggregated groups before filtering by status.
      return {
        pending:  manualRows.filter(r => r.status === "pending").length,
        approved: manualRows.filter(r => r.status === "approved").length,
        rejected: manualRows.filter(r => r.status === "rejected").length,
      };
    }
  }, [activeTab, pending, historyItems, manualRows]);

  const isLoading = activeTab === "rota" ? (rotaPendingLoading || rotaHistoryLoading) : manualLoading;
  const displayRows = activeTab === "rota" ? rotaRows : manualRows;

  const handleBulkReview = async (sheet: AggregatedManualTimesheet, action: "approve" | "reject") => {
    try {
      await bulkReviewM.mutateAsync({
        clinicianId: sheet.clinician_id,
        month: sheet.month,
        year: sheet.year,
        action,
        reason: action === "reject" ? "Rejected by admin" : ""
      });
      toast.success(`Timesheet ${action}d successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} timesheet`);
    }
  };

  return (
    <div className="space-y-5 pb-10">

      {/* Header & Tabs */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Timesheet Approvals</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve clinician timesheets.</p>
        
        <div className="mt-6 flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("rota")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "rota" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Rota Timesheets
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "manual" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Manual Timesheets
          </button>
        </div>
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
          <option value="">Submitted / Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          {activeTab === "rota" && <option value="draft">Draft</option>}
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
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">Loading...</td></tr>
            )}
            {!isLoading && displayRows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm italic">No timesheets found.</td></tr>
            )}
            {activeTab === "rota" ? (displayRows as Timesheet[]).map((sheet) => (
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
            )) : (displayRows as AggregatedManualTimesheet[]).map((sheet) => (
              <tr key={sheet.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">
                    {sheet.clinician_name}
                  </div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {sheet.role || "IP"}
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
                    {sheet.status === "pending" ? "submitted" : sheet.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {sheet.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={bulkReviewM.isPending}
                        onClick={() => handleBulkReview(sheet, "approve")}
                        className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={bulkReviewM.isPending}
                        onClick={() => handleBulkReview(sheet, "reject")}
                        className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
