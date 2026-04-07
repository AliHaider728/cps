/**
 * ComplianceDocumentDetailPage.jsx — UPDATED
 * Delete button & handleDelete completely removed as per Sir's instruction
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Edit2, Check, ChevronRight, CheckCircle2, XCircle, Layers, Clock } from "lucide-react";
import { useComplianceDoc, useUpdateComplianceDoc } from "../../../hooks/useCompliance";

const Spinner = ({ cls = "border-white" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);
const ActivePill = ({ active }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
    {active ? "Active" : "Inactive"}
  </span>
);

export function ComplianceDocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const { data, isLoading } = useComplianceDoc(id);
  const updateDoc = useUpdateComplianceDoc();

  const doc = data?.doc;
  const groups = data?.groups || [];

  useEffect(() => {
    if (doc) {
      setForm({
        name: doc.name,
        displayOrder: doc.displayOrder,
        mandatory: doc.mandatory,
        expirable: doc.expirable,
        active: doc.active,
        defaultExpiryDays: doc.defaultExpiryDays,
        defaultReminderDays: doc.defaultReminderDays,
      });
    }
  }, [doc]);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc.mutateAsync({ id, data: form });
      setEditing(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-9 h-9 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!doc) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
      <FileText size={44} className="opacity-30" />
      <p className="font-semibold">Document not found</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  return (
    <div className="space-y-4 pb-8">
      <nav className="flex items-center gap-1.5 text-sm flex-wrap">
        <button onClick={() => navigate("/dashboard/super-admin/clients")} className="text-slate-400 hover:text-blue-600 transition-colors">Client Management</button>
        <ChevronRight size={13} className="text-slate-300" />
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-blue-600 transition-colors">Compliance Documents</button>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-700 font-bold truncate">{doc.name}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">{doc.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <ActivePill active={doc.active} />
              <span className="text-sm text-slate-400">Order: {doc.displayOrder}</span>
              {doc.mandatory && <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">Mandatory</span>}
              {doc.expirable && <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"><Clock size={9} /> Expirable</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* DELETE BUTTON REMOVED */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all">
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Compliance Document / Training Detail</h2>
          <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {saving ? <Spinner /> : editing ? <><Check size={12} /> Save</> : <><Edit2 size={12} /> Edit</>}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Document Name *</label>
                <input value={form.name} onChange={e => set("name")(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Display Order</label>
                <input type="number" value={form.displayOrder} onChange={e => set("displayOrder")(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Default Expiry Days</label>
                <input type="number" value={form.defaultExpiryDays} onChange={e => set("defaultExpiryDays")(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Default Reminder Days</label>
                <input type="number" value={form.defaultReminderDays} onChange={e => set("defaultReminderDays")(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[["mandatory","Mandatory"],["expirable","Expirable"],["active","Active"]].map(([k,label]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form[k]} onChange={e => set(k)(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {saving ? <Spinner /> : <Check size={15} />} Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[["Document Name",doc.name],["Display Order",doc.displayOrder],["Default Expiry Days",doc.defaultExpiryDays],["Default Reminder Days",doc.defaultReminderDays]].map(([label,val]) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-800">{val ?? "—"}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[["Mandatory",doc.mandatory],["Expirable",doc.expirable],["Active",doc.active]].map(([label,val]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  {val ? <span className="flex items-center gap-1 text-sm font-semibold text-green-600"><CheckCircle2 size={14} /> Yes</span>
                       : <span className="flex items-center gap-1 text-sm font-semibold text-slate-400"><XCircle size={14} /> No</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Layers size={13} /> Document Groups ({groups.length})</h3>
        {groups.length === 0 ? <p className="text-sm text-slate-400">This document is not assigned to any group.</p>
          : <div className="grid gap-2">{groups.map(g => (
              <div key={g._id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <Layers size={14} className="text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-slate-800 flex-1">{g.name}</span>
                <ActivePill active={g.active} />
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

export default ComplianceDocumentDetailPage;