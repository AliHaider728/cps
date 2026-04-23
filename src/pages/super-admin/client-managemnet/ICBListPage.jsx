import { useState, useMemo } from "react";
import {
  Building2, Plus, Edit2, Trash2, X, Check,
  MapPin, Hash, FileText, ChevronRight, Search, SlidersHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useICBs, useCreateICB, useUpdateICB, useDeleteICB } from "../../../hooks/useICB";
import DataTable from "../../../components/ui/DataTable.jsx";

const ICBModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: existing?.name || "",
    region: existing?.region || "",
    code: existing?.code || "",
    notes: existing?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.name.trim()) { setError("ICB name is required"); return; }
    setSaving(true); setError("");
    try { await onSave(form); onClose(); } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{existing ? "Edit ICB" : "Add ICB"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">ICB Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. NHS Greater Manchester ICB"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Region</label>
              <input
                value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                placeholder="North West"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Code</label>
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="QOP"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button
            onClick={handle}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
            {existing ? "Save Changes" : "Create ICB"}
          </button>
        </div>
      </div>
    </div>
  );
};

export function ICBListPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useICBs();
  const icbs = data?.icbs || [];
  const createICB = useCreateICB();
  const updateICB = useUpdateICB();
  const deleteICB = useDeleteICB();

  const handleSave = async (form) => {
    if (modal?._id) await updateICB.mutateAsync({ id: modal._id, data: form });
    else await createICB.mutateAsync(form);
    setModal(null);
  };

  const handleDelete = async (icb) => {
    if (!confirm(`Delete "${icb.name}"? This cannot be undone.`)) return;
    try { await deleteICB.mutateAsync(icb._id); } catch (e) { alert(e.message); }
  };

  // unique regions for filter dropdown
  const regions = useMemo(() => [...new Set(icbs.map(i => i.region).filter(Boolean))].sort(), [icbs]);

  // client-side filtering
  const filteredICBs = useMemo(() => {
    const q = search.toLowerCase();
    return icbs.filter(i => {
      const matchSearch = !q ||
        i.name.toLowerCase().includes(q) ||
        (i.region || "").toLowerCase().includes(q) ||
        (i.code || "").toLowerCase().includes(q) ||
        (i.notes || "").toLowerCase().includes(q);
      const matchRegion = !regionFilter || i.region === regionFilter;
      return matchSearch && matchRegion;
    });
  }, [icbs, search, regionFilter]);

  const columns = [
    {
      id: "name",
      header: "ICB Name",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={13} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800">{row.name}</span>
        </div>
      ),
      mobileRender: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={13} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      id: "region",
      header: "Region",
      key: "region",
      render: (row) =>
        row.region ? (
          <span className="inline-flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={11} /> {row.region}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "code",
      header: "Code",
      key: "code",
      render: (row) =>
        row.code ? (
          <span className="inline-flex items-center gap-1 text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            <Hash size={10} /> {row.code}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "notes",
      header: "Notes",
      key: "notes",
      render: (row) =>
        row.notes ? (
          <span className="inline-flex items-center gap-1 text-sm text-slate-400 max-w-[220px] truncate">
            <FileText size={11} className="shrink-0" /> {row.notes}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
      hideOnMobile: true,
    },
    {
      id: "actions",
      header: "",
      headerClassName: "px-4 py-3 w-20",
      cellClassName: "px-4 py-3 align-top",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const hasActiveFilters = search || regionFilter;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <button onClick={() => navigate("/dashboard/super-admin/clients")} className="hover:text-blue-600 transition-colors">
              Client Management
            </button>
            <ChevronRight size={13} />
            <span className="text-slate-600 font-medium">ICBs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Integrated Care Boards</h1>
          <p className="text-slate-500 text-sm mt-1">Manage NHS ICBs — top-level governance bodies</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
        >
          <Plus size={15} /> Add ICB
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, region, code…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all"
          />
        </div>

        {/* Region filter */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || regionFilter
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(""); setRegionFilter(""); }}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Region</label>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer min-w-[160px]"
            >
              <option value="">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Stats row */}
      {!isLoading && (
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-400">
            {filteredICBs.length} of {icbs.length} ICBs
            {hasActiveFilters && " (filtered)"}
          </span>
          {regionFilter && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
              <MapPin size={10} /> {regionFilter}
              <button onClick={() => setRegionFilter("")} className="ml-0.5 hover:text-blue-900">×</button>
            </span>
          )}
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredICBs}
        rowKey="_id"
        loading={isLoading}
        loadingText="Loading ICBs…"
        emptyTitle="No ICBs found"
        emptyDescription={hasActiveFilters ? "Try adjusting your filters." : "Click 'Add ICB' to get started."}
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

      {modal && (
        <ICBModal
          existing={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ICBListPage;