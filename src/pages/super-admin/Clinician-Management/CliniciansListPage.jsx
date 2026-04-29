import { useEffect, useMemo, useState } from "react";
import {
  Stethoscope, Plus, Eye, Edit2, Trash2, X, Check,
  Search, Filter, ShieldAlert, RefreshCw, AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClinicians, useCreateClinician, useDeleteClinician } from "../../../hooks/useClinicians";
import { useUpdateClinician } from "../../../hooks/useClinician";
import { useAllUsers } from "../../../hooks/useAuth";
import DataTable from "../../../components/ui/DataTable";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { resetListFilters, setListFilter } from "../../../slices/clinicianSlice";

const TYPE_OPTS     = ["Pharmacist", "Technician", "IP"];
const CONTRACT_OPTS = ["ARRS", "EA", "Direct", "Mixed"];

const F = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
    {children}
  </div>
);

const FilterChip = ({ label, children }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={13} className="shrink-0 text-slate-400" />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </div>
);

const buildForm = (existing) => ({
  fullName:      existing?.fullName      || "",
  clinicianType: existing?.clinicianType || "Pharmacist",
  email:         existing?.email         || "",
  phone:         existing?.phone         || "",
  gphcNumber:    existing?.gphcNumber    || "",
  contractType:  existing?.contractType  || "ARRS",
  workingHours:  existing?.workingHours  || 0,
  startDate:     existing?.startDate ? new Date(existing.startDate).toISOString().split("T")[0] : "",
  opsLead:       existing?.opsLead?._id    || existing?.opsLead    || "",
  supervisor:    existing?.supervisor?._id || existing?.supervisor || "",
});

const ClinicianModal = ({ existing, users, onClose, onSave }) => {
  const [form, setForm]     = useState(() => buildForm(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => { setForm(buildForm(existing)); }, [existing]);

  const handle = async () => {
    if (!form.fullName.trim()) { setError("Full name is required"); return; }
    setSaving(true); setError("");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-[15px] font-bold text-slate-800">
            {existing ? "Edit clinician" : "Add new clinician"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <F label="Full name">
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
            </F>
            <F label="Type">
              <select value={form.clinicianType} onChange={(e) => setForm({ ...form, clinicianType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
                {TYPE_OPTS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </F>
            <F label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
            </F>
            <F label="Phone">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
            </F>
            <F label="GPhC number">
              <input value={form.gphcNumber} onChange={(e) => setForm({ ...form, gphcNumber: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
            </F>
            <F label="Contract type">
              <select value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
                {CONTRACT_OPTS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </F>
            <F label="Working hours / week">
              <input type="number" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
            </F>
            <F label="Start date">
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400" />
            </F>
            <F label="Ops lead">
              <select value={form.opsLead} onChange={(e) => setForm({ ...form, opsLead: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
                <option value="">—</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.email}</option>)}
              </select>
            </F>
            <F label="Supervisor">
              <select value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer">
                <option value="">—</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.email}</option>)}
              </select>
            </F>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handle} disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 inline-flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CliniciansListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ✅ FIX: slice mein listFilters hai, filters nahi
  const filters = useAppSelector((s) => s.clinician?.listFilters || {});

  const { data, isLoading, refetch, isFetching } = useClinicians(filters);
  const usersQ = useAllUsers();
  const createM = useCreateClinician();
  const updateM = useUpdateClinician();
  const deleteM = useDeleteClinician();

  const [modal, setModal] = useState(null);

  const items = data?.clinicians || [];
  const users = usersQ.data?.users || usersQ.data || [];

  // ✅ FIX: setListFilter slice action use karo
  const setFilter = (patch) => {
    const key   = Object.keys(patch)[0];
    const value = Object.values(patch)[0];
    dispatch(setListFilter({ key, value }));
  };

  const handleSave = async (form) => {
    if (modal?.clinician) {
      await updateM.mutateAsync({ id: modal.clinician._id, data: form });
    } else {
      await createM.mutateAsync(form);
    }
  };

  const handleDelete = async (clinician) => {
    if (!window.confirm(`Delete ${clinician.fullName}? This cannot be undone.`)) return;
    await deleteM.mutateAsync(clinician._id);
  };

  const columns = useMemo(() => ([
    {
      header: "Name",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Stethoscope size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{c.fullName || "—"}</p>
            <p className="text-[11px] text-slate-500 truncate">{c.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (c) => (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-600 border-slate-200">
          {c.clinicianType || "—"}
        </span>
      ),
    },
    { header: "Contract", cell: (c) => <span className="text-sm text-slate-700">{c.contractType || "—"}</span> },
    {
      header: "Hours",
      cell: (c) => <span className="text-sm text-slate-700 font-mono">{c.workingHours || 0}</span>,
    },
    {
      header: "Status",
      cell: (c) => (
        c.restricted ? (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-red-50 text-red-700 border-red-200 inline-flex items-center gap-1">
            <ShieldAlert size={11} /> Restricted
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-green-50 text-green-700 border-green-200">
            Active
          </span>
        )
      ),
    },
    {
      header: "Actions",
      cell: (c) => (
        <div className="flex gap-1.5">
          <button onClick={() => navigate(`/dashboard/clinicians/${c._id}`)}
            className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 inline-flex items-center gap-1">
            <Eye size={12} /> View
          </button>
          <button onClick={() => setModal({ mode: "edit", clinician: c })}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 inline-flex items-center gap-1">
            <Edit2 size={12} />
          </button>
          <button onClick={() => handleDelete(c)}
            className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 inline-flex items-center gap-1">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Stethoscope size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">Clinicians</h1>
              <p className="text-xs text-slate-500">Module 3 · Clinician Management</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 inline-flex items-center gap-1.5">
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => setModal({ mode: "create" })}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 inline-flex items-center gap-1.5">
            <Plus size={14} /> Add clinician
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <FilterChip label="Search">
          <div className="flex items-center gap-1 flex-1">
            <Search size={12} className="text-slate-400" />
            <input
              value={filters.search || ""}
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Name, email, GPhC…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </FilterChip>
        <FilterChip label="Type">
          <select value={filters.type || ""} onChange={(e) => setFilter({ type: e.target.value })}
            className="flex-1 bg-transparent text-sm outline-none cursor-pointer">
            <option value="">All</option>
            {TYPE_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FilterChip>
        <FilterChip label="Contract">
          <select value={filters.contract || ""} onChange={(e) => setFilter({ contract: e.target.value })}
            className="flex-1 bg-transparent text-sm outline-none cursor-pointer">
            <option value="">All</option>
            {CONTRACT_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FilterChip>
        <FilterChip label="Restricted">
          <select value={filters.restricted || ""} onChange={(e) => setFilter({ restricted: e.target.value })}
            className="flex-1 bg-transparent text-sm outline-none cursor-pointer">
            <option value="">Any</option>
            <option value="false">Active only</option>
            <option value="true">Restricted only</option>
          </select>
        </FilterChip>
      </div>

      <div className="flex justify-end">
        {/* ✅ FIX: resetListFilters use karo */}
        <button onClick={() => dispatch(resetListFilters())}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
          <X size={11} /> Reset filters
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={items}
          loading={isLoading}
          emptyMessage="No clinicians match the current filters."
        />
      </div>

      {modal && (
        <ClinicianModal
          existing={modal.clinician}
          users={users}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}