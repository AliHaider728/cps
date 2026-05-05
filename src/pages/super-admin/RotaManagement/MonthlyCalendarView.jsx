import { useMemo, useState } from "react";
import { useRotaList } from "../../../hooks/useRota";
import ShiftDetailModal from "./ShiftDetailModal";
import AddShiftModal from "./AddShiftModal";

const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

export default function MonthlyCalendarView({ month, year }) {
  const { data, isLoading, isError, error } = useRotaList({ month, year });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailShift, setDetailShift] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState(null);
  const [addClinicianId, setAddClinicianId] = useState(null);
  const dayCount = useMemo(() => daysInMonth(month, year), [month, year]);
  const days = useMemo(() => Array.from({ length: dayCount }).map((_, i) => i + 1), [dayCount]);
  const clinicians = data?.data?.clinicians || data?.clinicians || [];

  if (isLoading) return <div className="text-sm text-slate-500">Loading rota...</div>;
  if (isError) return <div className="text-sm text-red-700">{String(error?.message || "Failed to load")}</div>;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr>
              <th className="text-left px-3 py-2 border-b border-slate-200">Clinician</th>
              {days.map((d) => <th key={d} className="text-center px-2 py-2 border-b border-slate-200">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {clinicians.map((row) => {
              const clinician = row?.clinician || {};
              const clinicianId = String(clinician?._id || clinician?.id || "");
              const shifts = row?.shifts || {};
              return (
                <tr key={clinicianId} className="odd:bg-white even:bg-slate-50/30">
                  <td className="px-3 py-2 border-b border-slate-100">{clinician.fullName || clinician.name || clinicianId}</td>
                  {days.map((d) => {
                    const iso = new Date(Date.UTC(year, month - 1, d)).toISOString().slice(0, 10);
                    const shift = shifts?.[iso] || null;
                    return (
                      <td key={iso} className="px-1.5 py-1 border-b border-slate-100">
                        <button type="button" onClick={() => (shift ? (setDetailShift(shift), setDetailOpen(true)) : (setAddClinicianId(clinicianId), setAddDate(iso), setAddOpen(true)))} className="w-full h-8 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
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
      </div>
      <ShiftDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} shift={detailShift} />
      <AddShiftModal open={addOpen} onClose={() => setAddOpen(false)} clinicianId={addClinicianId} date={addDate} />
    </div>
  );
}
