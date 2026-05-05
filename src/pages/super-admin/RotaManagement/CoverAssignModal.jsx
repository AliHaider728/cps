import { useMemo, useState } from "react";
import { useAssignCover } from "../../../hooks/useRota";
import { rotaService } from "../../../services/api/rotaService";
import { useAuth } from "../../../context/AuthContext";

const SERVICE_CODES = ["PCN", "EA", "GPX"];

export default function CoverAssignModal({ open, onClose, gapShift }) {
  const assign = useAssignCover();
  const { user } = useAuth();
  const [clinicianId, setClinicianId] = useState("");
  const [serviceCode, setServiceCode] = useState("PCN");
  const [reason, setReason] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [complianceMissing, setComplianceMissing] = useState([]);
  const [blockedMessage, setBlockedMessage] = useState("");
  const [checking, setChecking] = useState(false);

  const canOverride = ["ops_manager", "super_admin"].includes(String(user?.role || ""));
  const canRender = open && !!gapShift;

  const title = useMemo(
    () => `Assign cover — ${String(gapShift?.date || "").slice(0, 10)}`,
    [gapShift]
  );

  const runChecks = async () => {
    setChecking(true);
    const practiceId = String(gapShift?.practice_id || "");
    const restrictedRes = await rotaService.checkRestrictedClinician(clinicianId, practiceId);
    if (restrictedRes?.data?.data?.blocked) {
      setBlockedMessage(restrictedRes.data.data.reason || "Clinician is restricted at this practice.");
      setChecking(false);
      return { ok: false };
    }
    const complianceRes = await rotaService.checkMandatoryCompliance(clinicianId);
    const missing = complianceRes?.data?.data?.missing || [];
    setComplianceMissing(missing);
    if (missing.length > 0 && !canOverride) {
      setBlockedMessage(`Missing/expired compliance: ${missing.join(", ")}`);
      setChecking(false);
      return { ok: false };
    }
    setChecking(false);
    return { ok: true, missing };
  };

  const onSubmit = async (override = false) => {
    setBlockedMessage("");
    const checked = await runChecks();
    if (!checked.ok) return;
    if ((checked.missing || []).length > 0 && !override) {
      setBlockedMessage("Compliance override required.");
      return;
    }
    await assign.mutateAsync({
      gapId: gapShift?.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900">Assign Cover</span>
              </div>
              <p className="text-xs text-slate-500">{title}</p>
              {gapShift?.practice_id && (
                <p className="text-xs text-slate-400 mt-0.5">Practice: {String(gapShift.practice_id)}</p>
              )}
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Clinician */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Clinician ID</label>
            <input
              value={clinicianId}
              onChange={(e) => setClinicianId(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. CLN-001"
            />
          </div>

          {/* Service code + project code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project code</label>
              <div className="h-10 flex items-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-medium text-slate-500">
                COV1
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service code</label>
              <div className="flex gap-1">
                {SERVICE_CODES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setServiceCode(c)}
                    className={`flex-1 h-10 rounded-lg text-xs font-semibold border transition-all ${
                      serviceCode === c
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cover reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              placeholder="Reason for cover assignment…"
            />
          </div>

          {/* Compliance warnings */}
          {complianceMissing.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-amber-800">Missing/expired compliance</p>
                  <p className="text-xs text-amber-700 mt-0.5">{complianceMissing.join(", ")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Override reason */}
          {canOverride && complianceMissing.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1.5">Override reason (ops_manager only)</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-900 placeholder-amber-300 transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
                placeholder="Justify compliance override…"
              />
            </div>
          )}

          {/* Error messages */}
          {blockedMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414-1.414A9 9 0 105.636 18.364l1.414 1.414A9 9 0 0018.364 5.636z" />
              </svg>
              {blockedMessage}
            </div>
          )}
          {assign.isError && (
            <div className="text-xs text-red-600">{String(assign.error?.message || "Failed")}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95">
            Cancel
          </button>
          {canOverride && complianceMissing.length > 0 && (
            <button
              type="button"
              onClick={() => onSubmit(true)}
              disabled={assign.isPending || checking || !clinicianId || !overrideReason.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Override &amp; assign
            </button>
          )}
          <button
            type="button"
            onClick={() => onSubmit(false)}
            disabled={assign.isPending || checking || !clinicianId}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {assign.isPending || checking ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                {checking ? "Checking…" : "Assigning…"}
              </>
            ) : "Assign cover"}
          </button>
        </div>
      </div>
    </div>
  );
}