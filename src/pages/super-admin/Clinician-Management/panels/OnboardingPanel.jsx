import { useEffect, useState } from "react";
import { Rocket, Save, Send } from "lucide-react";
import {
  useUpdateOnboarding, useSendWelcomePack,
} from "../../../../hooks/useClinician";
import { Btn, FormField, Spinner, ToggleRow, fmtDate } from "./shared.jsx";

const CHECKLIST = [
  ["mobilisationPlan",  "Mobilisation plan in place"],
  ["systemsRequested",  "Systems / accounts requested"],
  ["smartcardOrdered",  "Smartcard ordered"],
  ["contractSigned",    "Contract signed"],
  ["indemnityVerified", "Professional indemnity verified"],
  ["inductionBooked",   "Induction booked"],
];

export default function OnboardingPanel({ clinicianId, clinician, canManage }) {
  const saveM    = useUpdateOnboarding(clinicianId);
  const welcomeM = useSendWelcomePack(clinicianId);

  const initial = () => ({
    welcomePackSent:   clinician?.onboarding?.welcomePackSent   ?? false,
    welcomePackSentAt: clinician?.onboarding?.welcomePackSentAt ?? null,
    mobilisationPlan:  clinician?.onboarding?.mobilisationPlan  ?? false,
    systemsRequested:  clinician?.onboarding?.systemsRequested  ?? false,
    smartcardOrdered:  clinician?.onboarding?.smartcardOrdered  ?? false,
    contractSigned:    clinician?.onboarding?.contractSigned    ?? false,
    indemnityVerified: clinician?.onboarding?.indemnityVerified ?? false,
    inductionBooked:   clinician?.onboarding?.inductionBooked   ?? false,
    notes:             clinician?.onboarding?.notes             ?? "",
  });

  const [state, setState] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [portal, setPortal] = useState("");

  useEffect(() => { setState(initial()); setDirty(false); /* eslint-disable-next-line */ }, [clinician]);

  const set = (patch) => { setState((s) => ({ ...s, ...patch })); setDirty(true); };

  const handleSave = async () => {
    await saveM.mutateAsync({ ...state });
    setDirty(false);
  };

  const handleSendWelcome = async () => {
    if (!clinician?.email) {
      alert("Clinician has no email on record.");
      return;
    }
    if (!window.confirm(`Send welcome pack to ${clinician.email}?`)) return;
    await welcomeM.mutateAsync({ portalUrl: portal || undefined });
  };

  const completedCount = CHECKLIST.filter(([k]) => !!state[k]).length;
  const totalCount     = CHECKLIST.length;
  const pct            = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
            <Rocket size={18} className="text-orange-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Onboarding</h3>
        </div>
        {canManage && (
          <Btn size="sm" onClick={handleSave} disabled={!dirty || saveM.isPending}>
            {saveM.isPending ? <Spinner /> : <Save size={13} />} Save
          </Btn>
        )}
      </div>

      <div className="rounded-xl bg-slate-50 p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</p>
          <p className="text-sm font-extrabold text-slate-800">{completedCount} / {totalCount} ({pct}%)</p>
        </div>
        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {CHECKLIST.map(([k, label]) => (
          <ToggleRow
            key={k}
            label={label}
            checked={state[k]}
            onChange={(v) => set({ [k]: v })}
            disabled={!canManage}
          />
        ))}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-bold text-amber-800">Welcome pack</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {state.welcomePackSent
                ? `Sent ${fmtDate(state.welcomePackSentAt)}`
                : "Not sent yet"}
            </p>
          </div>
          {canManage && (
            <Btn variant="warn" size="sm" onClick={handleSendWelcome} disabled={welcomeM.isPending || !clinician?.email}>
              {welcomeM.isPending ? <Spinner /> : <Send size={13} />}
              {state.welcomePackSent ? "Resend" : "Send"}
            </Btn>
          )}
        </div>
        <input
          value={portal}
          onChange={(e) => setPortal(e.target.value)}
          placeholder="Portal URL override (optional)"
          className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white focus:outline-none focus:border-amber-400"
        />
      </div>

      <FormField
        label="Notes"
        value={state.notes}
        onChange={(v) => set({ notes: v })}
        textarea
        rows={4}
      />
    </div>
  );
}
