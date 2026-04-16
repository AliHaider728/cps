import { useEffect, useMemo, useState } from "react";
import {
  Network, Plus, Eye, Edit2, Trash2, X, Check,
  ChevronRight, Search, Filter, Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePCNs, useCreatePCN, useUpdatePCN, useDeletePCN } from "../../../hooks/usePCN";
import { useICBs } from "../../../hooks/useICB";
import { useFederations } from "../../../hooks/useFederation";
import { useDocumentGroups } from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { resetPcnFilters, setPcnFilters } from "../../../slices/pcnSlice";

/* ─── ICB accent colours (same as ICBListPage) ───────────────────────────── */
const ACCENTS = [
  { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    icon: "text-blue-500"    },
  { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  icon: "text-purple-500"  },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" },
  { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    icon: "text-rose-500"    },
  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   icon: "text-amber-500"   },
  { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    icon: "text-cyan-500"    },
];

/* Build a stable icbId → accent index map so same ICB always gets same colour */
const buildAccentMap = (icbs) => {
  const map = {};
  icbs.forEach((icb, idx) => { map[icb._id] = idx % ACCENTS.length; });
  return map;
};

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

const buildPCNForm = (existing) => ({
  name: existing?.name || "",
  icb: existing?.icb?._id || existing?.icb || "",
  federation: existing?.federation?._id || existing?.federation || "",
  complianceGroups: existing?.complianceGroups?.length
    ? existing.complianceGroups.map((g) => g?._id || g).filter(Boolean)
    : existing?.complianceGroup
    ? [existing?.complianceGroup?._id || existing?.complianceGroup]
    : [],
  contractType: existing?.contractType || "",
  annualSpend: existing?.annualSpend || "",
  xeroCode: existing?.xeroCode || "",
  xeroCategory: existing?.xeroCategory || "",
  contractRenewalDate: existing?.contractRenewalDate
    ? new Date(existing.contractRenewalDate).toISOString().split("T")[0]
    : "",
  contractExpiryDate: existing?.contractExpiryDate
    ? new Date(existing.contractExpiryDate).toISOString().split("T")[0]
    : "",
  notes: existing?.notes || "",
});

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

const getAssignedGroupNames = (pcn) =>
  (pcn.complianceGroups?.length
    ? pcn.complianceGroups
    : pcn.complianceGroup
    ? [pcn.complianceGroup]
    : []
  )
    .map((g) => g?.name || "")
    .filter(Boolean);

/* ─── Modal ─────────────────────────────────────────────────────────────── */

