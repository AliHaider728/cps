import { useEffect, useMemo, useState } from "react";
import {
  Stethoscope, Plus, Eye, Edit2, Trash2, X, Check,
  ChevronRight, Search, Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  usePractices, useCreatePractice, useUpdatePractice, useDeletePractice,
} from "../../../hooks/usePractice";
import { usePCNs } from "../../../hooks/usePCN";
import { useDocumentGroups } from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";

/* ─── Shared tiny helpers ──────────────────────────────────────────────── */

const F = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
      {label}
    </label>
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

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const buildPracticeForm = (existing) => ({
  name: existing?.name || "",
  pcn: existing?.pcn?._id || existing?.pcn || "",
  complianceGroup: existing?.complianceGroup?._id || existing?.complianceGroup || "",
  odsCode: existing?.odsCode || "",
  address: existing?.address || "",
  city: existing?.city || "",
  postcode: existing?.postcode || "",
  fte: existing?.fte || "",
  contractType: existing?.contractType || "",
  xeroCode: existing?.xeroCode || "",
  xeroCategory: existing?.xeroCategory || "",
  patientListSize: existing?.patientListSize || "",
  notes: existing?.notes || "",
});

/* ─── Modal ─────────────────────────────────────────────────────────────── */

const PracticeModal = ({ existing, pcns, groups, onClose, onSave }) => {
  const [form, setForm] = useState(() => buildPracticeForm(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setForm(buildPracticeForm(existing)); }, [existing]);

  const handle = async () => {
    if (!form.name.trim()) { setError("Practice name is required"); return; }
    if (!form.pcn) { setError("PCN is required"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const input = (key, placeholder, type = "text") => (
    <input
      type={type}
      value={form[key]}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      onChange={(e) => setForm((cur) => ({ ...cur, [key]: e.target.value }))}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] transition-all focus:border-blue-400 focus:bg-white focus:outline-none"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="flex w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[90vh] flex-col rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-[15px] font-bold text-slate-800">
            {existing ? "Edit Practice" : "Add Practice"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 [scrollbar-width:thin]">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          <F label="Practice Name *">{input("name", "e.g. Pendleton Medical Centre")}</F>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="PCN *">
              <select
                value={form.pcn}
                autoComplete="off"
                onChange={(e) => setForm((cur) => ({ ...cur, pcn: e.target.value }))}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:outline-none"
              >
                <option value="">Select PCN…</option>
                {pcns.map((pcn) => (
                  <option key={pcn._id} value={pcn._id}>{pcn.name}</option>
                ))}
              </select>
            </F>
            <F label="ODS Code">{input("odsCode", "P84001")}</F>
          </div>

          <F label="Compliance Group">
            <select
              value={form.complianceGroup}
              autoComplete="off"
              onChange={(e) =>
                setForm((cur) => ({ ...cur, complianceGroup: e.target.value }))
              }
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:outline-none"
            >
              <option value="">None</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </F>

          <F label="Address">{input("address", "15 Broad Street")}</F>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="City">{input("city", "Salford")}</F>
            <F label="Postcode">{input("postcode", "M6 5BN")}</F>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="FTE">{input("fte", "0.5 FTE (20HRS/WEEK)")}</F>
            <F label="Contract Type">
              <select
                value={form.contractType}
                autoComplete="off"
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, contractType: e.target.value }))
                }
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:outline-none"
              >
                <option value="">None</option>
                {["ARRS", "EA", "Direct", "Mixed"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </F>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Xero Code">{input("xeroCode", "PEN1")}</F>
            <F label="Xero Category">
              <select
                value={form.xeroCategory}
                autoComplete="off"
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, xeroCategory: e.target.value }))
                }
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:outline-none"
              >
                <option value="">None</option>
                {["PCN", "GPX", "EAX"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </F>
          </div>

          <F label="Patient List Size">
            {input("patientListSize", "0", "number")}
          </F>

          <F label="Notes">
            <textarea
              value={form.notes}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) =>
                setForm((cur) => ({ ...cur, notes: e.target.value }))
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:bg-white focus:outline-none"
            />
          </F>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-3 border-t border-slate-100 px-5 pb-6 pt-3 sm:pb-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-[13px] font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check size={14} />
            )}
            {existing ? "Save" : "Create Practice"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function PracticeListPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [filters, setFilters] = useState({
    search: "", pcn: "", city: "", contractType: "", group: "",
  });

  const { data: practiceData, isLoading } = usePractices();
  const { data: pcnData } = usePCNs();
  const { data: groupData } = useDocumentGroups({ active: true });

  const practices = practiceData?.practices || [];
  const pcns = pcnData?.pcns || [];
  const groups = groupData?.groups || [];

  const createPractice = useCreatePractice();
  const updatePractice = useUpdatePractice();
  const deletePractice = useDeletePractice();

  const filteredPractices = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return practices.filter((p) => {
      const matchSearch = !q ||
        [p.name, p.odsCode, p.pcn?.name, p.city, p.postcode, p.complianceGroup?.name]
          .filter(Boolean).join(" ").toLowerCase().includes(q);
      const matchPcn = !filters.pcn || String(p.pcn?._id || p.pcn) === filters.pcn;
      const matchCity =
        !filters.city ||
        String(p.city || "").toLowerCase().includes(filters.city.toLowerCase());
      const matchContract = !filters.contractType || p.contractType === filters.contractType;
      const matchGroup =
        !filters.group ||
        String(p.complianceGroup?._id || p.complianceGroup || "") === filters.group;
      return matchSearch && matchPcn && matchCity && matchContract && matchGroup;
    });
  }, [filters, practices]);

  const handleSave = async (form) => {
    if (modal?._id) await updatePractice.mutateAsync({ id: modal._id, data: form });
    else await createPractice.mutateAsync(form);
    setModal(null);
  };

  const handleDelete = async (practice) => {
    if (!confirm(`Delete "${practice.name}"?`)) return;
    try { await deletePractice.mutateAsync(practice._id); }
    catch (e) { alert(e.message); }
  };

  const columns = [
    {
      header: "Practice",
      id: "practice",
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-800">{p.name}</div>
          {p.notes && (
            <div className="mt-1 max-w-[260px] line-clamp-2 text-xs text-slate-400">
              {p.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "PCN",
      id: "pcn",
      render: (p) => p.pcn?.name || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "ODS",
      id: "ods",
      render: (p) => p.odsCode || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
      hideOnMobile: true,
    },
    {
      header: "Compliance Group",
      id: "group",
      render: (p) =>
        p.complianceGroup?.name ? (
          <span className="rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
            {p.complianceGroup.name}
          </span>
        ) : (
          <span className="text-slate-400 text-sm">No group</span>
        ),
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
      hideOnMobile: true,
    },
    {
      header: "City",
      id: "city",
      render: (p) => p.city || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
      hideOnMobile: true,
    },
    {
      header: "Contract",
      id: "contract",
      render: (p) => p.contractType || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "FTE",
      id: "fte",
      render: (p) => p.fte || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
      hideOnMobile: true,
    },
    {
      header: "Patients",
      id: "patients",
      render: (p) =>
        p.patientListSize ? Number(p.patientListSize).toLocaleString() : "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
      hideOnMobile: true,
    },
    {
      header: "Actions",
      id: "actions",
      mobileLabel: "Actions",
      mobileCellClassName: "pt-1",
      render: (p) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              navigate(`/dashboard/super-admin/clients/practice/${p._id}`)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-teal-50 hover:text-teal-600"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setModal(p)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(p)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 px-2 sm:px-0">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={() => navigate("/dashboard/super-admin/clients")}
              className="transition-colors hover:text-blue-600"
            >
              Client Management
            </button>
            <ChevronRight size={12} />
            <span className="font-medium text-slate-600">Practices</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Practices / Surgeries
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPractices.length} visible of {practices.length} practices
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-teal-700"
        >
          <Plus size={14} /> Add Practice
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={filters.search}
            onChange={(e) =>
              setFilters((cur) => ({ ...cur, search: e.target.value }))
            }
            placeholder="Search by practice, ODS, PCN, city, postcode or group…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip label="PCN">
            <select
              value={filters.pcn}
              onChange={(e) =>
                setFilters((cur) => ({ ...cur, pcn: e.target.value }))
              }
              className="cursor-pointer bg-transparent text-sm outline-none"
            >
              <option value="">All</option>
              {pcns.map((pcn) => (
                <option key={pcn._id} value={pcn._id}>{pcn.name}</option>
              ))}
            </select>
          </FilterChip>

          <FilterChip label="City">
            <input
              value={filters.city}
              onChange={(e) =>
                setFilters((cur) => ({ ...cur, city: e.target.value }))
              }
              placeholder="Any"
              className="w-20 bg-transparent text-sm outline-none"
            />
          </FilterChip>

          <FilterChip label="Contract">
            <select
              value={filters.contractType}
              onChange={(e) =>
                setFilters((cur) => ({ ...cur, contractType: e.target.value }))
              }
              className="cursor-pointer bg-transparent text-sm outline-none"
            >
              <option value="">All</option>
              {["ARRS", "EA", "Direct", "Mixed"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FilterChip>

          <FilterChip label="Group">
            <select
              value={filters.group}
              onChange={(e) =>
                setFilters((cur) => ({ ...cur, group: e.target.value }))
              }
              className="cursor-pointer bg-transparent text-sm outline-none"
            >
              <option value="">All</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </FilterChip>

          {(filters.search || filters.pcn || filters.city || filters.contractType || filters.group) && (
            <button
              onClick={() =>
                setFilters({ search: "", pcn: "", city: "", contractType: "", group: "" })
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={filteredPractices}
        rowKey="_id"
        loading={isLoading}
        loadingText="Loading practices…"
        emptyState={
          <div className="flex flex-col items-center p-12 text-center">
            <Stethoscope size={36} className="mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">
              No practices match the current filters
            </p>
          </div>
        }
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

      {/* ── Modal ── */}
      {modal && (
        <PracticeModal
          key={modal === "add" ? "practice-add" : `practice-${modal._id}`}
          existing={modal === "add" ? null : modal}
          pcns={pcns}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}