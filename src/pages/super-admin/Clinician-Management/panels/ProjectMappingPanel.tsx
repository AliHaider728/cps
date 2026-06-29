import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil } from "lucide-react";
import { clinicianService } from "../../../../services/api/clinicianService";
import { usePractices } from "../../../../hooks/usePractice";
import { Btn, FormField, Spinner } from "./shared";
import { ModalShell } from "../../../../components/ui/ModalShell";

const PROJECT_OPTS = ["ARRS", "EA", "Direct", "COVER"];
const TYPE_OPTS = ["Locums Contractor", "Employed", "Limited Company"];
const RATE_TYPE_OPTS = ["Per Hour", "Fixed"];

const defaultRate = (project: string) => (project === "COVER" || project === "EA" ? 29 : 28);

interface ProjectMappingForm {
  project: string;
  practice_id: string;
  type: string;
  rate: number;
  rate_type: string;
  vat_percentage: number;
}

const emptyForm: ProjectMappingForm = {
  project: "ARRS",
  practice_id: "",
  type: "Locums Contractor",
  rate: 28,
  rate_type: "Per Hour",
  vat_percentage: 0,
};

interface ProjectMappingPanelProps {
  clinicianId: string;
  canManage?: boolean;
}

export default function ProjectMappingPanel({ clinicianId, canManage }: ProjectMappingPanelProps) {
  const qc = useQueryClient();
  const practicesQ = usePractices();

  const [modal, setModal]   = useState<"add" | "edit" | false>(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm]     = useState<ProjectMappingForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["project-mappings", clinicianId],
    queryFn: () => clinicianService.getProjectMappings(clinicianId).then((r: any) => r.data),
    enabled: !!clinicianId,
  });

  const createM = useMutation({
    mutationFn: (payload: ProjectMappingForm) =>
      // @ts-ignore
      clinicianService.createProjectMapping(clinicianId, payload).then((r: any) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-mappings", clinicianId] });
      closeModal();
    },
  });

  const updateM = useMutation({
    mutationFn: ({ mappingId, payload }: { mappingId: string; payload: ProjectMappingForm }) =>
      // @ts-ignore
      clinicianService.updateProjectMapping(clinicianId, mappingId, payload).then((r: any) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-mappings", clinicianId] });
      closeModal();
    },
  });

  const deleteM = useMutation({
    mutationFn: (mappingId: string) =>
      clinicianService.deleteProjectMapping(clinicianId, mappingId).then((r: any) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["project-mappings", clinicianId] }),
  });

  // @ts-ignore
  const practices = (practicesQ.data?.practices || practicesQ.data || []).map((p: any) => ({
    id: p._id || p.id,
    name: p.name || p.practiceName || "Practice",
  }));

  const mappings = data?.mappings || [];

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal("add");
  };

  const openEdit = (m: any) => {
    setEditing(m);
    setForm({
      project:        m.project || "ARRS",
      practice_id:    m.practice_id || "",
      type:           m.type || "Locums Contractor",
      rate:           Number(m.rate || 0),
      rate_type:      m.rate_type || "Per Hour",
      vat_percentage: Number(m.vat_percentage || 0),
    });
    setModal("edit");
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (modal === "edit" && editing) {
      updateM.mutate({ mappingId: editing.id, payload: form });
    } else {
      createM.mutate(form);
    }
  };

  const isPending = createM.isPending || updateM.isPending;

  if (isLoading) return <Spinner />;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Project Mapping</h3>
        {canManage && (
          <Btn size="sm" className="w-full sm:w-auto" onClick={openAdd}>
            <Plus size={14} /> Add Project
          </Btn>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm border-collapse">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-bold">Project</th>
              <th className="px-4 py-3 font-bold">Practice</th>
              <th className="px-4 py-3 font-bold">Type</th>
              <th className="px-4 py-3 font-bold">Rate</th>
              <th className="px-4 py-3 font-bold">Rate Type</th>
              <th className="px-4 py-3 font-bold">VAT%</th>
              {canManage && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mappings.map((m: any) => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold text-slate-800">{m.project || "—"}</td>
                <td className="px-4 py-3 text-slate-700">{m.practice_name || "—"}</td>
                <td className="px-4 py-3 text-slate-700">{m.type || "—"}</td>
                <td className="px-4 py-3 text-slate-700">£{Number(m.rate || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-700">{m.rate_type || "—"}</td>
                <td className="px-4 py-3 text-slate-700">{Number(m.vat_percentage || 0).toFixed(0)}%</td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Delete this project mapping?")) {
                            deleteM.mutate(m.id);
                          }
                        }}
                        disabled={deleteM.isPending}
                        className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {mappings.length === 0 && (
              <tr>
                <td colSpan={canManage ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                  No project mappings yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <ModalShell
          title={modal === "edit" ? "Edit Project Mapping" : "Add Project Mapping"}
          onClose={closeModal}
        >
          <div className="grid gap-3">
            <FormField
              label="Project"
              value={form.project}
              onChange={(v: string) =>
                setForm((f) => ({ ...f, project: v, rate: defaultRate(v) }))
              }
              options={PROJECT_OPTS}
            />
            <FormField
              label="Practice"
              value={form.practice_id}
              onChange={(v: string) => setForm((f) => ({ ...f, practice_id: v }))}
              options={[["", "— Select practice —"], ...practices.map((p: any) => [p.id, p.name])]}
            />
            <FormField
              label="Type"
              value={form.type}
              onChange={(v: string) => setForm((f) => ({ ...f, type: v }))}
              options={TYPE_OPTS}
            />
            <FormField
              label="Rate (£)"
              value={form.rate}
              onChange={(v: string) => setForm((f) => ({ ...f, rate: Number(v) || 0 }))}
              type="number"
            />
            <FormField
              label="Rate type"
              value={form.rate_type}
              onChange={(v: string) => setForm((f) => ({ ...f, rate_type: v }))}
              options={RATE_TYPE_OPTS}
            />
            <FormField
              label="VAT %"
              value={form.vat_percentage}
              onChange={(v: string) => setForm((f) => ({ ...f, vat_percentage: Number(v) || 0 }))}
              type="number"
            />

            {/* Error */}
            {(createM.isError || updateM.isError) && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {(createM.error as any)?.response?.data?.message ||
                  (updateM.error as any)?.response?.data?.message ||
                  "Something went wrong. Please try again."}
              </p>
            )}

            <Btn
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={isPending || !form.practice_id}
            >
              {isPending ? "Saving…" : modal === "edit" ? "Save Changes" : "Save"}
            </Btn>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

