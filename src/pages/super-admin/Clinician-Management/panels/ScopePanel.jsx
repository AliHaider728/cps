import { useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../../../../services/api";
import { QK } from "../../../../lib/queryKeys";
import { Btn, ModalShell, FormField, Spinner, StatusBadge, fmtDate } from "./shared.jsx";

export default function ScopePanel({ clinician, canRestrict }) {
  const qc = useQueryClient();
  const id = clinician?._id;

  const restrictM = useMutation({
    mutationFn: (reason) => clinicianService.restrict(id, reason).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });

  const unrestrictM = useMutation({
    mutationFn: () => clinicianService.unrestrict(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
      qc.invalidateQueries({ queryKey: QK.CLINICIANS });
    },
  });

  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState("");

  const restricted = !!clinician?.restricted;

  const submitRestrict = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await restrictM.mutateAsync(reason);
    setModal(null);
    setReason("");
  };

  const handleUnrestrict = async () => {
    if (!window.confirm("Remove restriction from this clinician?")) return;
    await unrestrictM.mutateAsync();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${restricted ? "bg-red-50" : "bg-green-50"}`}>
            {restricted
              ? <ShieldAlert size={18} className="text-red-600" />
              : <ShieldCheck size={18} className="text-green-600" />}
          </div>
          <h3 className="text-base font-bold text-slate-800">Scope of practice</h3>
        </div>
        <StatusBadge status={restricted ? "restricted" : "active"} />
      </div>

      {restricted ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">This clinician is restricted</p>
              {clinician?.restrictionReason && (
                <p className="text-sm text-red-700 mt-1">Reason: {clinician.restrictionReason}</p>
              )}
              {clinician?.restrictedAt && (
                <p className="text-[11px] text-red-600 mt-1">Since {fmtDate(clinician.restrictedAt)}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm font-bold text-green-800">No restrictions in place — full scope of practice.</p>
          </div>
        </div>
      )}

      {canRestrict && (
        <div className="flex gap-2">
          {!restricted ? (
            <Btn variant="danger" onClick={() => setModal("restrict")}>
              <ShieldAlert size={14} /> Restrict clinician
            </Btn>
          ) : (
            <Btn variant="success" onClick={handleUnrestrict} disabled={unrestrictM.isPending}>
              {unrestrictM.isPending ? <Spinner /> : <ShieldCheck size={14} />} Remove restriction
            </Btn>
          )}
        </div>
      )}

      {modal === "restrict" && (
        <ModalShell
          title="Restrict clinician"
          onClose={() => setModal(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">Cancel</Btn>
              <Btn variant="danger" onClick={submitRestrict} disabled={restrictM.isPending || !reason.trim()} cls="flex-1">
                {restrictM.isPending ? <Spinner /> : <ShieldAlert size={14} />} Restrict
              </Btn>
            </>
          }
        >
          <FormField
            label="Reason for restriction"
            value={reason}
            onChange={setReason}
            textarea
            rows={5}
            required
          />
          <p className="text-[11px] text-slate-500">
            This will mark the clinician as restricted across the system. The reason will be visible to all reviewers and recorded in the audit log.
          </p>
        </ModalShell>
      )}
    </div>
  );
}
