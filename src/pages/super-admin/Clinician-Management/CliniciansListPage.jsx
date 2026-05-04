import { useEffect, useMemo, useState } from "react";
import {
  Stethoscope, Plus, Eye, Edit2, Trash2, X, Check,
  Search, SlidersHorizontal, ShieldAlert, RefreshCw,
  AlertCircle, ChevronDown, ShieldCheck,
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

/* ── Small reusable label wrapper ── */
const F = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
    {children}
  </div>
);

/* ── Select with chevron ── */
const Select = ({ value, onChange, children, className = "" }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white cursor-pointer transition-all ${className}`}
    >
      {children}
    </select>
    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

/* ── Input field ── */
const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all ${className}`}
  />
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

/* ══════════════ MODAL ══════════════ */
const ClinicianModal = ({ existing, users, onClose, onSave }) => {
  const [form, setForm]     = useState(() => buildForm(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => { setForm(buildForm(existing)); }, [existing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) || 0 }));

  const handle = async () => {
    if (!form.fullName.trim()) { setError("Full name is required"); return; }
    setSaving(true); setError("");
    try { await onSave(form); onClose(); }
    catch (e) { setError(e?.response?.data?.message || e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {existing ? "Edit Clinician" : "Add New Clinician"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Module 3 · Clinician Management</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Full Name">
              <Input value={form.fullName} onChange={set("fullName")} placeholder="Dr. John Smith" />
            </F>
            <F label="Type">
              <Select value={form.clinicianType} onChange={set("clinicianType")}>
                {TYPE_OPTS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </F>
            <F label="Email">
              <Input type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" />
            </F>
            <F label="Phone">
              <Input value={form.phone} onChange={set("phone")} placeholder="+44 7700 000000" />
            </F>
            <F label="GPhC Number">
              <Input value={form.gphcNumber} onChange={set("gphcNumber")} placeholder="1234567" />
            </F>
            <F label="Contract Type">
              <Select value={form.contractType} onChange={set("contractType")}>
                {CONTRACT_OPTS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </F>
            <F label="Working Hours / Week">
              <Input type="number" value={form.workingHours} onChange={setNum("workingHours")} placeholder="37.5" />
            </F>
            <F label="Start Date">
              <Input type="date" value={form.startDate} onChange={set("startDate")} />
            </F>
            <F label="Ops Lead">
              <Select value={form.opsLead} onChange={set("opsLead")}>
                <option value="">— None —</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.email}</option>)}
              </Select>
            </F>
            <F label="Supervisor">
              <Select value={form.supervisor} onChange={set("supervisor")}>
                <option value="">— None —</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.email}</option>)}
              </Select>
            </F>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={handle} disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-all">
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Check size={15} />}
            {saving ? "Saving…" : "Save Clinician"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════ MAIN PAGE ══════════════ */
export default function CliniciansListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const filters  = useAppSelector((s) => s.clinician?.listFilters || {});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useClinicians(filters);
  const usersQ = useAllUsers();
  const createM = useCreateClinician();
  const updateM = useUpdateClinician();
  const deleteM = useDeleteClinician();

  const [modal, setModal] = useState(null);

  const items = (data?.clinicians || []).map((c) => ({
    ...(c.data || c),
    _id: c._id || c.id,
    restricted: c.data?.isRestricted ?? c.data?.restricted ?? c.isRestricted ?? c.restricted ?? false,
  }));

  const users = usersQ.data?.users || usersQ.data || [];

  const setFilter = (patch) => {
    const key   = Object.keys(patch)[0];
    const value = Object.values(patch)[0];
    dispatch(setListFilter({ key, value }));
  };

  const handleSave = async (form) => {
    if (modal?.clinician) await updateM.mutateAsync({ id: modal.clinician._id, data: form });
    else await createM.mutateAsync(form);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete ${c.fullName}? This cannot be undone.`)) return;
    await deleteM.mutateAsync(c._id);
  };

  const hasActiveFilters = filters.search || filters.type || filters.contract || filters.restricted;

  const columns = useMemo(() => ([
    {
      header: "Name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Stethoscope size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{c.fullName || "—"}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{c.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      render: (c) => {
        const colors = {
          Pharmacist: "bg-purple-50 text-purple-700 border-purple-200",
          Technician: "bg-amber-50 text-amber-700 border-amber-200",
          IP:         "bg-teal-50 text-teal-700 border-teal-200",
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap ${colors[c.clinicianType] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
            {c.clinicianType || "—"}
          </span>
        );
      },
    },
    {
      header: "Contract",
      render: (c) => {
        const colors = {
          ARRS:   "bg-blue-50 text-blue-700",
          EA:     "bg-green-50 text-green-700",
          Direct: "bg-orange-50 text-orange-700",
          Mixed:  "bg-pink-50 text-pink-700",
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${colors[c.contractType] || "text-slate-600"}`}>
            {c.contractType || "—"}
          </span>
        );
      },
    },
    {
      header: "Hours / wk",
      render: (c) => (
        <span className="text-sm font-semibold text-slate-700 tabular-nums">
          {c.workingHours || 0}
          <span className="text-xs font-normal text-slate-400 ml-0.5">h</span>
        </span>
      ),
    },
    {
      header: "Status",
      render: (c) => (
        c.restricted ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
            <ShieldAlert size={11} /> Restricted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap">
            <ShieldCheck size={11} /> Active
          </span>
        )
      ),
    },
    {
      header: "",
      render: (c) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button onClick={() => navigate(`/dashboard/clinicians/${c._id}`)}
            className="h-8 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 inline-flex items-center gap-1.5 transition-all whitespace-nowrap">
            <Eye size={12} /> View
          </button>
          <button onClick={() => setModal({ mode: "edit", clinician: c })}
            className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 inline-flex items-center justify-center transition-all">
            <Edit2 size={13} />
          </button>
          <button onClick={() => handleDelete(c)}
            className="h-8 w-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:text-red-700 inline-flex items-center justify-center transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), []);

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-800 leading-tight">Clinicians</h1>
            <p className="text-xs text-slate-400">Module 3 · Clinician Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter toggle */}
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className={`lg:hidden h-9 w-9 rounded-xl border flex items-center justify-center transition-all relative ${filtersOpen ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <SlidersHorizontal size={15} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
            )}
          </button>

          <button onClick={() => refetch()}
            className="h-9 px-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5 transition-all">
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button onClick={() => setModal({ mode: "create" })}
            className="h-9 px-3 sm:px-4 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 inline-flex items-center gap-1.5 shadow-sm shadow-blue-200 transition-all">
            <Plus size={15} />
            <span className="hidden sm:inline">Add clinician</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* ── Filters — Desktop always visible, Mobile toggle ── */}
      <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.search || ""}
                onChange={(e) => setFilter({ search: e.target.value })}
                placeholder="Search name, email, GPhC…"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>

            {/* Type */}
            <div className="relative">
              <Select value={filters.type || ""} onChange={(e) => setFilter({ type: e.target.value })}>
                <option value="">All types</option>
                {TYPE_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>

            {/* Contract */}
            <div className="relative">
              <Select value={filters.contract || ""} onChange={(e) => setFilter({ contract: e.target.value })}>
                <option value="">All contracts</option>
                {CONTRACT_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>

            {/* Restricted */}
            <div className="relative">
              <Select value={filters.restricted || ""} onChange={(e) => setFilter({ restricted: e.target.value })}>
                <option value="">Any status</option>
                <option value="false">Active only</option>
                <option value="true">Restricted only</option>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">Filters applied</p>
              <button onClick={() => dispatch(resetListFilters())}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                <X size={11} /> Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      {!isLoading && items.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span><span className="font-bold text-slate-800">{items.length}</span> clinicians</span>
          <span className="text-slate-200">|</span>
          <span><span className="font-bold text-emerald-600">{items.filter(c => !c.restricted).length}</span> active</span>
          {items.filter(c => c.restricted).length > 0 && (
            <>
              <span className="text-slate-200">|</span>
              <span><span className="font-bold text-red-500">{items.filter(c => c.restricted).length}</span> restricted</span>
            </>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={items}
          loading={isLoading}
          emptyTitle="No clinicians found"
          emptyDescription="Try adjusting your filters or add a new clinician."
        />
      </div>

      {/* ── Modal ── */}
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