import { useMemo, useState } from "react";
import { useCreateRota } from "../../../hooks/useRota";

const STATUS_OPTIONS = [
  { value: "working",      label: "Working",       color: "bg-emerald-500" },
  { value: "annual_leave", label: "Annual Leave",  color: "bg-blue-500" },
  { value: "sick",         label: "Sick",          color: "bg-red-500" },
  { value: "cppe",         label: "CPPE",          color: "bg-purple-500" },
  { value: "gap",          label: "Gap",           color: "bg-orange-500" },
  { value: "cancelled",    label: "Cancelled",     color: "bg-slate-400" },
];

export default function AddShiftModal({ open, onClose, clinicianId, date }) {
  const create = useCreateRota();
  const [practiceId, setPracticeId] = useState("");
  const [status, setStatus] = useState("working");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [notes, setNotes] = useState("");

  const title = useMemo(() => {
    if (!date) return "Add Shift";
    return new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }, [date]);

  const handleCreate = () => {
    create.mutate({
      clinician_id: clinicianId || null,
      practice_id: practiceId,
      date,
      start_time: startTime,
      end_time: endTime,
      status,
      workstreams_notes: notes,
    });
  };

  if (!open || !date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900">Add Shift</span>
              </div>
              <p className="text-xs text-slate-500">{title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Practice ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Practice ID</label>
            <input
              value={practiceId}
              onChange={(e) => setPracticeId(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. PR-001"
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:shadow-sm ${
                    status === opt.value
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${opt.color}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              placeholder="Optional notes…"
            />
          </div>

          {create.isError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {String(create.error?.message || "Failed to create shift")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={create.isPending || !practiceId.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {create.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Creating…
              </>
            ) : "Create shift"}
          </button>
        </div>
      </div>
    </div>
  );
}