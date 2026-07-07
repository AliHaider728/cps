import React, { useEffect, useMemo, useState } from "react";
import PracticeModal, { ExistingPractice, PracticeForm } from "./modals/PracticeModal";
import {
  Stethoscope, Plus, Eye, Edit2, Trash2, X, Check,
  ChevronRight, Search, Filter, Building2, Layers, Network,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EntityFilterBar } from "../../../components/shared/EntityFilterBar";
import {
  usePractices, useCreatePractice, useUpdatePractice, useDeletePractice,
} from "../../../hooks/usePractice";
import { usePCNs } from "../../../hooks/usePCN";
import { useDocumentGroups } from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { toast } from "sonner";

/* ─── Interfaces ──────────────────────────────────────────────────────────── */



interface FilterChipProps {
  label: string;
  children: React.ReactNode;
}







/* ─── Helpers ─────────────────────────────────────────────────────────────── */



const FilterChip: React.FC<FilterChipProps> = ({ label, children }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={13} className="shrink-0 text-slate-400" />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </div>
);

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function PracticeListPage() {
    const confirm = useConfirm();
  const navigate = useNavigate();
  const [modal, setModal]     = useState<ExistingPractice | 'add' | null>(null);
  const [filters, setFilters] = useState({ search: "", pcn: "", city: "", contractType: "", group: "" });

  const { data: practiceData, isLoading, isFetching } = usePractices();
  const { data: pcnData }   = usePCNs();
  const { data: groupData } = useDocumentGroups({ active: true });

  const practices: any[] = practiceData?.practices || [];
  const pcns: any[]      = pcnData?.pcns           || [];
  const groups: any[]    = groupData?.groups       || [];

  const createPractice = useCreatePractice();
  const updatePractice = useUpdatePractice();
  const deletePractice = useDeletePractice();

  const filteredPractices = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return practices.filter((p) => {
      /* ✅ p.client = populated PCN object (has .icb and .federation nested) */
      const client = p.client || {};

      const matchSearch = !q || [
        p.name, p.odsCode,
        client.name,
        client.icb?.name,
        client.federation?.name,
        p.city, p.postcode,
        ...(Array.isArray(p.complianceGroup) ? p.complianceGroup.map((g: any) => g.name || g) : [p.complianceGroup?.name || p.complianceGroup]),
      ].filter(Boolean).join(" ").toLowerCase().includes(q);

      const matchPcn      = !filters.pcn          || String(client._id || client.id || p.client) === filters.pcn;
      const matchCity     = !filters.city         || String(p.city || "").toLowerCase().includes(filters.city.toLowerCase());
      const matchContract = !filters.contractType || p.contractType === filters.contractType;
      const matchGroup    = !filters.group        || (Array.isArray(p.complianceGroup) ? p.complianceGroup.some((g: any) => String(g._id || g) === filters.group) : String(p.complianceGroup?._id || p.complianceGroup || "") === filters.group);

      return matchSearch && matchPcn && matchCity && matchContract && matchGroup;
    });
  }, [filters, practices]);

  const handleSave = async (form: PracticeForm) => {
    if (modal && typeof modal === 'object' && modal._id) {
      await updatePractice.mutateAsync({ id: modal._id, data: form });
    } else {
      await createPractice.mutateAsync(form);
    }
    setModal(null);
  };

  const handleDelete = async (practice: any) => {
    if (!await confirm({ title: `Delete "${practice.name}"?` })) return;
    try   { await deletePractice.mutateAsync(practice._id); }
    catch (e: any) { toast.error(e.message); }
  };

  /* ─── Columns ─────────────────────────────────────────────────────── */
  const columns = [
    {
      header: "Practice",
      id: "practice",
      cellClassName: "px-4 py-3 align-top",
      render: (p: any) => {
        /* ✅ client = populated PCN → icb & federation come from here */
        const client  = p.client || {};
        const icbName = client.icb?.name;
        const fedName = client.federation?.name;
        const pcnName = client.name;

        return (
          <div className="space-y-1.5 min-w-[180px]">
            {/* Practice name */}
            <div className="font-semibold text-slate-800 text-sm leading-tight">{p.name}</div>

            {/* PCN name */}
            {pcnName && (
              <div className="flex items-center gap-1">
                <Network size={11} className="text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-600 font-medium">{pcnName}</span>
              </div>
            )}

            {/* ICB badge */}
            {icbName && (
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  <Building2 size={10} className="text-blue-500" />
                  {icbName}
                </span>
              </div>
            )}

            {/* Federation */}
            {fedName && (
              <div className="flex items-center gap-1">
                <Layers size={11} className="text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-500 leading-tight">{fedName}</span>
              </div>
            )}

            {/* Notes */}
            {p.notes && (
              <div className="max-w-[260px] line-clamp-1 text-xs text-slate-400">{p.notes}</div>
            )}
          </div>
        );
      },
    },
    {
      header: "ODS",
      id: "ods",
      hideOnMobile: true,
      render: (p: any) => p.odsCode || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Compliance Groups",
      id: "group",
      hideOnMobile: true,
      render: (p: any) => {
        const groups = Array.isArray(p.complianceGroup) ? p.complianceGroup : (p.complianceGroup ? [p.complianceGroup] : []);
        if (groups.length === 0) return <span className="text-slate-400 text-sm">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {groups.map((g: any, i: number) => (
              <span key={i} className="rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                {g.name || g}
              </span>
            ))}
          </div>
        );
      },
      cellClassName: "px-4 py-3 align-top",
    },
    {
      header: "City",
      id: "city",
      hideOnMobile: true,
      render: (p: any) => p.city || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Contract",
      id: "contract",
      hideOnMobile: true,
      render: (p: any) => p.contractType
        ? <span className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">{p.contractType}</span>
        : <span className="text-slate-400">—</span>,
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
    },
    {
      header: "FTE",
      id: "fte",
      hideOnMobile: true,
      render: (p: any) => p.fte || "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Patients",
      id: "patients",
      hideOnMobile: true,
      render: (p: any) => p.patientListSize ? Number(p.patientListSize).toLocaleString() : "—",
      cellClassName: "px-4 py-3 whitespace-nowrap text-slate-600 align-top",
    },
    {
      header: "Actions",
      id: "actions",
      mobileLabel: "Actions",
      mobileCellClassName: "pt-1",
      render: (p: any) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/dashboard/super-admin/clients/practice/${p._id}`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors" title="View">
            <Eye size={14} />
          </button>
          <button onClick={() => setModal(p)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleDelete(p)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 px-2 sm:px-0">

      {/* ── Header ── */}
      <EntityFilterBar
        title="Practices / Surgeries"
        itemTypeLabel="practices"
        breadcrumbs={[
          { label: "Client Management", path: "/dashboard/super-admin/clients" },
          { label: "Practices" },
        ]}
        visibleCount={filteredPractices.length}
        totalCount={practices.length}
        onAdd={() => setModal("add")}
        addButtonLabel="Add Practice"
        searchPlaceholder="Search by practice, ODS, PCN, city, postcode or group…"
        searchValue={filters.search}
        onSearchChange={(val) => setFilters((c) => ({ ...c, search: val }))}
      >
        <FilterChip label="PCN">
          <select value={filters.pcn} onChange={(e) => setFilters((c) => ({ ...c, pcn: e.target.value }))}
            className="cursor-pointer bg-transparent text-[13px] outline-none">
            <option value="">All</option>
            {pcns.map((pcn: any) => <option key={pcn._id} value={pcn._id}>{pcn.name}</option>)}
          </select>
        </FilterChip>

        <FilterChip label="City">
          <input value={filters.city} onChange={(e) => setFilters((c) => ({ ...c, city: e.target.value }))}
            placeholder="Any" className="w-20 bg-transparent text-[13px] outline-none" />
        </FilterChip>

        <FilterChip label="Contract">
          <select value={filters.contractType} onChange={(e) => setFilters((c) => ({ ...c, contractType: e.target.value }))}
            className="cursor-pointer bg-transparent text-[13px] outline-none">
            <option value="">All</option>
            {["ARRS","EA","Direct","Mixed"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FilterChip>

        <FilterChip label="Group">
          <select value={filters.group} onChange={(e) => setFilters((c) => ({ ...c, group: e.target.value }))}
            className="cursor-pointer bg-transparent text-[13px] outline-none">
            <option value="">All</option>
            {groups.map((g: any) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </FilterChip>

        {(filters.search || filters.pcn || filters.city || filters.contractType || filters.group) && (
          <button onClick={() => setFilters({ search: "", pcn: "", city: "", contractType: "", group: "" })}
            className="rounded-lg px-2 py-1 text-[13px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
            Clear Filters
          </button>
        )}
      </EntityFilterBar>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={filteredPractices}
        rowKey="_id"
        loading={isLoading || isFetching}
        loadingText="Loading practices…"
        emptyState={
          <div className="flex flex-col items-center p-12 text-center">
            <Stethoscope size={36} className="mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">No practices match the current filters</p>
          </div>
        }
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

      {/* ── Modal ── */}
      {modal && (
        <PracticeModal
          key={modal === "add" ? "practice-add" : `practice-${(modal as ExistingPractice)._id}`}
          existing={modal === "add" ? null : (modal as ExistingPractice)}
          pcns={pcns}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}


