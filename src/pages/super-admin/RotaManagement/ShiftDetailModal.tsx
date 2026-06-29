import React, { useEffect, useMemo, useState } from "react";
import { useDeleteRota, useUpdateRota } from "../../../hooks/useRota";
import { useAuth } from "../../../context/AuthContext";
import {
  X,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import ShiftStatusBadge from "../../../components/ui/ShiftStatusBadge";

const STATUS_OPTIONS = [
  { value: "working",      label: "Working",      bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  { value: "annual_leave", label: "Annual Leave", bg: "bg-blue-100",    text: "text-blue-800",    dot: "bg-blue-500"    },
  { value: "sick",         label: "Sick",         bg: "bg-red-100",     text: "text-red-800",     dot: "bg-red-500"     },
  { value: "cppe",         label: "CPPE",         bg: "bg-purple-100",  text: "text-purple-800",  dot: "bg-purple-500"  },
  { value: "cover",        label: "Cover",        bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-500"   },
  { value: "gap",          label: "Gap",          bg: "bg-orange-100",  text: "text-orange-800",  dot: "bg-orange-500"  },
  { value: "cancelled",    label: "Cancelled",    bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400"   },
];

interface Shift {
  id?: string | number;
  status?: string;
  workstreams_notes?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

interface ShiftDetailModalProps {
  open: boolean;
  onClose?: () => void;
  shift: Shift | null;
  readOnly?: boolean;
}

export default function ShiftDetailModal({ open, onClose, shift, readOnly = false }: ShiftDetailModalProps) {
  const update = useUpdateRota();
  const del    = useDeleteRota();
  const { user } = useAuth();
  const effectiveReadOnly = readOnly || user?.role === "clinician";

  const [status,        setStatus]        = useState<string>(String(shift?.status || "working"));
  const [notes,         setNotes]         = useState<string>(String(shift?.workstreams_notes || ""));
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (shift) {
      setStatus(String(shift.status || "working"));
      setNotes(String(shift.workstreams_notes || ""));
      setConfirmDelete(false);
    }
  }, [shift]);

  const title = useMemo(() => {
    if (!shift?.date) return "Shift Details";
    return new Date(String(shift.date)).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }, [shift]);

  if (!open || !shift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-1.5"><ShiftStatusBadge status={status} /></div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{String(shift.id ?? "")}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-4 space-y-4">
          {/* Time row */}
          {(shift.start_time || shift.end_time) && (
            <div className="grid grid-cols-2 gap-3">
              {shift.start_time && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                    <Clock size={10} /> Start
                  </div>
                  <p className="text-sm font-bold text-slate-800">{String(shift.start_time)}</p>
                </div>
              )}
              {shift.end_time && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                    <Clock size={10} /> End
                  </div>
                  <p className="text-sm font-bold text-slate-800">{String(shift.end_time)}</p>
                </div>
              )}
            </div>
          )}

          {/* Status selector */}
          {!effectiveReadOnly && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={[
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-all hover:shadow-sm active:scale-95",
                      status === opt.value
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dot}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
            {effectiveReadOnly ? (
              <div className="min-h-[72px] rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-sm text-slate-600">
                {notes || <span className="text-slate-400 italic">No notes</span>}
              </div>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900
                  placeholder-slate-400 resize-none transition-all
                  focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Workstream notes…"
              />
            )}
          </div>

          {/* Error */}
          {(update.isError || del.isError) && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              {String(update.error?.message ?? del.error?.message ?? "Action failed")}
            </div>
          )}

          {/* Delete confirm */}
          {confirmDelete && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold text-red-800 mb-2.5">Delete this shift permanently?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { del.mutate(shift.id as string | number); onClose?.(); }}
                  disabled={del.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-all"
                >
                  {del.isPending ? <><Loader2 size={12} className="animate-spin" /> Deleting…</> : "Yes, delete"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            {!effectiveReadOnly && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
              >
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              Close
            </button>
            {!effectiveReadOnly && (
              <button
                type="button"
                onClick={() => update.mutate({ id: shift.id as string | number, data: { status, workstreams_notes: notes } })}
                disabled={update.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 hover:shadow-md transition-all active:scale-95 disabled:opacity-60"
              >
                {update.isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : <><Save size={14} /> Save changes</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
