import React, { useState, useMemo } from "react";
import {
  Building2, Plus, Edit2, Trash2, X, Check, Search, SlidersHorizontal, ChevronRight, Layers
} from "lucide-react";
import { EntityFilterBar } from "../../../components/shared/EntityFilterBar";
import { useNavigate } from "react-router-dom";
import { useFederations, useCreateFederation, useUpdateFederation, useDeleteFederation } from "../../../hooks/useFederation";
import { useICBs } from "../../../hooks/useICB";
import DataTable from "../../../components/ui/DataTable";

import FedModal, { FedFormState } from "./modals/FedModal";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { toast } from "sonner";

const TYPE_STYLE: Record<string, string> = {
  federation: "bg-indigo-50 text-indigo-700 border-indigo-200",
  INT: "bg-amber-50 text-amber-700 border-amber-200",
  other: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function FederationListPage() {
    const confirm = useConfirm();
  const navigate = useNavigate();
  const [modal, setModal] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [icbFilter, setIcbFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const { data: fedData, isLoading, isFetching } = useFederations();
  const { data: icbData } = useICBs();

  const feds = fedData?.federations || [];
  const icbs = icbData?.icbs || [];

  const createFed = useCreateFederation();
  const updateFed = useUpdateFederation();
  const deleteFed = useDeleteFederation();

  const handleSave = async (form: FedFormState) => {
    if (modal?._id) await updateFed.mutateAsync({ id: modal._id, data: form as any });
    else await createFed.mutateAsync(form as any);
    setModal(null);
  };

  const handleDelete = async (fed: any) => {
    if (!await confirm({ title: `Delete "${fed.name}"?` })) return;
    try { await deleteFed.mutateAsync(fed._id); } catch (e: any) { toast.error(e.message); }
  };

  // Client-side filtering
  const filteredFeds = useMemo(() => {
    const q = search.toLowerCase();
    return feds.filter((f: any) => {
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
      render: (row: any) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <Layers size={13} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800">{row.name}</span>
        </div>
      ),
      mobileRender: (row: any) => (
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
      render: (row: any) =>
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
      render: (row: any) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${TYPE_STYLE[row.type] || TYPE_STYLE.other}`}>
          {row.type}
        </span>
      ),
    },
    {
      id: "notes",
      header: "Notes",
      render: (row: any) =>
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
      render: (row: any) => (
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

      <EntityFilterBar
        title="Federations / INT"
        itemTypeLabel="federations"
        breadcrumbs={[
          { label: "Client Management", path: "/dashboard/super-admin/clients" },
          { label: "Federations / INT" },
        ]}
        visibleCount={filteredFeds.length}
        totalCount={feds.length}
        onAdd={() => setModal("add")}
        addButtonLabel="Add Federation"
        searchPlaceholder="Search federations by name, ICB…"
        searchValue={search}
        onSearchChange={setSearch}
      >
        <select
          value={icbFilter}
          onChange={(e) => setIcbFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-600 outline-none transition-colors focus:border-indigo-400"
        >
          <option value="">All ICBs</option>
          {icbs.map((i: any) => (
            <option key={i._id} value={i._id}>{i.name}</option>
          ))}
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-600 outline-none transition-colors focus:border-indigo-400"
        >
          <option value="">All Types</option>
          <option value="federation">Federation</option>
          <option value="INT">INT</option>
          <option value="other">Other</option>
        </select>

        {(icbFilter || typeFilter) && (
          <button
            onClick={() => { setIcbFilter(""); setTypeFilter(""); }}
            className="flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-2 text-[13px] font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            Clear Filters
          </button>
        )}
      </EntityFilterBar>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredFeds}
        rowKey="_id"
        loading={isLoading || isFetching}
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


