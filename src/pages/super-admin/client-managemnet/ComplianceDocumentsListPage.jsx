/**
 * ComplianceDocumentsListPage.jsx — NON-EXPIRABLE FIXED
 * Ab Add/Edit modal mein "Non-Expirable" clearly dikh raha hai
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Plus, Edit2, X, Check, Search, Loader2, ExternalLink, Filter, Upload
} from "lucide-react";
import {
  useComplianceDocs,
  useCreateComplianceDoc,
  useUpdateComplianceDoc,
} from "../../../hooks/useCompliance";

/* ══════ ATOMS ════ */
const Spinner = ({ cls = "border-blue-600" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);

const BadgeStatus = ({ ok, label }) => (
  <span className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded border ${ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
    {ok ? <Check size={14} /> : <X size={14} />}{label}
  </span>
);

const ActivePill = ({ active }) => (
  <span className={`text-sm font-semibold px-3 py-1 rounded border ${active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
    {active ? "Active" : "Inactive"}
  </span>
);

/* ══════ FILTER BAR ════ */
const FilterBar = ({ search, setSearch, filters, setFilters, filterOptions }) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="relative flex-1 min-w-[200px]">
      <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search documents…"
        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400"
      />
    </div>
    {filterOptions.map(opt => (
      <div key={opt.key} className="flex items-center gap-2 border border-slate-200 rounded-2xl px-4 py-3 bg-white">
        <Filter size={15} className="text-slate-400" />
        <select
          value={filters[opt.key] ?? ""}
          onChange={e => setFilters(f => ({ ...f, [opt.key]: e.target.value }))}
          className="text-sm text-slate-700 outline-none bg-transparent cursor-pointer font-medium"
        >
          <option value="">{opt.label}</option>
          {opt.options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
        </select>
      </div>
    ))}
    {(search || Object.values(filters).some(Boolean)) && (
      <button onClick={() => { setSearch(""); setFilters({}); }}
        className="text-sm font-semibold text-red-500 hover:text-red-700 px-4 py-3 rounded-2xl hover:bg-red-50 flex items-center gap-2">
        <X size={15} /> Clear
      </button>
    )}
  </div>
);

/* ══════ DOC MODAL (Non-Expirable clearly visible) ════ */
const DocModal = ({ existing, onClose, onSave }) => {
  const isEdit = !!existing?._id;
  const [form, setForm] = useState({
    name: "", displayOrder: 0, mandatory: true, expirable: false, active: true,
    defaultExpiryDays: 365, defaultReminderDays: 28,
    ...(existing || {})
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    if (!form.name.trim()) { setErr("Document name is required"); return; }
    setSaving(true); setErr("");
    try {
      await onSave({ ...form, file });
      onClose();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold">{isEdit ? "Edit Compliance Document" : "Add New Compliance Document"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">{err}</div>}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Document Name *</label>
            <input value={form.name} onChange={e => set("name")(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={e => set("displayOrder")(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Default Expiry Days</label>
              <input type="number" value={form.defaultExpiryDays} onChange={e => set("defaultExpiryDays")(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Default Reminder Days</label>
            <input type="number" value={form.defaultReminderDays} onChange={e => set("defaultReminderDays")(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
          </div>

          {/* Upload Document */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Upload size={16} /> Document Template / File (Optional)
            </label>
            <input type="file" onChange={e => setFile(e.target.files[0])}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm bg-slate-50 file:mr-4 file:py-2 file:px-5 file:rounded-xl file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700" />
          </div>

          {/* Checkboxes - Non-Expirable clearly visible */}
          <div className="grid grid-cols-3 gap-6 pt-2">
            {/* Mandatory */}
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={!!form.mandatory} onChange={e => set("mandatory")(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span>Mandatory</span>
            </label>

            {/* Expirable / Non-Expirable */}
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={!!form.expirable} onChange={e => set("expirable")(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span>{form.expirable ? "Expirable" : "Non-Expirable"}</span>
            </label>

            {/* Active */}
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={!!form.active} onChange={e => set("active")(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span>Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-5 border-t">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handle} disabled={saving || !form.name.trim()}
            className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Spinner cls="border-white" /> : <Check size={16} />}{isEdit ? "Save Changes" : "Add Document"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════ MAIN LIST PAGE (same as before) ════ */
const DOC_FILTER_OPTIONS = [
  { key: "mandatory", label: "All Mandatory", options: [["true","Mandatory"],["false","Non-Mandatory"]] },
  { key: "expirable", label: "All Expirable", options: [["true","Expirable"],["false","Non-Expirable"]] },
  { key: "active",    label: "All Status",    options: [["true","Active"],["false","Inactive"]] },
];

export default function ComplianceDocumentsListPage() {
  const navigate = useNavigate();
  const [docModal, setDocModal] = useState(null);

  const { data: docsData, isLoading } = useComplianceDocs();
  const createDoc = useCreateComplianceDoc();
  const updateDoc = useUpdateComplianceDoc();

  const docs = docsData?.docs || [];

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const filtered = docs
    .filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !search || d.name.toLowerCase().includes(q);
      const matchMandatory = !filters.mandatory || String(d.mandatory) === filters.mandatory;
      const matchExpirable = !filters.expirable || String(d.expirable) === filters.expirable;
      const matchActive    = !filters.active    || String(d.active)    === filters.active;
      return matchSearch && matchMandatory && matchExpirable && matchActive;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  const handleSaveDoc = async (formData) => {
    if (formData._id) await updateDoc.mutateAsync({ id: formData._id, data: formData });
    else await createDoc.mutateAsync(formData);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileText size={26} /> Compliance Documents
        </h1>
        <button onClick={() => setDocModal({})}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all">
          <Plus size={18} /> Add New Document
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <FilterBar search={search} setSearch={setSearch} filters={filters} setFilters={setFilters} filterOptions={DOC_FILTER_OPTIONS} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["Document Name", "Order", "Mandatory", "Expirable", "Expiry Days", "Reminder Days", "Status", ""].map((h, i) => (
                <th key={i} className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-12"><Loader2 size={24} className="animate-spin mx-auto text-slate-400" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">No documents found</td></tr>
            ) : filtered.map(doc => (
              <tr key={doc._id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-5 py-4">
                  <button onClick={() => navigate(`/dashboard/super-admin/compliance/documents/${doc._id}`)}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
                    {doc.name}
                    <ExternalLink size={14} className="opacity-50" />
                  </button>
                </td>
                <td className="px-5 py-4 text-center text-slate-600">{doc.displayOrder}</td>
                <td className="px-5 py-4"><BadgeStatus ok={doc.mandatory} label={doc.mandatory ? "Mandatory" : "Non-Mandatory"} /></td>
                <td className="px-5 py-4"><BadgeStatus ok={doc.expirable} label={doc.expirable ? "Expirable" : "Non-Expirable"} /></td>
                <td className="px-5 py-4 text-slate-600 text-xs">{doc.defaultExpiryDays ?? "—"} days</td>
                <td className="px-5 py-4 text-slate-600 text-xs">{doc.defaultReminderDays ?? "—"} days</td>
                <td className="px-5 py-4"><ActivePill active={doc.active} /></td>
                <td className="px-5 py-4">
                  <button onClick={() => setDocModal(doc)} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          Showing {filtered.length} of {docs.length} records
        </div>
      </div>

      {docModal !== null && (
        <DocModal
          existing={docModal?._id ? docModal : null}
          onClose={() => setDocModal(null)}
          onSave={handleSaveDoc}
        />
      )}
    </div>
  );
}