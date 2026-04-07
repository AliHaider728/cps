import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Network, Building2, Layers, ChevronRight, ArrowLeft, RefreshCw,
  Users, FileCheck, Calendar, Stethoscope, MessageSquare,
  UserX, Mail, Check, X, Phone, AlertTriangle, Plus, Edit2, Trash2,
  Save, FileText, CheckCircle2, XCircle, Hash, DollarSign, Clock
} from "lucide-react";
import { usePCN, useUpdatePCN, useUpsertMeeting } from "../../../hooks/usePCN";
import ContactHistoryPanel from "./ContactHistoryPanel.jsx";
import MassEmailModal from "./MassEmailModal.jsx";
import EntityDocumentsTab from "./EntityDocumentsTab.jsx";

/* ══════════════════════════════════════════════════════════
   SHARED UI ATOMS
══════════════════════════════════════════════════════════ */
const Spinner = ({ cls = "border-white" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);

const ModalShell = ({ title, onClose, children, footer, wide }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] w-full ${wide ? "max-w-2xl" : "max-w-lg"}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:thin]">{children}</div>
      {footer && <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">{footer}</div>}
    </div>
  </div>
);

const Btn = ({ onClick, disabled, variant = "primary", size = "md", children, cls = "" }) => {
  const V = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    teal:    "bg-teal-600 text-white hover:bg-teal-700",
    ghost:   "border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger:  "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  };
  const S = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${V[variant]} ${S[size]} ${cls}`}>
      {children}
    </button>
  );
};

const CompBadge = ({ ok, label, onToggle, saving }) => (
  <button onClick={onToggle} disabled={saving}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all w-full text-left
      ${ok ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}
      ${saving ? "opacity-60 cursor-wait" : "cursor-pointer"}`}>
    {saving ? <Spinner cls="border-slate-400" /> : ok
      ? <CheckCircle2 size={16} className="text-green-600 shrink-0" />
      : <XCircle size={16} className="text-slate-400 shrink-0" />}
    <span className="flex-1 truncate">{label}</span>
  </button>
);

const EditRow = ({ label, value, onChange, type = "text", options }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-40 shrink-0">{label}</span>
    {options ? (
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all" />
    )}
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className="text-sm text-slate-800 font-semibold text-right truncate max-w-[55%]">{value || "—"}</span>
  </div>
);

const C_TYPE = {
  decision_maker: "bg-red-50 text-red-700 border-red-200",
  finance:        "bg-green-50 text-green-700 border-green-200",
  clinical_lead:  "bg-purple-50 text-purple-700 border-purple-200",
  operations:     "bg-blue-50 text-blue-700 border-blue-200",
  general:        "bg-slate-50 text-slate-600 border-slate-200",
};

const M_STATUS = {
  scheduled:  "bg-blue-50 text-blue-700 border-blue-200",
  completed:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
  not_booked: "bg-slate-50 text-slate-500 border-slate-200",
};

