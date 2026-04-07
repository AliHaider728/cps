import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Stethoscope, Network, ChevronRight, ArrowLeft, RefreshCw,
  Users, FileCheck, MessageSquare, UserX, Mail, Check, X,
  Phone, AlertTriangle, Plus, Edit2, Trash2, Save,
  Wifi, Activity, Hash, MapPin, CheckCircle2, XCircle
} from "lucide-react";
import { usePractice, useUpdatePractice } from "../../../hooks/usePractice";
import { useDocumentGroups } from "../../../hooks/useCompliance";
import ContactHistoryPanel from "./ContactHistoryPanel.jsx";
import MassEmailModal from "./MassEmailModal.jsx";
import EntityDocumentsTab from "./EntityDocumentsTab.jsx";

/* ══════════════════════════════════════════════════════════
   SHARED UI ATOMS
══════════════════════════════════════════════════════════ */
const Spinner = ({ cls = "border-white" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);

const ModalShell = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] w-full max-w-lg">
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
  const S = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${V[variant]} ${S[size]} ${cls}`}>
      {children}
    </button>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className="text-sm text-slate-800 font-semibold text-right truncate max-w-[55%]">{value || "—"}</span>
  </div>
);

const EditRow = ({ label, value, onChange, type = "text", options }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-40 shrink-0">{label}</span>
    {options ? (
      <select value={value || ""} onChange={e => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400" />
    )}
  </div>
);

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

/* ══════════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════════ */
const ContactModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({ name: "", role: "", email: "", phone: "", type: "general", isDecisionMaker: false, ...(existing || {}) });
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
      {opts ? (
        <select value={form[k] || ""} onChange={e => set(k)(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
          {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : (
        <input type={type} value={form[k] || ""} onChange={e => set(k)(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
      )}
    </div>
  );
  return (
    <ModalShell title={existing?._id ? "Edit Contact" : "Add Contact"} onClose={onClose}
      footer={<><Btn variant="ghost" cls="flex-1" onClick={onClose}>Cancel</Btn><Btn cls="flex-1" onClick={handle} disabled={saving || !form.name.trim()}>{saving ? <Spinner /> : <Check size={14} />} Save</Btn></>}>
      <Field label="Name *" k="name" />
      <Field label="Role" k="role" />
      <div className="grid grid-cols-2 gap-3"><Field label="Email" k="email" type="email" /><Field label="Phone" k="phone" /></div>
      <Field label="Type" k="type" opts={[["general","General"],["decision_maker","Decision Maker"],["finance","Finance"],["gp_lead","GP Lead"],["practice_manager","Practice Manager"]]} />
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" checked={!!form.isDecisionMaker} onChange={e => set("isDecisionMaker")(e.target.checked)} className="accent-blue-600 w-4 h-4" />
        <span className="text-sm text-slate-700 font-medium">Mark as Decision Maker</span>
      </label>
    </ModalShell>
  );
};

const AccessModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({ system: existing?.system || "EMIS", code: existing?.code || "", status: existing?.status || "not_requested", notes: existing?.notes || "" });
  const [saving, setSaving] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const handle = async () => {
    setSaving(true);
    try { await onSave({ ...form, _id: existing?._id }); onClose(); } catch (e) { alert(e.message); } finally { setSaving(false); }
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
    <ModalShell title={existing?._id ? "Edit System Access" : "Add System Access"} onClose={onClose}
      footer={<><Btn variant="ghost" cls="flex-1" onClick={onClose}>Cancel</Btn><Btn cls="flex-1" onClick={handle} disabled={saving}>{saving ? <Spinner /> : <Check size={14} />} Save</Btn></>}>
      <Sel label="System" k="system" opts={["EMIS","SystmOne","ICE","AccuRx","Docman","Softphone","VPN","Other"].map(s => [s,s])} />
      <Sel label="Status" k="status" opts={[["not_requested","Not Requested"],["requested","Requested"],["pending","Pending"],["granted","Granted"],["view_only","View Only"]]} />
      <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Code / Reference</label><input value={form.code} onChange={e => set("code")(e.target.value)} placeholder="EMIS/1485566" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all" /></div>
      <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label><textarea rows={3} value={form.notes} onChange={e => set("notes")(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 resize-none" /></div>
    </ModalShell>
  );
};

/* ══════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════ */
const TABS = [
  { id: "overview",   label: "Overview",   icon: Stethoscope   },
  { id: "contacts",   label: "Contacts",   icon: Users         },
  { id: "documents",  label: "Documents",  icon: FileCheck     },
  { id: "access",     label: "Sys Access", icon: Wifi          },
  { id: "history",    label: "History",    icon: MessageSquare },
  { id: "restricted", label: "Restricted", icon: UserX         },
];

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function PracticeDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = usePractice(id);
  const updatePracticeMutation = useUpdatePractice();
  const { data: groupsData } = useDocumentGroups({ active: true });

  const practice = data?.practice ?? null;
  const groups = groupsData?.groups || [];

  const [tab,          setTab]          = useState("overview");
  const [fieldSaving,  setFieldSaving]  = useState({});
  const [massEmail,    setMassEmail]    = useState(false);
  const [contactModal, setContactModal] = useState(null);
  const [accessModal,  setAccessModal]  = useState(null);

  const patch = useCallback(async (body, fieldKey) => {
    if (fieldKey) setFieldSaving(s => ({ ...s, [fieldKey]: true }));
    try { await updatePracticeMutation.mutateAsync({ id, data: body }); }
    catch (e) { alert(e.message); }
    finally { if (fieldKey) setFieldSaving(s => ({ ...s, [fieldKey]: false })); }
  }, [id, updatePracticeMutation]);

  const saveContact = async (form) => {
    const contacts = [...(practice?.contacts || [])];
    if (form._id) { const i = contacts.findIndex(c => c._id === form._id); if (i > -1) contacts[i] = { ...contacts[i], ...form }; }
    else contacts.push(form);
    await patch({ contacts });
  };
  const deleteContact = async (cid) => {
    if (!confirm("Delete contact?")) return;
    await patch({ contacts: (practice?.contacts || []).filter(c => c._id !== cid) });
  };
  const saveAccess = async (form) => {
    const systems = [...(practice?.systemAccess || [])];
    if (form._id) { const i = systems.findIndex(s => s._id === form._id); if (i > -1) systems[i] = { ...systems[i], ...form }; }
    else systems.push(form);
    await patch({ systemAccess: systems });
  };
  const deleteAccess = async (sid) => {
    if (!confirm("Remove system access record?")) return;
    await patch({ systemAccess: (practice?.systemAccess || []).filter(s => s._id !== sid) });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-9 h-9 border-[3px] border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!practice) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
      <Stethoscope size={44} className="opacity-30" />
      <p className="font-semibold text-base">Practice not found</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  /* ════════════ PANELS ════════════════════════════════════ */

  const OverviewPanel = () => {
    const [editing, setEditing] = useState(false);
    const [saving,  setSaving]  = useState(false);
    const [form, setForm] = useState({
      odsCode: practice.odsCode || "", address: practice.address || "",
      city: practice.city || "", postcode: practice.postcode || "",
      fte: practice.fte || "", contractType: practice.contractType || "",
      xeroCode: practice.xeroCode || "", xeroCategory: practice.xeroCategory || "",
      patientListSize: practice.patientListSize || "",
      complianceGroup: practice.complianceGroup?._id || practice.complianceGroup || "",
      systemAccessNotes: practice.systemAccessNotes || "", notes: practice.notes || "",
    });
    useEffect(() => {
      setForm({
        odsCode: practice.odsCode || "",
        address: practice.address || "",
        city: practice.city || "",
        postcode: practice.postcode || "",
        fte: practice.fte || "",
        contractType: practice.contractType || "",
        xeroCode: practice.xeroCode || "",
        xeroCategory: practice.xeroCategory || "",
        patientListSize: practice.patientListSize || "",
        complianceGroup: practice.complianceGroup?._id || practice.complianceGroup || "",
        systemAccessNotes: practice.systemAccessNotes || "",
        notes: practice.notes || "",
      });
    }, [practice]);
    const set = k => v => setForm(f => ({ ...f, [k]: v }));
    const handleSave = async () => { setSaving(true); try { await patch(form); setEditing(false); } finally { setSaving(false); } };
    const handleCancel = () => {
      setForm({
        odsCode: practice.odsCode || "",
        address: practice.address || "",
        city: practice.city || "",
        postcode: practice.postcode || "",
        fte: practice.fte || "",
        contractType: practice.contractType || "",
        xeroCode: practice.xeroCode || "",
        xeroCategory: practice.xeroCategory || "",
        patientListSize: practice.patientListSize || "",
        complianceGroup: practice.complianceGroup?._id || practice.complianceGroup || "",
        systemAccessNotes: practice.systemAccessNotes || "",
        notes: practice.notes || "",
      });
      setEditing(false);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Practice Details</h3>
            <div className="flex items-center gap-2">
              {editing && (
                <button onClick={handleCancel} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                  <X size={12} /> Cancel
                </button>
              )}
              <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {saving ? <Spinner cls="border-white" /> : editing ? <><Save size={12} /> Save</> : <><Edit2 size={12} /> Edit</>}
              </button>
            </div>
          </div>
          {editing ? (
            <div>
              <EditRow label="ODS Code"      value={form.odsCode}         onChange={set("odsCode")} />
              <EditRow label="FTE"           value={form.fte}             onChange={set("fte")} />
              <EditRow label="Contract Type" value={form.contractType}    onChange={set("contractType")} options={["ARRS","EA","Direct","Mixed"]} />
              <EditRow label="Xero Code"     value={form.xeroCode}        onChange={set("xeroCode")} />
              <EditRow label="Xero Category" value={form.xeroCategory}    onChange={set("xeroCategory")} options={["PCN","GPX","EAX"]} />
              <EditRow label="Patient List"  value={form.patientListSize} onChange={set("patientListSize")} type="number" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-40 shrink-0">Compliance Group</span>
                <select value={form.complianceGroup || ""} onChange={e => set("complianceGroup")(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
                  <option value="">None</option>
                  {groups.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}
                </select>
              </div>
              <EditRow label="Address"       value={form.address}         onChange={set("address")} />
              <EditRow label="City"          value={form.city}            onChange={set("city")} />
              <EditRow label="Postcode"      value={form.postcode}        onChange={set("postcode")} />
              <div className="pt-3"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Notes</span>
                <textarea rows={3} value={form.notes} onChange={e => set("notes")(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none" /></div>
            </div>
          ) : (
            <div>
              <DetailRow label="ODS Code"      value={practice.odsCode} />
              <DetailRow label="PCN"           value={practice.pcn?.name} />
              <DetailRow label="Compliance Group" value={practice.complianceGroup?.name || "No compliance group assigned"} />
              <DetailRow label="Contract Type" value={practice.contractType} />
              <DetailRow label="FTE"           value={practice.fte} />
              <DetailRow label="Xero Code"     value={practice.xeroCode} />
              <DetailRow label="Xero Category" value={practice.xeroCategory} />
              <DetailRow label="Patient List"  value={practice.patientListSize ? practice.patientListSize.toLocaleString() : null} />
              {practice.notes && <div className="pt-4 mt-2 border-t border-slate-50"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p><p className="text-sm text-slate-600 leading-relaxed">{practice.notes}</p></div>}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">Location</h3>
          {(practice.address || practice.city || practice.postcode) ? (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><MapPin size={16} className="text-slate-500" /></div>
              <div className="text-sm text-slate-700 leading-relaxed">
                {practice.address && <p>{practice.address}</p>}
                {practice.city    && <p>{practice.city}</p>}
                {practice.postcode && <p className="font-bold text-slate-800">{practice.postcode}</p>}
              </div>
            </div>
          ) : <p className="text-sm text-slate-400">No address on record</p>}
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

  const ContactsPanel = () => {
    const contacts = practice.contacts || [];
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
                  {c.type && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize shrink-0 ${CONTACT_TYPE_STYLE[c.type] || CONTACT_TYPE_STYLE.general}`}>{c.type.replace("_"," ")}</span>}
                </div>
                <div className="space-y-1.5 mb-3">
                  {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 truncate"><Mail size={12} className="shrink-0" />{c.email}</a>}
                  {c.phone && <p className="flex items-center gap-2 text-sm text-slate-500"><Phone size={12} className="shrink-0" />{c.phone}</p>}
                </div>
                <div className="flex items-center pt-2.5 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.isDecisionMaker && <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-md border border-red-200 mr-2">Decision Maker</span>}
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
      entityType="Practice"
      entityId={practice._id}
      accent="teal"
    />
  );

  const AccessPanel = () => {
    const systems = practice.systemAccess || [];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">System Access</p>
          <Btn size="sm" onClick={() => setAccessModal({})}><Plus size={13} /> Add System</Btn>
        </div>
        {practice.systemAccessNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">Access Notes</p>
            <p className="text-sm text-blue-800">{practice.systemAccessNotes}</p>
          </div>
        )}
        {systems.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <Wifi size={32} className="opacity-40" /><p className="font-semibold">No system access records</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {systems.map(s => (
              <div key={s._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><Activity size={16} className="text-slate-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="text-[15px] font-bold text-slate-800">{s.system}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${ACCESS_STATUS_STYLE[s.status] || ACCESS_STATUS_STYLE.not_requested}`}>{s.status?.replace("_"," ")}</span>
                  </div>
                  {s.code  && <p className="text-sm text-slate-400">Code: {s.code}</p>}
                  {s.notes && <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{s.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setAccessModal(s)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 size={14} /></button>
                  <button onClick={() => deleteAccess(s._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const RestrictedPanel = () => {
    const restricted = practice.restrictedClinicians || [];
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div><p className="text-sm font-bold text-red-700">Restricted / Unsuitable Clinicians</p><p className="text-xs text-red-600 mt-0.5 leading-relaxed">These clinicians will not be scheduled at this practice.</p></div>
        </div>
        {restricted.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <UserX size={32} className="opacity-40" /><p className="font-semibold">No restricted clinicians</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {restricted.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-red-100 p-5 flex items-center gap-4">
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
    access:     <AccessPanel />,
    history:    <ContactHistoryPanel entityType="Practice" entityId={practice._id} />,
    restricted: <RestrictedPanel />,
  };

  return (
    <div className="space-y-4 pb-8">
      <nav className="flex items-center gap-1.5 text-sm flex-wrap">
        <button onClick={() => navigate("/dashboard/super-admin/clients")} className="text-slate-400 hover:text-blue-600 font-medium transition-colors">Client Management</button>
        <ChevronRight size={13} className="text-slate-300" />
        {practice.pcn?._id && (
          <>
            <button onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${practice.pcn._id}`)} className="text-slate-400 hover:text-blue-600 font-medium transition-colors">{practice.pcn.name}</button>
            <ChevronRight size={13} className="text-slate-300" />
          </>
        )}
        <span className="text-slate-700 font-bold truncate">{practice.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0"><Stethoscope size={22} className="text-white" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">{practice.name}</h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              {practice.odsCode    && <span className="text-sm text-slate-400 flex items-center gap-1"><Hash size={12} /> {practice.odsCode}</span>}
              {practice.pcn?.name  && <span className="text-sm text-slate-400 flex items-center gap-1"><Network size={12} /> {practice.pcn.name}</span>}
              {practice.contractType && <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-md border border-teal-200">{practice.contractType}</span>}
              {practice.fte        && <span className="text-sm text-slate-400">{practice.fte}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => refetch()} title="Refresh" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"><RefreshCw size={15} /></button>
            <Btn variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={13} /> Back</Btn>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-2 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {TABS.map(t => { const Icon = t.icon; return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${tab === t.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
              <Icon size={14} /> {t.label}
            </button>
          ); })}
        </div>
      </div>

      <div>{PANELS[tab]}</div>

      {contactModal !== null && <ContactModal existing={contactModal?._id ? contactModal : null} onClose={() => setContactModal(null)} onSave={saveContact} />}
      {accessModal  !== null && <AccessModal  existing={accessModal?._id  ? accessModal  : null} onClose={() => setAccessModal(null)}  onSave={saveAccess}  />}
      {massEmail && <MassEmailModal entityType="Practice" entityId={practice._id} contacts={practice.contacts || []} onClose={() => setMassEmail(false)} />}
    </div>
  );
}
