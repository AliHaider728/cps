import { useEffect, useMemo, useState } from "react";
import {
  Network, Plus, Eye, Edit2, Trash2, X, Check,
  ChevronRight, Search, Filter, Building2, Layers,
  DollarSign, Tag, AlertCircle, RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePCNs, useCreatePCN, useUpdatePCN, useDeletePCN } from "../../../hooks/usePCN";
import { useICBs } from "../../../hooks/useICB";
import { useFederations } from "../../../hooks/useFederation";
import { useDocumentGroups } from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { resetPcnFilters, setPcnFilters } from "../../../slices/pcnSlice";

/* ─── ICB accent colours ─────────────────────────────────────────────────── */
const ACCENTS = [
  { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    icon: "text-blue-500"    },
  { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  icon: "text-purple-500"  },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" },
  { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    icon: "text-rose-500"    },
  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   icon: "text-amber-500"   },
  { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    icon: "text-cyan-500"    },
];

const buildAccentMap = (icbs) => {
  const map = {};
  icbs.forEach((icb, idx) => { map[String(icb._id)] = idx % ACCENTS.length; });
  return map;
};

/* ─── Federation name resolver (FIXED)
   Backend stores federation as:
   - populated object  { _id, name, type }   → from mongoose populate
   - plain object      { _id, id, name }      → from seed upsert
   - string ID         "abc123"               → unpopulated ref
   - null / undefined                         → not set
──────────────────────────────────────────────────────────────────────────── */
const resolveFederationName = (pcn, fedMap) => {
  const f = pcn.federation;
  if (!f) return null;

  // Already a populated object with name
  if (typeof f === "object" && f.name) return f.name;

  // Plain string ID — look up in fedMap
  if (typeof f === "string" && fedMap[f]) return fedMap[f].name;

  // Object with _id or id but no name — look up
  const fid = f._id || f.id;
  if (fid && fedMap[String(fid)]) return fedMap[String(fid)].name;

  // federationName fallback (set by seed)
  if (pcn.federationName) return pcn.federationName;

  return null;
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
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

const buildPCNForm = (existing) => ({
  name: existing?.name || "",
  icb: existing?.icb?._id || existing?.icb || "",
  federation: existing?.federation?._id || existing?.federation?.id || existing?.federation || "",
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
  priority: existing?.priority || "normal",
  tags: existing?.tags?.join(", ") || "",
  notes: existing?.notes || "",
});

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

const PRIORITY_STYLE = {
  high:   "bg-red-50 text-red-700 border-red-200",
  low:    "bg-amber-50 text-amber-700 border-amber-200",
  normal: "",
};

/* ─── PCN Modal ─────────────────────────────────────────────────────────── */
const PCNModal = ({ existing, icbs, federations, groups, onClose, onSave }) => {
  const [form, setForm] = useState(() => buildPCNForm(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredFeds = federations.filter(
    (f) => !form.icb || String(f.icb?._id || f.icb) === form.icb
  );

  useEffect(() => { setForm(buildPCNForm(existing)); }, [existing]);

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
    if (!form.name.trim()) { setError("Client name is required"); return; }
    if (!form.icb)          { setError("ICB is required"); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };
      await onSave(payload);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const inp = (key, placeholder, type = "text") => (
    <input type={type} value={form[key]} placeholder={placeholder} autoComplete="off"
      onChange={(e) => setForm((cur) => ({ ...cur, [key]: e.target.value }))}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none" />
  );

  const sel = (key, options, placeholder = "None") => (
    <select value={form[key]} autoComplete="off"
      onChange={(e) => setForm((cur) => ({ ...cur, [key]: e.target.value }))}
      className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
      <option value="">{placeholder}</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="flex w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[90vh] flex-col rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-800">{existing ? "Edit Client" : "Add Client"}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><X size={16} /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 [scrollbar-width:thin]">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <F label="Client Name *">{inp("name", "e.g. Salford Central Client")}</F>

          <div className="grid grid-cols-2 gap-3">
            <F label="ICB *">
              <select value={form.icb} autoComplete="off"
                onChange={(e) => setForm((cur) => ({ ...cur, icb: e.target.value, federation: "" }))}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
                <option value="">Select ICB…</option>
                {icbs.map((icb) => <option key={icb._id} value={icb._id}>{icb.name}</option>)}
              </select>
            </F>
            <F label="Federation / INT">
              <select value={form.federation} autoComplete="off"
                onChange={(e) => setForm((cur) => ({ ...cur, federation: e.target.value }))}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none">
                <option value="">None</option>
                {filteredFeds.map((fed) => <option key={fed._id} value={fed._id}>{fed.name}</option>)}
              </select>
            </F>
          </div>

          <F label="Compliance Groups">
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              {groups.length === 0
                ? <p className="text-xs text-slate-400">No groups available</p>
                : groups.map((g) => (
                  <label key={g._id} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input type="checkbox" checked={(form.complianceGroups || []).includes(g._id)}
                      onChange={() => toggleGroup(g._id)} className="h-4 w-4 accent-purple-600" />
                    <span>{g.name}</span>
                  </label>
                ))}
            </div>
          </F>

          <div className="grid grid-cols-2 gap-3">
            <F label="Contract Type">{sel("contractType", [["ARRS","ARRS"],["EA","EA"],["Direct","Direct"],["Mixed","Mixed"]])}</F>
            <F label="Annual Spend (£)">{inp("annualSpend", "0", "number")}</F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Xero Code">{inp("xeroCode", "SAL1")}</F>
            <F label="Xero Category">{sel("xeroCategory", [["PCN","PCN"],["GPX","GPX"],["EAX","EAX"]])}</F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Contract Renewal">{inp("contractRenewalDate", "", "date")}</F>
            <F label="Contract Expiry">{inp("contractExpiryDate", "", "date")}</F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Priority">{sel("priority", [["normal","Normal"],["high","High"],["low","Low"]])}</F>
            <F label="Tags (comma separated)">{inp("tags", "urgent, renewal-due")}</F>
          </div>

          <F label="Notes">
            <textarea value={form.notes} autoComplete="off" rows={3}
              onChange={(e) => setForm((cur) => ({ ...cur, notes: e.target.value }))}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none" />
          </F>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-slate-100 px-5 pb-6 pt-3 sm:pb-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handle} disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check size={15} />}
            {existing ? "Save Changes" : "Create Client"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function PCNListPage() {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const filters   = useAppSelector((state) => state.pcn.filters);
  const [modal, setModal] = useState(null);

  const { data: pcnData, isLoading, refetch } = usePCNs();
  const { data: icbData }   = useICBs();
  const { data: fedData }   = useFederations();
  const { data: groupData } = useDocumentGroups({ active: true });

  const pcns   = pcnData?.pcns         || [];
  const icbs   = icbData?.icbs         || [];
  const feds   = fedData?.federations  || [];
  const groups = groupData?.groups     || [];

  // Build federation lookup map: id → federation object
  const fedMap = useMemo(() => {
    const map = {};
    feds.forEach(f => {
      map[String(f._id)] = f;
      if (f.id) map[String(f.id)] = f;
    });
    return map;
  }, [feds]);

  const icbAccentMap = useMemo(() => buildAccentMap(icbs), [icbs]);

  const createPCN = useCreatePCN();
  const updatePCN = useUpdatePCN();
  const deletePCN = useDeletePCN();

  const filteredPCNs = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return pcns.filter((pcn) => {
      const fedName = resolveFederationName(pcn, fedMap) || "";
      const matchSearch = !q ||
        [pcn.name, pcn.icb?.name, fedName, pcn.xeroCode, pcn.contractType, pcn.notes]
          .filter(Boolean).join(" ").toLowerCase().includes(q);
      const matchIcb      = !filters.icb          || String(pcn.icb?._id || pcn.icb) === filters.icb;
      const matchContract = !filters.contractType  || pcn.contractType === filters.contractType;
      return matchSearch && matchIcb && matchContract;
    });
  }, [filters, pcns, fedMap]);

  // Summary stats
  const totalSpend = useMemo(() =>
    filteredPCNs.reduce((s, p) => s + (Number(p.annualSpend) || 0), 0), [filteredPCNs]);

  const handleSave = async (form) => {
    if (modal?._id) await updatePCN.mutateAsync({ id: modal._id, data: form });
    else            await createPCN.mutateAsync(form);
    setModal(null);
  };

  const handleDelete = async (pcn) => {
    if (!confirm(`Delete "${pcn.name}"? This cannot be undone.`)) return;
    try { await deletePCN.mutateAsync(pcn._id); }
    catch (e) { alert(e.message); }
  };

  /* ─── Table columns ──────────────────────────────────────────────── */
  const columns = [
    {
      header: "PCN / Client",
      id: "pcn",
      render: (pcn) => {
        const priorityStyle = PRIORITY_STYLE[pcn.priority];
        return (
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800">{pcn.name}</span>
              {pcn.priority && pcn.priority !== "normal" && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityStyle}`}>
                  {pcn.priority.toUpperCase()}
                </span>
              )}
              {(pcn.tags || []).map(tag => (
                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
              ))}
            </div>
            {pcn.notes && (
              <div className="mt-0.5 max-w-[260px] line-clamp-1 text-xs text-slate-400">{pcn.notes}</div>
            )}
          </div>
        );
      },
    },
    {
      header: "ICB",
      id: "icb",
      render: (pcn) => {
        const icbId   = String(pcn.icb?._id || pcn.icb || "");
        const icbName = pcn.icb?.name;
        if (!icbName) return <span className="text-slate-400">—</span>;
        const accentIdx = icbAccentMap[icbId] ?? 0;
        const accent    = ACCENTS[accentIdx];
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${accent.bg} ${accent.border} ${accent.text}`}>
            <Building2 size={11} className={accent.icon} />
            {icbName}
          </span>
        );
      },
      cellClassName: "px-4 py-3 align-top",
    },
    {
      header: "Federation",
      id: "federation",
      render: (pcn) => {
        // ✅ FIXED: use resolveFederationName helper
        const name = resolveFederationName(pcn, fedMap);
        if (!name) return <span className="text-slate-400">—</span>;
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
            <Layers size={12} className="text-slate-400 shrink-0" />
            {name}
          </span>
        );
      },
      cellClassName: "px-4 py-3 align-top",
      hideOnMobile: true,
    },
    {
      header: "Contract",
      id: "contract",
      render: (pcn) => pcn.contractType
        ? <span className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">{pcn.contractType}</span>
        : <span className="text-slate-400">—</span>,
      cellClassName: "px-4 py-3 align-top",
    },
    {
      header: "Annual Spend",
      id: "annualSpend",
      render: (pcn) => pcn.annualSpend
        ? <span className="text-sm font-semibold text-green-700">£{Number(pcn.annualSpend).toLocaleString()}</span>
        : <span className="text-slate-400">—</span>,
      cellClassName: "px-4 py-3 align-top whitespace-nowrap",
      hideOnMobile: true,
    },
    {
      header: "Renewal",
      id: "renewal",
      render: (pcn) => {
        if (!pcn.contractRenewalDate) return <span className="text-slate-400">—</span>;
        const date     = new Date(pcn.contractRenewalDate);
        const daysLeft = Math.ceil((date - Date.now()) / 86_400_000);
        const isUrgent = daysLeft <= 30 && daysLeft > 0;
        const isPast   = daysLeft <= 0;
        return (
          <span className={`text-sm ${isPast ? "text-red-600 font-semibold" : isUrgent ? "text-amber-600 font-semibold" : "text-slate-600"}`}>
            {formatDate(pcn.contractRenewalDate)}
            {isUrgent && <span className="ml-1 text-xs">({daysLeft}d)</span>}
            {isPast   && <span className="ml-1 text-xs">(overdue)</span>}
          </span>
        );
      },
      cellClassName: "px-4 py-3 align-top whitespace-nowrap",
      hideOnMobile: true,
    },
    {
      header: "Xero",
      id: "xero",
      render: (pcn) => (
        <div>
          <div className="text-sm text-slate-600">{pcn.xeroCode || "—"}</div>
          <div className="text-xs text-slate-400">{pcn.xeroCategory || ""}</div>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      header: "Actions",
      id: "actions",
      render: (pcn) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${pcn._id}`)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="View">
            <Eye size={15} />
          </button>
          <button onClick={() => setModal(pcn)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
            <Edit2 size={15} />
          </button>
          <button onClick={() => handleDelete(pcn)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
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
            <button onClick={() => navigate("/dashboard/super-admin/clients")}
              className="transition-colors hover:text-blue-600">Client Management</button>
            <ChevronRight size={13} />
            <span className="font-medium text-slate-600">PCNs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Primary Care Networks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPCNs.length} visible of {pcns.length} Clients
            {totalSpend > 0 && (
              <span className="ml-3 text-green-700 font-semibold">
                · Total: £{totalSpend.toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors">
            <Plus size={15} /> Add Client
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filters.search}
            onChange={(e) => dispatch(setPcnFilters({ search: e.target.value }))}
            placeholder="Search PCN, ICB, federation, Xero code…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm focus:border-blue-400 focus:bg-white focus:outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="ICB">
            <select value={filters.icb}
              onChange={(e) => dispatch(setPcnFilters({ icb: e.target.value }))}
              className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              {icbs.map((icb) => <option key={icb._id} value={icb._id}>{icb.name}</option>)}
            </select>
          </FilterChip>
          <FilterChip label="Contract">
            <select value={filters.contractType}
              onChange={(e) => dispatch(setPcnFilters({ contractType: e.target.value }))}
              className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              {["ARRS","EA","Direct","Mixed"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FilterChip>
          {(filters.search || filters.icb || filters.contractType) && (
            <button onClick={() => dispatch(resetPcnFilters())}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
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
            <p className="font-semibold text-slate-500">No clients match the current filters</p>
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