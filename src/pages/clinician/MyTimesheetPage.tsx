import React, { useMemo, useState } from "react";
import { RefreshCw, Calendar, Clock, MapPin, CalendarDays } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { useMyTimesheet, useMyRota } from "../../hooks/useRota";
import { usePractices } from "../../hooks/usePractice";
import { buildPracticeNameMap, resolvePracticeName, isWorkingShift } from "../../lib/practiceNames";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const statusColor: Record<string, string> = {
  draft:     "draft",
  submitted: "submitted",
  approved:  "approved",
  rejected:  "rejected",
};

function fmtDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function fmtTime(t: any) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

export default function MyTimesheetPage() {
  const today = new Date();
  type FilterType = "all" | "thisMonth" | "specificMonth" | "specificDay";
  const [filterType, setFilterType] = useState<FilterType>("all");
  
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(today.getFullYear());
  const [filterDate, setFilterDate] = useState<string>(today.toISOString().slice(0, 10));

  // Fetch all shifts
  const rotaQuery = useMyRota(null, null);
  const timesheetAllQuery = useMyTimesheet(null, null);
  const { data: practicesData } = usePractices();

  const practiceMap = useMemo(
    () => buildPracticeNameMap(practicesData),
    [practicesData]
  );

  const isLoading = rotaQuery.isLoading || timesheetAllQuery.isLoading;

  const allShifts = useMemo(() => {
    const raw = rotaQuery.data?.shifts ?? timesheetAllQuery.data?.shifts ?? rotaQuery.data?.rota ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [rotaQuery.data, timesheetAllQuery.data]);

  const filteredShifts = useMemo(() => {
    let list = allShifts.filter(isWorkingShift);

    if (filterType === "thisMonth") {
      const tm = today.getMonth() + 1;
      const ty = today.getFullYear();
      list = list.filter((s: any) => {
        const d = String(s.shift_date || s.date || "").slice(0, 10);
        if (!d) return false;
        const [y, m] = d.split("-").map(Number);
        return m === tm && y === ty;
      });
    } else if (filterType === "specificMonth") {
      list = list.filter((s: any) => {
        const d = String(s.shift_date || s.date || "").slice(0, 10);
        if (!d) return false;
        const [y, m] = d.split("-").map(Number);
        return m === filterMonth && y === filterYear;
      });
    } else if (filterType === "specificDay") {
      list = list.filter((s: any) => {
        const d = String(s.shift_date || s.date || "").slice(0, 10);
        return d === filterDate;
      });
    }

    // Sort date descending
    return list.sort((a: any, b: any) => {
      const dA = String(a.shift_date || a.date || "");
      const dB = String(b.shift_date || b.date || "");
      return dB.localeCompare(dA);
    });
  }, [allShifts, filterType, filterMonth, filterYear, filterDate]);

  const rows = useMemo(() => {
    return filteredShifts.map((shift: any) => {
      const dateStr = String(shift.shift_date || shift.date || "").slice(0, 10);
      return {
        id: shift.id,
        shift_date: dateStr,
        surgery_name: resolvePracticeName(shift, practiceMap),
        expected_hours: Number(shift.expected_hours ?? shift.hours ?? shift.total_hours ?? 0),
        start_time: shift.start_time || "",
        end_time: shift.end_time || "",
        hourly_rate: shift.hourly_rate,
        clinical_system: shift.clinical_system || shift.service_code,
      };
    });
  }, [filteredShifts, practiceMap]);

  const timesheetHistory = useMemo(() => {
    const list = timesheetAllQuery.data?.timesheets;
    return Array.isArray(list) ? list : [];
  }, [timesheetAllQuery.data]);

  return (
    <div className="space-y-5 pb-10 max-w-full mx-auto px-1 overflow-x-hidden animate-fade-up">

      {/* Header & Filter Pill Control */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            My Timesheet
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assigned hours view only. Use <strong>Log My Hours</strong> to submit actual worked time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterType === "all" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setFilterType("thisMonth")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterType === "thisMonth" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setFilterType("specificMonth")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterType === "specificMonth" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Specific Month
            </button>
            <button
              type="button"
              onClick={() => setFilterType("specificDay")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterType === "specificDay" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Specific Day
            </button>
          </div>

          <button
            onClick={() => {
              rotaQuery.refetch();
              timesheetAllQuery.refetch();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Dynamic Sub-filters based on selection */}
      {(filterType === "specificMonth" || filterType === "specificDay") && (
        <div className="card p-4 flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm animate-scale-in">
          {filterType === "specificMonth" && (
            <>
              <div>
                <label className="field-label">Month</label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(Number(e.target.value))}
                  className="input w-36"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Year</label>
                <input
                  type="number" min="2020" max="2100"
                  className="input w-28"
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {filterType === "specificDay" && (
            <div>
              <label className="field-label">Date</label>
              <input
                type="date"
                className="input w-40"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Monthly submission history (Always visible) */}
      {timesheetHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 text-sm font-bold text-slate-700">
            Monthly submission history
          </div>
          <div className="divide-y divide-slate-100">
            {timesheetHistory.map((ts: any) => (
              <button
                key={ts.id}
                type="button"
                onClick={() => {
                  setFilterType("specificMonth");
                  setFilterMonth(ts.month);
                  setFilterYear(ts.year);
                }}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-800">
                  {MONTHS[ts.month - 1]} {ts.year}
                </span>
                <Badge color={statusColor[ts.status] || "draft"}>
                  {ts.status === "submitted" ? "Under review" : ts.status}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shifts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="table-header bg-gray-50 border-b border-gray-200">
              <tr>
                {["Date", "Practice", "Expected", "Scheduled", "Rate", "System"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">
                    <RefreshCw size={18} className="spin-arc inline-block text-blue-500 mr-2" />
                    Loading shifts...
                  </td>
                </tr>
              )}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm">
                        <CalendarDays size={26} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-slate-700 mb-1">
                          No shifts found
                        </p>
                        <p className="text-sm text-slate-500">
                          Try adjusting your filters above
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && rows.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/40">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                    {fmtDate(entry.shift_date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-800 truncate max-w-[220px]">
                    {entry.surgery_name}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                    {Number(entry.expected_hours || 0).toFixed(2)}h
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">
                    {entry.start_time && entry.end_time
                      ? `${fmtTime(entry.start_time)} — ${fmtTime(entry.end_time)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {entry.hourly_rate ? `£${entry.hourly_rate}/hr` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {entry.clinical_system || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
