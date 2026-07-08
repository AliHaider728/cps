import React, { useState } from "react";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";
import { useClinicianSupervision, useUpdateSupervisionLog } from "../../hooks/useClinicianSupervision";
import { useAllUsers } from "../../hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

interface RagConfig {
  label: string;
  className: string;
}

const RAG_CONFIG: Record<string, RagConfig> = {
  green: { label: "No Concerns", className: "bg-green-100 text-green-700" },
  amber: { label: "Monitor", className: "bg-amber-100 text-amber-700" },
  red: { label: "Action Required", className: "bg-red-100 text-red-700" },
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  "in-person": "In-Person",
  remote: "Remote",
  telephone: "Telephone",
  group: "Group Session",
};

export default function ClinicianSupervisionPage() {
  const { data: leaveData } = useClinicianLeave();
  const clinicianId = leaveData?.clinicianId;
  const { data, isLoading } = useClinicianSupervision(clinicianId);
  const { data: usersData } = useAllUsers();
  const updateM = useUpdateSupervisionLog(clinicianId);
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");

  const users = (usersData as any)?.users || (Array.isArray(usersData) ? usersData : []);

  const getSupervisorName = (supervisorId: string) => {
    if (!supervisorId) return "Not assigned";
    const found = users.find((u: any) => u._id === supervisorId || u.id === supervisorId);
    return found?.name || found?.email || supervisorId;
  };

  const logs = data?.logs || (Array.isArray(data) ? data : []);

  const submitReflection = async (logId: string) => {
    try {
      await updateM.mutateAsync({
        logId,
        data: { reflection: reflectionText, reflectionSubmittedAt: new Date().toISOString() },
      });
      toast.success("Reflection submitted successfully");
      setReflectionId(null);
      setReflectionText("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit reflection. Please try again.");
    }
  };

  if (!clinicianId) {
    return (
      <p className="text-sm text-slate-600">
        No clinician profile linked. Contact admin to link your login.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-full space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-slate-900">My Supervision</h1>
      {isLoading && <p className="text-sm text-slate-500">Loading sessions…</p>}
      <div className="space-y-4">
        {logs.map((log: any) => {
          const rag = log.ragStatus || "green";
          const ragCfg = RAG_CONFIG[rag] || RAG_CONFIG.green;
          const canReflect =
            log.type === "remote" &&
            !log.reflectionSubmittedAt &&
            !log.reflection;
          return (
            <div key={log._id || log.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-800">
                  {log.sessionDate ? new Date(log.sessionDate).toLocaleDateString("en-GB") : "—"}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ragCfg.className}`}>
                  {ragCfg.label}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Type: {SESSION_TYPE_LABELS[log.type] || log.type || "In-Person"} · Supervisor:{" "}
                {log.supervisor?.email || log.supervisorName || getSupervisorName(log.supervisor)}
              </p>
              {log.reflection && (
                <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                  {log.reflection}
                </p>
              )}
              {canReflect && reflectionId !== (log._id || log.id) && (
                <Button className="mt-3" size="sm" onClick={() => setReflectionId(log._id || log.id)}>
                  Add reflection
                </Button>
              )}
              {reflectionId === (log._id || log.id) && (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm"
                    rows={3}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                  />
                  <Button size="sm" onClick={() => submitReflection(log._id || log.id)}>
                    Submit reflection
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        {logs.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500">No supervision sessions recorded yet.</p>
        )}
      </div>
    </div>
  );
}


