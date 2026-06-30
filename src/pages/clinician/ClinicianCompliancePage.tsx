import React from "react";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";
import { useQuery } from "@tanstack/react-query";
import { clinicianService } from "../../services/api/clinicianService";
import { Badge } from "../../components/ui/Badge";

const statusColor: Record<string, "success" | "warning" | "danger" | "blue" | "default"> = {
  valid: "success",
  expiring_soon: "warning",
  expired: "danger",
  missing: "danger",
  uploaded: "blue",
  approved: "success",
};

interface ComplianceDoc {
  _id?: string;
  id?: string;
  docType?: string;
  name?: string;
  status?: string;
  expiryDate?: string;
}

export default function ClinicianCompliancePage() {
  const { data: leaveData } = useClinicianLeave();
  const clinicianId = leaveData?.clinicianId;

  const { data, isLoading } = useQuery({
    queryKey: ["compliance", clinicianId],
    queryFn: () => clinicianService.getCompliance(clinicianId).then((r: any) => r.data),
    enabled: !!clinicianId,
  });

  const docs: ComplianceDoc[] = data?.documents || data?.docs || [];

  const validCount = docs.filter((d) =>
    ["valid", "approved", "uploaded"].includes(d.status || "")
  ).length;
  const pct = docs.length ? Math.round((validCount / docs.length) * 100) : 0;

  if (!clinicianId) {
    return <p className="text-sm text-slate-600">No clinician profile linked.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-slate-900">My Compliance</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">Overall compliance</p>
        <div className="mt-2 h-3 rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-500 mt-1">{pct}% · {validCount}/{docs.length} documents</p>
      </div>
      {isLoading && <p className="text-sm text-slate-500">Loading documents…</p>}
      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc._id || doc.id || doc.docType}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-semibold text-slate-800">{doc.docType || doc.name}</p>
              {doc.expiryDate && (
                <p className="text-xs text-slate-500">Expires {String(doc.expiryDate).slice(0, 10)}</p>
              )}
            </div>
            <Badge color={statusColor[doc.status || "missing"] || "default"}>{doc.status || "missing"}</Badge>
          </div>
        ))}
        {docs.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500">No compliance documents on file yet.</p>
        )}
      </div>
    </div>
  );
}


