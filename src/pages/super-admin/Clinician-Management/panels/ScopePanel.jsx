import { useEffect, useState } from "react";
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Save,
  Plus, Trash2, Eye, Monitor,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicianService } from "../../../../services/api";
import { QK } from "../../../../lib/queryKeys";
import { Btn, ModalShell, FormField, Spinner, StatusBadge, ToggleRow, fmtDate } from "./shared.jsx";

const COMMON_WORKSTREAMS = [
  "SMR", "EHCH", "Enhanced Access", "QOF Reviews", "Care Homes",
  "Long-Term Conditions", "Frailty", "Medicines Reconciliation",
  "Anticoagulation", "Structured Medication Reviews",
];

const COMMON_SYSTEMS = [
  "EMIS", "SystmOne", "ICE", "AccuRx", "Docman", "Rio",
  "Systm Online", "Footprint", "CERNER", "TPP",
];

export default function ScopePanel({ clinician, canRestrict, canManage }) {
  const qc = useQueryClient();
  const id = clinician?._id;

  // ─── Restrict / Unrestrict mutations ───────────────────────
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

  // ─── Scope patch mutation ───────────────────────────────────
  const scopeM = useMutation({
    mutationFn: (patch) => clinicianService.update(id, patch).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(id) });
    },
  });

  // ─── Local state ────────────────────────────────────────────
  const [restrictModal, setRestrictModal] = useState(false);
  const [reason,        setReason]        = useState("");
  const [editing,       setEditing]       = useState(false);
  const [saving,        setSaving]        = useState(false);

  const [workstreams,        setWorkstreams]        = useState([]);
  const [systemsInUse,       setSystemsInUse]       = useState([]);
  const [shadowingAvailable, setShadowingAvailable] = useState(false);
  const [extraWS,            setExtraWS]            = useState("");
  const [extraSys,           setExtraSys]           = useState("");

  // Populate from clinician
  useEffect(() => {
    setWorkstreams(clinician?.scopeWorkstreams  || []);
    setSystemsInUse(clinician?.systemsInUse    || []);
    setShadowingAvailable(!!clinician?.shadowingAvailable);
  }, [clinician]);

  // ─── Restrict helpers ──────────────────────────────────────
  const restricted = !!(clinician?.isRestricted || clinician?.restricted);

  const submitRestrict = async () => {
    if (!reason.trim()) return;
    await restrictM.mutateAsync(reason);
    setRestrictModal(false);
    setReason("");
  };

  const handleUnrestrict = async () => {
    if (!window.confirm("Remove restriction from this clinician?")) return;
    await unrestrictM.mutateAsync();
  };

  // ─── Scope edit helpers ────────────────────────────────────
  const toggleWS = (s) =>
    setWorkstreams((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);

  const addWS = () => {
    const v = extraWS.trim();
    if (v && !workstreams.includes(v)) setWorkstreams((c) => [...c, v]);
    setExtraWS("");
  };

  const toggleSys = (s) =>
    setSystemsInUse((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);

  const addSys = () => {
    const v = extraSys.trim();
    if (v && !systemsInUse.includes(v)) setSystemsInUse((c) => [...c, v]);
    setExtraSys("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await scopeM.mutateAsync({
        scopeWorkstreams:   workstreams,
        systemsInUse:       systemsInUse,
        shadowingAvailable: shadowingAvailable,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const allWS  = Array.from(new Set([...COMMON_WORKSTREAMS, ...workstreams]));
  const allSys = Array.from(new Set([...COMMON_SYSTEMS, ...systemsInUse]));

  return (
    <div className="space-y-4">

      {/* ── Restriction status card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${restricted ? "bg-red-50" : "bg-green-50"}`}>
              {restricted
                ? <ShieldAlert size={18} className="text-red-600" />
                : <ShieldCheck size={18} className="text-green-600" />}
            </div>
            <h3 className="text-base font-bold text-slate-800">Restricted / unsuitable flag</h3>
          </div>
          <StatusBadge status={restricted ? "restricted" : "active"} />
        </div>

        {restricted ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">This clinician is restricted</p>
                <p className="text-xs text-red-600 mt-1">
                  Hard block active — cannot be placed on rota or bookings.
                </p>
                {clinician?.restrictReason && (
                  <p className="text-sm text-red-700 mt-2">Reason: {clinician.restrictReason}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-4">
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm font-bold text-green-800">
                No restrictions — clinician can be placed on rota and bookings.
              </p>
            </div>
          </div>
        )}

        {canRestrict && (
          <div className="flex gap-2">
            {!restricted ? (
              <Btn variant="danger" onClick={() => setRestrictModal(true)}>
                <ShieldAlert size={14} /> Restrict clinician
              </Btn>
            ) : (
              <Btn variant="success" onClick={handleUnrestrict} disabled={unrestrictM.isPending}>
                {unrestrictM.isPending ? <Spinner /> : <ShieldCheck size={14} />} Remove restriction
              </Btn>
            )}
          </div>
        )}
      </div>

      {/* ── Scope of practice card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Eye size={18} className="text-violet-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Scope of practice</h3>
          </div>
          {canManage && !editing && (
            <Btn variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Btn>
          )}
          {canManage && editing && (
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm" onClick={() => { setEditing(false); }}>Cancel</Btn>
              <Btn size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner /> : <Save size={13} />} Save
              </Btn>
            </div>
          )}
        </div>

        {/* Shadowing */}
        <div className="mb-5">
          {editing ? (
            <ToggleRow
              label="Available for shadowing"
              checked={shadowingAvailable}
              onChange={setShadowingAvailable}
            />
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Eye size={15} className="text-slate-500 shrink-0" />
              <p className="text-sm font-semibold text-slate-700">
                Shadowing:{" "}
                <span className={shadowingAvailable ? "text-green-600" : "text-slate-400"}>
                  {shadowingAvailable ? "Available" : "Not available"}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Workstreams */}
        <div className="mb-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Workstreams trained &amp; actively using
          </p>
          {editing ? (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {allWS.map((s) => {
                  const on = workstreams.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleWS(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        on
                          ? "bg-violet-50 border-violet-300 text-violet-700"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  value={extraWS}
                  onChange={(e) => setExtraWS(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWS())}
                  placeholder="Add custom workstream…"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400"
                />
                <Btn variant="ghost" size="sm" onClick={addWS} disabled={!extraWS.trim()}>
                  <Plus size={13} /> Add
                </Btn>
              </div>
            </>
          ) : workstreams.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No workstreams recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {workstreams.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-violet-50 border-violet-200 text-violet-700"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Systems in use */}
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <Monitor size={11} className="inline mr-1" />
            Systems in use
          </p>
          {editing ? (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {allSys.map((s) => {
                  const on = systemsInUse.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSys(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        on
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  value={extraSys}
                  onChange={(e) => setExtraSys(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSys())}
                  placeholder="Add custom system…"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400"
                />
                <Btn variant="ghost" size="sm" onClick={addSys} disabled={!extraSys.trim()}>
                  <Plus size={13} /> Add
                </Btn>
              </div>
            </>
          ) : systemsInUse.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No systems recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {systemsInUse.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-blue-50 border-blue-200 text-blue-700"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Restrict modal */}
      {restrictModal && (
        <ModalShell
          title="Restrict clinician"
          onClose={() => setRestrictModal(false)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setRestrictModal(false)} cls="flex-1">Cancel</Btn>
              <Btn
                variant="danger"
                onClick={submitRestrict}
                disabled={restrictM.isPending || !reason.trim()}
                cls="flex-1"
              >
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
            This will apply a hard block — the clinician cannot be placed on rota or bookings at any client.
            The reason is recorded in the audit log.
          </p>
        </ModalShell>
      )}
    </div>
  );
}