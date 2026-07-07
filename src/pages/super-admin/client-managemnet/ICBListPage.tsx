import React, { useState, useMemo } from "react";
import { EntityFilterBar } from "../../../components/shared/EntityFilterBar";
import ICBModal from "./modals/ICBModal";
import {
  Building2, Plus, Edit2, Trash2, X, Check,
  MapPin, Hash, FileText, ChevronRight, Search, SlidersHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useICBs, useCreateICB, useUpdateICB, useDeleteICB } from "../../../hooks/useICB";
import DataTable from "../../../components/ui/DataTable";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { toast } from "sonner";

export interface ICB {
  _id?: string;
  name: string;
  region?: string;
  code?: string;
  notes?: string;
}

export interface ICBFormState {
  name: string;
  region: string;
  code: string;
  notes: string;
}




  
export function ICBListPage() {
    const confirm = useConfirm();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ICB | "add" | null>(null);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isFetching } = useICBs();
  const icbs: ICB[] = data?.icbs || [];
  const createICB = useCreateICB();
  const updateICB = useUpdateICB();
  const deleteICB = useDeleteICB();

  const handleSave = async (form: ICBFormState) => {
    if (modal && typeof modal !== "string" && modal._id) await updateICB.mutateAsync({ id: modal._id, data: form });
    else await createICB.mutateAsync(form);
    setModal(null);
  };

  const handleDelete = async (icb: ICB) => {
    if (!await confirm({ title: `Delete "${icb.name}"? This cannot be undone.` })) return;
    try { await deleteICB.mutateAsync(icb._id!); } catch (e: any) { toast.error(e.message); }
  };

  // unique regions for filter dropdown
  const regions = useMemo(() => Array.from(new Set(icbs.map(i => i.region).filter(Boolean) as string[])).sort(), [icbs]);

  // client-side filtering
  const filteredICBs = useMemo(() => {
    const q = search.toLowerCase();
    return icbs.filter(i => {
      const matchSearch = !q ||
        i.name.toLowerCase().includes(q) ||
        (i.region || "").toLowerCase().includes(q) ||
        (i.code || "").toLowerCase().includes(q) ||
        (i.notes || "").toLowerCase().includes(q);
      const matchRegion = !regionFilter || i.region === regionFilter;
      return matchSearch && matchRegion;
    });
  }, [icbs, search, regionFilter]);

  const columns = [
    {
      id: "name",
      header: "ICB Name",
      render: (row: ICB) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={13} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800">{row.name}</span>
        </div>
      ),
      mobileRender: (row: ICB) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={13} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      id: "region",
      header: "Region",
      key: "region",
      render: (row: ICB) =>
        row.region ? (
          <span className="inline-flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={11} /> {row.region}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "code",
      header: "Code",
      key: "code",
      render: (row: ICB) =>
        row.code ? (
          <span className="inline-flex items-center gap-1 text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            <Hash size={10} /> {row.code}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "notes",
      header: "Notes",
      key: "notes",
      render: (row: ICB) =>
        row.notes ? (
          <span className="inline-flex items-center gap-1 text-sm text-slate-400 max-w-[220px] truncate">
            <FileText size={11} className="shrink-0" /> {row.notes}
          </span>
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
      render: (row: ICB) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal(row)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
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
        title="Integrated Care Boards"
        itemTypeLabel="ICBs"
        breadcrumbs={[
          { label: "Client Management", path: "/dashboard/super-admin/clients" },
          { label: "ICBs" },
        ]}
        visibleCount={filteredICBs.length}
        totalCount={icbs.length}
        onAdd={() => setModal("add")}
        addButtonLabel="Add ICB"
        searchPlaceholder="Search by name, region, code…"
        searchValue={search}
        onSearchChange={setSearch}
      >
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-600 outline-none transition-colors focus:border-blue-400"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {regionFilter && (
          <button
            onClick={() => setRegionFilter("")}
            className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-[13px] font-medium text-blue-700 transition-colors hover:bg-blue-100"
          >
            Clear Filters
          </button>
        )}
      </EntityFilterBar>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredICBs}
          rowKey="_id"
          loading={isLoading || isFetching}
          loadingText="Loading ICBs…"
          emptyTitle="No ICBs found"
          emptyDescription={(search || regionFilter) ? "Try adjusting your filters." : "Click 'Add ICB' to get started."}
          initialPageSize={10}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
      {modal && (
        <ICBModal
          existing={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ICBListPage;


