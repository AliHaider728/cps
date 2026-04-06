import { useState } from "react";
import { X, Mail, Send, Plus, Trash2, Check } from "lucide-react";
import { useSendMassEmail } from "../../../hooks/useEmail";

export default function MassEmailModal({ entityType, entityId, contacts = [], onClose }) {
  const [subject,    setSubject]    = useState("");
  const [body,       setBody]       = useState("");
  const [recipients, setRecipients] = useState(
    contacts.filter(c => c.email).map(c => ({ name: c.name, email: c.email, selected: true }))
  );
  const [custom, setCustom] = useState({ name: "", email: "" });
  const [sent,   setSent]   = useState(false);

  // ✅ React Query
  const sendEmail = useSendMassEmail();

  const toggle    = (i) => setRecipients(prev => prev.map((r, idx) => idx === i ? {...r, selected: !r.selected} : r));
  const addCustom = () => {
    if (!custom.email.includes("@")) return;
    setRecipients(prev => [...prev, { ...custom, selected: true }]);
    setCustom({ name: "", email: "" });
  };

  const handleSend = async () => {
    const valid = recipients.filter(r => r.selected && r.email);
    if (!subject.trim() || !body.trim() || valid.length === 0) return;
    try {
      await sendEmail.mutateAsync({ entityType, entityId, data: { subject, body, recipients: valid } });
      setSent(true);
      setTimeout(onClose, 1500);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Mail size={15} className="text-blue-600" /></div>
            <h3 className="text-[15px] font-bold text-slate-800">Mass Email</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 [scrollbar-width:thin]">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Recipients ({recipients.filter(r => r.selected).length} selected)</label>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {recipients.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No contacts with email. Add below.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto [scrollbar-width:thin]">
                  {recipients.map((r, i) => (
                    <label key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={r.selected} onChange={() => toggle(i)} className="w-3.5 h-3.5 accent-blue-600" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-semibold text-slate-700">{r.name || "—"}</span>
                        <span className="text-[11px] text-slate-400 ml-2">{r.email}</span>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setRecipients(p => p.filter((_, idx) => idx !== i)); }} className="text-slate-300 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    </label>
                  ))}
                </div>
              )}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                <input value={custom.name} onChange={e => setCustom(c => ({...c, name: e.target.value}))} placeholder="Name"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-400 transition-all" />
                <input value={custom.email} onChange={e => setCustom(c => ({...c, email: e.target.value}))} placeholder="Email address"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-400 transition-all" />
                <button onClick={addCustom} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"><Plus size={13} /></button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Subject *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Message *</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} placeholder="Email body (HTML is supported)…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none font-mono" />
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handleSend}
            disabled={sendEmail.isPending || sent || !subject.trim() || !body.trim() || recipients.filter(r => r.selected).length === 0}
            className={`flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-all ${sent ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"}`}>
            {sent ? <><Check size={14} /> Sent!</>
              : sendEmail.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Send size={14} /> Send to {recipients.filter(r => r.selected).length} recipients</>}
          </button>
        </div>
      </div>
    </div>
  );
}