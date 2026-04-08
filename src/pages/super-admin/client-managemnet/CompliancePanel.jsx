/**
 * CompliancePanelEnhanced.jsx — UPDATED
 * Changes:
 *     PCN Compliance tab completely removed (extra lag raha tha)
 *     Ab sirf "Document Groups" tab rahega (default)
 *     Code clean aur simple kar diya
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers, Plus, Edit2, Trash2, X, Check, Search, ExternalLink, Filter
} from "lucide-react";
import {
  useComplianceDocs,
  useDocumentGroups,
  useCreateDocumentGroup,
  useUpdateDocumentGroup,
  useDeleteDocumentGroup,
} from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";

/* ══════ ATOMS ════ */
const Spinner = ({ cls = "border-blue-600" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);

const ActivePill = ({ active }) => (
  <span className={`text-sm font-semibold px-3 py-1 rounded border ${active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
    {active ? "Active" : "Inactive"}
  </span>
);

/* ══════ FILTER BAR ════ */
const FilterBar = ({ search, setSearch, filters, setFilters, filterOptions, searchPlaceholder }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative flex-1 min-w-[180px]">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={searchPlaceholder || "Search…"}
        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all"
      />
    </div>
    {filterOptions.map(opt => (
      <div key={opt.key} className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 bg-white">
        <Filter size={12} className="text-slate-400 shrink-0" />
        <select
          value={filters[opt.key] ?? ""}
          onChange={e => setFilters(f => ({ ...f, [opt.key]: e.target.value }))}
          className="text-xs text-slate-700 outline-none bg-transparent cursor-pointer font-medium"
        >
          <option value="">{opt.label}</option>
          {opt.options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
        </select>
      </div>
    ))}
    {(search || Object.values(filters).some(Boolean)) && (
      <button
        onClick={() => { setSearch(""); setFilters({}); }}
        className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-all flex items-center gap-1"
      >
        <X size={11} /> Clear
      </button>
    )}
  </div>
);

/* ══════ GROUP MODAL ══ */
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
  const toggleAll = () => set("documents")(allChecked ? [] : allDocs.map(d => d._id));

  const cols = [
    allDocs.filter((_, i) => i % 3 === 0),
    allDocs.filter((_, i) => i % 3 === 1),
    allDocs.filter((_, i) => i % 3 === 2),
  ];

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
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Group Name *</label>
              <input value={form.name} onChange={e => set("name")(e.target.value)} placeholder="e.g. Clinical Staff Documents"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={e => set("displayOrder")(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>
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
              {cols.map((col, ci) => (
                <div key={ci} className="space-y-2">
                  {col.map(doc => (
                    <label key={doc._id} className="flex items-start gap-2 cursor-pointer group">
                      <input type="checkbox" checked={(form.documents || []).includes(doc._id)} onChange={() => toggleDoc(doc._id)}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer mt-0.5 shrink-0" />
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
          <button onClick={handle} disabled={saving || !form.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <Spinner cls="border-white" /> : <Check size={15} />}{isEdit ? "Save Changes" : "Add Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════ GROUPS LIST TAB (Ab yahi sirf tab hai) ════ */
const GROUP_FILTER_OPTIONS = [
  { key: "active", label: "All Status", options: [["true", "Active"], ["false", "Inactive"]] },
];

const GroupListTab = ({ groups, loading, onAdd, onEdit, onDelete, navigate }) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const filtered = groups
    .filter(g => {
      const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
      const matchActive = !filters.active || String(g.active) === filters.active;
      return matchSearch && matchActive;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

  const columns = [
    {
      header: "Group Name",
      id: "name",
      render: (grp) => (
        <button onClick={() => navigate(`/dashboard/super-admin/compliance/groups/${grp._id}`)}
          className="flex items-center gap-1 text-left font-medium text-blue-600 hover:text-blue-800 hover:underline">
          {grp.name}<ExternalLink size={11} className="shrink-0 opacity-50" />
        </button>
      ),
    },
    {
      header: "Display Order",
      id: "displayOrder",
      render: (grp) => grp.displayOrder,
      cellClassName: "px-4 py-3 text-slate-500 align-top",
    },
    {
      header: "Documents",
      id: "documents",
      render: (grp) => {
        const docCount = (grp.documents || []).length;
        return <span className="text-xs text-slate-500">{docCount} doc{docCount !== 1 ? "s" : ""}</span>;
      },
    },
    {
      header: "Status",
      id: "status",
      render: (grp) => <ActivePill active={grp.active} />,
    },
    {
      header: "",
      id: "actions",
      render: (grp) => (
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(grp)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(grp._id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
            <Trash2 size={13} />
          </button>
        </div>
      ),
      mobileLabel: "Actions",
      mobileCellClassName: "pt-1",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Document Groups
            <span className="ml-2 normal-case font-normal text-slate-400">({filtered.length} of {groups.length})</span>
          </h3>
          <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all">
            <Plus size={14} /> Add New Document Group
          </button>
        </div>
        <FilterBar 
          search={search} 
          setSearch={setSearch} 
          filters={filters} 
          setFilters={setFilters}
          filterOptions={GROUP_FILTER_OPTIONS} 
          searchPlaceholder="Search groups…" 
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey="_id"
        loading={loading}
        loadingText="Loading document groups..."
        emptyTitle="No groups match your filters"
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        getRowClassName={(grp) => `${!grp.active ? "opacity-60" : ""} hover:bg-slate-50 transition-colors`}
      />
    </div>
  );
};

/* ══════ MAIN EXPORT   ════ */
export default function CompliancePanelEnhanced({ entityType = "PCN", entity, fieldSaving = {}, onToggle, onPatch, practiceRollup = [] }) {
  const navigate = useNavigate();

  // Ab sirf ek tab hai
  const [groupModal, setGroupModal] = useState(null);

  const { data: docsData, isLoading: docsLoading } = useComplianceDocs();
  const { data: groupsData, isLoading: groupsLoading } = useDocumentGroups();

  const docs = docsData?.docs || [];
  const groups = groupsData?.groups || [];

  const createGroup = useCreateDocumentGroup();
  const updateGroup = useUpdateDocumentGroup();
  const deleteGroup = useDeleteDocumentGroup();

  const handleSaveGroup = async (form) => {
    if (form._id) await updateGroup.mutateAsync({ id: form._id, data: form });
    else await createGroup.mutateAsync(form);
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm("Delete this document group?")) return;
    await deleteGroup.mutateAsync(id);
  };

  const activeDocs = docs.filter(d => d.active);

  return (
    <div className="space-y-4">
       

      <GroupListTab 
        groups={groups} 
        loading={groupsLoading}
        onAdd={() => setGroupModal({})} 
        onEdit={g => setGroupModal(g)}
        onDelete={handleDeleteGroup} 
        navigate={navigate} 
      />

      {groupModal !== null && (
        <GroupModal 
          existing={groupModal?._id ? groupModal : null} 
          allDocs={activeDocs}
          onClose={() => setGroupModal(null)} 
          onSave={handleSaveGroup} 
        />
      )}
    </div>
  );
}
