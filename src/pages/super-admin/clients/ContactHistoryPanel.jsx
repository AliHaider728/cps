import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Search, Star, Trash2, Plus, Check, Loader2, Send } from "lucide-react";
import { TYPE_COLORS, CONTACT_TYPES, fmt, Field, Input, Textarea, Btn, Modal } from "../clients/ClientUtils.jsx";
import MassEmailModal from "./MassEmailModal.jsx";

const API = import.meta.env.VITE_API_URL;

export default function ContactHistoryPanel({ entityType, entityId }) {
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [filter,     setFilter]     = useState({ type: "", starred: false, search: "" });
  const [form,       setForm]       = useState({
    type: "call", subject: "", notes: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type)    params.append("type",    filter.type);
      if (filter.starred) params.append("starred", "true");
      if (filter.search)  params.append("search",  filter.search);
      const { data } = await axios.get(
        `${API}/clients/${entityType}/${entityId}/history?${params}`
      );
      setLogs(data.logs);
    } catch {}
    finally { setLoading(false); }
  }, [entityType, entityId, filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const save = async () => {
    if (!form.subject) return;
    setSaving(true);
    try {
      await axios.post(`${API}/clients/${entityType}/${entityId}/history`, form);
      await fetchLogs();
      setModal(false);
      setForm({ type: "call", subject: "", notes: "", date: new Date().toISOString().slice(0, 10) });
    } catch {}
    finally { setSaving(false); }
  };

  const star = async (logId) => {
    await axios.patch(`${API}/clients/history/${logId}/star`);
    setLogs(prev => prev.map(l => l._id === logId ? { ...l, starred: !l.starred } : l));
  };

  const del = async (logId) => {
    if (!confirm("Delete this log?")) return;
    await axios.delete(`${API}/clients/history/${logId}`);
    setLogs(prev => prev.filter(l => l._id !== logId));
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[180px] bg-white">
          <Search size={13} className="text-slate-400" />
          <input
            value={filter.search}
            onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
            placeholder="Search logs…"
            className="text-sm outline-none w-full bg-transparent text-slate-700 placeholder-slate-400"
          />
        </div>
        <select
          value={filter.type}
          onChange={e => setFilter(p => ({ ...p, type: e.target.value }))}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none"
        >
          <option value="">All Types</option>
          {CONTACT_TYPES.map(t => (
            <option key={t} value={t}>{t.replace("_", " ")}</option>
          ))}
        </select>
        <button
          onClick={() => setFilter(p => ({ ...p, starred: !p.starred }))}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors
            ${filter.starred
              ? "bg-yellow-50 border-yellow-300 text-yellow-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
        >
          <Star size={13} fill={filter.starred ? "currentColor" : "none"} /> Starred
        </button>
        <Btn onClick={() => setEmailModal(true)} variant="outline" size="sm">
          <Send size={13}/> Mass Email
        </Btn>
        <Btn onClick={() => setModal(true)} size="sm">
          <Plus size={13}/> Add Log
        </Btn>
      </div>

      {/* Log list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={22} className="animate-spin text-blue-600"/>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">No contact history yet</div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div
              key={log._id}
              className={`bg-white border rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow
                ${log.starred ? "border-yellow-300 bg-yellow-50/30" : "border-slate-200"}`}
            >
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0
                ${TYPE_COLORS[log.type] || "bg-slate-100 text-slate-600"}`}>
                {log.type?.replace("_", " ")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{log.subject}</p>
                {log.notes && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{log.notes}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span>{fmt(log.date)}</span>
                  {log.createdBy && <span>by {log.createdBy.name}</span>}
                  {log.isMassEmail && (
                    <span className="text-blue-600 font-medium">
                      {log.recipients?.filter(r => r.opened).length}/{log.recipients?.length} opened
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => star(log._id)}
                  className={`p-1.5 rounded-lg transition-colors
                    ${log.starred ? "text-yellow-500" : "text-slate-300 hover:text-yellow-400"}`}
                >
                  <Star size={14} fill={log.starred ? "currentColor" : "none"}/>
                </button>
                <button
                  onClick={() => del(log._id)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Log Modal */}
      {modal && (
        <Modal title="Add Contact Log" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <Field label="Type">
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50
                  focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                {CONTACT_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="Subject">
              <Input
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="Brief description"
              />
            </Field>
            <Field label="Notes">
              <Textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Additional details…"
              />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              />
            </Field>
          </div>
          <div className="flex gap-3 mt-6">
            <Btn onClick={() => setModal(false)} variant="outline">Cancel</Btn>
            <Btn onClick={save} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
              Save Log
            </Btn>
          </div>
        </Modal>
      )}

      {emailModal && (
        <MassEmailModal
          entityType={entityType}
          entityId={entityId}
          onClose={() => { setEmailModal(false); fetchLogs(); }}
        />
      )}
    </div>
  );
}