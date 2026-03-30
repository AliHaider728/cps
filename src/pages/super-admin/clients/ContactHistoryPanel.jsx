/**
 * ContactHistoryPanel.jsx  —  FIXED
 * 
 * BUGS FIXED:
 *  ✅ Removed duplicate local Input/Textarea declarations (was imported AND redeclared)
 *  ✅ Search now works on subject, notes, and createdBy.name
 *  ✅ Edit mode per log entry
 *  ✅ Time displayed alongside date
 *  ✅ Mass email recipients count shown
 *  ✅ All 10 contact types supported
 */
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Mail, Phone, Users, FileSignature, AlertTriangle,
  Monitor, StickyNote, FileText, CalendarCheck,
  Star, Trash2, Plus, Loader2, Send, Clock, Search, X, Check,
} from "lucide-react";
import { fmt, Field, Input, Textarea, Btn } from "./ClientUtils.jsx";
import MassEmailModal from "./MassEmailModal.jsx";

const API = import.meta.env.VITE_API_URL;

export const TYPE_META = {
  email:         { label: "Email",          icon: Mail,          color: "bg-blue-100 text-blue-700"    },
  call:          { label: "Call",           icon: Phone,         color: "bg-green-100 text-green-700"  },
  meeting:       { label: "Meeting",        icon: Users,         color: "bg-purple-100 text-purple-700"},
  contract:      { label: "Contract",       icon: FileSignature, color: "bg-orange-100 text-orange-700"},
  complaint:     { label: "Complaint",      icon: AlertTriangle, color: "bg-red-100 text-red-700"      },
  system_access: { label: "System Access",  icon: Monitor,       color: "bg-cyan-100 text-cyan-700"    },
  document:      { label: "Document",       icon: FileText,      color: "bg-indigo-100 text-indigo-700"},
  presentation:  { label: "Presentation",   icon: CalendarCheck, color: "bg-pink-100 text-pink-700"   },
  note:          { label: "Note",           icon: StickyNote,    color: "bg-slate-100 text-slate-600"  },
  rota:          { label: "Rota",           icon: CalendarCheck, color: "bg-teal-100 text-teal-700"    },
};

const EMPTY_FORM = {
  type:    "call",
  subject: "",
  notes:   "",
  date:    new Date().toISOString().split("T")[0],
  time:    new Date().toTimeString().slice(0, 5),
};

