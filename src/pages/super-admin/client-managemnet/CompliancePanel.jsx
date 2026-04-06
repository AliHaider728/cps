/**
 * CompliancePanelEnhanced.jsx
 * Props:
 *   entityType      "PCN" | "Practice"
 *   entity          pcn / practice object
 *   fieldSaving     { [key]: bool }
 *   onToggle        (key) => void
 *   onPatch         (body) => void
 *   practiceRollup  array of practices (PCN only)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Layers, FileText, CheckCircle2, XCircle,
  Plus, Edit2, Trash2, X, Check, ChevronDown, ChevronUp,
  Search, Clock, Loader2, ExternalLink, RefreshCw
} from "lucide-react";
import {
  getComplianceDocs, createComplianceDoc, updateComplianceDoc, deleteComplianceDoc,
  getDocumentGroups, createDocumentGroup, updateDocumentGroup, deleteDocumentGroup,
} from "../../../api/clientAPI.js";

/* ══════════════════════════════════════════════
   SHARED ATOMS
══════════════════════════════════════════════ */
const Spinner = ({ cls = "border-blue-600" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);
const BadgeStatus = ({ ok, label }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
    ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
    {ok ? <CheckCircle2 size={9} /> : <XCircle size={9} />}{label}
  </span>
);
const ActivePill = ({ active }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
    active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
    {active ? "Active" : "In Active"}
  </span>
);

/* ══════════════════════════════════════════════
   COMPLIANCE DOCUMENT MODAL
══════════════════════════════════════════════ */
const DocModal = ({ existing, onClose, onSave }) => {
  const isEdit = !!existing?._id;
  const [form, setForm] = useState({
    name: "", displayOrder: 0, mandatory: true, expirable: false,
    active: true, defaultExpiryDays: 365, defaultReminderDays: 28,
    ...(existing || {}),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const handle = async () => {
    if (!form.name.trim()) { setErr("Document name is required"); return; }
    setSaving(true); setErr("");
    try { await onSave(form); onClose(); } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-[15px] font-bold text-slate-800">{isEdit ? "Edit Compliance Document" : "Add New Compliance Document"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:thin]">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2">{err}</div>}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Document Name *</label>
            <input value={form.name} onChange={e => set("name")(e.target.value)} placeholder="e.g. DBS Check/Update Service"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={e => set("displayOrder")(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Default Expiry Days</label>
              <input type="number" value={form.defaultExpiryDays} onChange={e => set("defaultExpiryDays")(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" /></div>
          </div>
          <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Default Reminder Days</label>
            <input type="number" value={form.defaultReminderDays} onChange={e => set("defaultReminderDays")(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" /></div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[["mandatory","Mandatory"],["expirable","Expirable"],["active","Active"]].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[k]} onChange={e => set(k)(e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving || !form.name.trim()} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <Spinner cls="border-white" /> : <Check size={15} />}{isEdit ? "Save Changes" : "Add Document"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   DOCUMENT GROUP MODAL
══════════════════════════════════════════════ */
const GroupModal = ({ existing, allDocs, onClose, onSave }) => {
  const isEdit = !!existing?._id;
  const [form, setForm] = useState({
    name: "", displayOrder: 0, active: true, documents: [],
    ...(existing ? { ...existing, documents: (existing.documents || []).map(d => d._id || d) } : {}),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const toggleDoc = id => {
    const docs = form.documents || [];
    set("documents")(docs.includes(id) ? docs.filter(d => d !== id) : [...docs, id]);
  };
  const allChecked = (form.documents || []).length === allDocs.length;
  const toggleAll  = () => set("documents")(allChecked ? [] : allDocs.map(d => d._id));
  const col1 = allDocs.filter((_, i) => i % 3 === 0);
  const col2 = allDocs.filter((_, i) => i % 3 === 1);
  const col3 = allDocs.filter((_, i) => i % 3 === 2);
  const handle = async () => {
    if (!form.name.trim()) { setErr("Group name is required"); return; }
    setSaving(true); setErr("");
    try { await onSave(form); onClose(); } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-[15px] font-bold text-slate-800">{isEdit ? "Edit Document Group" : "Add New Document Group"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5 [scrollbar-width:thin]">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2">{err}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Group Name *</label>
              <input value={form.name} onChange={e => set("name")(e.target.value)} placeholder="e.g. Clinical Staff Documents" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={e => set("displayOrder")(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" /></div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={!!form.active} onChange={e => set("active")(e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
            <span className="text-sm font-medium text-slate-700">Active</span>
          </label>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Documents</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                <span className="text-xs font-semibold text-slate-500">Check ALL</span>
              </label>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-2">
              {[col1, col2, col3].map((col, ci) => (
                <div key={ci} className="space-y-2">
                  {col.map(doc => (
                    <label key={doc._id} className="flex items-start gap-2 cursor-pointer group">
                      <input type="checkbox" checked={(form.documents || []).includes(doc._id)} onChange={() => toggleDoc(doc._id)} className="w-3.5 h-3.5 accent-blue-600 cursor-pointer mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-snug">{doc.name}</span>
                    </label>
                  ))}
                </div>
              ))}
              {allDocs.length === 0 && <p className="col-span-3 text-xs text-slate-400 text-center py-4">No active documents. Create documents first.</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving || !form.name.trim()} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <Spinner cls="border-white" /> : <Check size={15} />}{isEdit ? "Save Changes" : "Add Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   TAB 1 — ENTITY COMPLIANCE CHECKLIST
══════════════════════════════════════════════ */
const ONBOARDING_KEYS = [
  { key: "ndaSigned",                 label: "NDA Signed"                  },
  { key: "dsaSigned",                 label: "DSA Signed"                  },
  { key: "mouReceived",               label: "MOU Received"                },
  { key: "welcomePackSent",           label: "Welcome Pack Sent"           },
  { key: "mobilisationPlanSent",      label: "Mobilisation Plan Sent"      },
  { key: "confidentialityFormSigned", label: "Confidentiality Form Signed" },
  { key: "prescribingPoliciesShared", label: "Prescribing Policies Shared" },
  { key: "remoteAccessSetup",         label: "Remote Access Setup"         },
  { key: "templateInstalled",         label: "Template Installed"          },
  { key: "reportsImported",           label: "Reports Imported"            },
];

const EntityComplianceTab = ({ entity, entityType, groups, docs, fieldSaving, onToggle, practiceRollup }) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = id => setExpandedGroups(p => ({ ...p, [id]: !p[id] }));

  const done  = ONBOARDING_KEYS.filter(c => entity?.[c.key]).length;
  const total = ONBOARDING_KEYS.length;
  const pct   = Math.round((done / total) * 100);
  const barColor = pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
  const txtColor = pct === 100 ? "text-green-600" : pct >= 60 ? "text-amber-500" : "text-red-500";

  const rollupPct = practiceRollup?.length
    ? Math.round(practiceRollup.reduce((s, p) => {
        const pd = ONBOARDING_KEYS.filter(c => p[c.key]).length;
        return s + (pd / total) * 100;
      }, 0) / practiceRollup.length)
    : null;

  return (
    <div className="space-y-5">
      <div className={`grid grid-cols-1 ${rollupPct !== null ? "sm:grid-cols-2" : ""} gap-4`}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div><h3 className="text-sm font-bold text-slate-700">{entityType} Onboarding Status</h3><p className="text-xs text-slate-400 mt-0.5">{done} of {total} items complete</p></div>
            <span className={`text-3xl font-bold ${txtColor}`}>{pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2.5">Click any item to toggle — saves instantly</p>
        </div>
        {rollupPct !== null && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div><h3 className="text-sm font-bold text-slate-700">Practices Roll-up</h3><p className="text-xs text-slate-400 mt-0.5">{practiceRollup.length} practices averaged</p></div>
              <span className={`text-3xl font-bold ${rollupPct === 100 ? "text-green-600" : rollupPct >= 60 ? "text-amber-500" : "text-red-500"}`}>{rollupPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${rollupPct === 100 ? "bg-green-500" : rollupPct >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${rollupPct}%` }} />
            </div>
            <div className="mt-3 space-y-1">
              {practiceRollup.slice(0, 6).map(p => {
                const pd = ONBOARDING_KEYS.filter(c => p[c.key]).length;
                const pp = Math.round((pd / total) * 100);
                const col = pp === 100 ? "bg-green-500" : pp >= 60 ? "bg-amber-400" : "bg-red-400";
                return (
                  <div key={p._id} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${col}`} />
                    <span className="text-[10px] text-slate-500 flex-1 truncate">{p.name}</span>
                    <span className={`text-[10px] font-bold ${pp === 100 ? "text-green-600" : pp >= 60 ? "text-amber-500" : "text-red-500"}`}>{pp}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Onboarding Checklist</h3>
          <span className="text-xs text-slate-400">{done}/{total} complete</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
          {ONBOARDING_KEYS.map(c => {
            const ok     = !!entity?.[c.key];
            const saving = !!fieldSaving?.[c.key];
            return (
              <button key={c.key} onClick={() => onToggle(c.key)} disabled={saving}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-left
                  ${ok ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}
                  ${saving ? "opacity-60 cursor-wait" : "cursor-pointer"}`}>
                {saving ? <Spinner cls="border-slate-400" />
                  : ok ? <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                       : <XCircle size={16} className="text-slate-400 shrink-0" />}
                <span className="flex-1 truncate">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {groups.filter(g => g.active).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Layers size={13} /> Document Groups</h3>
          {groups.filter(g => g.active).map(grp => {
            const grpDocs = docs.filter(d => (grp.documents || []).some(gd => (gd._id || gd) === d._id));
            const open    = expandedGroups[grp._id];
            return (
              <div key={grp._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button onClick={() => toggleGroup(grp._id)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Layers size={14} className="text-blue-600" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-800">{grp.name}</p><p className="text-xs text-slate-400 mt-0.5">{grpDocs.length} document{grpDocs.length !== 1 ? "s" : ""}</p></div>
                  {open ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                </button>
                {open && grpDocs.length > 0 && (
                  <div className="px-5 pb-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                      {grpDocs.map(doc => (
                        <div key={doc._id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-medium ${doc.active ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                          {doc.active ? <CheckCircle2 size={13} className="text-green-600 shrink-0" /> : <XCircle size={13} className="text-slate-400 shrink-0" />}
                          <span className="flex-1 truncate">{doc.name}</span>
                          <div className="flex gap-1 shrink-0">
                            {doc.mandatory && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold">MAN</span>}
                            {doc.expirable && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5"><Clock size={8} />EXP</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   TAB 2 — DOCUMENT GROUPS LIST
══════════════════════════════════════════════ */
const GroupListTab = ({ groups, allDocs, loading, onAdd, onEdit, onDelete, onRefresh, navigate }) => {
  const [search, setSearch] = useState("");
  const filtered = groups
    .filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all" />
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"><RefreshCw size={14} /></button>
          <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"><Plus size={14} /> Add New Document Group</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Groups</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white border-b border-slate-200">
              {["Group Name","Display Order","Active",""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12"><Loader2 size={20} className="animate-spin mx-auto text-slate-400" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">No groups found</td></tr>
            ) : filtered.map(grp => (
              <tr key={grp._id} className={`hover:bg-slate-50 transition-colors group ${!grp.active ? "opacity-60" : ""}`}>
                <td className="px-4 py-3">
                  {/* ← Click name → detail page */}
                  <button onClick={() => navigate(`/dashboard/super-admin/compliance/groups/${grp._id}`)}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left flex items-center gap-1">
                    {grp.name}<ExternalLink size={11} className="shrink-0 opacity-50" />
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-500">{grp.displayOrder}</td>
                <td className="px-4 py-3"><ActivePill active={grp.active} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(grp)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={13} /></button>
                    <button onClick={() => onDelete(grp._id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50"><p className="text-xs text-slate-500">Total Records : {filtered.length}</p></div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   TAB 3 — COMPLIANCE DOCUMENTS LIST
══════════════════════════════════════════════ */
const DocumentListTab = ({ docs, loading, onAdd, onEdit, onDelete, onRefresh, navigate }) => {
  const [search, setSearch] = useState("");
  const filtered = docs
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all" />
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"><RefreshCw size={14} /></button>
          <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"><Plus size={14} /> Add New Compliance Document</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Document / Training List</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white border-b border-slate-200">
              {["Document Name","Display Order","Mandatory","Expirable","Active",""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><Loader2 size={20} className="animate-spin mx-auto text-slate-400" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No documents found</td></tr>
            ) : filtered.map(doc => (
              <tr key={doc._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3">
                  {/* ← Click name → detail page */}
                  <button onClick={() => navigate(`/dashboard/super-admin/compliance/documents/${doc._id}`)}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left flex items-center gap-1">
                    {doc.name}<ExternalLink size={11} className="shrink-0 opacity-50" />
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-500">{doc.displayOrder}</td>
                <td className="px-4 py-3"><BadgeStatus ok={doc.mandatory} label={doc.mandatory ? "Mandatory" : "Non-Mandatory"} /></td>
                <td className="px-4 py-3"><BadgeStatus ok={doc.expirable} label={doc.expirable ? "Expirable" : "Non-Expirable"} /></td>
                <td className="px-4 py-3"><ActivePill active={doc.active} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(doc)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={13} /></button>
                    <button onClick={() => onDelete(doc._id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50"><p className="text-xs text-slate-500">Total Records : {filtered.length}</p></div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════ */
export default function CompliancePanelEnhanced({
  entityType = "PCN",
  entity,
  fieldSaving = {},
  onToggle,
  onPatch,
  practiceRollup = [],
}) {
  const navigate = useNavigate();

  const SUBTABS = [
    { id: "compliance", label: `${entityType} Compliance`, icon: Shield    },
    { id: "groups",     label: "Document Groups",           icon: Layers   },
    { id: "documents",  label: "Compliance Documents",      icon: FileText },
  ];
  const [subTab,  setSubTab]  = useState("compliance");
  const [docs,    setDocs]    = useState([]);
  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [docModal,   setDocModal]   = useState(null);
  const [groupModal, setGroupModal] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, gRes] = await Promise.all([getComplianceDocs(), getDocumentGroups()]);
      setDocs(dRes.docs     || []);
      setGroups(gRes.groups || []);
    } catch (e) { console.error("CompliancePanelEnhanced load error:", e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSaveDoc = async (form) => {
    if (form._id) await updateComplianceDoc(form._id, form);
    else          await createComplianceDoc(form);
    await loadAll();
  };
  const handleDeleteDoc = async (id) => {
    if (!confirm("Delete this compliance document? It will also be removed from all groups.")) return;
    await deleteComplianceDoc(id); await loadAll();
  };
  const handleSaveGroup = async (form) => {
    if (form._id) await updateDocumentGroup(form._id, form);
    else          await createDocumentGroup(form);
    await loadAll();
  };
  const handleDeleteGroup = async (id) => {
    if (!confirm("Delete this document group?")) return;
    await deleteDocumentGroup(id); await loadAll();
  };

  const activeDocs = docs.filter(d => d.active);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-1.5 overflow-x-auto [scrollbar-width:none]">
          {SUBTABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setSubTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0
                  ${subTab === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {subTab === "compliance" && (
        <EntityComplianceTab entity={entity} entityType={entityType} groups={groups} docs={docs}
          fieldSaving={fieldSaving} onToggle={onToggle} practiceRollup={practiceRollup} />
      )}
      {subTab === "groups" && (
        <GroupListTab groups={groups} allDocs={activeDocs} loading={loading}
          onAdd={() => setGroupModal({})} onEdit={g => setGroupModal(g)}
          onDelete={handleDeleteGroup} onRefresh={loadAll} navigate={navigate} />
      )}
      {subTab === "documents" && (
        <DocumentListTab docs={docs} loading={loading}
          onAdd={() => setDocModal({})} onEdit={d => setDocModal(d)}
          onDelete={handleDeleteDoc} onRefresh={loadAll} navigate={navigate} />
      )}

      {docModal !== null && (
        <DocModal existing={docModal?._id ? docModal : null} onClose={() => setDocModal(null)} onSave={handleSaveDoc} />
      )}
      {groupModal !== null && (
        <GroupModal existing={groupModal?._id ? groupModal : null} allDocs={activeDocs} onClose={() => setGroupModal(null)} onSave={handleSaveGroup} />
      )}
    </div>
  );
}