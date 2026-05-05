import { useMemo, useState } from "react";
import { useClinicianRota } from "../../../../hooks/useRota";
import ShiftDetailModal from "../../../super-admin/RotaManagement/ShiftDetailModal";

export default function RotaTab({ staffData = {}, userRole = "" }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState(null);
  const clinicianId = staffData?._id || staffData?.id;
  const rotaQ = useClinicianRota(clinicianId, month, year);
  const shifts = rotaQ?.data?.data?.shifts || rotaQ?.data?.shifts || [];
  const totalHours = useMemo(() => shifts.reduce((sum, s) => sum + (Number(s.hours) || 0), 0), [shifts]);
  const readOnly = userRole === "clinician";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select className="h-9 px-2 rounded-md border border-slate-200" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>)}
        </select>
        <input className="h-9 w-24 px-2 rounded-md border border-slate-200" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-800">Total working hours this month: {totalHours}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="text-left px-3 py-2 border-b border-slate-200">Date</th><th className="text-left px-3 py-2 border-b border-slate-200">Status</th><th className="text-left px-3 py-2 border-b border-slate-200">Surgery</th><th className="text-left px-3 py-2 border-b border-slate-200">Hours</th></tr></thead>
          <tbody>
            {shifts.map((s) => (
              <tr key={s.id} className="odd:bg-white even:bg-slate-50/30 cursor-pointer" onClick={() => setSelected(s)}>
                <td className="px-3 py-2 border-b border-slate-100">{String(s.date || "").slice(0, 10)}</td>
                <td className="px-3 py-2 border-b border-slate-100">{s.status}</td>
                <td className="px-3 py-2 border-b border-slate-100">{s.practice_name || s.practice_id || "-"}</td>
                <td className="px-3 py-2 border-b border-slate-100">{s.hours ?? "-"}</td>
              </tr>
            ))}
            {shifts.length === 0 ? <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={4}>No rota entries found.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <ShiftDetailModal open={!!selected} onClose={() => setSelected(null)} shift={selected} readOnly={readOnly} />
    </div>
  );
}