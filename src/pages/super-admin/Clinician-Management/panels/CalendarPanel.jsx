import { useMemo, useState } from "react";
import { useClinicianLeave } from "../../../../hooks/useClinicianLeave";
import { useClinicianRota } from "../../../../hooks/useRota";
import ShiftDetailModal from "../../../super-admin/RotaManagement/ShiftDetailModal";

const statusBadgeClass = (shift) => {
  const status = String(shift?.status || "");
  if (status === "working") return "bg-green-100 text-green-800";
  if (status === "annual_leave") return "bg-yellow-100 text-yellow-800";
  if (status === "sick") return "bg-red-100 text-red-700";
  if (status === "cppe") return "bg-blue-100 text-blue-800";
  if (status === "cover") return "bg-purple-100 text-purple-800";
  if (status === "gap") return shift?.urgent ? "bg-red-600 text-white" : "bg-orange-100 text-orange-800";
  return "bg-slate-100 text-slate-700";
};

export default function CalendarPanel({ clinicianId, canManage, userRole = "clinician" }) {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState(null);
  const leaveQ = useClinicianLeave(clinicianId);
  const rotaQ = useClinicianRota(clinicianId, month, year);
  const shifts = rotaQ?.data?.data?.shifts || rotaQ?.data?.shifts || [];
  const balances = leaveQ?.data?.balances || [];
  const byContract = { ARRS: { total: 0, used: 0, remaining: 0 }, EA: { total: 0, used: 0, remaining: 0 }, Direct: { total: 0, used: 0, remaining: 0 } };
  balances.forEach((b) => { if (byContract[b.contract]) byContract[b.contract] = b; });
  const readOnly = userRole === "clinician" || !canManage;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <select className="h-9 px-2 rounded-lg border border-slate-200 bg-white text-sm" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>)}
        </select>
        <input className="h-9 w-24 px-2 rounded-lg border border-slate-200 bg-white text-sm" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {["ARRS", "EA", "Direct"].map((contract) => (
          <div key={contract} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-700">{contract} Leave</p>
            <p className="text-xs text-slate-500">Total {byContract[contract].total} | Taken {byContract[contract].used} | Remaining {byContract[contract].remaining}</p>
            <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${byContract[contract].total > 0 ? Math.min((byContract[contract].used / byContract[contract].total) * 100, 100) : 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="text-left px-3 py-2 border-b border-slate-200">Date</th><th className="text-left px-3 py-2 border-b border-slate-200">Status</th><th className="text-left px-3 py-2 border-b border-slate-200">Time</th><th className="text-left px-3 py-2 border-b border-slate-200">Practice</th></tr></thead>
          <tbody>
            {shifts.map((s) => (
              <tr key={s.id} className="odd:bg-white even:bg-slate-50/30 cursor-pointer" onClick={() => setSelected(s)}>
                <td className="px-3 py-2 border-b border-slate-100">{String(s.date || "").slice(0, 10)}</td>
                <td className="px-3 py-2 border-b border-slate-100"><span className={`px-2 py-1 rounded text-xs font-medium ${statusBadgeClass(s)}`}>{s.status === "gap" && s.urgent ? "URGENT GAP" : s.status}</span></td>
                <td className="px-3 py-2 border-b border-slate-100">{s.start_time || ""}{s.end_time ? `-${s.end_time}` : ""}</td>
                <td className="px-3 py-2 border-b border-slate-100">{String(s.practice_name || s.practice_id || "")}</td>
              </tr>
            ))}
            {shifts.length === 0 ? <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={4}>No shifts found.</td></tr> : null}
          </tbody>
        </table>
      </div>

      <ShiftDetailModal open={!!selected} onClose={() => setSelected(null)} shift={selected} readOnly={readOnly} />
    </div>
  );
}