export default function ContactHistoryPanel({ entityType, entityId }) {
  const [logs,      setLogs]      = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [filter,    setFilter]    = useState("all");
  const [starOnly,  setStarOnly]  = useState(false);
  const [search,    setSearch]    = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [editLog,   setEditLog]   = useState(null); // { _id, subject, notes }

  const fetchLogs = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (filter !== "all") params.set("type", filter);
      if (starOnly)         params.set("starred", "true");
      const { data } = await axios.get(
        `${API}/clients/${entityType}/${entityId}/history?${params}`
      );
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("fetchLogs:", err);
    } finally { setLoading(false); }
  }, [entityType, entityId, filter, starOnly]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = async () => {
    if (!form.subject.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${API}/clients/${entityType}/${entityId}/history`, form);
      await fetchLogs();
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error("addLog:", err);
    } finally { setSaving(false); }
  };

  const saveEdit = async () => {
    if (!editLog) return;
    setSaving(true);
    try {
      await axios.put(`${API}/clients/history/${editLog._id}`, {
        subject: editLog.subject,
        notes:   editLog.notes,
      });
      await fetchLogs();
      setEditLog(null);
    } catch { } finally { setSaving(false); }
  };

  const toggleStar = async (id) => {
    await axios.patch(`${API}/clients/history/${id}/star`).catch(() => {});
    setLogs(prev => prev.map(l => l._id === id ? { ...l, starred: !l.starred } : l));
  };

  const deleteLog = async (id) => {
    if (!window.confirm("Delete this log entry permanently?")) return;
    await axios.delete(`${API}/clients/history/${id}`).catch(() => {});
    setLogs(prev => prev.filter(l => l._id !== id));
    setTotal(t => t - 1);
  };

  // Client-side search on already-loaded logs
  const visible = logs.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.subject?.toLowerCase().includes(q) ||
      l.notes?.toLowerCase().includes(q) ||
      l.createdBy?.name?.toLowerCase().includes(q)
    );
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Contact History ({total})
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStarOnly(s => !s)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
              font-semibold border transition-all
              ${starOnly
                ? "bg-amber-50 text-amber-600 border-amber-300"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
          >
            <Star size={11} className={starOnly ? "fill-amber-500 text-amber-500" : ""} />
            Starred
          </button>
          <Btn size="sm" variant="ghost" onClick={() => setShowEmail(true)}>
            <Send size={12} /> Mass Email
          </Btn>
          <Btn size="sm" onClick={() => { setShowForm(s => !s); setEditLog(null); }}>
            <Plus size={12} /> Add Log
          </Btn>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by subject, notes, or author…"
          className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-xl text-sm
            bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        <Pill active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        {Object.entries(TYPE_META).map(([key, { label }]) => (
          <Pill key={key} active={filter === key} onClick={() => setFilter(key)} label={label} />
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">New Log Entry</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Type">
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
                  bg-white focus:outline-none focus:border-blue-400 transition-all">
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </Field>
            <Field label="Time">
              <Input type="time" value={form.time} onChange={e => set("time", e.target.value)} />
            </Field>
          </div>
          <Field label="Subject *">
            <Input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Brief subject…" />
          </Field>
          <Field label="Notes / Details">
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Details, outcomes, next steps, who was involved…" />
          </Field>
          <div className="flex gap-2 justify-end">
            <Btn variant="outline" size="sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
              <X size={12} /> Cancel
            </Btn>
            <Btn size="sm" onClick={addLog} disabled={saving || !form.subject.trim()}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? "Saving…" : "Save Log"}
            </Btn>
          </div>
        </div>
      )}

      {/* Log list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={22} className="animate-spin text-blue-500" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-10">
          <Clock size={24} className="text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">No history entries</p>
          {(filter !== "all" || starOnly || search) && (
            <button
              onClick={() => { setFilter("all"); setStarOnly(false); setSearch(""); }}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(log => (
            editLog?._id === log._id ? (
              <EditForm
                key={log._id}
                log={editLog}
                setLog={setEditLog}
                onSave={saveEdit}
                onCancel={() => setEditLog(null)}
                saving={saving}
              />
            ) : (
              <LogCard
                key={log._id}
                log={log}
                onStar={() => toggleStar(log._id)}
                onDelete={() => deleteLog(log._id)}
                onEdit={() => setEditLog({ _id: log._id, subject: log.subject, notes: log.notes || "" })}
              />
            )
          ))}
        </div>
      )}

      {/* Mass email modal */}
      {showEmail && (
        <MassEmailModal
          entityType={entityType}
          entityId={entityId}
          onClose={() => { setShowEmail(false); fetchLogs(); }}
        />
      )}
    </div>
  );
}

/* ── Log card ── */
function LogCard({ log, onStar, onDelete, onEdit }) {
  const meta = TYPE_META[log.type] || TYPE_META.note;
  const Icon = meta.icon;
  const [expanded, setExpanded] = useState(false);
  const longNotes = (log.notes?.length || 0) > 140;

  return (
    <div className={`group flex items-start gap-3 p-4 rounded-xl border transition-all
      ${log.starred
        ? "bg-amber-50 border-amber-200"
        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}>

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
        <Icon size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="font-semibold text-slate-800 text-sm flex-1 leading-snug">{log.subject}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.color}`}>
            {meta.label}
          </span>
        </div>

        {log.notes && (
          <div className="mt-1">
            <p className={`text-xs text-slate-500 leading-relaxed ${!expanded && longNotes ? "line-clamp-2" : ""}`}>
              {log.notes}
            </p>
            {longNotes && (
              <button onClick={() => setExpanded(e => !e)}
                className="text-[11px] text-blue-600 hover:underline font-semibold mt-0.5">
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400">
            {fmt(log.date)}{log.time ? ` · ${log.time}` : ""}
          </span>
          {log.createdBy?.name && (
            <span className="text-[11px] text-slate-400">by {log.createdBy.name}</span>
          )}
          {log.isMassEmail && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Mass Email · {log.recipients?.length || 0} recipients
              {log.emailTracking?.opened && " · Opened"}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={onStar}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
            ${log.starred ? "text-amber-500" : "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-500"}`}>
          <Star size={13} className={log.starred ? "fill-amber-500" : ""} />
        </button>
        <button onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center
            text-slate-300 opacity-0 group-hover:opacity-100
            hover:bg-slate-100 hover:text-slate-600 transition-all">
          <FileText size={12} />
        </button>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center
            text-slate-300 opacity-0 group-hover:opacity-100
            hover:bg-red-50 hover:text-red-500 transition-all">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Edit form ── */
function EditForm({ log, setLog, onSave, onCancel, saving }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Edit Log</p>
      <Field label="Subject">
        <Input value={log.subject} onChange={e => setLog(l => ({ ...l, subject: e.target.value }))} />
      </Field>
      <Field label="Notes">
        <Textarea value={log.notes} onChange={e => setLog(l => ({ ...l, notes: e.target.value }))} />
      </Field>
      <div className="flex gap-2 justify-end">
        <Btn variant="outline" size="sm" onClick={onCancel}><X size={12} /> Cancel</Btn>
        <Btn size="sm" onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Save
        </Btn>
      </div>
    </div>
  );
}

/* ── Filter pill ── */
function Pill({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border
        ${active
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
      {label}
    </button>
  );
}