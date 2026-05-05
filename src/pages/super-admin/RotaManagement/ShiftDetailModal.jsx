import { useMemo, useState } from "react";
import { useDeleteRota, useUpdateRota } from "../../../hooks/useRota";
import { useAuth } from "../../../context/AuthContext";

export default function ShiftDetailModal({ open, onClose, shift, readOnly = false }) {
  const update = useUpdateRota();
  const del = useDeleteRota();
  const { user } = useAuth();
  const effectiveReadOnly = readOnly || user?.role === "clinician";
  const [status, setStatus] = useState(shift?.status || "working");
  const [notes, setNotes] = useState(shift?.workstreams_notes || "");
  const title = useMemo(() => `Shift - ${String(shift?.date || "").slice(0, 10)}`, [shift]);
  if (!open || !shift) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between">
          <div><div className="text-sm font-semibold text-slate-900">{title}</div><div className="text-xs text-slate-500">ID: {shift.id}</div></div>
          <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose} type="button">Close</button>
        </div>
        <div className="p-4 space-y-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={effectiveReadOnly} className="h-10 w-full px-3 rounded-md border border-slate-200 bg-white text-sm">
            {["working", "annual_leave", "sick", "cppe", "cover", "gap", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={effectiveReadOnly} className="min-h-[90px] w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm" />
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          {!effectiveReadOnly ? <button type="button" onClick={() => del.mutate(shift.id)} disabled={del.isPending} className="px-3 py-2 rounded-md border border-red-200 text-red-700 text-sm">{del.isPending ? "Deleting..." : "Delete"}</button> : null}
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-md border border-slate-200 text-slate-700 text-sm">Close</button>
          {!effectiveReadOnly ? <button type="button" onClick={() => update.mutate({ id: shift.id, data: { status, workstreams_notes: notes } })} disabled={update.isPending} className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm">{update.isPending ? "Saving..." : "Save"}</button> : null}
        </div>
      </div>
    </div>
  );
}
