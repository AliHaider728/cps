import { useMemo, useState } from "react";
import { useRotaList } from "../../../hooks/useRota";
import ShiftDetailModal from "./ShiftDetailModal";
import AddShiftModal from "./AddShiftModal";

const startOfWeekMondayUTC = (date) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  return d;
};

export default function WeeklyView({ month, year }) {
  const { data, isLoading, isError, error } = useRotaList({ month, year });
  const [anchor, setAnchor] = useState(new Date(Date.UTC(year, month - 1, new Date().getDate())));
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailShift, setDetailShift] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState(null);
  const [addClinicianId, setAddClinicianId] = useState(null);
  const weekStart = useMemo(() => startOfWeekMondayUTC(anchor), [anchor]);
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => new Date(weekStart.getTime() + i * 86400000)), [weekStart]);
  const clinicians = data?.data?.clinicians || data?.clinicians || [];

  if (isLoading) return <div className="text-sm text-slate-500">Loading...</div>;
  if (isError) return <div className="text-sm text-red-700">{String(error?.message || "Failed")}</div>;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="p-3 border-b border-slate-100 flex justify-between">
        <div className="text-sm font-semibold text-slate-900">Weekly View</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAnchor(new Date(anchor.getTime() - 7 * 86400000))} className="px-3 py-1.5 rounded-md border border-slate-200 text-sm">Prev</button>
          <button type="button" onClick={() => setAnchor(new Date(anchor.getTime() + 7 * 86400000))} className="px-3 py-1.5 rounded-md border border-slate-200 text-sm">Next</button>
        </div>
      </div>
      <table className="min-w-full text-xs">
        <thead><tr><th className="text-left px-3 py-2 border-b border-slate-200">Clinician</th>{days.map((d) => <th key={d.toISOString()} className="text-center px-2 py-2 border-b border-slate-200">{d.toISOString().slice(0, 10)}</th>)}</tr></thead>
        <tbody>
          {clinicians.map((row) => {
            const clinician = row?.clinician || {};
            const clinicianId = String(clinician?._id || clinician?.id || "");
            const shifts = row?.shifts || {};
            return (
              <tr key={clinicianId} className="odd:bg-white even:bg-slate-50/30">
                <td className="px-3 py-2 border-b border-slate-100">{clinician.fullName || clinician.name || clinicianId}</td>
                {days.map((d) => {
                  const iso = d.toISOString().slice(0, 10);
                  const shift = shifts?.[iso] || null;
                  return (
                    <td key={iso} className="px-1.5 py-1 border-b border-slate-100">
                      <button type="button" onClick={() => (shift ? (setDetailShift(shift), setDetailOpen(true)) : (setAddClinicianId(clinicianId), setAddDate(iso), setAddOpen(true)))} className="w-full h-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50">
                        {shift ? String(shift.status || "").slice(0, 2).toUpperCase() : "+"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <ShiftDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} shift={detailShift} />
      <AddShiftModal open={addOpen} onClose={() => setAddOpen(false)} clinicianId={addClinicianId} date={addDate} />
    </div>
  );
}
