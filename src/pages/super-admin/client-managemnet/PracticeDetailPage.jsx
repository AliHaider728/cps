import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Stethoscope, Network, ChevronRight, ArrowLeft, RefreshCw,
  Users, FileCheck, MessageSquare, UserX, Mail, Check, X,
  Phone, AlertTriangle, Plus, Edit2, Trash2, Save,
  Wifi, Activity, Hash, MapPin, CheckCircle2, XCircle
} from "lucide-react";
import { getPracticeById, updatePractice } from "../../../api/clientApi.js";
import ContactHistoryPanel from "../../../pages/super-admin/client-managemnet/ContactHistoryPanel.jsx";
import MassEmailModal from "../../../pages/super-admin/client-managemnet/MassEmailModal.jsx";

/* ── Helpers ── */
const Badge = ({ ok, label, onToggle, canEdit }) => (
  <button onClick={canEdit ? onToggle : undefined} disabled={!canEdit}
    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all w-full
      ${ok ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}
      ${canEdit ? "cursor-pointer" : "cursor-default"}`}>
    {ok ? <CheckCircle2 size={15} className="text-green-600 shrink-0"/> : <XCircle size={15} className="text-slate-400 shrink-0"/>}
    <span className="truncate text-left">{label}</span>
  </button>
);

const Spinner = () => (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
);

const ModalWrap = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:thin]">{children}</div>
      {footer && (
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">{footer}</div>
      )}
    </div>
  </div>
);

/* ── Contact Modal ── */
const ContactModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({ name:"", role:"", email:"", phone:"", type:"general", isDecisionMaker:false, ...(existing||{}) });
  const [saving, setSaving] = useState(false);
  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };
  const inp = (key, label, type="text") => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <input type={type} value={form[key]||""} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"/>
    </div>
  );
  return (
    <ModalWrap title={existing?._id?"Edit Contact":"Add Contact"} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={handle} disabled={saving||!form.name.trim()}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving?<Spinner/>:<Check size={14}/>} Save
        </button>
      </>}>
      {inp("name","Name *")} {inp("role","Role")}
      <div className="grid grid-cols-2 gap-3">{inp("email","Email","email")} {inp("phone","Phone")}</div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
        <select value={form.type||"general"} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer transition-all">
          {[["general","General"],["decision_maker","Decision Maker"],["finance","Finance"],["gp_lead","GP Lead"],["practice_manager","Practice Manager"]].map(([v,l])=>(
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" checked={!!form.isDecisionMaker} onChange={e=>setForm(f=>({...f,isDecisionMaker:e.target.checked}))} className="accent-blue-600 w-4 h-4"/>
        <span className="text-sm text-slate-700 font-medium">Decision Maker</span>
      </label>
    </ModalWrap>
  );
};

/* ── System Access Modal ── */
const AccessModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({
    system: existing?.system || "EMIS",
    code:   existing?.code   || "",
    status: existing?.status || "not_requested",
    notes:  existing?.notes  || "",
  });
  const [saving, setSaving] = useState(false);
  const handle = async () => {
    setSaving(true);
    try { await onSave({ ...form, _id: existing?._id }); onClose(); } finally { setSaving(false); }
  };
  return (
    <ModalWrap title={existing?._id?"Edit System Access":"Add System Access"} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={handle} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving?<Spinner/>:<Check size={14}/>} Save
        </button>
      </>}>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">System</label>
        <select value={form.system} onChange={e=>setForm(f=>({...f,system:e.target.value}))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer transition-all">
          {["EMIS","SystmOne","ICE","AccuRx","Docman","Softphone","VPN","Other"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
        <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer transition-all">
          {[["not_requested","Not Requested"],["requested","Requested"],["pending","Pending"],["granted","Granted"],["view_only","View Only"]].map(([v,l])=>(
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Code / Reference</label>
        <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))}
          placeholder="EMIS/1485566"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all"/>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
        <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all resize-none"/>
      </div>
    </ModalWrap>
  );
};

/* ── TABS CONFIG ── */
const TABS = [
  { id:"overview",   label:"Overview",    icon:Stethoscope  },
  { id:"contacts",   label:"Contacts",    icon:Users        },
  { id:"compliance", label:"Compliance",  icon:FileCheck    },
  { id:"access",     label:"Sys Access",  icon:Wifi         },
  { id:"history",    label:"History",     icon:MessageSquare},
  { id:"restricted", label:"Restricted",  icon:UserX        },
];

const ACCESS_STATUS_STYLE = {
  granted:       "bg-green-50 text-green-700 border-green-200",
  view_only:     "bg-blue-50 text-blue-700 border-blue-200",
  pending:       "bg-amber-50 text-amber-700 border-amber-200",
  requested:     "bg-purple-50 text-purple-700 border-purple-200",
  not_requested: "bg-slate-50 text-slate-500 border-slate-200",
};

const CONTACT_TYPE_STYLE = {
  decision_maker:   "bg-red-50 text-red-700 border-red-200",
  finance:          "bg-green-50 text-green-700 border-green-200",
  gp_lead:          "bg-purple-50 text-purple-700 border-purple-200",
  practice_manager: "bg-blue-50 text-blue-700 border-blue-200",
  general:          "bg-slate-50 text-slate-600 border-slate-200",
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function PracticeDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [practice,  setPractice]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [tab,       setTab]       = useState("overview");
  const [massEmail, setMassEmail] = useState(false);
  const [contactModal, setContactModal] = useState(null);
  const [accessModal,  setAccessModal]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await getPracticeById(id); setPractice(d.practice); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const patch = useCallback(async (body) => {
    setSaving(true);
    try { await updatePractice(id, body); await load(); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }, [id, load]);

  const saveContact = async (form) => {
    const contacts = [...(practice.contacts || [])];
    if (form._id) {
      const i = contacts.findIndex(c => c._id === form._id);
      if (i > -1) contacts[i] = { ...contacts[i], ...form };
    } else {
      contacts.push(form);
    }
    await patch({ contacts });
  };
  const deleteContact = async (cid) => {
    if (!confirm("Delete contact?")) return;
    await patch({ contacts: practice.contacts.filter(c => c._id !== cid) });
  };

  const toggleCompliance = async (key) => {
    await patch({ [key]: !practice[key] });
  };

  const saveAccess = async (form) => {
    const systems = [...(practice.systemAccess || [])];
    if (form._id) {
      const i = systems.findIndex(s => s._id === form._id);
      if (i > -1) systems[i] = { ...systems[i], ...form };
    } else {
      systems.push(form);
    }
    await patch({ systemAccess: systems });
  };
  const deleteAccess = async (sid) => {
    if (!confirm("Remove system access record?")) return;
    await patch({ systemAccess: practice.systemAccess.filter(s => s._id !== sid) });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-9 h-9 border-[3px] border-teal-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (!practice) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400">
      <Stethoscope size={44} className="mb-3 opacity-30"/>
      <p className="font-semibold text-base">Practice not found</p>
      <button onClick={() => navigate(-1)} className="mt-3 text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  /* ── OVERVIEW ── */
  const OverviewTab = () => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
      odsCode:         practice.odsCode || "",
      address:         practice.address || "",
      city:            practice.city || "",
      postcode:        practice.postcode || "",
      fte:             practice.fte || "",
      contractType:    practice.contractType || "",
      xeroCode:        practice.xeroCode || "",
      xeroCategory:    practice.xeroCategory || "",
      patientListSize: practice.patientListSize || "",
      systemAccessNotes: practice.systemAccessNotes || "",
      notes:           practice.notes || "",
    });
    const handleSave = async () => { await patch(form); setEditing(false); };
    const inp = (k, label, type="text", opts=null) => (
      <div key={k} className="flex flex-col sm:flex-row sm:items-center gap-2 py-2.5 border-b border-slate-50 last:border-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-40 shrink-0">{label}</span>
        {opts ? (
          <select value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 cursor-pointer transition-all">
            <option value="">—</option>
            {opts.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all"/>
        )}
      </div>
    );
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Practice Details</h3>
            <button onClick={() => editing ? handleSave() : setEditing(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {editing ? <><Save size={12}/> Save</> : <><Edit2 size={12}/> Edit</>}
            </button>
          </div>
          {editing ? (
            <div className="space-y-0">
              {inp("odsCode","ODS Code")}
              {inp("fte","FTE")}
              {inp("contractType","Contract Type","text",["ARRS","EA","Direct","Mixed"])}
              {inp("xeroCode","Xero Code")}
              {inp("xeroCategory","Xero Category","text",["PCN","GPX","EAX"])}
              {inp("patientListSize","Patient List","number")}
              {inp("address","Address")}
              {inp("city","City")}
              {inp("postcode","Postcode")}
              <div className="py-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Notes</span>
                <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all resize-none"/>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {[
                ["ODS Code",      practice.odsCode||"—"],
                ["PCN",           practice.pcn?.name||"—"],
                ["Contract Type", practice.contractType||"—"],
                ["FTE",           practice.fte||"—"],
                ["Xero Code",     practice.xeroCode||"—"],
                ["Xero Category", practice.xeroCategory||"—"],
                ["Patient List",  practice.patientListSize ? practice.patientListSize.toLocaleString() : "—"],
              ].map(([l,v])=>(
                <div key={l} className="flex justify-between gap-2 py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500 font-medium">{l}</span>
                  <span className="text-sm text-slate-800 font-bold text-right">{v}</span>
                </div>
              ))}
              {practice.notes && (
                <div className="pt-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{practice.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Address card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">Location</h3>
          {(practice.address || practice.city || practice.postcode) ? (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-slate-500"/>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                {practice.address && <p>{practice.address}</p>}
                {practice.city    && <p>{practice.city}</p>}
                {practice.postcode && <p className="font-bold text-slate-800">{practice.postcode}</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No address on record</p>
          )}

          {practice.systemAccessNotes && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Access Notes</p>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">{practice.systemAccessNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── CONTACTS ── */
  const ContactsTab = () => {
    const contacts = practice.contacts || [];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {contacts.length} Contact{contacts.length !== 1?"s":""}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setMassEmail(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-all">
              <Mail size={14}/> Mass Email
            </button>
            <button onClick={() => setContactModal({})}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
              <Plus size={14}/> Add Contact
            </button>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400">
            <Users size={32} className="mb-3 opacity-40"/>
            <p className="text-base font-semibold">No contacts yet</p>
            <button onClick={() => setContactModal({})} className="mt-2 text-blue-600 text-sm font-bold hover:underline">Add first contact</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {contacts.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 group hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-slate-800 truncate">{c.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{c.role}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border capitalize shrink-0 ${CONTACT_TYPE_STYLE[c.type]||CONTACT_TYPE_STYLE.general}`}>
                    {c.type?.replace("_"," ")}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors truncate"><Mail size={12} className="shrink-0"/>{c.email}</a>}
                  {c.phone && <p className="flex items-center gap-2 text-sm text-slate-500"><Phone size={12} className="shrink-0"/>{c.phone}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2.5 border-t border-slate-100">
                  {c.isDecisionMaker && <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-md border border-red-200">Decision Maker</span>}
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => setContactModal(c)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={11}/> Edit</button>
                    <button onClick={() => deleteContact(c._id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all"><Trash2 size={11}/> Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── COMPLIANCE ── */
  const ComplianceTab = () => {
    const checks = [
      { key:"ndaSigned",                 label:"NDA Signed"               },
      { key:"dsaSigned",                 label:"DSA Signed"               },
      { key:"mouReceived",               label:"MOU Received"             },
      { key:"welcomePackSent",           label:"Welcome Pack Sent"        },
      { key:"mobilisationPlanSent",      label:"Mobilisation Plan Sent"   },
      { key:"confidentialityFormSigned", label:"Confidentiality Form Signed"},
      { key:"prescribingPoliciesShared", label:"Prescribing Policies Shared"},
      { key:"remoteAccessSetup",         label:"Remote Access Setup"      },
      { key:"templateInstalled",         label:"Template Installed"       },
      { key:"reportsImported",           label:"Reports Imported"         },
    ];
    const done = checks.filter(c => practice[c.key]).length;
    const pct  = Math.round((done / checks.length) * 100);
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-700">Onboarding Compliance</h3>
            <span className={`text-2xl font-bold ${pct===100?"text-green-600":pct>=50?"text-amber-500":"text-red-500"}`}>{pct}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${pct===100?"bg-green-500":pct>=50?"bg-amber-500":"bg-red-500"}`} style={{width:`${pct}%`}}/>
          </div>
          <p className="text-sm text-slate-400 mt-2.5">{done} of {checks.length} complete · Click any item to toggle</p>
        </div>
        {saving && <p className="text-sm text-blue-500 animate-pulse font-medium">Saving…</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {checks.map(c => (
            <Badge key={c.key} ok={!!practice[c.key]} label={c.label} onToggle={() => toggleCompliance(c.key)} canEdit={true}/>
          ))}
        </div>
      </div>
    );
  };

  /* ── SYSTEM ACCESS ── */
  const AccessTab = () => {
    const systems = practice.systemAccess || [];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">System Access</p>
          <button onClick={() => setAccessModal({})}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all">
            <Plus size={14}/> Add System
          </button>
        </div>

        {practice.systemAccessNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">Access Notes</p>
            <p className="text-sm text-blue-800">{practice.systemAccessNotes}</p>
          </div>
        )}

        {systems.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400">
            <Wifi size={32} className="mb-3 opacity-40"/>
            <p className="text-base font-semibold">No system access records</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {systems.map(s => (
              <div key={s._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Activity size={16} className="text-slate-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="text-base font-bold text-slate-800">{s.system}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${ACCESS_STATUS_STYLE[s.status]||ACCESS_STATUS_STYLE.not_requested}`}>
                      {s.status?.replace("_"," ")}
                    </span>
                  </div>
                  {s.code  && <p className="text-sm text-slate-400">Code: {s.code}</p>}
                  {s.notes && <p className="text-sm text-slate-500 mt-1.5">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setAccessModal(s)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14}/></button>
                  <button onClick={() => deleteAccess(s._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14}/></button>
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
    const restricted = practice.restrictedClinicians || [];
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5"/>
          <p className="text-sm text-red-700 leading-relaxed">These clinicians are <strong>restricted or unsuitable</strong> for this practice.</p>
        </div>
        {restricted.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400">
            <UserX size={32} className="mb-3 opacity-40"/>
            <p className="text-base font-semibold">No restricted clinicians</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {restricted.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-red-100 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><UserX size={17} className="text-red-500"/></div>
                <div>
                  <p className="text-base font-bold text-slate-800">{c.name}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{c.email} · <span className="capitalize">{c.role}</span></p>
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
    access:     <AccessTab/>,
    history:    <ContactHistoryPanel entityType="Practice" entityId={practice._id}/>,
    restricted: <RestrictedTab/>,
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs flex-wrap">
        <button onClick={() => navigate("/dashboard/super-admin/clients")} className="text-slate-400 hover:text-blue-600 transition-colors font-medium">Client Management</button>
        <ChevronRight size={12} className="text-slate-300"/>
        {practice.pcn?._id && (
          <>
            <button onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${practice.pcn._id}`)} className="text-slate-400 hover:text-blue-600 transition-colors font-medium">
              {practice.pcn.name}
            </button>
            <ChevronRight size={12} className="text-slate-300"/>
          </>
        )}
        <span className="text-slate-700 font-semibold truncate">{practice.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
            <Stethoscope size={20} className="text-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">{practice.name}</h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              {practice.odsCode && <span className="text-sm text-slate-400 flex items-center gap-1"><Hash size={12}/> {practice.odsCode}</span>}
              {practice.pcn?.name && <span className="text-sm text-slate-400 flex items-center gap-1"><Network size={12}/> {practice.pcn.name}</span>}
              {practice.contractType && <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-md border border-teal-200">{practice.contractType}</span>}
              {practice.fte && <span className="text-sm text-slate-400">{practice.fte}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saving && <span className="text-sm text-blue-500 font-medium animate-pulse">Saving…</span>}
            <button onClick={load} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"><RefreshCw size={15}/></button>
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"><ArrowLeft size={13}/> Back</button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-2 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0
                  ${tab === t.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                <Icon size={14}/> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>{TAB_CONTENT[tab]}</div>

      {/* Modals */}
      {contactModal !== null && (
        <ContactModal existing={contactModal?._id ? contactModal : null} onClose={() => setContactModal(null)} onSave={saveContact}/>
      )}
      {accessModal !== null && (
        <AccessModal existing={accessModal?._id ? accessModal : null} onClose={() => setAccessModal(null)} onSave={saveAccess}/>
      )}
      {massEmail && (
        <MassEmailModal entityType="Practice" entityId={practice._id} contacts={practice.contacts||[]} onClose={() => setMassEmail(false)}/>
      )}
    </div>
  );
}