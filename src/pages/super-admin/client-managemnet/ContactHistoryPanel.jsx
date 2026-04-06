import { useState } from "react";
import {
  MessageSquare, Phone, Mail, Users, FileText, AlertTriangle,
  HardDrive, Star, Plus, Search, Trash2, Edit2, X, Check, Clock, Wifi
} from "lucide-react";
import { useHistory, useAddHistory, useUpdateHistory, useToggleStar, useDeleteHistory } from "../../../hooks/useHistory";

const TYPE_META = {
  call:          { icon: Phone,         color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  label: "Call"          },
  email:         { icon: Mail,          color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   label: "Email"         },
  meeting:       { icon: Users,         color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", label: "Meeting"       },
  note:          { icon: FileText,      color: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200",  label: "Note"          },
  complaint:     { icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    label: "Complaint"     },
  document:      { icon: HardDrive,     color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  label: "Document"      },
  system_access: { icon: Wifi,          color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-200",   label: "System Access" },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
const fmtTime = (d, t) => t || (d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "");

const LogModal = ({ onClose, onSave, existing }) => {
  const [form, setForm] = useState({
    type:    existing?.type    || "call",
    subject: existing?.subject || "",
    notes:   existing?.notes   || "",
    date:    existing?.date    ? new Date(existing.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    time:    existing?.time    || new Date().toTimeString().slice(0,5),
  });
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    if (!form.subject.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{existing ? "Edit Log" : "Add Contact Log"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_META).map(([k, v]) => {
                const Icon = v.icon;
                return (
                  <button key={k} onClick={() => setForm(f => ({...f, type: k}))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${form.type === k ? `${v.bg} ${v.border} ${v.color}` : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                    <Icon size={16} />{v.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Subject *</label>
            <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="Brief description…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={4} placeholder="Detailed notes…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none placeholder:text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving || !form.subject.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check size={15}/>}
            {existing ? "Save Changes" : "Add Log"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ContactHistoryPanel({ entityType, entityId }) {
  const [filterType, setFilterType] = useState("all");
  const [starred,    setStarred]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);

  const apiEntityType = entityType?.toLowerCase() === "practice" ? "Practice" : entityType;

  // ✅ React Query — auto refetches when filterType/starred changes
  const params = {};
  if (filterType !== "all") params.type = filterType;
  if (starred) params.starred = "true";

  const { data, isLoading, isError, error } = useHistory(apiEntityType, entityId, params);
  const logs = data?.logs || [];

  const addHistory    = useAddHistory(apiEntityType, entityId);
  const updateHistory = useUpdateHistory(apiEntityType, entityId);
  const toggleStar    = useToggleStar(apiEntityType, entityId);
  const deleteHistory = useDeleteHistory(apiEntityType, entityId);

  const handleSave = async (form) => {
    if (editing) await updateHistory.mutateAsync({ logId: editing._id, data: form });
    else         await addHistory.mutateAsync(form);
    setEditing(null);
  };

  const handleStar = async (id) => {
    await toggleStar.mutateAsync(id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this log entry?")) return;
    await deleteHistory.mutateAsync(id);
  };

  const filtered = logs.filter(l =>
    !search || l.subject?.toLowerCase().includes(search.toLowerCase()) || l.notes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <MessageSquare size={20} className="text-blue-600 shrink-0" />
          <h3 className="text-base font-bold text-slate-800">Contact History</h3>
          <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full">{logs.length}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…"
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all w-44" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-600 px-3 py-2 focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="all">All Types</option>
            {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => setStarred(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${starred ? "bg-amber-50 border-amber-300 text-amber-600" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"}`}>
            <Star size={13} fill={starred ? "currentColor" : "none"} /> Starred
          </button>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all">
            <Plus size={14} /> Add Log
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto [scrollbar-width:thin]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading history…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-2">
            <AlertTriangle size={28} className="opacity-50" />
            <p className="text-sm font-semibold">Failed to load</p>
            <p className="text-xs text-slate-400">{error?.message}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <MessageSquare size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">{logs.length === 0 ? "No contact history yet" : "No logs match your search"}</p>
            {logs.length === 0 && (
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="mt-3 text-blue-600 text-xs font-bold hover:underline">Add the first log</button>
            )}
          </div>
        ) : (
          filtered.map((log) => {
            const meta = TYPE_META[log.type] || TYPE_META.note;
            const Icon = meta.icon;
            return (
              <div key={log._id} className="px-6 py-5 hover:bg-slate-50/80 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}><Icon size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${meta.bg} ${meta.color}`}>{meta.label}</span>
                          {log.starred     && <Star size={13} className="text-amber-500 fill-amber-500" />}
                          {log.isMassEmail && <span className="text-xs bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded-md border border-blue-200">Mass Email</span>}
                        </div>
                        <p className="text-sm font-bold text-slate-800 mt-2 leading-tight">{log.subject}</p>
                        {log.notes && <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{log.notes}</p>}
                        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                          <span className="text-xs text-slate-400 flex items-center gap-1.5"><Clock size={12} />{fmtDate(log.date)} {fmtTime(log.date, log.time)}</span>
                          {log.createdBy && <span className="text-xs text-slate-400">by <span className="font-semibold text-slate-600">{log.createdBy.name}</span></span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => handleStar(log._id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${log.starred ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"}`}>
                          <Star size={14} fill={log.starred ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => { setEditing(log); setShowModal(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(log._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <LogModal existing={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSave={handleSave} />
      )}
    </div>
  );
}