const PCNModal = ({ existing, icbs, federations, groups, onClose, onSave }) => {
  const [form, setForm] = useState(() => buildPCNForm(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredFeds = federations.filter(
    (f) => !form.icb || String(f.icb?._id || f.icb) === form.icb
  );

  useEffect(() => {
    setForm(buildPCNForm(existing));
  }, [existing]);

  const toggleGroup = (groupId) =>
    setForm((cur) => {
      const sel = cur.complianceGroups || [];
      return {
        ...cur,
        complianceGroups: sel.includes(groupId)
          ? sel.filter((id) => id !== groupId)
          : [...sel, groupId],
      };
    });

  const handle = async () => {
    if (!form.name.trim()) { setError("PCN name is required"); return; }
    if (!form.icb) { setError("ICB is required"); return; }
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
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="flex w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[90vh] flex-col rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-800">
            {existing ? "Edit Client" : "Add Client"}
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
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <F label="Client Name *">{input("name", "e.g. Salford Central Client")}</F>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="ICB *">
              <select
                value={form.icb}
                autoComplete="off"
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, icb: e.target.value, federation: "" }))
                }
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="">Select ICB…</option>
                {icbs.map((icb) => (
                  <option key={icb._id} value={icb._id}>{icb.name}</option>
                ))}
              </select>
            </F>
            <F label="Federation / INT">
              <select
                value={form.federation}
                autoComplete="off"
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, federation: e.target.value }))
                }
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="">None</option>
                {filteredFeds.map((fed) => (
                  <option key={fed._id} value={fed._id}>{fed.name}</option>
                ))}
              </select>
            </F>
          </div>

          <F label="Compliance Groups">
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              {groups.length === 0 ? (
                <p className="text-xs text-slate-400">No groups available</p>
              ) : (
                groups.map((group) => (
                  <label
                    key={group._id}
                    className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={(form.complianceGroups || []).includes(group._id)}
                      onChange={() => toggleGroup(group._id)}
                      className="h-4 w-4 accent-purple-600"
                    />
                    <span>{group.name}</span>
                  </label>
                ))
              )}
            </div>
          </F>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Contract Type">
              <select
                value={form.contractType}
                autoComplete="off"
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, contractType: e.target.value }))
                }
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="">None</option>
                {["ARRS", "EA", "Direct", "Mixed"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </F>
            <F label="Annual Spend (GBP)">{input("annualSpend", "0", "number")}</F>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Xero Code">{input("xeroCode", "SAL1")}</F>
            <F label="Xero Category">
              <select
                value={form.xeroCategory}
                autoComplete="off"
                onChange={(e) =>
                  setForm((cur) => ({ ...cur, xeroCategory: e.target.value }))
                }
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="">None</option>
                {["PCN", "GPX", "EAX"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </F>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Contract Renewal">{input("contractRenewalDate", "", "date")}</F>
            <F label="Contract Expiry">{input("contractExpiryDate", "", "date")}</F>
          </div>

          <F label="Notes">
            <textarea
              value={form.notes}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) =>
                setForm((cur) => ({ ...cur, notes: e.target.value }))
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none"
            />
          </F>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-3 border-t border-slate-100 px-5 pb-6 pt-3 sm:pb-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check size={15} />
            )}
            {existing ? "Save Changes" : "Create PCN"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function PCNListPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.pcn.filters);

  const { data: pcnData, isLoading } = usePCNs();
  const { data: icbData } = useICBs();
  const { data: fedData } = useFederations();
  const { data: groupData } = useDocumentGroups({ active: true });

  const pcns = pcnData?.pcns || [];
  const icbs = icbData?.icbs || [];
  const feds = fedData?.federations || [];
  const groups = groupData?.groups || [];

  // Stable colour map: icbId → accent index
  const icbAccentMap = useMemo(() => buildAccentMap(icbs), [icbs]);

  const createPCN = useCreatePCN();
  const updatePCN = useUpdatePCN();
  const deletePCN = useDeletePCN();

  const filteredPCNs = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return pcns.filter((pcn) => {
      const matchSearch = !q ||
        [pcn.name, pcn.icb?.name, pcn.federation?.name, pcn.xeroCode, pcn.contractType]
          .filter(Boolean).join(" ").toLowerCase().includes(q);
      const matchIcb = !filters.icb || String(pcn.icb?._id || pcn.icb) === filters.icb;
      const matchContract = !filters.contractType || pcn.contractType === filters.contractType;
      return matchSearch && matchIcb && matchContract;
    });
  }, [filters, pcns]);

  const handleSave = async (form) => {
    if (modal?._id) await updatePCN.mutateAsync({ id: modal._id, data: form });
    else await createPCN.mutateAsync(form);
    setModal(null);
  };

  const handleDelete = async (pcn) => {
    if (!confirm(`Delete "${pcn.name}"?`)) return;
    try { await deletePCN.mutateAsync(pcn._id); }
    catch (e) { alert(e.message); }
  };

  const columns = [
    {
      header: "PCN",
      id: "pcn",
      render: (pcn) => (
        <div>
          <div className="font-semibold text-slate-800">{pcn.name}</div>
          {pcn.notes && (
            <div className="mt-1 max-w-[260px] line-clamp-2 text-xs text-slate-400">
              {pcn.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "ICB",
      id: "icb",
      render: (pcn) => {
        const icbId = pcn.icb?._id || pcn.icb;
        const icbName = pcn.icb?.name;
        if (!icbName) return <span className="text-slate-400">—</span>;
        const accentIdx = icbAccentMap[icbId] ?? 0;
        const accent = ACCENTS[accentIdx];
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${accent.bg} ${accent.border} ${accent.text}`}
          >
            <Building2 size={11} className={accent.icon} />
            {icbName}
          </span>
        );
      },
      cellClassName: "px-4 py-3 align-top",
      hideOnMobile: false,
    },
    {
      header: "Federation",
      id: "federation",
      render: (pcn) => pcn.federation?.name || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
      hideOnMobile: true,
    },
    {
      header: "Contract",
      id: "contract",
      render: (pcn) => pcn.contractType || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Annual Spend",
      id: "annualSpend",
      render: (pcn) =>
        pcn.annualSpend ? `£${Number(pcn.annualSpend).toLocaleString()}` : "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
      hideOnMobile: true,
    },
    {
      header: "Renewal",
      id: "renewal",
      render: (pcn) => formatDate(pcn.contractRenewalDate),
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
      hideOnMobile: true,
    },
    {
      header: "Xero",
      id: "xero",
      render: (pcn) => (
        <div>
          <div className="text-slate-600">{pcn.xeroCode || "—"}</div>
          <div className="text-xs text-slate-400">{pcn.xeroCategory || ""}</div>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      header: "Actions",
      id: "actions",
      mobileLabel: "Actions",
      mobileCellClassName: "pt-1",
      render: (pcn) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${pcn._id}`)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-purple-50 hover:text-purple-600"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setModal(pcn)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => handleDelete(pcn)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={15} />
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
          <div className="mb-1 flex items-center gap-2 text-sm text-slate-400">
            <button
              onClick={() => navigate("/dashboard/super-admin/clients")}
              className="transition-colors hover:text-blue-600"
            >
              Client Management
            </button>
            <ChevronRight size={13} />
            <span className="font-medium text-slate-600">PCNs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Primary Care Networks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPCNs.length} visible of {pcns.length} Clients
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
        >
          <Plus size={15} /> Add Client
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
              dispatch(setPcnFilters({ search: e.target.value }))
            }
            placeholder="Search PCN, ICB, federation, Xero code…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip label="ICB">
            <select
              value={filters.icb}
              onChange={(e) =>
                dispatch(setPcnFilters({ icb: e.target.value }))
              }
              className="cursor-pointer bg-transparent text-sm outline-none"
            >
              <option value="">All</option>
              {icbs.map((icb) => (
                <option key={icb._id} value={icb._id}>{icb.name}</option>
              ))}
            </select>
          </FilterChip>

          <FilterChip label="Contract">
            <select
              value={filters.contractType}
              onChange={(e) =>
                dispatch(setPcnFilters({ contractType: e.target.value }))
              }
              className="cursor-pointer bg-transparent text-sm outline-none"
            >
              <option value="">All</option>
              {["ARRS", "EA", "Direct", "Mixed"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FilterChip>

          {(filters.search || filters.icb || filters.contractType) && (
            <button
              onClick={() => dispatch(resetPcnFilters())}
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
        data={filteredPCNs}
        rowKey="_id"
        loading={isLoading}
        loadingText="Loading Clients…"
        emptyState={
          <div className="flex flex-col items-center p-12 text-center">
            <Network size={36} className="mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">
              No Client match the current filters
            </p>
          </div>
        }
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

      {/* ── Modal ── */}
      {modal && (
        <PCNModal
          key={modal === "add" ? "pcn-add" : `pcn-${modal._id}`}
          existing={modal === "add" ? null : modal}
          icbs={icbs}
          federations={feds}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}