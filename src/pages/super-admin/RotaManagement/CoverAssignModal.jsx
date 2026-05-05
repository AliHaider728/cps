import { useMemo, useState } from "react";
import { useAssignCover } from "../../../hooks/useRota";
import { rotaService } from "../../../services/api/rotaService";
import { useAuth } from "../../../context/AuthContext";

export default function CoverAssignModal({ open, onClose, gapShift }) {
  const assign = useAssignCover();
  const { user } = useAuth();
  const [clinicianId, setClinicianId] = useState("");
  const [serviceCode, setServiceCode] = useState("PCN");
  const [reason, setReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [complianceMissing, setComplianceMissing] = useState([]);
  const [blockedMessage, setBlockedMessage] = useState("");
  const canOverride = ["ops_manager", "super_admin"].includes(String(user?.role || ""));
  const canRender = open && !!gapShift;
  const title = useMemo(() => `Assign cover - ${String(gapShift?.date || "").slice(0, 10)}`, [gapShift]);

  const runChecks = async () => {
    const practiceId = String(gapShift?.practice_id || "");
    const restrictedRes = await rotaService.checkRestrictedClinician(clinicianId, practiceId);
    if (restrictedRes?.data?.data?.blocked) {
      setBlockedMessage(restrictedRes.data.data.reason || "Clinician is restricted at this practice.");
      return { ok: false };
    }
    const complianceRes = await rotaService.checkMandatoryCompliance(clinicianId);
    const missing = complianceRes?.data?.data?.missing || [];
    setComplianceMissing(missing);
    if (missing.length > 0 && !canOverride) {
      setBlockedMessage(`Missing/expired compliance documents: ${missing.join(", ")}`);
      return { ok: false };
    }
    return { ok: true, missing };
  };

  const onSubmit = async (override = false) => {
    setBlockedMessage("");
    const checked = await runChecks();
    if (!checked.ok) return;

    if ((checked.missing || []).length > 0 && !override) {
      setBlockedMessage("Compliance override is required.");
      return;
    }

    await assign.mutateAsync({
      gapId: gapShift.id,
      clinicianId,
      service_code: serviceCode,
      cover_reason: reason,
      compliance_override_by: override ? user?._id || user?.id : null,
      compliance_override_reason: override ? overrideReason : null,
    });
    onClose?.();
  };

  if (!canRender) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose} type="button">Close</button>
        </div>
        <div className="p-4 space-y-3">
          <input value={clinicianId} onChange={(e) => setClinicianId(e.target.value)} className="h-10 w-full px-3 rounded-md border border-slate-200 bg-white text-sm" placeholder="Clinician ID" />
          <div className="h-10 w-full px-3 rounded-md border border-slate-200 bg-slate-50 text-sm flex items-center">{String(gapShift?.practice_id || "")}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Project code</div>
              <div className="h-10 w-full px-3 rounded-md border border-slate-200 bg-slate-50 text-sm flex items-center">COV1</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600 mb-1">Service code</div>
              <select value={serviceCode} onChange={(e) => setServiceCode(e.target.value)} className="h-10 w-full px-3 rounded-md border border-slate-200 bg-white text-sm">
                {["PCN", "EA", "GPX"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[90px] w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm" placeholder="Reason" />
          {complianceMissing.length > 0 ? <div className="text-sm text-amber-700">Missing/expired docs: {complianceMissing.join(", ")}</div> : null}
          {canOverride && complianceMissing.length > 0 ? (
            <textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} className="min-h-[70px] w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm" placeholder="Override reason (ops_manager only)" />
          ) : null}
          {blockedMessage ? <div className="text-sm text-red-700">{blockedMessage}</div> : null}
          {assign.isError ? <div className="text-sm text-red-700">{String(assign.error?.message || "Failed")}</div> : null}
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-md border border-slate-200 text-slate-700 text-sm">Cancel</button>
          {canOverride && complianceMissing.length > 0 ? (
            <button type="button" onClick={() => onSubmit(true)} disabled={assign.isPending || !clinicianId || !overrideReason.trim()} className="px-3 py-2 rounded-md bg-amber-600 text-white text-sm disabled:opacity-60">Override & assign</button>
          ) : null}
          <button type="button" onClick={() => onSubmit(false)} disabled={assign.isPending || !clinicianId} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60">{assign.isPending ? "Assigning..." : "Assign cover"}</button>
        </div>
      </div>
    </div>
  );
}
