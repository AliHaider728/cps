/**
 * pages/super-admin/Clinician-Management/RestrictedCliniciansPage.jsx
 *
 * Module 3 — Restricted / Unsuitable Clinicians
 *
 * Shows TWO types of restriction in one place:
 *   1. Globally restricted clinicians  (isRestricted = true on Clinician record)
 *   2. Per-client restrictions          (RestrictedClinician records)
 *
 * Flags are visible in rota and dashboards.
 * Hard-block prevents placement at any flagged client.
 */

import { useMemo, useState } from "react";
import {
  ShieldAlert, ShieldOff, Eye, Search, Filter, RefreshCw,
  Building2, Users, AlertTriangle, X, CheckCircle, ChevronDown,
  MapPin, UserX, Trash2, Plus, Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clinicianService } from "../../../services/api/clinicianService";
import { apiClient } from "../../../services/api/client";
import { QK } from "../../../lib/queryKeys";
import { useAppSelector } from "../../../hooks/redux";
import DataTable from "../../../components/ui/DataTable";

/* ─── helpers   */
const fmtDate = (v) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
};

const RAG = {
  red:   { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700",   dot: "bg-red-500"   },
  amber: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  green: { bg: "bg-green-50",  border: "border-green-200", text: "text-green-700", dot: "bg-green-500" },
};

const EntityBadge = ({ type }) => {
  const map = {
    practice: { icon: Building2, label: "Practice",  cls: "bg-purple-50 text-purple-700 border-purple-200" },
    pcn:      { icon: Users,     label: "PCN",        cls: "bg-blue-50   text-blue-700   border-blue-200"   },
    surgery:  { icon: MapPin,    label: "Surgery",    cls: "bg-teal-50   text-teal-700   border-teal-200"   },
  };
  const m = map[type] || { icon: Building2, label: type, cls: "bg-slate-50 text-slate-600 border-slate-200" };
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${m.cls}`}>
      <Icon size={10} /> {m.label}
    </span>
  );
};

/* ─── hooks  ── */
const useGlobalRestricted = (params) =>
  useQuery({
    queryKey: [QK.CLINICIANS, "restricted-global", params],
    queryFn:  () => clinicianService.getAll({ ...params, restricted: "true" }).then((r) => r.data),
  });

const usePerClientRestricted = (params) =>
  useQuery({
    queryKey: [QK.RESTRICTED_CLINICIANS, params],
    queryFn:  () => apiClient.get("/restricted-clinicians", { params }).then((r) => r.data),
  });

/* ─── stat card  ──── */
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  </div>
);

/* ─── remove restriction modal  ─ */
const RemoveModal = ({ record, clinicianName, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-[15px] font-bold text-slate-800">Remove restriction</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <X size={15} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>Removing this restriction will allow <strong>{clinicianName}</strong> to be placed at this client again.</span>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Reason for removal</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Optional — explain why restriction is being lifted…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(record, reason)} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <CheckCircle size={14} />}
            Remove restriction
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN PAGE  ──── */
export default function RestrictedCliniciansPage() {
  const navigate = useNavigate();
  const role     = useAppSelector((s) => s.auth?.user?.role) || "";
  const canAdmin = ["super_admin", "ops_manager"].includes(role);

  const [view,        setView]        = useState("global");   // global | per-client
  const [search,      setSearch]      = useState("");
  const [entityType,  setEntityType]  = useState("");
  const [removeModal, setRemoveModal] = useState(null);
  const [removing,    setRemoving]    = useState(false);

  /* ── data   */
  const globalQ = useGlobalRestricted({ search });
  const clientQ = usePerClientRestricted({ search, entityType, activeOnly: "true" });

  const globalItems  = globalQ.data?.clinicians || [];
  const clientItems  = clientQ.data?.records    || [];

  const isLoading  = view === "global" ? globalQ.isLoading  : clientQ.isLoading;
  const isFetching = view === "global" ? globalQ.isFetching : clientQ.isFetching;
  const refetch    = view === "global" ? globalQ.refetch    : clientQ.refetch;

  /* ── stats   */
  const totalGlobal    = globalItems.length;
  const totalPerClient = clientItems.length;
  const entitiesAffected = new Set(clientItems.map((r) => r.entityId)).size;

  /* ── handlers  ─── */
  const handleRemovePerClient = async (record, reason) => {
    setRemoving(true);
    try {
      const clinicianId = record?.clinician?._id || record?.clinician;
      await apiClient.delete(
        `/clinicians/${clinicianId}/restricted-clients/${record._id}`,
        { data: { reason } }
      );
      clientQ.refetch();
      setRemoveModal(null);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to remove restriction");
    } finally {
      setRemoving(false);
    }
  };

  /* ── global table columns  ── */
  const globalColumns = useMemo(() => ([
    {
      header: "Clinician",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <UserX size={15} className="text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{c.fullName || "—"}</p>
            <p className="text-[11px] text-slate-500 truncate">{c.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Type / Contract",
      cell: (c) => (
        <div className="flex flex-col gap-1">
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-600 border-slate-200 inline-block w-fit">
            {c.clinicianType || "—"}
          </span>
          <span className="text-[11px] text-slate-500">{c.contractType || "—"}</span>
        </div>
      ),
    },
    {
      header: "GPhC",
      cell: (c) => <span className="text-xs font-mono text-slate-600">{c.gphcNumber || "—"}</span>,
    },
    {
      header: "Restriction reason",
      cell: (c) => (
        <div className="max-w-xs">
          {c.restrictReason ? (
            <p className="text-xs text-slate-700 line-clamp-2">{c.restrictReason}</p>
          ) : (
            <span className="text-xs text-slate-400 italic">No reason recorded</span>
          )}
        </div>
      ),
    },
    {
      header: "Ops Lead",
      cell: (c) => <span className="text-xs text-slate-600">{c.opsLeadName || "—"}</span>,
    },
    {
      header: "Actions",
      cell: (c) => (
        <button
          onClick={() => navigate(`/dashboard/clinicians/${c._id}?tab=scope`)}
          className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 inline-flex items-center gap-1">
          <Eye size={12} /> View
        </button>
      ),
    },
  ]), [navigate]);

  /* ── per-client table columns ─── */
  const clientColumns = useMemo(() => ([
    {
      header: "Clinician",
      cell: (r) => {
        const c = r.clinician || {};
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <ShieldAlert size={15} className="text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{c.fullName || "—"}</p>
              <p className="text-[11px] text-slate-500 truncate">{c.email || "—"}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Client type",
      cell: (r) => <EntityBadge type={r.entityType} />,
    },
    {
      header: "Client ID",
      cell: (r) => <span className="text-xs font-mono text-slate-500">{r.entityId || "—"}</span>,
    },
    {
      header: "Reason",
      cell: (r) => (
        <div className="max-w-xs">
          {r.reason ? (
            <p className="text-xs text-slate-700 line-clamp-2">{r.reason}</p>
          ) : (
            <span className="text-xs text-slate-400 italic">No reason recorded</span>
          )}
        </div>
      ),
    },
    {
      header: "Added",
      cell: (r) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-600">{fmtDate(r.addedAt)}</span>
          {r.addedBy && (
            <span className="text-[11px] text-slate-400">{r.addedBy?.fullName || "—"}</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (r) => {
        const c = r.clinician || {};
        return (
          <div className="flex gap-1.5">
            <button
              onClick={() => navigate(`/dashboard/clinicians/${c._id}?tab=scope`)}
              className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 inline-flex items-center gap-1">
              <Eye size={12} /> View
            </button>
            {canAdmin && (
              <button
                onClick={() => setRemoveModal({ record: r, clinicianName: c.fullName || "this clinician" })}
                className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 inline-flex items-center gap-1">
                <Trash2 size={11} /> Remove
              </button>
            )}
          </div>
        );
      },
    },
  ]), [navigate, canAdmin]);

  /* ── render  ──── */
  return (
    <div className="space-y-6">

      {/* ── Header  ───── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center">
            <ShieldAlert size={22} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Restricted clinicians</h1>
            <p className="text-xs text-slate-500">Module 3 · Hard-block flags for rota & bookings</p>
          </div>
        </div>
        <button onClick={() => refetch()}
          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 inline-flex items-center gap-1.5">
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Alert banner   */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertTriangle size={17} className="text-red-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-red-800">Hard-block active</p>
          <p className="text-xs text-red-700 mt-0.5">
            Clinicians listed here are blocked from rota placement at flagged client sites.
            Global restrictions apply system-wide. Per-client restrictions block placement at specific practices / PCNs only.
          </p>
        </div>
      </div>

      {/* ── Stats  ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={UserX}
          label="Globally restricted"
          value={totalGlobal}
          accent="bg-red-50 text-red-600"
        />
        <StatCard
          icon={ShieldAlert}
          label="Per-client restrictions"
          value={totalPerClient}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Building2}
          label="Client sites affected"
          value={entitiesAffected}
          accent="bg-blue-50 text-blue-600"
        />
      </div>

      {/* ── View toggle  ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 flex gap-1 w-fit">
        {[
          { key: "global",     label: "Globally restricted",   count: totalGlobal    },
          { key: "per-client", label: "Per-client restrictions", count: totalPerClient },
        ].map((t) => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all
              ${view === t.key ? "bg-red-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"}`}>
            {t.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
              ${view === t.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filters  ───── */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 min-w-[220px]">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, GPhC…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Entity type filter (per-client only) */}
        {view === "per-client" && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Filter size={13} className="text-slate-400 shrink-0" />
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="bg-transparent text-sm outline-none cursor-pointer">
              <option value="">All entity types</option>
              <option value="practice">Practice</option>
              <option value="pcn">PCN</option>
              <option value="surgery">Surgery</option>
            </select>
          </div>
        )}

        {(search || entityType) && (
          <button onClick={() => { setSearch(""); setEntityType(""); }}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 px-2">
            <X size={11} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Table  ─ */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {view === "global" ? (
          <>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX size={15} className="text-red-500" />
                <p className="text-sm font-bold text-slate-700">System-wide restrictions</p>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700">
                  {globalItems.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">These clinicians are blocked from ALL client placements</p>
            </div>
            <DataTable
              columns={globalColumns}
              data={globalItems}
              loading={isLoading}
              emptyMessage="No globally restricted clinicians found."
            />
          </>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={15} className="text-amber-500" />
                <p className="text-sm font-bold text-slate-700">Per-client restrictions</p>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                  {clientItems.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">Clinicians blocked from specific practices / PCNs</p>
            </div>
            <DataTable
              columns={clientColumns}
              data={clientItems}
              loading={isLoading}
              emptyMessage="No per-client restrictions found."
            />
          </>
        )}
      </div>

      {/* ── Rota block info box   */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldOff size={16} className="text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700">How hard-blocks work in the rota</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="font-bold text-slate-700 mb-1">Global restriction</p>
            <p>Set on the clinician's Scope tab. Prevents placement at ANY client across the system. Visible as a red badge on all list and detail pages.</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="font-bold text-slate-700 mb-1">Per-client restriction</p>
            <p>Added per-client on the Scope tab. Only blocks the clinician at that specific practice / PCN / surgery. All other placements remain open.</p>
          </div>
        </div>
      </div>

      {/* ── Remove modal   */}
      {removeModal && (
        <RemoveModal
          record={removeModal.record}
          clinicianName={removeModal.clinicianName}
          onClose={() => setRemoveModal(null)}
          onConfirm={handleRemovePerClient}
          loading={removing}
        />
      )}
    </div>
  );
}