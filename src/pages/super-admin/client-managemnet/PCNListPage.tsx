import React, { useEffect, useMemo, useState } from "react";
import PCNModal, { formatDate, PRIORITY_STYLE } from "./modals/PCNModal";

import {
  Network, Plus, Eye, Edit2, Trash2, X, Check,
  ChevronRight, Search, Filter, Building2, Layers,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePCNs, useCreatePCN, useUpdatePCN, useDeletePCN } from "../../../hooks/usePCN";
import { useICBs } from "../../../hooks/useICB";
import { useFederations } from "../../../hooks/useFederation";
import { useDocumentGroups } from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { resetPcnFilters, setPcnFilters } from "../../../slices/pcnSlice";
import { toast } from "sonner";
import { useConfirm } from "../../../contexts/ConfirmContext";

/* ─── Interfaces ──────────────────────────────────────────────────────── */

export interface ICB {
  id?: string;
  _id?: string;
  name?: string;
}

export interface Federation {
  id?: string;
  _id?: string;
  name?: string;
  icb?: string | ICB;
}

export interface DocumentGroup {
  id?: string;
  _id?: string;
  name?: string;
  colour?: string;
  applicableContractTypes?: string[];
  applicable_contract_types?: string[];
}

export interface PCN {
  id?: string;
  _id?: string;
  name?: string;
  icb?: ICB;
  federation?: Federation;
  federationName?: string;
  contractType?: string;
  hourlyRate?: number | string;
  xeroCode?: string;
  xeroCategory?: string;
  contractStartDate?: string;
  contractRenewalDate?: string;
  contractExpiryDate?: string;
  priority?: "normal" | "high" | "low" | string;
  tags?: string[];
  notes?: string;
  complianceGroups?: (string | DocumentGroup)[];
  complianceGroup?: string | DocumentGroup;
}



/* ─── ICB accent colours ──────────────────────────────────────────────── */
const ACCENTS = [
  { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    icon: "text-blue-500"    },
  { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  icon: "text-purple-500"  },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" },
  { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    icon: "text-rose-500"    },
  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   icon: "text-amber-500"   },
  { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    icon: "text-cyan-500"    },
];

const buildAccentMap = (icbs: ICB[]) => {
  const map: Record<string, number> = {};
  icbs.forEach((icb, idx) => { map[String(icb.id || icb._id)] = idx % ACCENTS.length; });
  return map;
};

/* ─── Federation name resolver ────────────────────────────────────────── */
const resolveFederationName = (pcn: PCN, fedMap: Record<string, Federation>) => {
  if (!pcn) return null;
  if (pcn.federationName) return pcn.federationName;
  const f = pcn.federation;
  if (!f) return null;
  if (typeof f === "object" && f.name) return f.name;
  const fid = (f as any)?.id || (f as any)?._id || f;
  if (fid && fedMap[String(fid)]) return fedMap[String(fid)].name;
  return null;
};

/* ─── Helper: get id ──────────────────────────────────────────────────── */
export const getId = (g: any): string => g?.id ?? g?._id ?? g;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
export const F: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
    {children}
  </div>
);

const FilterChip: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={13} className="shrink-0 text-slate-400" />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </div>
);



/* ─── Portal wrapper ──────────────────────────────────────────────────────*/


import { EntityFilterBar } from "../../../components/shared/EntityFilterBar";

