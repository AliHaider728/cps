import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useClinicianRota } from "../../../../hooks/useRota";

const style = {
  working: "bg-emerald-50 text-emerald-800 border-emerald-200",
  annual_leave: "bg-blue-50 text-blue-800 border-blue-200",
  sick: "bg-red-50 text-red-800 border-red-200",
  cppe_training: "bg-purple-50 text-purple-800 border-purple-200",
  cppe: "bg-purple-50 text-purple-800 border-purple-200",
  cover: "bg-yellow-50 text-yellow-800 border-yellow-200",
};

const pad = (value) => String(value).padStart(2, "0");
const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

export default function Rotatab({ clinicianId }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ month: today.getMonth() + 1, year: today.getFullYear() });
  const { data, isLoading } = useClinicianRota(clinicianId, cursor.month, cursor.year);
  const shifts = data?.data?.shifts || data?.shifts || [];
  const byDate = useMemo(() => {
    const map = new Map();
    shifts.forEach((shift) => {
      const key = String(shift.shift_date || shift.date).slice(0, 10);
      map.set(key, [...(map.get(key) || []), shift]);
    });
    return map;
  }, [shifts]);
  const counts = shifts.reduce((acc, shift) => {
    const key = shift.shift_type || shift.status || "working";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const moveMonth = (delta) => {
    setCursor((cur) => {
      const next = new Date(cur.year, cur.month - 1 + delta, 1);
      return { month: next.getMonth() + 1, year: next.getFullYear() };
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Rota</h2>
          <p className="text-sm text-slate-500">View-only clinician rota.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
          <button onClick={() => moveMonth(-1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronLeft size={16} /></button>
          <span className="min-w-40 text-center text-sm font-semibold">{new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>
          <button onClick={() => moveMonth(1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Working</p><p className="text-2xl font-black">{counts.working || 0}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">AL</p><p className="text-2xl font-black">{counts.annual_leave || 0}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Sick</p><p className="text-2xl font-black">{counts.sick || 0}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">CPPE</p><p className="text-2xl font-black">{counts.cppe_training || counts.cppe || 0}</p></div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading rota...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: daysInMonth(cursor.month, cursor.year) }, (_, index) => {
              const key = `${cursor.year}-${pad(cursor.month)}-${pad(index + 1)}`;
              const items = byDate.get(key) || [];
              return (
                <div key={key} className="min-h-28 rounded-lg border border-slate-100 bg-slate-50 p-2">
                  <div className="mb-2 text-xs font-bold text-slate-500">{index + 1}</div>
                  <div className="space-y-1">
                    {items.map((shift) => {
                      const type = shift.shift_type || shift.status;
                      return (
                        <div key={shift.id} className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${style[type] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          <div>{String(type || "shift").replace("_", " ")}</div>
                          <div className="truncate">{shift.surgery_name || shift.practice_name || "Surgery"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
