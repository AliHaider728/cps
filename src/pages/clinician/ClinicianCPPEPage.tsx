import React from "react";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";
import { useClinicianCPPE } from "../../hooks/useClinicianCPPE";
import { Badge } from "../../components/ui/Badge";

interface Module {
  name: string;
  status: string;
}

interface CPPEData {
  enrolled?: boolean;
  progress?: number;
  completionPercentage?: number;
  progressPct?: number;
  enrolledAt?: string;
  completedAt?: string;
  modules?: Module[];
}

export default function ClinicianCPPEPage() {
  const { data: leaveData } = useClinicianLeave();
  // @ts-ignore
  const clinicianId = leaveData?.clinicianId;

  const { data, isLoading } = useClinicianCPPE(clinicianId);

  const cppeData: CPPEData = data?.cppe || data?.cppeStatus || data || {};
  const isEnrolled = !!cppeData.enrolled;
  const progress = Number(cppeData.progress ?? cppeData.completionPercentage ?? cppeData.progressPct ?? 0) || 0;
  const enrolledAt = cppeData.enrolledAt;
  const completedAt = cppeData.completedAt;
  const modules = cppeData.modules || [];

  if (!clinicianId) {
    return <p className="text-sm text-slate-600">No clinician profile linked.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-slate-900">My CPPE Progress</h1>
      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {!isLoading && !isEnrolled ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="font-semibold text-slate-700">Not Yet Enrolled in CPPE</h3>
          <p className="text-sm text-slate-400 mt-1">
            Contact your supervisor or training manager to enrol in the CPPE programme.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={progress >= 100 ? "success" : "blue"}>
                {progress >= 100 ? "Completed" : "Enrolled"}
              </Badge>
              <span className="text-sm text-slate-600">Overall Progress</span>
            </div>
            <span className="font-bold text-blue-600">{progress}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 mt-3">
            <div
              className="h-3 bg-blue-600 rounded-full transition-all"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Enrolled: {enrolledAt ? new Date(enrolledAt).toLocaleDateString("en-GB") : "—"}
            {completedAt ? ` · Completed: ${new Date(completedAt).toLocaleDateString("en-GB")}` : ""}
          </p>

          {modules.length > 0 && (
            <ul className="mt-5 space-y-2">
              {modules.map((m, i) => (
                <li key={i} className="text-sm flex justify-between border-b border-slate-100 py-2">
                  <span className="font-medium text-slate-700">{m.name}</span>
                  <span className="text-slate-500">{m.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

