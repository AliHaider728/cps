/**
 * ComplianceDocumentsListPage.jsx
 * UPDATED (Apr 2026): DocModal +clinicianCanUpload, +visibleToClinician, +notes
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Plus, Edit2, X, Check, Search, ExternalLink, Filter, Upload, Eye
} from "lucide-react";
import {
  useComplianceDocs,
  useCreateComplianceDoc,
  useUpdateComplianceDoc,
} from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";

const Spinner = ({ cls = "border-blue-600" }) => (
  <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${cls} border-t-transparent`} />
);
const BadgeStatus = ({ ok, label }) => (
  <span className={`inline-flex items-center gap-1 rounded border px-3 py-1 text-sm font-semibold
    ${ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600"}`}>
    {ok ? <Check size={14} /> : <X size={14} />}{label}
  </span>
);
const ActivePill = ({ active }) => (
  <span className={`rounded border px-3 py-1 text-sm font-semibold
    ${active ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600"}`}>
    {active ? "Active" : "Inactive"}
  </span>
);

const FilterBar = ({ search, setSearch, filters, setFilters, filterOptions }) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="relative min-w-[200px] flex-1">
      <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-blue-400 focus:outline-none" />
    </div>
    {filterOptions.map(opt => (
      <div key={opt.key} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <Filter size={15} className="text-slate-400" />
        <select value={filters[opt.key] ?? ""} onChange={e => setFilters(c => ({ ...c, [opt.key]: e.target.value }))}
          className="cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none">
          <option value="">{opt.label}</option>
          {opt.options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
        </select>
      </div>
    ))}
    {(search || Object.values(filters).some(Boolean)) && (
      <button onClick={() => { setSearch(""); setFilters({}); }}
        className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700">
        <X size={15} /> Clear
      </button>
    )}
  </div>
);

/* ── DocModal — UPDATED: +clinicianCanUpload, +visibleToClinician, +notes ── */
const DocModal = ({ existing, onClose, onSave }) => {
  const isEdit = !!existing?._id;
  const [form, setForm] = useState({
    name: "", displayOrder: 0, mandatory: true, expirable: false, active: true,
    defaultExpiryDays: 365, defaultReminderDays: 28,
    // ── NEW FIELDS ──────────────────────────────────────────────────────
    clinicianCanUpload: true,
    visibleToClinician: true,
    notes: "",
    ...(existing || {}),
  });
  const [file,   setFile]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const set = key => value => setForm(c => ({ ...c, [key]: value }));

  const handle = async () => {
    if (!form.name.trim()) { setErr("Document name is required"); return; }
    setSaving(true); setErr("");
    try { await onSave({ ...form, file }); onClose(); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-bold">{isEdit ? "Edit Compliance Document" : "Add New Compliance Document"}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6 text-sm">
          {err && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Document Name *</label>
            <input value={form.name} onChange={e => set("name")(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={e => set("displayOrder")(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Default Expiry Days</label>
              <input type="number" value={form.defaultExpiryDays} onChange={e => set("defaultExpiryDays")(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Default Reminder Days</label>
            <input type="number" value={form.defaultReminderDays} onChange={e => set("defaultReminderDays")(Number(e.target.value))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Upload size={13} /> Document Template / File (Optional)
            </label>
            <input type="file" onChange={e => setFile(e.target.files[0])}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-blue-100 file:px-5 file:py-2 file:text-sm file:text-blue-700" />
          </div>

          {/* Boolean flags row 1 */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[["mandatory","Mandatory"],["expirable","Expirable"],["active","Active"]].map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form[k]} onChange={e => set(k)(e.target.checked)} className="h-4 w-4 accent-blue-600" />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {/* ── NEW: Clinician flags row ── */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.clinicianCanUpload} onChange={e => set("clinicianCanUpload")(e.target.checked)} className="h-4 w-4 accent-blue-600" />
              <span className="flex items-center gap-1.5"><Upload size={13} className="text-slate-400" /> Clinician Can Upload</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.visibleToClinician} onChange={e => set("visibleToClinician")(e.target.checked)} className="h-4 w-4 accent-blue-600" />
              <span className="flex items-center gap-1.5"><Eye size={13} className="text-slate-400" /> Visible to Clinician</span>
            </label>
          </div>

          {/* ── NEW: Admin notes ── */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Admin Notes (internal)</label>
            <textarea rows={2} value={form.notes} onChange={e => set("notes")(e.target.value)}
              placeholder="Internal notes for admins only…"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none" />
          </div>
        </div>

        <div className="flex gap-3 border-t px-6 py-5">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handle} disabled={saving || !form.name.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? <Spinner cls="border-white" /> : <Check size={16} />}
            {isEdit ? "Save Changes" : "Add Document"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DOC_FILTER_OPTIONS = [
  { key: "mandatory", label: "All Mandatory", options: [["true","Mandatory"],["false","Non-Mandatory"]] },
  { key: "expirable", label: "All Expirable", options: [["true","Expirable"],["false","Non-Expirable"]] },
  { key: "active",    label: "All Status",    options: [["true","Active"],  ["false","Inactive"]]       },
];

export default function ComplianceDocumentsListPage() {
  const navigate = useNavigate();
  const [docModal, setDocModal] = useState(null);
  const [search,   setSearch]   = useState("");
  const [filters,  setFilters]  = useState({});

  const { data: docsData, isLoading } = useComplianceDocs();
  const createDoc = useCreateComplianceDoc();
  const updateDoc = useUpdateComplianceDoc();

  const docs = docsData?.docs || [];

  const filtered = docs
    .filter(doc => {
      const q = search.toLowerCase();
      return (
        (!search || doc.name.toLowerCase().includes(q)) &&
        (!filters.mandatory || String(doc.mandatory) === filters.mandatory) &&
        (!filters.expirable || String(doc.expirable) === filters.expirable) &&
        (!filters.active    || String(doc.active)    === filters.active)
      );
    })
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  const handleSaveDoc = async (formData) => {
    if (formData._id) await updateDoc.mutateAsync({ id: formData._id, data: formData });
    else              await createDoc.mutateAsync(formData);
  };

  const columns = [
    {
      header: "Document Name", id: "name",
      render: doc => (
        <button onClick={() => navigate(`/dashboard/super-admin/compliance/documents/${doc._id}`)}
          className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 hover:underline">
          {doc.name}<ExternalLink size={14} className="opacity-50" />
        </button>
      ),
    },
    {
      header: "Order", id: "order",
      render: doc => doc.displayOrder,
      cellClassName: "px-5 py-4 text-center text-slate-600 align-top",
    },
    {
      header: "Mandatory", id: "mandatory",
      render: doc => <BadgeStatus ok={doc.mandatory} label={doc.mandatory ? "Mandatory" : "Non-Mandatory"} />,
    },
    {
      header: "Expirable", id: "expirable",
      render: doc => <BadgeStatus ok={doc.expirable} label={doc.expirable ? "Expirable" : "Non-Expirable"} />,
    },
    {
      header: "Expiry Days", id: "expiryDays",
      render: doc => `${doc.defaultExpiryDays ?? "—"} days`,
      cellClassName: "px-5 py-4 text-xs text-slate-600 align-top",
    },
    {
      header: "Reminder Days", id: "reminderDays",
      render: doc => `${doc.defaultReminderDays ?? "—"} days`,
      cellClassName: "px-5 py-4 text-xs text-slate-600 align-top",
    },
    {
      // ── NEW column ──
      header: "Clinician", id: "clinician",
      render: doc => (
        <div className="flex flex-col gap-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border w-fit
            ${(doc.clinicianCanUpload ?? true) ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
            {(doc.clinicianCanUpload ?? true) ? "Self-upload" : "Admin only"}
          </span>
          {!(doc.visibleToClinician ?? true) && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-500 border-slate-200 w-fit">Hidden</span>
          )}
        </div>
      ),
      cellClassName: "px-5 py-4 align-top",
    },
    {
      header: "Status", id: "status",
      render: doc => <ActivePill active={doc.active} />,
    },
    {
      header: "", id: "actions",
      render: doc => (
        <button onClick={() => setDocModal(doc)} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600">
          <Edit2 size={16} />
        </button>
      ),
      mobileLabel: "Edit", mobileCellClassName: "pt-1",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <FileText size={26} /> Compliance Documents
        </h1>
        <button onClick={() => setDocModal({})}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700">
          <Plus size={18} /> Add New Document
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <FilterBar search={search} setSearch={setSearch} filters={filters} setFilters={setFilters} filterOptions={DOC_FILTER_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey="_id"
        loading={isLoading}
        loadingText="Loading documents..."
        emptyTitle="No documents found"
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

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