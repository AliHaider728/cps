// src/pages/super-admin/client-managemnet/ContactHistoryPanel.jsx
import { useState } from "react";
import {
  MessageSquare, Phone, Mail, Users, FileText, AlertTriangle,
  HardDrive, Star, Plus, Search, Trash2, Edit2, X, Check, Clock,
  Wifi, CalendarCheck, Target
} from "lucide-react";
import {
  useHistory,
  useAddHistory,
  useUpdateHistory,
  useToggleStar,
  useDeleteHistory,
} from "../../../hooks/useHistory";

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════════ */
const TYPE_META = {
  call:          { icon: Phone,         color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  label: "Call"          },
  email:         { icon: Mail,          color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   label: "Email"         },
  meeting:       { icon: Users,         color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", label: "Meeting"       },
  note:          { icon: FileText,      color: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200",  label: "Note"          },
  complaint:     { icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    label: "Complaint"     },
  document:      { icon: HardDrive,     color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  label: "Document"      },
  system_access: { icon: Wifi,          color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-200",   label: "System Access" },
};

/* ══════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════ */
/**
 * Normalize entityType to match backend expectations.
 * Backend normalizeEntityType() expects exactly: "PCN" | "Practice" | "Federation" | "ICB"
 */
const normalizeEntityType = (raw = "") => {
  const s = String(raw).trim().toLowerCase();
  if (s === "pcn")        return "PCN";
  if (s === "practice")   return "Practice";
  if (s === "federation") return "Federation";
  if (s === "icb")        return "ICB";
  return raw; // already correct
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";

const fmtTime = (d, t) =>
  t || (d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "");

/**
 * Build a clean initial form state.
 * When `existing` is provided → edit mode (prefill values).
 * When null/undefined         → add mode (use defaults).
 *
 * FIX: The old code relied on `useState` being called once at mount.
 * If the modal was reused without unmounting, state was stale.
 * We now always derive from `existing` at construction time correctly.
 */
const buildFormState = (existing = null) => ({
  type:         existing?.type         ?? "call",
  subject:      existing?.subject      ?? "",
  notes:        existing?.notes        ?? existing?.detail ?? "",   // alias fix
  date:         existing?.date
                  ? new Date(existing.date).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
  time:         existing?.time         ?? new Date().toTimeString().slice(0, 5),
  outcome:      existing?.outcome      ?? "",
  followUpDate: existing?.followUpDate
                  ? new Date(existing.followUpDate).toISOString().split("T")[0]
                  : "",
  followUpNote: existing?.followUpNote ?? "",
});

/* ══════════════════════════════════════════════════════════════════
   LOG MODAL
   FIX: Modal now correctly distinguishes edit vs add mode.
   - `existing` prop drives the title and button label.
   - Form is initialised fresh every time via `buildFormState`.
   - Modal is ALWAYS unmounted on close (key prop in parent forces
     React to create a new instance each time it opens).
══════════════════════════════════════════════════════════════════ */
const LogModal = ({ onClose, onSave, existing }) => {
  const isEditMode = !!existing;
  const [form,   setForm]   = useState(() => buildFormState(existing));
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handle = async () => {
    setErr("");
    if (!form.subject.trim()) { setErr("Subject is required."); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-base font-bold text-slate-800">
            {/* FIX: title driven by isEditMode, not by stale state */}
            {isEditMode ? "Edit Log" : "Add Contact Log"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:thin]">

          {/* Type picker */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_META).map(([k, v]) => {
                const Icon = v.icon;
                return (
                  <button
                    key={k}
                    onClick={() => set("type", k)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all
                      ${form.type === k
                        ? `${v.bg} ${v.border} ${v.color}`
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                  >
                    <Icon size={16} />{v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Subject *</label>
            <input
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Brief description…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Detailed notes…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Target size={11} /> Outcome
            </label>
            <input
              value={form.outcome}
              onChange={(e) => set("outcome", e.target.value)}
              placeholder="What was the result of this contact?"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Follow-up */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Follow-up Date</label>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => set("followUpDate", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Follow-up Note</label>
              <input
                value={form.followUpNote}
                onChange={(e) => set("followUpNote", e.target.value)}
                placeholder="Action needed…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Error */}
          {err && (
            <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {err}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={saving || !form.subject.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Check size={15} />}
            {/* FIX: button label driven by isEditMode */}
            {isEditMode ? "Save Changes" : "Add Log"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function ContactHistoryPanel({ entityType, entityId }) {
  const [filterType, setFilterType] = useState("all");
  const [starred,    setStarred]    = useState(false);
  const [search,     setSearch]     = useState("");

  /**
   * FIX (edit vs add bug): Use TWO separate states instead of relying on
   * `editing !== null` as the show trigger.
   *
   * Problem: old code did `setEditing(log); setShowModal(true)` for edit,
   * but React batches state updates — so when the modal mounted, `editing`
   * might still be null, showing "Add" mode instead of "Edit".
   *
   * Solution:
   *   - `modalMode`: "add" | "edit" — explicitly tracks intent
   *   - `editingLog`: the log being edited (null for add)
   *   - Modal is keyed by `modalKey` so React always creates a FRESH
   *     instance (resets useState inside LogModal) every time it opens.
   */
  const [modalMode,  setModalMode]  = useState(null);   // null | "add" | "edit"
  const [editingLog, setEditingLog] = useState(null);
  const [modalKey,   setModalKey]   = useState(0);      // increment to force remount

  const apiEntityType = normalizeEntityType(entityType);

  const params = {};
  if (filterType !== "all") params.type    = filterType;
  if (starred)              params.starred = "true";

  const { data, isLoading, isError, error } = useHistory(apiEntityType, entityId, params);
  const logs = data?.logs ?? [];

  const addHistory    = useAddHistory(apiEntityType, entityId);
  const updateHistory = useUpdateHistory(apiEntityType, entityId);
  const toggleStar    = useToggleStar(apiEntityType, entityId);
  const deleteHistory = useDeleteHistory(apiEntityType, entityId);

  /* ── Open handlers ── */
  const openAdd = () => {
    setEditingLog(null);
    setModalMode("add");
    setModalKey((k) => k + 1);
  };

  const openEdit = (log) => {
    setEditingLog(log);
    setModalMode("edit");
    setModalKey((k) => k + 1);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingLog(null);
  };

  /* ── Save handler ── */
  const handleSave = async (form) => {
    if (modalMode === "edit" && editingLog) {
      await updateHistory.mutateAsync({ logId: editingLog._id, data: form });
    } else {
      await addHistory.mutateAsync(form);
    }
  };

  /* ── Delete handler ── */
  const handleDelete = (logId) => {
    if (!window.confirm("Delete this log entry?")) return;
    deleteHistory.mutate(logId);
  };

  /* ── Client-side search filter ── */
  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.subject?.toLowerCase().includes(q) ||
      l.notes?.toLowerCase().includes(q)   ||
      l.outcome?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <MessageSquare size={20} className="text-blue-600 shrink-0" />
          <h3 className="text-base font-bold text-slate-800">Contact History</h3>
          <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs…"
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all w-44"
            />
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-600 px-3 py-2 focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="all">All Types</option>
            {Object.entries(TYPE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Starred toggle */}
          <button
            onClick={() => setStarred((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-all
              ${starred
                ? "bg-amber-50 border-amber-300 text-amber-600"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"}`}
          >
            <Star size={13} fill={starred ? "currentColor" : "none"} /> Starred
          </button>

          {/* Add Log */}
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            <Plus size={14} /> Add Log
          </button>
        </div>
      </div>

      {/* ── Log list ── */}
      <div className="divide-y divide-slate-100 max-h-[650px] overflow-y-auto [scrollbar-width:thin]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading history…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-2">
            <AlertTriangle size={28} className="opacity-50" />
            <p className="text-sm font-semibold">Failed to load</p>
            <p className="text-xs text-slate-400">
              {error?.response?.data?.message || error?.message || "Server error — check entity type and ID"}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <MessageSquare size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">
              {logs.length === 0 ? "No contact history yet" : "No logs match your search"}
            </p>
            {logs.length === 0 && (
              <button
                onClick={openAdd}
                className="mt-3 text-blue-600 text-xs font-bold hover:underline"
              >
                Add the first log
              </button>
            )}
          </div>
        ) : (
          filtered.map((log) => {
            const meta = TYPE_META[log.type] ?? TYPE_META.note;
            const Icon = meta.icon;
            const followUpOverdue = log.followUpDate && new Date(log.followUpDate) < new Date();

            return (
              <div
                key={log._id ?? log.id}
                className="px-6 py-5 hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                          {log.starred && (
                            <Star size={13} className="text-amber-500 fill-amber-500" />
                          )}
                          {log.isMassEmail && (
                            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded-md border border-blue-200">
                              Mass Email
                            </span>
                          )}
                        </div>

                        {/* Subject */}
                        <p className="text-sm font-bold text-slate-800 mt-2 leading-tight">{log.subject}</p>

                        {/* Notes */}
                        {log.notes && (
                          <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{log.notes}</p>
                        )}

                        {/* Outcome */}
                        {log.outcome && (
                          <div className="mt-2 flex items-start gap-1.5">
                            <Target size={11} className="text-green-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-green-700 font-medium leading-relaxed">{log.outcome}</p>
                          </div>
                        )}

                        {/* Follow-up */}
                        {log.followUpDate && (
                          <div className={`mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold w-fit
                            ${followUpOverdue
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                            <CalendarCheck size={11} />
                            Follow-up: {fmtDate(log.followUpDate)}
                            {log.followUpNote && <span className="ml-1 opacity-75">— {log.followUpNote}</span>}
                            {followUpOverdue && <span className="ml-1 font-bold">OVERDUE</span>}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                          <span className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} />
                            {fmtDate(log.date)} {fmtTime(log.date, log.time)}
                          </span>
                          {log.createdBy && (
                            <span className="text-xs text-slate-400">
                              by <span className="font-semibold text-slate-600">{log.createdBy.name}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => toggleStar.mutate(log._id ?? log.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                            ${log.starred ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"}`}
                        >
                          <Star size={14} fill={log.starred ? "currentColor" : "none"} />
                        </button>

                        {/* FIX: Edit button explicitly calls openEdit(log) */}
                        <button
                          onClick={() => openEdit(log)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit log"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(log._id ?? log.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete log"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal — key forces fresh mount every open ── */}
      {modalMode && (
        <LogModal
          key={modalKey}
          existing={modalMode === "edit" ? editingLog : null}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}