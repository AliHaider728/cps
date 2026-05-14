import { useState } from "react";
import { Clock, Calendar, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useTimeEntries } from "../../hooks/useTimeEntry";

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function MyTimesheetPage() {
  const [page, setPage] = useState(0);
  const limit = 15;
  const { data: entries = [], isLoading } = useTimeEntries({ limit, offset: page * limit });

  const completed = entries.filter((entry) => entry.status === "completed");
  const totalHours = completed.reduce((sum, entry) => sum + Number(entry.actual_hours || 0), 0).toFixed(1);
  const totalShifts = completed.length;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Timesheet</h1>
        <p className="text-slate-500 mt-1">Your logged shift history and hours summary.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Clock size={20} /></div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Hours</p>
          </div>
          <h3 className="text-4xl font-black text-slate-900">{totalHours}<span className="text-base font-medium text-slate-400 ml-1">hrs</span></h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Calendar size={20} /></div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Shifts</p>
          </div>
          <h3 className="text-4xl font-black text-slate-900">{totalShifts}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><TrendingUp size={20} /></div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg per Shift</p>
          </div>
          <h3 className="text-4xl font-black text-slate-900">
            {totalShifts ? (Number(totalHours) / totalShifts).toFixed(1) : "0.0"}
            <span className="text-base font-medium text-slate-400 ml-1">hrs</span>
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Shift Log</h2>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm italic">No shifts recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase text-slate-400 tracking-wider bg-slate-50">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Clock In</th>
                  <th className="px-6 py-3 text-left">Clock Out</th>
                  <th className="px-6 py-3 text-right">Hours</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{formatDate(entry.clock_in)}</td>
                    <td className="px-6 py-4 text-slate-600">{formatTime(entry.clock_in)}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {entry.clock_out ? formatTime(entry.clock_out) : <span className="text-emerald-500 font-semibold">Active</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {entry.status === "active" ? "-" : `${Number(entry.actual_hours || 0).toFixed(1)}h`}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        entry.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">Showing {page * limit + 1}-{page * limit + entries.length}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
              type="button"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={entries.length < limit}
              onClick={() => setPage((current) => current + 1)}
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
