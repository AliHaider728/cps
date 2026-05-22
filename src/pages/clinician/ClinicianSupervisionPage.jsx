import { useState } from "react";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";
import { useClinicianSupervision, useUpdateSupervisionLog } from "../../hooks/useClinicianSupervision";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

const ragColor = { green: "success", amber: "warning", red: "danger" };

export default function ClinicianSupervisionPage() {
  const { data: leaveData } = useClinicianLeave();
  const clinicianId = leaveData?.clinicianId;
  const { data, isLoading } = useClinicianSupervision(clinicianId);
  const updateM = useUpdateSupervisionLog(clinicianId);
  const [reflectionId, setReflectionId] = useState(null);
  const [reflectionText, setReflectionText] = useState("");

  const logs = data?.logs || data || [];

  const submitReflection = async (logId) => {
    await updateM.mutateAsync({
      logId,
      data: { reflection: reflectionText, reflectionSubmittedAt: new Date().toISOString() },
    });
    setReflectionId(null);
    setReflectionText("");
  };

  if (!clinicianId) {
    return (
      <p className="text-sm text-slate-600">
        No clinician profile linked. Contact admin to link your login.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-slate-900">My Supervision</h1>
      {isLoading && <p className="text-sm text-slate-500">Loading sessions…</p>}
      <div className="space-y-4">
        {logs.map((log) => {
          const rag = log.ragStatus || "green";
          const canReflect =
            log.type === "remote" &&
            !log.reflectionSubmittedAt &&
            !log.reflection;
          return (
            <div key={log._id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-800">
                  {log.sessionDate ? String(log.sessionDate).slice(0, 10) : "—"}
                </span>
                <Badge color={ragColor[rag] || "default"}>{rag}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Type: {log.type || "in-person"} · Supervisor:{" "}
                {log.supervisor?.email || log.supervisorName || "—"}
              </p>
              {log.reflection && (
                <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                  {log.reflection}
                </p>
              )}
              {canReflect && reflectionId !== log._id && (
                <Button className="mt-3" size="sm" onClick={() => setReflectionId(log._id)}>
                  Add reflection
                </Button>
              )}
              {reflectionId === log._id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm"
                    rows={3}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                  />
                  <Button size="sm" onClick={() => submitReflection(log._id)}>
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