export default function PCNListPage() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const filters  = useAppSelector((state: any) => state.pcn.filters);
  const [modal,        setModal]       = useState<PCN | "add" | null>(null);

  const { data: pcnData, isLoading, isFetching, refetch } = usePCNs();
  const { data: icbData }   = useICBs();
  const { data: fedData, isLoading: fedsLoading }   = useFederations();
  const { data: groupData } = useDocumentGroups({ active: true });

  const pcns: PCN[]   = pcnData?.pcns        || [];
  const icbs: ICB[]   = icbData?.icbs        || [];
  const feds: Federation[]   = fedData?.federations || [];
  const groups: DocumentGroup[] = groupData?.groups    || [];

  const fedMap = useMemo(() => {
    const map: Record<string, Federation> = {};
    feds.forEach((f) => {
      const id = getId(f);
      if (id) map[String(id)] = f;
    });
    return map;
  }, [feds]);

  const icbAccentMap = useMemo(() => buildAccentMap(icbs), [icbs]);

  const createPCN = useCreatePCN();
  const updatePCN = useUpdatePCN();
  const deletePCN = useDeletePCN();

  const filteredPCNs = useMemo(() => {
    const q = (filters.search || "").trim().toLowerCase();
    return pcns.filter((pcn) => {
      const fedName   = resolveFederationName(pcn, fedMap) || "";
      const matchSearch = !q ||
        [pcn.name, pcn.icb?.name, fedName, pcn.xeroCode, pcn.contractType, pcn.notes]
          .filter(Boolean).join(" ").toLowerCase().includes(q);
      const matchIcb      = !filters.icb         || String(getId(pcn.icb) || "") === filters.icb;
      const matchContract = !filters.contractType || pcn.contractType === filters.contractType;
      return matchSearch && matchIcb && matchContract;
    });
  }, [filters, pcns, fedMap]);

  const avgHourlyRate = useMemo(() => {
    const rated = filteredPCNs.filter((p) => Number(p.hourlyRate) > 0);
    if (!rated.length) return 0;
    return rated.reduce((s, p) => s + Number(p.hourlyRate), 0) / rated.length;
  }, [filteredPCNs]);

  const handleSave = async (form: any) => {
    const id = getId(modal);
    if (id && modal !== "add") await updatePCN.mutateAsync({ id, data: form });
    else                       await createPCN.mutateAsync(form);
    setModal(null);
  };

  const handleDeleteClick = async (pcn: PCN) => {
    if (!await confirm({ title: `Delete "${pcn.name}"? This cannot be undone.` })) return;
    try {
      await deletePCN.mutateAsync(getId(pcn));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const columns = [
    {
      header: "PCN / Client",
      id: "pcn",
      cellClassName: "px-4 py-3 align-top",
      render: (pcn: PCN) => {
        const priorityStyle = pcn.priority && typeof pcn.priority === "string" ? PRIORITY_STYLE[pcn.priority] || "" : "";
        const icbId     = String(getId(pcn.icb) || "");
        const icbName   = pcn.icb?.name;
        const accentIdx = icbAccentMap[icbId] ?? 0;
        const accent    = ACCENTS[accentIdx];
        const fedName   = resolveFederationName(pcn, fedMap);

        return (
          <div className="space-y-1.5 min-w-[180px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 text-sm leading-tight">{pcn.name}</span>
              {pcn.priority && pcn.priority !== "normal" && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityStyle}`}>
                  {String(pcn.priority).toUpperCase()}
                </span>
              )}
              {(pcn.tags || []).map((tag) => (
                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
              ))}
            </div>
            {icbName && (
              <div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${accent.bg} ${accent.border} ${accent.text}`}>
                  <Building2 size={10} className={accent.icon} />{icbName}
                </span>
              </div>
            )}
            {fedName && (
              <div className="flex items-center gap-1">
                <Layers size={11} className="text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-500 leading-tight">{fedName}</span>
              </div>
            )}
            {pcn.notes && (
              <div className="max-w-[260px] line-clamp-1 text-xs text-slate-400">{pcn.notes}</div>
            )}
          </div>
        );
      },
    },
    {
      header: "Contract",
      id: "contract",
      hideOnMobile: true,
      render: (pcn: PCN) => pcn.contractType
        ? <span className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">{pcn.contractType}</span>
        : <span className="text-slate-400">—</span>,
      cellClassName: "px-4 py-3 align-top",
    },
    {
      header: "Hourly Rate",
      id: "hourlyRate",
      hideOnMobile: true,
      render: (pcn: PCN) => pcn.hourlyRate
        ? <span className="text-sm font-semibold text-green-700">£{Number(pcn.hourlyRate).toLocaleString()}/hr</span>
        : <span className="text-slate-400">—</span>,
      cellClassName: "px-4 py-3 align-top whitespace-nowrap",
    },
    {
      header: "Contract Dates",
      id: "dates",
      hideOnMobile: true,
      render: (pcn: PCN) => {
        if (!pcn.contractStartDate && !pcn.contractRenewalDate && !pcn.contractExpiryDate) {
          return <span className="text-slate-400">—</span>;
        }
        const renewal  = pcn.contractRenewalDate ? new Date(pcn.contractRenewalDate) : null;
        const daysLeft = renewal ? Math.ceil((renewal.getTime() - Date.now()) / 86_400_000) : null;
        const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
        const isPast   = daysLeft !== null && daysLeft <= 0;
        return (
          <div className="space-y-0.5 text-xs leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold w-11 shrink-0">Start</span>
              <span className="text-slate-600">{formatDate(pcn.contractStartDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold w-11 shrink-0">Renew</span>
              <span className={isPast ? "text-red-600 font-semibold" : isUrgent ? "text-amber-600 font-semibold" : "text-slate-600"}>
                {formatDate(pcn.contractRenewalDate)}
                {isUrgent && ` (${daysLeft}d)`}
                {isPast && " (overdue)"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold w-11 shrink-0">Expiry</span>
              <span className="text-slate-600">{formatDate(pcn.contractExpiryDate)}</span>
            </div>
          </div>
        );
      },
      cellClassName: "px-4 py-3 align-top whitespace-nowrap",
    },
    {
      header: "Xero",
      id: "xero",
      hideOnMobile: true,
      render: (pcn: PCN) => (
        <div>
          <div className="text-sm text-slate-600">{pcn.xeroCode || "—"}</div>
          <div className="text-xs text-slate-400">{pcn.xeroCategory || ""}</div>
        </div>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      render: (pcn: PCN) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${getId(pcn)}`)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="View">
            <Eye size={15} />
          </button>
          <button onClick={() => setModal(pcn)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
            <Edit2 size={15} />
          </button>
          <button onClick={() => handleDeleteClick(pcn)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 px-2 sm:px-0">
      <EntityFilterBar
        title="Primary Care Networks"
        itemTypeLabel="Clients"
        breadcrumbs={[
          { label: "Client Management", path: "/dashboard/super-admin/clients" },
          { label: "PCNs" },
        ]}
        visibleCount={filteredPCNs.length}
        totalCount={pcns.length}
        onAdd={() => setModal("add")}
        addButtonLabel="Add Client"
        searchPlaceholder="Search PCN, ICB, federation, Xero code…"
        searchValue={filters.search}
        onSearchChange={(val) => dispatch(setPcnFilters({ search: val }))}
      >
        <FilterChip label="ICB">
          <select value={filters.icb || ""}
            onChange={(e) => dispatch(setPcnFilters({ icb: e.target.value }))}
            className="cursor-pointer bg-transparent text-[13px] outline-none">
            <option value="">All</option>
            {icbs.map((icb) => <option key={getId(icb)} value={getId(icb)}>{icb.name}</option>)}
          </select>
        </FilterChip>
        <FilterChip label="Contract">
          <select value={filters.contractType || ""}
            onChange={(e) => dispatch(setPcnFilters({ contractType: e.target.value }))}
            className="cursor-pointer bg-transparent text-[13px] outline-none">
            <option value="">All</option>
            {["ARRS","EA","Direct","Mixed"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FilterChip>
        {(filters.search || filters.icb || filters.contractType) && (
          <button onClick={() => dispatch(resetPcnFilters())}
            className="rounded-lg px-2 py-1 text-[13px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            Clear Filters
          </button>
        )}
      </EntityFilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPCNs}
        rowKey={(row: PCN) => String(getId(row))}
        loading={isLoading || isFetching}
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

      {/* Add / Edit Modal */}
      {modal && (
        <PCNModal
          key={modal === "add" ? "pcn-add" : `pcn-${getId(modal)}`}
          existing={modal === "add" ? null : modal}
          icbs={icbs}
          federations={feds}
          fedsLoading={fedsLoading}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

    </div>
  );
}


