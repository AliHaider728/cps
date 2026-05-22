import { useClinicianLeave } from "../../hooks/useClinicianLeave";
import { useQuery } from "@tanstack/react-query";
import { clinicianService } from "../../services/api/clinicianService";
import { Badge } from "../../components/ui/Badge";

export default function ClinicianCPPEPage() {
  const { data: leaveData } = useClinicianLeave();
  const clinicianId = leaveData?.clinicianId;

  const { data, isLoading } = useQuery({
    queryKey: ["cppe", clinicianId],
    queryFn: () => clinicianService.getCPPE(clinicianId).then((r) => r.data),
    enabled: !!clinicianId,
  });

  const cppe = data?.cppe || data?.cppeStatus || data || {};

  if (!clinicianId) {
    return <p className="text-sm text-slate-600">No clinician profile linked.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-slate-900">My CPPE Progress</h1>
      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge color={cppe.completed ? "success" : cppe.enrolled ? "blue" : "warning"}>
            {cppe.completed ? "Completed" : cppe.enrolled ? "Enrolled" : cppe.exempt ? "Exempt" : "Not started"}
          </Badge>
          <span className="text-sm text-slate-600">
            Progress: {cppe.progressPct ?? 0}%
          </span>
        </div>
        {cppe.notes && <p className="mt-4 text-sm text-slate-700">{cppe.notes}</p>}
        <ul className="mt-4 space-y-2">
          {(cppe.modules || []).map((m, i) => (
            <li key={i} className="text-sm flex justify-between border-b border-slate-100 py-2">
              <span>{m.name}</span>
              <span className="text-slate-500">{m.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
