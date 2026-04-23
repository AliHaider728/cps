import { useState, useMemo } from "react";
import {
  Layers, Plus, Edit2, Trash2, X, Check,
  ChevronRight, Building2, Search, SlidersHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFederations, useCreateFederation, useUpdateFederation, useDeleteFederation } from "../../../hooks/useFederation";
import { useICBs } from "../../../hooks/useICB";
import DataTable from "../../../components/ui/DataTable.jsx";

const FedModal = ({ existing, icbs, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: existing?.name || "",
    icb: existing?.icb?._id || existing?.icb || "",
    type: existing?.type || "federation",
    notes: existing?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.icb) { setError("ICB is required"); return; }
    setSaving(true); setError("");
    try { await onSave(form); onClose(); } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{existing ? "Edit Federation" : "Add Federation / INT"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Salford Together Federation"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">ICB *</label>
            <select
              value={form.icb}
              onChange={e => setForm(f => ({ ...f, icb: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Select ICB…</option>
              {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["federation", "INT", "other"].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all 
                    ${form.type === t
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button
            onClick={handle}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
            {existing ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

const TYPE_STYLE = {
  federation: "bg-indigo-50 text-indigo-700 border-indigo-200",
  INT: "bg-amber-50 text-amber-700 border-amber-200",
  other: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function FederationListPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [icbFilter, setIcbFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: fedData, isLoading } = useFederations();
  const { data: icbData } = useICBs();

  const feds = fedData?.federations || [];
  const icbs = icbData?.icbs || [];

  const createFed = useCreateFederation();
  const updateFed = useUpdateFederation();
  const deleteFed = useDeleteFederation();

  const handleSave = async (form) => {
    if (modal?._id) await updateFed.mutateAsync({ id: modal._id, data: form });
    else await createFed.mutateAsync(form);
    setModal(null);
  };

  const handleDelete = async (fed) => {
    if (!confirm(`Delete "${fed.name}"?`)) return;
    try { await deleteFed.mutateAsync(fed._id); } catch (e) { alert(e.message); }
  };

  // Client-side filtering
  const filteredFeds = useMemo(() => {
    const q = search.toLowerCase();
    return feds.filter(f => {
      const matchSearch = !q ||
        f.name.toLowerCase().includes(q) ||
        (f.icb?.name || "").toLowerCase().includes(q) ||
        (f.notes || "").toLowerCase().includes(q);
      const matchICB = !icbFilter || f.icb?._id === icbFilter || f.icb === icbFilter;
      const matchType = !typeFilter || f.type === typeFilter;
      return matchSearch && matchICB && matchType;
    });
  }, [feds, search, icbFilter, typeFilter]);

  const hasActiveFilters = search || icbFilter || typeFilter;

  const columns = [
    {
      id: "name",
      header: "Federation Name",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <Layers size={13} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800">{row.name}</span>
        </div>
      ),
      mobileRender: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <Layers size={13} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      id: "icb",
      header: "ICB",
      render: (row) =>
        row.icb?.name ? (
          <span className="inline-flex items-center gap-1 text-sm text-slate-500">
            <Building2 size={11} /> {row.icb.name}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "type",
      header: "Type",
      render: (row) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${TYPE_STYLE[row.type] || TYPE_STYLE.other}`}>
          {row.type}
        </span>
      ),
    },
    {
      id: "notes",
      header: "Notes",
      render: (row) =>
        row.notes ? (
          <span className="text-sm text-slate-400 max-w-[180px] truncate block">{row.notes}</span>
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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
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
            <span className="text-slate-600 font-medium">Federations / INT</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Federations / INT</h1>
          <p className="text-slate-500 text-sm mt-1">Intermediate tier between ICBs and Clients</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
        >
          <Plus size={15} /> Add Federation
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search federations by name, ICB…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-indigo-400 transition-all"
          />
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || icbFilter || typeFilter
              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {(icbFilter || typeFilter) && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(""); setIcbFilter(""); setTypeFilter(""); }}
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ICB</label>
            <select
              value={icbFilter}
              onChange={e => setIcbFilter(e.target.value)}
              className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 focus:outline-none focus:border-indigo-400 cursor-pointer min-w-[200px]"
            >
              <option value="">All ICBs</option>
              {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
            <div className="flex items-center gap-2 pt-1">
              {["federation", "INT", "other"].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(v => v === t ? "" : t)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                    typeFilter === t
                      ? (t === "federation" ? "bg-indigo-50 border-indigo-300 text-indigo-700" :
                         t === "INT" ? "bg-amber-50 border-amber-300 text-amber-700" :
                         "bg-slate-100 border-slate-300 text-slate-700")
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      {!isLoading && (
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-400">
            {filteredFeds.length} of {feds.length} federations
            {hasActiveFilters && " (filtered)"}
          </span>
          {typeFilter && (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${TYPE_STYLE[typeFilter] || TYPE_STYLE.other}`}>
              {typeFilter}
              <button onClick={() => setTypeFilter("")} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
            </span>
          )}
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredFeds}
        rowKey="_id"
        loading={isLoading}
        loadingText="Loading federations…"
        emptyTitle="No federations found"
        emptyDescription={hasActiveFilters ? "Try adjusting your filters." : "Click 'Add Federation' to get started."}
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

      {modal && (
        <FedModal
          existing={modal === "add" ? null : modal}
          icbs={icbs}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}