import { useState } from "react";
import { UserPlus, Pencil, Trash2, Mail, Phone, Check, X, Loader2, User } from "lucide-react";
import { Field, Input, Btn } from "../ClientUtils.jsx";
import { pcnAPI, practiceAPI } from "../../../../api/api.js";

const TYPE_CONFIG = {
  general:          { label: "General",          color: "bg-slate-100 text-slate-600" },
  decision_maker:   { label: "Decision Maker",   color: "bg-purple-100 text-purple-700" },
  finance:          { label: "Finance",          color: "bg-amber-100 text-amber-700" },
  clinical_lead:    { label: "Clinical Lead",    color: "bg-blue-100 text-blue-700" },
  gp_lead:          { label: "GP Lead",          color: "bg-cyan-100 text-cyan-700" },
  practice_manager: { label: "Practice Manager", color: "bg-indigo-100 text-indigo-700" },
  operations:       { label: "Operations",       color: "bg-orange-100 text-orange-700" },
};

const PCN_TYPES      = ["general", "decision_maker", "finance", "clinical_lead", "operations"];
const PRACTICE_TYPES = ["general", "decision_maker", "finance", "gp_lead", "practice_manager"];
const EMPTY = { name: "", role: "", email: "", phone: "", type: "general" };

export default function ContactsTab({ data, entityType, entityId, onRefresh }) {
  const contacts = data?.contacts || [];
  const types    = entityType === "PCN" ? PCN_TYPES : PRACTICE_TYPES;

  const [adding,  setAdding]  = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const saveContacts = async (newContacts) => {
    setSaving(true); setErr("");
    try {
      if (entityType === "PCN") await pcnAPI.update(entityId, { contacts: newContacts });
      else                       await practiceAPI.update(entityId, { contacts: newContacts });
      onRefresh?.();
    } catch (e) { setErr(e.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleAdd    = async () => { if (!form.name.trim()) return setErr("Name is required"); await saveContacts([...contacts, form]); setAdding(false); setForm(EMPTY); };
  const handleEdit   = async () => { if (!form.name.trim()) return setErr("Name is required"); await saveContacts(contacts.map((c, i) => i === editing ? form : c)); setEditing(null); setForm(EMPTY); };
  const handleDelete = async (idx) => { if (!window.confirm("Remove this contact?")) return; await saveContacts(contacts.filter((_, i) => i !== idx)); };
  const startEdit    = (c, idx) => { setEditing(idx); setForm({ name: c.name || "", role: c.role || "", email: c.email || "", phone: c.phone || "", type: c.type || "general" }); setAdding(false); setErr(""); };
  const cancel       = () => { setAdding(false); setEditing(null); setForm(EMPTY); setErr(""); };
  const set          = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const showForm     = adding || editing !== null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contacts ({contacts.length})</p>
        {!showForm && <Btn size="sm" onClick={() => { setAdding(true); setEditing(null); setForm(EMPTY); setErr(""); }}><UserPlus size={13} /> Add Contact</Btn>}
      </div>
      {err && <p className="text-xs text-red-600 font-medium">{err}</p>}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">{adding ? "New Contact" : "Edit Contact"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name *"><Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" /></Field>
            <Field label="Role"><Input value={form.role} onChange={e => set("role", e.target.value)} placeholder="Job title" /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@nhs.uk" /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="01234 567 890" /></Field>
            <Field label="Type">
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                {types.map(t => <option key={t} value={t}>{TYPE_CONFIG[t]?.label || t}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="outline" size="sm" onClick={cancel}><X size={12} /> Cancel</Btn>
            <Btn size="sm" onClick={adding ? handleAdd : handleEdit} disabled={saving}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? "Saving…" : "Save"}
            </Btn>
          </div>
        </div>
      )}
      {contacts.length === 0 && !showForm ? (
        <div className="text-center py-10"><User size={28} className="text-slate-200 mx-auto mb-2" /><p className="text-sm text-slate-400">No contacts yet</p></div>
      ) : (
        <div className="space-y-2.5">
          {contacts.map((c, i) => {
            const tc = TYPE_CONFIG[c.type] || TYPE_CONFIG.general;
            return (
              <div key={i} className="group flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {c.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.color}`}>{tc.label}</span>
                  </div>
                  {c.role && <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Mail size={11} /> {c.email}</a>}
                    {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"><Phone size={11} /> {c.phone}</a>}
                  </div>
                </div>
                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(c, i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Pencil size={12} /></button>
                  <button onClick={() => handleDelete(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}