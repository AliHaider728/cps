import { useMemo, useState } from "react";
import { useCreateRota } from "../../../hooks/useRota";

export default function AddShiftModal({ open, onClose, clinicianId, date }) {
  const create = useCreateRota();
  const [practiceId, setPracticeId] = useState("");
  const [status, setStatus] = useState("working");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [notes, setNotes] = useState("");
  const title = useMemo(() => `Add shift - ${String(date || "").slice(0, 10)}`, [date]);
  if (!open || !date) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose} type="button">Close</button>
        </div>
        <div className="p-4 space-y-3">
          <input value={practiceId} onChange={(e) => setPracticeId(e.target.value)} className="h-10 w-full px-3 rounded-md border border-slate-200 bg-white text-sm" placeholder="Practice ID" />
          <div className="grid grid-cols-2 gap-3">
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-10 w-full px-3 rounded-md border border-slate-200 bg-white text-sm" />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-10 w-full px-3 rounded-md border border-slate-200 bg-white text-sm" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-full px-3 rounded-md border border-slate-200 bg-white text-sm">
            {["working", "annual_leave", "sick", "cppe", "gap", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[90px] w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm" />
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-md border border-slate-200 text-slate-700 text-sm">Cancel</button>
          <button type="button" onClick={() => create.mutate({ clinician_id: clinicianId || null, practice_id: practiceId, date, start_time: startTime, end_time: endTime, status, workstreams_notes: notes })} disabled={create.isPending || !practiceId} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">{create.isPending ? "Saving..." : "Create"}</button>
        </div>
      </div>
    </div>
  );
}