/* ══════════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════════ */
const ContactModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "", type: "general", isPrimary: false, ...(existing || {}) });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } catch (e) { alert(e.message); } finally { setSaving(false); }
  };
  const Field = ({ label, k, type = "text", opts }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      {opts
        ? <select value={form[k] || ""} onChange={e => set(k)(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        : <input type={type} value={form[k] || ""} onChange={e => set(k)(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />}
    </div>
  );
  return (
    <ModalShell title={existing?._id ? "Edit Contact" : "Add Contact"} onClose={onClose}
      footer={<><Btn variant="ghost" cls="flex-1" onClick={onClose}>Cancel</Btn><Btn cls="flex-1" onClick={handle} disabled={saving || !form.name.trim()}>{saving ? <Spinner /> : <Check size={14} />} Save</Btn></>}>
      <Field label="Name *" k="name" />
      <Field label="Role" k="role" />
      <div className="grid grid-cols-2 gap-3"><Field label="Email" k="email" type="email" /><Field label="Phone" k="phone" /></div>
      <Field label="Type" k="type" opts={[["general","General"],["decision_maker","Decision Maker"],["finance","Finance"],["clinical_lead","Clinical Lead"],["operations","Operations"]]} />
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" checked={!!form.isPrimary} onChange={e => set("isPrimary")(e.target.checked)} className="accent-blue-600 w-4 h-4" />
        <span className="text-sm text-slate-700 font-medium">Primary Contact</span>
      </label>
    </ModalShell>
  );
};

const MeetingModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({
    month: existing?.month || "",
    date: existing?.date ? new Date(existing.date).toISOString().split("T")[0] : "",
    type: existing?.type || "monthly_review",
    status: existing?.status || "scheduled",
    notes: existing?.notes || "",
    attendees: existing?.attendees?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const handle = async () => {
    setSaving(true);
    try { await onSave({ ...form, attendees: form.attendees.split(",").map(a => a.trim()).filter(Boolean) }); onClose(); }
    catch (e) { alert(e.message); } finally { setSaving(false); }
  };
  const Sel = ({ label, k, opts }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <select value={form[k]} onChange={e => set(k)(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
  return (
    <ModalShell title={existing?._id ? "Edit Meeting" : "Add Meeting"} onClose={onClose}
      footer={<><Btn variant="ghost" cls="flex-1" onClick={onClose}>Cancel</Btn><Btn cls="flex-1" onClick={handle} disabled={saving}>{saving ? <Spinner /> : <Check size={14} />} Save</Btn></>}>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Month</label><input value={form.month} onChange={e => set("month")(e.target.value)} placeholder="Apr-2026" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label><input type="date" value={form.date} onChange={e => set("date")(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" /></div>
      </div>
      <Sel label="Meeting Type" k="type" opts={[["monthly_review","Monthly Review"],["clinician_meeting","Clinician Meeting"],["governance","Governance"],["other","Other"]]} />
      <Sel label="Status" k="status" opts={[["scheduled","Scheduled"],["completed","Completed"],["cancelled","Cancelled"],["not_booked","Not Booked"]]} />
      <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Attendees (comma separated)</label><input value={form.attendees} onChange={e => set("attendees")(e.target.value)} placeholder="Dr. Smith, Jane Doe" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" /></div>
      <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label><textarea rows={4} value={form.notes} onChange={e => set("notes")(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 resize-none" /></div>
    </ModalShell>
  );
};

const TemplateModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({ name: "", subject: "", body: "", ...(existing || {}) });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } catch (e) { alert(e.message); } finally { setSaving(false); }
  };
  return (
    <ModalShell wide title={existing?._id ? "Edit Template" : "Add Email Template"} onClose={onClose}
      footer={<><Btn variant="ghost" cls="flex-1" onClick={onClose}>Cancel</Btn><Btn cls="flex-1" onClick={handle} disabled={saving || !form.name.trim()}>{saving ? <Spinner /> : <Check size={14} />} Save</Btn></>}>
      {["name","subject"].map(k => (
        <div key={k}><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{k} *</label><input value={form[k] || ""} onChange={e => set(k)(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white" /></div>
      ))}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Body <span className="normal-case font-normal text-slate-400">(HTML supported)</span></label>
        <textarea rows={10} value={form.body || ""} onChange={e => set("body")(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white resize-none font-mono" />
      </div>
    </ModalShell>
  );
};

/* ══════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════ */
const TABS = [
  { id: "overview",   label: "Overview",   icon: Network       },
  { id: "contacts",   label: "Contacts",   icon: Users         },
  { id: "documents",  label: "Documents",  icon: FileCheck     },
  { id: "practices",  label: "Practices",  icon: Stethoscope   },
  { id: "meetings",   label: "Meetings",   icon: Calendar      },
  { id: "templates",  label: "Templates",  icon: FileText      },
  { id: "history",    label: "History",    icon: MessageSquare },
  { id: "restricted", label: "Restricted", icon: UserX         },
];

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function PCNDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = usePCN(id);
  const updatePCNMutation     = useUpdatePCN();
  const upsertMeetingMutation = useUpsertMeeting(id);

  const pcn = data?.pcn ?? null;

  const [tab,           setTab]           = useState("overview");
  const [fieldSaving,   setFieldSaving]   = useState({});
  const [massEmail,     setMassEmail]     = useState(false);
  const [contactModal,  setContactModal]  = useState(null);
  const [meetingModal,  setMeetingModal]  = useState(null);
  const [templateModal, setTemplateModal] = useState(null);

  const patch = useCallback(async (body, fieldKey) => {
    if (fieldKey) setFieldSaving(s => ({ ...s, [fieldKey]: true }));
    try { await updatePCNMutation.mutateAsync({ id, data: body }); }
    catch (e) { alert(e.message); }
    finally { if (fieldKey) setFieldSaving(s => ({ ...s, [fieldKey]: false })); }
  }, [id, updatePCNMutation]);

  const toggleSystem = useCallback(async (sys) => {
    const rs = { ...(pcn?.requiredSystems || {}), [sys]: !pcn?.requiredSystems?.[sys] };
    await patch({ requiredSystems: rs }, `sys_${sys}`);
  }, [pcn, patch]);

  const saveContact = async (form) => {
    const contacts = [...(pcn?.contacts || [])];
    if (form._id) { const i = contacts.findIndex(c => c._id === form._id); if (i > -1) contacts[i] = { ...contacts[i], ...form }; }
    else contacts.push(form);
    await patch({ contacts });
  };
  const deleteContact = async (cid) => {
    if (!confirm("Delete this contact?")) return;
    await patch({ contacts: (pcn?.contacts || []).filter(c => c._id !== cid) });
  };

  const saveMeeting = async (form) => {
    await upsertMeetingMutation.mutateAsync(form);
    await refetch();
  };

  const saveTemplate = async (form) => {
    const templates = [...(pcn?.emailTemplates || [])];
    if (form._id) { const i = templates.findIndex(t => t._id === form._id); if (i > -1) templates[i] = { ...templates[i], ...form }; }
    else templates.push(form);
    await patch({ emailTemplates: templates });
  };
  const deleteTemplate = async (tid) => {
    if (!confirm("Delete template?")) return;
    await patch({ emailTemplates: (pcn?.emailTemplates || []).filter(t => t._id !== tid) });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-9 h-9 border-[3px] border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!pcn) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
      <Network size={44} className="opacity-30" />
      <p className="font-semibold text-base">PCN not found</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  /* ════════════ TAB PANELS ════════════════════════════════ */

  const OverviewPanel = () => {
    const [editing, setEditing] = useState(false);
    const [saving,  setSaving]  = useState(false);
    const [form, setForm] = useState({
      contractType: pcn.contractType || "", annualSpend: pcn.annualSpend || "",
      xeroCode: pcn.xeroCode || "", xeroCategory: pcn.xeroCategory || "",
      contractRenewalDate: pcn.contractRenewalDate ? new Date(pcn.contractRenewalDate).toISOString().split("T")[0] : "",
      contractExpiryDate:  pcn.contractExpiryDate  ? new Date(pcn.contractExpiryDate).toISOString().split("T")[0]  : "",
      notes: pcn.notes || "",
    });
    const set = k => v => setForm(f => ({ ...f, [k]: v }));
    const handleSave = async () => { setSaving(true); try { await patch(form); setEditing(false); } finally { setSaving(false); } };
    const SYSTEMS = ["emis","systmOne","ice","accurx","docman","softphone","vpn"];
    const SYS_LABEL = { systmOne:"SystmOne", emis:"EMIS", ice:"ICE", accurx:"AccuRx", docman:"Docman", softphone:"Softphone", vpn:"VPN" };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Contract & Finance</h3>
            <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {saving ? <Spinner cls="border-white" /> : editing ? <><Save size={12} /> Save</> : <><Edit2 size={12} /> Edit</>}
            </button>
          </div>
          {editing ? (
            <div>
              <EditRow label="Contract Type"  value={form.contractType}        onChange={set("contractType")}        options={["ARRS","EA","Direct","Mixed"]} />
              <EditRow label="Annual Spend £" value={form.annualSpend}         onChange={set("annualSpend")}         type="number" />
              <EditRow label="Xero Code"      value={form.xeroCode}            onChange={set("xeroCode")} />
              <EditRow label="Xero Category"  value={form.xeroCategory}        onChange={set("xeroCategory")}        options={["PCN","GPX","EAX"]} />
              <EditRow label="Renewal Date"   value={form.contractRenewalDate} onChange={set("contractRenewalDate")} type="date" />
              <EditRow label="Expiry Date"    value={form.contractExpiryDate}  onChange={set("contractExpiryDate")}  type="date" />
              <div className="pt-3"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Notes</span>
                <textarea rows={3} value={form.notes} onChange={e => set("notes")(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none transition-all" /></div>
            </div>
          ) : (
            <div>
              <DetailRow label="ICB"           value={pcn.icb?.name} />
              <DetailRow label="Federation"    value={pcn.federation?.name || pcn.federationName} />
              <DetailRow label="Contract Type" value={pcn.contractType} />
              <DetailRow label="Annual Spend"  value={pcn.annualSpend ? `£${Number(pcn.annualSpend).toLocaleString()}` : null} />
              <DetailRow label="Xero Code"     value={pcn.xeroCode} />
              <DetailRow label="Xero Category" value={pcn.xeroCategory} />
              <DetailRow label="Renewal Date"  value={pcn.contractRenewalDate ? new Date(pcn.contractRenewalDate).toLocaleDateString("en-GB") : null} />
              <DetailRow label="Expiry Date"   value={pcn.contractExpiryDate  ? new Date(pcn.contractExpiryDate).toLocaleDateString("en-GB")  : null} />
              {pcn.notes && <div className="pt-4 mt-2 border-t border-slate-50"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p><p className="text-sm text-slate-600 leading-relaxed">{pcn.notes}</p></div>}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Required Systems</h3>
          <p className="text-xs text-slate-400 mb-4">Click any system to toggle</p>
          <div className="grid grid-cols-2 gap-2">
            {SYSTEMS.map(sys => (
              <CompBadge key={sys} ok={!!pcn.requiredSystems?.[sys]} label={SYS_LABEL[sys] || sys}
                onToggle={() => toggleSystem(sys)} saving={!!fieldSaving[`sys_${sys}`]} />
            ))}
          </div>
          {pcn.requiredSystems?.other && <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">Other: {pcn.requiredSystems.other}</p>}
        </div>
      </div>
    );
  };

  const ContactsPanel = () => {
    const contacts = pcn.contacts || [];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{contacts.length} Contact{contacts.length !== 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" onClick={() => setMassEmail(true)}><Mail size={13} /> Mass Email</Btn>
            <Btn size="sm" onClick={() => setContactModal({})}><Plus size={13} /> Add Contact</Btn>
          </div>
        </div>
        {contacts.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <Users size={32} className="opacity-40" /><p className="font-semibold">No contacts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {contacts.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 group hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1"><p className="text-[15px] font-bold text-slate-800 truncate">{c.name}</p><p className="text-xs text-slate-500 mt-0.5">{c.role}</p></div>
                  {c.type && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize shrink-0 ${C_TYPE[c.type] || C_TYPE.general}`}>{c.type.replace("_"," ")}</span>}
                </div>
                <div className="space-y-1.5 mb-3">
                  {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 truncate"><Mail size={12} className="shrink-0" /> {c.email}</a>}
                  {c.phone && <p className="flex items-center gap-2 text-sm text-slate-500"><Phone size={12} className="shrink-0" /> {c.phone}</p>}
                </div>
                <div className="flex items-center pt-2.5 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.isPrimary && <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-md border border-amber-200 mr-2">Primary</span>}
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => setContactModal(c)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50"><Edit2 size={11} /> Edit</button>
                    <button onClick={() => deleteContact(c._id)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50"><Trash2 size={11} /> Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ✅ UPDATED: sirf entityType + entity pass ho raha hai
  const DocumentsPanel = () => (
    <EntityDocumentsTab
      entityType="PCN"
      entityId={pcn._id}
      currentGroupId={pcn.complianceGroup?._id || pcn.complianceGroup || ""}
      onChangeGroup={(complianceGroup) => patch({ complianceGroup })}
      accent="blue"
    />
  );

  const PracticesPanel = () => {
    const practices = pcn.practices || [];
    const totalFTE = practices.reduce((s, p) => { const n = parseFloat(p.fte); return s + (isNaN(n) ? 0 : n); }, 0);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{practices.length} Practice{practices.length !== 1 ? "s" : ""}</p>
            {totalFTE > 0 && <p className="text-xs text-slate-400 mt-0.5">Total FTE: {totalFTE.toFixed(1)}</p>}
          </div>
          <Btn variant="teal" size="sm" onClick={() => navigate(`/dashboard/super-admin/clients/practice?pcn=${id}`)}><Plus size={13} /> Add Practice</Btn>
        </div>
        {practices.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Practices",  value: practices.length,                                  color: "bg-teal-50 text-teal-700"    },
              { label: "NDA Signed", value: practices.filter(p => p.ndaSigned).length,         color: "bg-green-50 text-green-700"  },
              { label: "Templates",  value: practices.filter(p => p.templateInstalled).length, color: "bg-blue-50 text-blue-700"    },
              { label: "Reports",    value: practices.filter(p => p.reportsImported).length,   color: "bg-purple-50 text-purple-700" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl px-3 py-2.5 text-center ${s.color}`}>
                <p className="text-xl font-bold">{s.value}</p><p className="text-xs font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        {practices.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <Stethoscope size={32} className="opacity-40" /><p className="font-semibold">No practices linked</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {practices.map(p => {
              const compScore = [p.ndaSigned,p.dsaSigned,p.mouReceived,p.welcomePackSent,p.mobilisationPlanSent,p.templateInstalled,p.reportsImported].filter(Boolean).length;
              const compPct   = Math.round((compScore / 7) * 100);
              return (
                <button key={p._id} onClick={() => navigate(`/dashboard/super-admin/clients/practice/${p._id}`)}
                  className="w-full bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all px-4 py-4 flex items-center gap-4 group text-left">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0"><Stethoscope size={17} className="text-teal-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{[p.odsCode && `ODS: ${p.odsCode}`, p.fte, p.contractType].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${compPct === 100 ? "text-green-600" : compPct >= 50 ? "text-amber-500" : "text-red-500"}`}>{compPct}%</p>
                      <p className="text-[10px] text-slate-400">compliance</p>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const MeetingsPanel = () => {
    const meetings = [...(pcn.monthlyMeetings || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    const TYPE_LABEL = { monthly_review:"Monthly Review", clinician_meeting:"Clinician Meeting", governance:"Governance", other:"Other" };
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{meetings.length} Meeting{meetings.length !== 1 ? "s" : ""} logged</p>
          <Btn size="sm" onClick={() => setMeetingModal({})}><Plus size={13} /> Add Meeting</Btn>
        </div>
        {meetings.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <Calendar size={32} className="opacity-40" /><p className="font-semibold">No meetings logged yet</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {meetings.map(m => (
              <div key={m._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><Calendar size={17} className="text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[15px] font-bold text-slate-800">{m.month}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${M_STATUS[m.status] || M_STATUS.not_booked}`}>{m.status?.replace("_"," ")}</span>
                    <span className="text-xs text-slate-400">{TYPE_LABEL[m.type] || m.type}</span>
                  </div>
                  {m.date && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={10} />{new Date(m.date).toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}</p>}
                  {m.notes && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{m.notes}</p>}
                  {m.attendees?.length > 0 && <p className="text-xs text-slate-400 mt-1.5">👥 {m.attendees.join(", ")}</p>}
                </div>
                <button onClick={() => setMeetingModal(m)} className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 shrink-0"><Edit2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TemplatesPanel = () => {
    const templates = pcn.emailTemplates || [];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{templates.length} Template{templates.length !== 1 ? "s" : ""}</p>
          <Btn size="sm" onClick={() => setTemplateModal({})}><Plus size={13} /> Add Template</Btn>
        </div>
        {templates.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <FileText size={32} className="opacity-40" /><p className="font-semibold">No email templates yet</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {templates.map(t => (
              <div key={t._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 group hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-slate-800">{t.name}</p>
                    <p className="text-sm text-slate-500 mt-1">Subject: {t.subject}</p>
                    {t.body && <p className="text-xs text-slate-400 mt-2 line-clamp-2 bg-slate-50 rounded-lg p-2.5 font-mono">{t.body.replace(/<[^>]+>/g,"")}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setTemplateModal(t)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 size={14} /></button>
                    <button onClick={() => deleteTemplate(t._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const RestrictedPanel = () => {
    const restricted = pcn.restrictedClinicians || [];
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div><p className="text-sm font-bold text-red-700">Restricted / Unsuitable Clinicians</p><p className="text-xs text-red-600 mt-0.5 leading-relaxed">These clinicians are flagged as unsuitable for this PCN.</p></div>
        </div>
        {restricted.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <UserX size={32} className="opacity-40" /><p className="font-semibold">No restricted clinicians</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {restricted.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-red-100 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><UserX size={17} className="text-red-500" /></div>
                <div className="min-w-0"><p className="text-[15px] font-bold text-slate-800">{c.name}</p><p className="text-xs text-slate-400 mt-0.5">{c.email} · <span className="capitalize">{c.role}</span></p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const PANELS = {
    overview:   <OverviewPanel />,
    contacts:   <ContactsPanel />,
    documents:  <DocumentsPanel />,
    practices:  <PracticesPanel />,
    meetings:   <MeetingsPanel />,
    templates:  <TemplatesPanel />,
    history:    <ContactHistoryPanel entityType="PCN" entityId={pcn._id} />,
    restricted: <RestrictedPanel />,
  };

  return (
    <div className="space-y-4 pb-8">
      <nav className="flex items-center gap-1.5 text-sm flex-wrap">
        {[{ label:"Client Management", path:"/dashboard/super-admin/clients" }, { label:"PCNs", path:"/dashboard/super-admin/clients/pcn" }].map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <button onClick={() => navigate(c.path)} className="text-slate-400 hover:text-blue-600 font-medium transition-colors">{c.label}</button>
            <ChevronRight size={13} className="text-slate-300" />
          </span>
        ))}
        <span className="text-slate-700 font-bold truncate">{pcn.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0"><Network size={22} className="text-white" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">{pcn.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {pcn.icb?.name && <span className="text-sm text-slate-400 flex items-center gap-1"><Building2 size={12} /> {pcn.icb.name}</span>}
              {(pcn.federation?.name || pcn.federationName) && <span className="text-sm text-slate-400 flex items-center gap-1"><Layers size={12} /> {pcn.federation?.name || pcn.federationName}</span>}
              {pcn.contractType && <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-200">{pcn.contractType}</span>}
              {pcn.annualSpend > 0 && <span className="text-sm text-green-600 font-bold flex items-center gap-1"><DollarSign size={12} />£{Number(pcn.annualSpend).toLocaleString()}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => refetch()} title="Refresh" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"><RefreshCw size={15} /></button>
            <Btn variant="ghost" size="sm" onClick={() => navigate("/dashboard/super-admin/clients/pcn")}><ArrowLeft size={13} /> Back</Btn>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-2 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {TABS.map(t => { const Icon = t.icon; return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${tab === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
              <Icon size={14} /> {t.label}
            </button>
          ); })}
        </div>
      </div>

      <div>{PANELS[tab]}</div>

      {contactModal  !== null && <ContactModal  existing={contactModal?._id  ? contactModal  : null} onClose={() => setContactModal(null)}  onSave={saveContact}  />}
      {meetingModal  !== null && <MeetingModal  existing={meetingModal?._id  ? meetingModal  : null} onClose={() => setMeetingModal(null)}  onSave={saveMeeting}  />}
      {templateModal !== null && <TemplateModal existing={templateModal?._id ? templateModal : null} onClose={() => setTemplateModal(null)} onSave={saveTemplate} />}
      {massEmail && <MassEmailModal entityType="PCN" entityId={pcn._id} contacts={pcn.contacts || []} onClose={() => setMassEmail(false)} />}
    </div>
  );
}
