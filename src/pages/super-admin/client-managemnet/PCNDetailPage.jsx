import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Network, Building2, Layers, ChevronRight, ArrowLeft, RefreshCw,
  Users, DollarSign, FileCheck, Calendar, Stethoscope, MessageSquare,
  UserX, Mail, Check, X, Phone, AlertTriangle, Plus, Edit2, Trash2,
  Save, Hash, TrendingUp, Star, FileText, Download, Upload, Eye,
  Clock, CheckCircle2, XCircle, MoreVertical
} from "lucide-react";
import {
  getPCNById, updatePCN, getContactHistory,
  addContactHistory, updateContactHistory,
  toggleStarred, deleteContactHistory, upsertMonthlyMeeting
} from "../../../api/clientApi.js";
import ContactHistoryPanel from "../../../pages/super-admin/client-managemnet/ContactHistoryPanel.jsx";
import MassEmailModal from "../../../pages/super-admin/client-managemnet/MassEmailModal.jsx";

/* ────────────────────────────────────────────────
   SMALL HELPERS
──────────────────────────────────────────────── */
const Badge = ({ ok, label, onToggle, canEdit }) => (
  <button
    onClick={canEdit ? onToggle : undefined}
    disabled={!canEdit}
    className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-sm font-semibold transition-all w-full
      ${ok
        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
      } ${canEdit ? "cursor-pointer" : "cursor-default"}`}
  >
    {ok
      ? <CheckCircle2 size={15} className="text-green-600 shrink-0"/>
      : <XCircle size={15} className="text-slate-400 shrink-0"/>
    }
    <span className="truncate">{label}</span>
  </button>
);

const InputRow = ({ label, value, onChange, type = "text", options }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-36 shrink-0">{label}</span>
    {options ? (
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
      >
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-400 transition-all"
      />
    )}
  </div>
);

const ModalWrap = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
          <X size={15}/>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:thin]">
        {children}
      </div>
      {footer && (
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          {footer}
        </div>
      )}
    </div>
  </div>
);

const Spinner = ({ color = "blue" }) => (
  <div className={`w-4 h-4 border-2 border-${color}-600 border-t-transparent rounded-full animate-spin`}/>
);

/* ── Contact Modal ── */
const ContactModal = ({ existing, onClose, onSave }) => {
  const blank = { name:"", role:"", email:"", phone:"", type:"general", isPrimary:false };
  const [form, setForm] = useState(existing ? { ...existing } : blank);
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  const F = ({ label, k, type="text", options }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      {options ? (
        <select value={form[k]||""} onChange={e => setForm(f=>({...f,[k]:e.target.value}))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer">
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input type={type} value={form[k]||""} onChange={e => setForm(f=>({...f,[k]:e.target.value}))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"/>
      )}
    </div>
  );

  return (
    <ModalWrap
      title={existing?._id ? "Edit Contact" : "Add Contact"}
      onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
        <button onClick={handle} disabled={saving||!form.name.trim()}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {saving?<Spinner/>:<Check size={14}/>} Save
        </button>
      </>}
    >
      <F label="Name *" k="name"/>
      <F label="Role" k="role"/>
      <div className="grid grid-cols-2 gap-3">
        <F label="Email" k="email" type="email"/>
        <F label="Phone" k="phone"/>
      </div>
      <F label="Type" k="type" options={[
        {v:"general",l:"General"},{v:"decision_maker",l:"Decision Maker"},
        {v:"finance",l:"Finance"},{v:"clinical_lead",l:"Clinical Lead"},{v:"operations",l:"Operations"}
      ]}/>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!form.isPrimary} onChange={e=>setForm(f=>({...f,isPrimary:e.target.checked}))} className="accent-blue-600 w-4 h-4"/>
        <span className="text-sm text-slate-700 font-medium">Primary Contact</span>
      </label>
    </ModalWrap>
  );
};

/* ── Email Template Modal ── */
const TemplateModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({ name:"", subject:"", body:"", ...(existing||{}) });
  const [saving, setSaving] = useState(false);
  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };
  return (
    <ModalWrap title={existing?._id?"Edit Template":"Add Email Template"} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={handle} disabled={saving||!form.name.trim()}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving?<Spinner/>:<Check size={14}/>} Save
        </button>
      </>}
    >
      {["name","subject"].map(k => (
        <div key={k}>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{k.charAt(0).toUpperCase()+k.slice(1)} *</label>
          <input value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"/>
        </div>
      ))}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Body (HTML supported)</label>
        <textarea rows={8} value={form.body||""} onChange={e=>setForm(f=>({...f,body:e.target.value}))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none font-mono"/>
      </div>
    </ModalWrap>
  );
};

/* ── Meeting Modal ── */
const MeetingModal = ({ existing, pcnId, onClose, onSave }) => {
  const [form, setForm] = useState({
    month: existing?.month || new Date().toLocaleDateString("en-GB",{month:"short",year:"numeric"}).replace(" ","-"),
    date:  existing?.date ? new Date(existing.date).toISOString().split("T")[0] : "",
    type:  existing?.type || "monthly_review",
    status:existing?.status || "scheduled",
    notes: existing?.notes || "",
    attendees: existing?.attendees?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);
  const handle = async () => {
    setSaving(true);
    try {
      await onSave({ ...form, attendees: form.attendees.split(",").map(a=>a.trim()).filter(Boolean) });
      onClose();
    } finally { setSaving(false); }
  };
  const sel = (k, label, opts) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer transition-all">
        {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
  return (
    <ModalWrap title={existing?._id?"Edit Meeting":"Add Meeting"} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={handle} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving?<Spinner/>:<Check size={14}/>} Save
        </button>
      </>}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Month</label>
          <input value={form.month} onChange={e=>setForm(f=>({...f,month:e.target.value}))}
            placeholder="Jan-2026"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all"/>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
          <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all"/>
        </div>
      </div>
      {sel("type","Type",[["monthly_review","Monthly Review"],["clinician_meeting","Clinician Meeting"],["governance","Governance"],["other","Other"]])}
      {sel("status","Status",[["scheduled","Scheduled"],["completed","Completed"],["cancelled","Cancelled"],["not_booked","Not Booked"]])}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Attendees (comma separated)</label>
        <input value={form.attendees} onChange={e=>setForm(f=>({...f,attendees:e.target.value}))}
          placeholder="Dr. Smith, Jane Doe"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all"/>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
        <textarea rows={4} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all resize-none"/>
      </div>
    </ModalWrap>
  );
};

/* ── Contact type badge styles ── */
const CONTACT_TYPE_STYLE = {
  decision_maker: "bg-red-50 text-red-700 border-red-200",
  finance:        "bg-green-50 text-green-700 border-green-200",
  clinical_lead:  "bg-purple-50 text-purple-700 border-purple-200",
  operations:     "bg-blue-50 text-blue-700 border-blue-200",
  general:        "bg-slate-50 text-slate-600 border-slate-200",
};

/* ── Tabs ── */
const TABS = [
  { id:"overview",   label:"Overview",     icon:Network      },
  { id:"contacts",   label:"Contacts",     icon:Users        },
  { id:"compliance", label:"Compliance",   icon:FileCheck    },
  { id:"practices",  label:"Practices",    icon:Stethoscope  },
  { id:"meetings",   label:"Meetings",     icon:Calendar     },
  { id:"templates",  label:"Templates",    icon:FileText     },
  { id:"history",    label:"History",      icon:MessageSquare},
  { id:"restricted", label:"Restricted",   icon:UserX        },
];

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function PCNDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [pcn,       setPCN]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [tab,       setTab]       = useState("overview");
  const [massEmail, setMassEmail] = useState(false);

  const [contactModal,  setContactModal]  = useState(null);
  const [meetingModal,  setMeetingModal]  = useState(null);
  const [templateModal, setTemplateModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getPCNById(id);
      setPCN(d.pcn);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const patch = useCallback(async (body) => {
    setSaving(true);
    try {
      await updatePCN(id, body);
      await load();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }, [id, load]);

  const saveContact = async (form) => {
    const contacts = [...(pcn.contacts || [])];
    if (form._id) {
      const i = contacts.findIndex(c => c._id === form._id);
      if (i > -1) contacts[i] = { ...contacts[i], ...form };
    } else {
      contacts.push(form);
    }
    await patch({ contacts });
  };

  const deleteContact = async (cid) => {
    if (!confirm("Delete this contact?")) return;
    await patch({ contacts: pcn.contacts.filter(c => c._id !== cid) });
  };

  const toggleCompliance = async (key) => {
    await patch({ [key]: !pcn[key] });
  };

  const toggleSystem = async (sys) => {
    const rs = { ...(pcn.requiredSystems || {}), [sys]: !pcn.requiredSystems?.[sys] };
    await patch({ requiredSystems: rs });
  };

  const saveMeeting = async (form) => {
    await upsertMonthlyMeeting(id, form);
    await load();
  };

  const saveTemplate = async (form) => {
    const templates = [...(pcn.emailTemplates || [])];
    if (form._id) {
      const i = templates.findIndex(t => t._id === form._id);
      if (i > -1) templates[i] = { ...templates[i], ...form };
    } else {
      templates.push(form);
    }
    await patch({ emailTemplates: templates });
  };

  const deleteTemplate = async (tid) => {
    if (!confirm("Delete template?")) return;
    await patch({ emailTemplates: pcn.emailTemplates.filter(t => t._id !== tid) });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-[3px] border-purple-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!pcn) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400">
      <Network size={40} className="mb-3 opacity-30"/>
      <p className="font-semibold">PCN not found</p>
      <button onClick={() => navigate(-1)} className="mt-3 text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  /* ── OVERVIEW ── */
  const OverviewTab = () => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
      contractType:        pcn.contractType || "",
      annualSpend:         pcn.annualSpend || "",
      xeroCode:            pcn.xeroCode || "",
      xeroCategory:        pcn.xeroCategory || "",
      contractRenewalDate: pcn.contractRenewalDate ? new Date(pcn.contractRenewalDate).toISOString().split("T")[0] : "",
      contractExpiryDate:  pcn.contractExpiryDate  ? new Date(pcn.contractExpiryDate).toISOString().split("T")[0]  : "",
      notes:               pcn.notes || "",
    });

    const handleSave = async () => {
      await patch(form);
      setEditing(false);
    };

    const SYSTEMS = ["emis","systmOne","ice","accurx","docman","softphone","vpn"];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Contract & Finance</h3>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {editing ? <><Save size={12}/> Save</> : <><Edit2 size={12}/> Edit</>}
            </button>
          </div>

          {editing ? (
            <div className="space-y-0">
              <InputRow label="Contract Type" value={form.contractType} onChange={v=>setForm(f=>({...f,contractType:v}))} options={["ARRS","EA","Direct","Mixed"]}/>
              <InputRow label="Annual Spend £" value={form.annualSpend} onChange={v=>setForm(f=>({...f,annualSpend:v}))} type="number"/>
              <InputRow label="Xero Code" value={form.xeroCode} onChange={v=>setForm(f=>({...f,xeroCode:v}))}/>
              <InputRow label="Xero Category" value={form.xeroCategory} onChange={v=>setForm(f=>({...f,xeroCategory:v}))} options={["PCN","GPX","EAX"]}/>
              <InputRow label="Renewal Date" value={form.contractRenewalDate} onChange={v=>setForm(f=>({...f,contractRenewalDate:v}))} type="date"/>
              <InputRow label="Expiry Date" value={form.contractExpiryDate} onChange={v=>setForm(f=>({...f,contractExpiryDate:v}))} type="date"/>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Notes</span>
                <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all resize-none"/>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {[
                ["ICB",             pcn.icb?.name],
                ["Federation",      pcn.federation?.name || pcn.federationName || "—"],
                ["Contract Type",   pcn.contractType || "—"],
                ["Annual Spend",    pcn.annualSpend ? `£${Number(pcn.annualSpend).toLocaleString()}` : "—"],
                ["Xero Code",       pcn.xeroCode || "—"],
                ["Xero Category",   pcn.xeroCategory || "—"],
                ["Renewal Date",    pcn.contractRenewalDate ? new Date(pcn.contractRenewalDate).toLocaleDateString("en-GB") : "—"],
                ["Expiry Date",     pcn.contractExpiryDate  ? new Date(pcn.contractExpiryDate).toLocaleDateString("en-GB")  : "—"],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between gap-2 py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500 font-medium">{l}</span>
                  <span className="text-sm text-slate-800 font-semibold text-right max-w-[60%] truncate">{v}</span>
                </div>
              ))}
              {pcn.notes && (
                <div className="pt-3 mt-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{pcn.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Required Systems</h3>
          <div className="grid grid-cols-2 gap-2">
            {SYSTEMS.map(sys => (
              <Badge
                key={sys}
                ok={!!pcn.requiredSystems?.[sys]}
                label={sys === "systmOne" ? "SystmOne" : sys.charAt(0).toUpperCase() + sys.slice(1)}
                onToggle={() => toggleSystem(sys)}
                canEdit={true}
              />
            ))}
          </div>
          {pcn.requiredSystems?.other && (
            <p className="text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">Other: {pcn.requiredSystems.other}</p>
          )}
          {saving && <p className="text-xs text-blue-500 mt-2 animate-pulse">Saving…</p>}
        </div>
      </div>
    );
  };

  /* ── CONTACTS ── */
  const ContactsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          {(pcn.contacts||[]).length} Contact{(pcn.contacts||[]).length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setMassEmail(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-all">
            <Mail size={13}/> Mass Email
          </button>
          <button onClick={() => setContactModal({})}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
            <Plus size={13}/> Add Contact
          </button>
        </div>
      </div>

      {(pcn.contacts||[]).length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-12 flex flex-col items-center text-slate-400">
          <Users size={28} className="mb-2 opacity-40"/>
          <p className="text-sm font-medium">No contacts yet</p>
          <button onClick={() => setContactModal({})} className="mt-2 text-blue-600 text-sm font-bold hover:underline">Add first contact</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {(pcn.contacts||[]).map(c => (
            <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 group hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{c.role}</p>
                </div>
                {c.type && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md border capitalize shrink-0 ${CONTACT_TYPE_STYLE[c.type]||CONTACT_TYPE_STYLE.general}`}>
                    {c.type.replace("_"," ")}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 mb-3">
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors truncate">
                    <Mail size={11} className="shrink-0"/> {c.email}
                  </a>
                )}
                {c.phone && (
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={11} className="shrink-0"/> {c.phone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-slate-100">
                <button onClick={() => setContactModal(c)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all">
                  <Edit2 size={11}/> Edit
                </button>
                <button onClick={() => deleteContact(c._id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={11}/> Delete
                </button>
                {c.isPrimary && (
                  <span className="ml-auto text-xs bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded-md border border-amber-200">Primary</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── COMPLIANCE ── */
  const ComplianceTab = () => {
    const checks = [
      { key:"ndaSigned",       label:"NDA Signed"        },
      { key:"dsaSigned",       label:"DSA Signed"        },
      { key:"mouReceived",     label:"MOU Received"      },
      { key:"welcomePackSent", label:"Welcome Pack Sent" },
    ];
    const done = checks.filter(c => pcn[c.key]).length;
    const pct  = Math.round((done / checks.length) * 100);

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">PCN Compliance Score</h3>
            <span className={`text-2xl font-bold ${pct===100?"text-green-600":pct>=50?"text-amber-500":"text-red-500"}`}>{pct}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct===100?"bg-green-500":pct>=50?"bg-amber-500":"bg-red-500"}`}
              style={{width:`${pct}%`}}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{done} of {checks.length} items completed · Click to toggle</p>
        </div>

        {saving && (
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium animate-pulse">
            <Spinner/> Saving…
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {checks.map(c => (
            <Badge key={c.key} ok={!!pcn[c.key]} label={c.label} onToggle={() => toggleCompliance(c.key)} canEdit={true}/>
          ))}
        </div>
      </div>
    );
  };

  /* ── PRACTICES ── */
  const PracticesTab = () => {
    const practices = pcn.practices || [];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {practices.length} Practice{practices.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => navigate("/dashboard/super-admin/clients/practice")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-all">
            <Plus size={13}/> Add Practice
          </button>
        </div>

        {practices.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-12 flex flex-col items-center text-slate-400">
            <Stethoscope size={28} className="mb-2 opacity-40"/>
            <p className="text-sm font-medium">No practices linked</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {practices.map(p => (
              <button key={p._id}
                onClick={() => navigate(`/dashboard/super-admin/clients/practice/${p._id}`)}
                className="w-full bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all px-4 py-3.5 flex items-center gap-4 group text-left">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Stethoscope size={17} className="text-teal-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {[p.odsCode && `ODS: ${p.odsCode}`, p.fte, p.contractType].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <ChevronRight size={15} className="text-slate-300 group-hover:text-teal-500 transition-colors shrink-0"/>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── MEETINGS ── */
  const MeetingsTab = () => {
    const meetings = pcn.monthlyMeetings || [];
    const STATUS_STYLE = {
      scheduled:  "bg-blue-50 text-blue-700 border-blue-200",
      completed:  "bg-green-50 text-green-700 border-green-200",
      cancelled:  "bg-red-50 text-red-700 border-red-200",
      not_booked: "bg-slate-50 text-slate-500 border-slate-200",
    };
    const TYPE_LABEL = {
      monthly_review: "Monthly Review",
      clinician_meeting: "Clinician Meeting",
      governance: "Governance",
      other: "Other",
    };
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {meetings.length} Meeting record{meetings.length !== 1 ? "s" : ""}
          </p>
          <button onClick={() => setMeetingModal({})}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
            <Plus size={13}/> Add Meeting
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-12 flex flex-col items-center text-slate-400">
            <Calendar size={28} className="mb-2 opacity-40"/>
            <p className="text-sm font-medium">No meetings logged</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {[...meetings].sort((a,b) => new Date(b.date||0) - new Date(a.date||0)).map(m => (
              <div key={m._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar size={17} className="text-blue-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{m.month}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${STATUS_STYLE[m.status]||STATUS_STYLE.not_booked}`}>
                      {m.status?.replace("_"," ")}
                    </span>
                    <span className="text-xs text-slate-400">{TYPE_LABEL[m.type]||m.type}</span>
                  </div>
                  {m.date && <p className="text-xs text-slate-500 mt-1">{new Date(m.date).toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}</p>}
                  {m.notes && <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{m.notes}</p>}
                  {m.attendees?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1.5">👥 {m.attendees.join(", ")}</p>
                  )}
                </div>
                <button onClick={() => setMeetingModal(m)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                  <Edit2 size={13}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── TEMPLATES ── */
  const TemplatesTab = () => {
    const templates = pcn.emailTemplates || [];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {templates.length} Template{templates.length !== 1 ? "s" : ""}
          </p>
          <button onClick={() => setTemplateModal({})}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
            <Plus size={13}/> Add Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-12 flex flex-col items-center text-slate-400">
            <FileText size={28} className="mb-2 opacity-40"/>
            <p className="text-sm font-medium">No email templates</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {templates.map(t => (
              <div key={t._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Subject: {t.subject}</p>
                    {t.body && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 bg-slate-50 rounded-lg p-2">
                        {t.body.replace(/<[^>]+>/g,"")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setTemplateModal(t)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <Edit2 size={13}/>
                    </button>
                    <button onClick={() => deleteTemplate(t._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── RESTRICTED ── */
  const RestrictedTab = () => {
    const restricted = pcn.restrictedClinicians || [];
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5"/>
          <p className="text-sm text-red-700 leading-relaxed">
            These clinicians are <strong>restricted or unsuitable</strong> for this PCN.
            They will not be scheduled for any sessions here.
          </p>
        </div>

        {restricted.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-12 flex flex-col items-center text-slate-400">
            <UserX size={28} className="mb-2 opacity-40"/>
            <p className="text-sm font-medium">No restricted clinicians</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {restricted.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-red-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <UserX size={17} className="text-red-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.email} · <span className="capitalize">{c.role}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TAB_CONTENT = {
    overview:   <OverviewTab/>,
    contacts:   <ContactsTab/>,
    compliance: <ComplianceTab/>,
    practices:  <PracticesTab/>,
    meetings:   <MeetingsTab/>,
    templates:  <TemplatesTab/>,
    history:    <ContactHistoryPanel entityType="PCN" entityId={pcn._id}/>,
    restricted: <RestrictedTab/>,
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm flex-wrap">
        {[
          { label:"Client Management", path:"/dashboard/super-admin/clients" },
          { label:"PCNs",              path:"/dashboard/super-admin/clients/pcn" },
        ].map((crumb,i) => (
          <span key={i} className="flex items-center gap-1.5">
            <button onClick={() => navigate(crumb.path)} className="text-slate-400 hover:text-blue-600 transition-colors font-medium">{crumb.label}</button>
            <ChevronRight size={13} className="text-slate-300"/>
          </span>
        ))}
        <span className="text-slate-700 font-semibold truncate">{pcn.name}</span>
      </nav>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
            <Network size={22} className="text-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800 leading-tight">{pcn.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {pcn.icb?.name && (
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Building2 size={12}/> {pcn.icb.name}
                </span>
              )}
              {(pcn.federation?.name || pcn.federationName) && (
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Layers size={12}/> {pcn.federation?.name || pcn.federationName}
                </span>
              )}
              {pcn.contractType && (
                <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-200">
                  {pcn.contractType}
                </span>
              )}
              {pcn.annualSpend > 0 && (
                <span className="text-sm text-green-600 font-bold">
                  £{Number(pcn.annualSpend).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saving && <span className="text-sm text-blue-500 font-medium animate-pulse">Saving…</span>}
            <button onClick={load} title="Refresh"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all">
              <RefreshCw size={14}/>
            </button>
            <button onClick={() => navigate("/dashboard/super-admin/clients/pcn")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <ArrowLeft size={13}/> Back
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-1.5 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0
                  ${tab === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                <Icon size={14}/>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>{TAB_CONTENT[tab]}</div>

      {/* Modals */}
      {contactModal !== null && (
        <ContactModal
          existing={contactModal?._id ? contactModal : null}
          onClose={() => setContactModal(null)}
          onSave={saveContact}
        />
      )}
      {meetingModal !== null && (
        <MeetingModal
          existing={meetingModal?._id ? meetingModal : null}
          pcnId={id}
          onClose={() => setMeetingModal(null)}
          onSave={saveMeeting}
        />
      )}
      {templateModal !== null && (
        <TemplateModal
          existing={templateModal?._id ? templateModal : null}
          onClose={() => setTemplateModal(null)}
          onSave={saveTemplate}
        />
      )}
      {massEmail && (
        <MassEmailModal
          entityType="PCN"
          entityId={pcn._id}
          contacts={pcn.contacts || []}
          onClose={() => setMassEmail(false)}
        />
      )}
    </div>
  );
}