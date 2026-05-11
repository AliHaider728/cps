/**
 * SuperAdminDashboard.jsx — Super Admin
 *
 * UPDATED: Real data from /api/time-entries/admin/summary
 * Spec: CPS_Clinician_Management_Specification §5.1 Clinician List View
 *
 * Shows:
 *  - Total clinicians, shifts this month, planned vs actual hours, pending leave
 *  - Per-clinician table: name, type, shifts, planned hours, actual hours, clocked-in status
 */

import { Users, CalendarCheck, Clock, AlertTriangle, Timer, TrendingUp } from "lucide-react";
import { useTimeEntryAdminSummary } from "../../hooks/useTimeEntry";

function StatCard({ icon: Icon, label, value, sub, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50 text-blue-700",
    green:  "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red:    "bg-red-50 text-red-600",
    slate:  "bg-slate-50 text-slate-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { data: summary, isLoading, isError } = useTimeEntryAdminSummary();

  const totals    = summary?.totals    || {};
  const clinicians = summary?.clinicians || [];
  const month     = summary?.month     || "";

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{month || "Loading…"}</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Failed to load summary. Check the API connection.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Users}         label="Total Clinicians"     value={totals.clinicians ?? "—"}      sub="All roles"           color="blue"   />
          <StatCard icon={CalendarCheck} label="Shifts This Month"    value={totals.shiftsThisMonth ?? "—"} sub={month}               color="green"  />
          <StatCard icon={Clock}         label="Planned Hours"        value={`${totals.plannedHours ?? 0}h`} sub="scheduled this month" color="slate"  />
          <StatCard icon={TrendingUp}    label="Actual Hours Worked"  value={`${totals.actualHours ?? 0}h`}  sub="clocked this month"  color="blue"   />
          <StatCard icon={Timer}         label="Currently Clocked In" value={totals.currentlyClockedIn ?? 0} sub="right now"           color="green"  />
          <StatCard icon={AlertTriangle} label="Pending Leave"        value={totals.pendingLeave ?? 0}       sub="awaiting approval"   color="yellow" />
        </div>
      )}

      {/* Clinician Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">Clinician Summary — {month}</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : clinicians.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No clinicians found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-medium">Clinician</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Contract</th>
                  <th className="text-right px-4 py-3 font-medium">Shifts</th>
                  <th className="text-right px-4 py-3 font-medium">Planned h</th>
                  <th className="text-right px-4 py-3 font-medium">Actual h</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clinicians.map((c) => (
                  <tr key={c.clinicianId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {c.fullName || <span className="text-gray-400 italic">Unknown</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.clinicianType || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        {c.contractType || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{c.totalShiftsMonth}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{c.plannedHoursMonth}h</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {c.actualHoursMonth}h
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!c.isActive ? (
                        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Inactive</span>
                      ) : c.currentlyClockedIn ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">● On Shift</span>
                      ) : (
                        <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">Off</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
