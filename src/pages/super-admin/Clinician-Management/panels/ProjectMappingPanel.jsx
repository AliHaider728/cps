import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { clinicianService } from "../../../../services/api/clinicianService";
import { usePractices } from "../../../../hooks/usePractice";
import { Btn, ModalShell, FormField, Spinner } from "./shared.jsx";
import { Button } from "../../../../components/ui/Button.jsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../../../components/ui/table.jsx";
import TableScroll from "../../../../components/shared/TableScroll.jsx";

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

      <TableScroll>
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Practice</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Rate Type</TableHead>
              <TableHead>VAT%</TableHead>
              {canManage && <TableHead className="text-right" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappings.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-semibold">{m.project || "—"}</TableCell>
                <TableCell>{m.practice_name || "—"}</TableCell>
                <TableCell>{m.type || "—"}</TableCell>
                <TableCell>£{Number(m.rate || 0).toFixed(2)}</TableCell>
                <TableCell>{m.rate_type || "—"}</TableCell>
                <TableCell>{Number(m.vat_percentage || 0).toFixed(0)}%</TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm("Delete this project mapping?")) {
                          deleteM.mutate(m.id);
                        }
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {mappings.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 7 : 6} className="py-8 text-center text-muted-foreground">
                  No project mappings yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableScroll>

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
