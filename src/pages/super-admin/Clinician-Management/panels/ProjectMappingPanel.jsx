import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { clinicianService } from "../../../../services/api/clinicianService";
import { usePractices } from "../../../../hooks/usePractice";
import { Btn, ModalShell, FormField, Spinner } from "./shared.jsx";

const PROJECT_OPTS = ["ARRS", "EA", "Direct", "COVER"];
const TYPE_OPTS = ["Locums Contractor", "Employed", "Limited Company"];
const RATE_TYPE_OPTS = ["Per Hour", "Fixed"];

const defaultRate = (project) => (project === "COVER" || project === "EA" ? 29 : 28);

export default function ProjectMappingPanel({ clinicianId, canManage }) {
  const qc = useQueryClient();
  const practicesQ = usePractices();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    project: "ARRS",
    practice_id: "",
    type: "Locums Contractor",
    rate: 28,
    rate_type: "Per Hour",
    vat_percentage: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["project-mappings", clinicianId],
    queryFn: () => clinicianService.getProjectMappings(clinicianId).then((r) => r.data),
    enabled: !!clinicianId,
  });

  const createM = useMutation({
    mutationFn: (payload) =>
      clinicianService.createProjectMapping(clinicianId, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-mappings", clinicianId] });
      setModal(false);
    },
  });

  const deleteM = useMutation({
    mutationFn: (mappingId) =>
      clinicianService.deleteProjectMapping(clinicianId, mappingId).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["project-mappings", clinicianId] }),
  });

  const practices = (practicesQ.data?.practices || practicesQ.data || []).map((p) => ({
    id: p._id || p.id,
    name: p.name || p.practiceName || "Practice",
  }));

  const mappings = data?.mappings || [];

  if (isLoading) return <Spinner />;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Project Mapping</h3>
        {canManage && (
          <Btn
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              setForm({
                project: "ARRS",
                practice_id: "",
                type: "Locums Contractor",
                rate: 28,
                rate_type: "Per Hour",
                vat_percentage: 0,
              });
              setModal(true);
            }}
          >
            <Plus size={14} /> Add Project
          </Btn>
        )}
      </div>

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
            {mappings.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold text-slate-800">{m.project || "—"}</td>
                <td className="px-4 py-3 text-slate-700">{m.practice_name || "—"}</td>
                <td className="px-4 py-3 text-slate-700">{m.type || "—"}</td>
                <td className="px-4 py-3 text-slate-700">£{Number(m.rate || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-700">{m.rate_type || "—"}</td>
                <td className="px-4 py-3 text-slate-700">{Number(m.vat_percentage || 0).toFixed(0)}%</td>
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Delete this project mapping?")) {
                          deleteM.mutate(m.id);
                        }
                      }}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
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

      {modal && (
        <ModalShell title="Add Project Mapping" onClose={() => setModal(false)}>
          <div className="grid gap-3">
            <FormField
              label="Project"
              value={form.project}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  project: v,
                  rate: defaultRate(v),
                }))
              }
              options={PROJECT_OPTS}
            />
            <FormField label="Practice" value={form.practice_id} onChange={(v) => setForm((f) => ({ ...f, practice_id: v }))} options={[["", "— Select practice —"], ...practices.map((p) => [p.id, p.name])]} />
            <FormField label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={TYPE_OPTS} />
            <FormField
              label="Rate (£)"
              value={form.rate}
              onChange={(v) => setForm((f) => ({ ...f, rate: Number(v) || 0 }))}
              type="number"
            />
            <FormField
              label="Rate type"
              value={form.rate_type}
              onChange={(v) => setForm((f) => ({ ...f, rate_type: v }))}
              options={RATE_TYPE_OPTS}
            />
            <FormField
              label="VAT %"
              value={form.vat_percentage}
              onChange={(v) => setForm((f) => ({ ...f, vat_percentage: Number(v) || 0 }))}
              type="number"
            />
            <Btn
              className="w-full sm:w-auto"
              onClick={() => createM.mutate(form)}
              disabled={createM.isPending || !form.practice_id}
            >
              Save
            </Btn>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
