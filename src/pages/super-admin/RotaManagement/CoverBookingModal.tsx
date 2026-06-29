import React, { useState, useMemo } from "react";
import { useAssignCover } from "../../../hooks/useRota";
import {
  X,
  UserCheck,
  Shield,
  Clock,
  AlertCircle,
  Loader2,
  CheckSquare,
  ChevronRight,
} from "lucide-react";

/* ── Interfaces ─────────────────────────────────────────────────────── */
export interface GapShift {
  id: string;
  practice_id: string;
  date: string;
  start_time: string;
  end_time: string;
  hours_to_cover: number;
}

export interface CoverBookingModalProps {
  open: boolean;
  onClose: () => void;
  gapShift: GapShift | null;
  onAssign?: () => void;
}

/* ── Helpers ────────────────────────────────────────────────────────── */
const isValidUUID = (uuid: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);

/* ── Static style maps — NO dynamic Tailwind strings ────────────────── */
const SERVICE_STYLES: Record<string, { active: string; label: string }> = {
  PCN: { active: "border-purple-300 bg-purple-50 text-purple-800", label: "Primary Care Network" },
  GPX: { active: "border-blue-300 bg-blue-50 text-blue-800",       label: "General Practice"    },
  EAX: { active: "border-indigo-300 bg-indigo-50 text-indigo-800", label: "Enhanced Access"      },
};
const SERVICE_CODES = Object.entries(SERVICE_STYLES).map(([code, s]) => ({ code, ...s }));

const EXP_LEVELS = [
  { value: "junior",       label: "Junior",       sub: "0–2 yrs"         },
  { value: "intermediate", label: "Intermediate", sub: "2–5 yrs"         },
  { value: "senior",       label: "Senior",       sub: "5+ yrs"          },
  { value: "advanced",     label: "Advanced",     sub: "5+ yrs specialist"},
];

const COMPLIANCE_ITEMS = [
  { id: "dpa",       label: "Data Protection Awareness" },
  { id: "nda",       label: "Non-Disclosure Agreement"  },
  { id: "indemnity", label: "Professional Indemnity"    },
  { id: "dbs",       label: "DBS Check"                 },
  { id: "gphc",      label: "GPhC Registration"         },
  { id: "training",  label: "Mandatory Training"        },
];

/* ── Component ──────────────────────────────────────────────────────── */
export default function CoverBookingModal({ open, onClose, gapShift, onAssign }: CoverBookingModalProps) {
  const assignCover = useAssignCover();

  const [clinicianId,   setClinicianId]   = useState<string>("");
  const [startTime,     setStartTime]     = useState<string>(gapShift?.start_time ?? "09:00");
  const [endTime,       setEndTime]       = useState<string>(gapShift?.end_time   ?? "17:00");
  const [serviceCode,   setServiceCode]   = useState<string>("GPX");
  const [coverReason,   setCoverReason]   = useState<string>("");
  const [accessRequest, setAccessRequest] = useState<boolean>(false);
  const [notes,         setNotes]         = useState<string>("");
  const [expLevel,      setExpLevel]      = useState<string>("intermediate");

  /* ── Per-item compliance checklist ── */
  const [compliance, setCompliance] = useState<Record<string, boolean>>(
    Object.fromEntries(COMPLIANCE_ITEMS.map((i) => [i.id, false]))
  );
  const allCompliant = Object.values(compliance).every(Boolean);
  const toggleCompliance = (id: string) => setCompliance((p) => ({ ...p, [id]: !p[id] }));

  /* ── Restriction check state ── */
  const [restrictionCheck,    setRestrictionCheck]    = useState<{ blocked: boolean; reason?: string } | null>(null);
  const [isCheckingRestriction, setIsCheckingRestriction] = useState<boolean>(false);

  const title = useMemo(() => {
    if (!gapShift) return "Assign Cover";
    return new Date(gapShift.date).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }, [gapShift]);

  /* ── Restriction check ── */
  const checkRestrictions = async () => {
    if (!clinicianId || !isValidUUID(clinicianId)) {
      setRestrictionCheck({ blocked: true, reason: "Please enter a valid clinician UUID." });
      return false;
    }
    setIsCheckingRestriction(true);
    setRestrictionCheck(null);
    try {
      const res    = await fetch(`/api/rota/checks/restricted?clinicianId=${clinicianId}&practiceId=${gapShift?.practice_id}`);
      const result = await res.json();
      if (result.blocked) {
        setRestrictionCheck({ blocked: true, reason: result.reason ?? "Clinician is restricted at this practice." });
        return false;
      }
      setRestrictionCheck({ blocked: false });
      return true;
    } catch {
      setRestrictionCheck({ blocked: true, reason: "Failed to verify clinician restrictions." });
      return false;
    } finally {
      setIsCheckingRestriction(false);
    }
  };

  /* ── Submit ── */
  const handleAssign = async () => {
    if (!isValidUUID(clinicianId)) {
      setRestrictionCheck({ blocked: true, reason: "Please enter a valid clinician UUID." });
      return;
    }
    const canProceed = await checkRestrictions();
    if (!canProceed) return;
    if (!allCompliant) {
      /* Scroll to checklist — just highlight, don't block */
      document.getElementById("compliance-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    assignCover.mutate(
      {
        gapId:              gapShift?.id,
        clinicianId,
        startTime,
        endTime,
        serviceCode,
        coverReason:        coverReason || `Covering gap at ${gapShift?.practice_id}`,
        accessRequestNeeded: accessRequest,
        workstreamsNotes:   notes,
        projectCode:        "COVER",
        experienceLevel:    expLevel,
      },
      {
        onSuccess: () => { onClose(); onAssign?.(); },
      }
    );
  };

  if (!open || !gapShift) return null;

  const inputCls = "h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0 shadow-md">
                <UserCheck size={17} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Assign Cover</p>
                <p className="text-xs text-slate-400 mt-0.5">{title}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Gap info strip */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 px-3 py-2">
            <AlertCircle size={14} className="text-orange-600 shrink-0" />
            <p className="text-xs font-semibold text-orange-800">
              Gap: {gapShift.hours_to_cover}h at {gapShift.practice_id}
            </p>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Clinician ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Clinician UUID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                value={clinicianId}
                onChange={(e) => { setClinicianId(e.target.value); setRestrictionCheck(null); }}
                className={inputCls}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              {isCheckingRestriction && (
                <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />
              )}
            </div>

            {/* Restriction warning */}
            {restrictionCheck?.blocked && (
              <div className="mt-2 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
                <Shield size={15} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-800">Booking Blocked — Restricted Clinician</p>
                  <p className="text-xs text-red-700 mt-0.5">{restrictionCheck.reason}</p>
                </div>
                <button type="button" onClick={() => setRestrictionCheck(null)} className="rounded-lg p-1 text-red-400 hover:bg-red-100 transition-colors">
                  <X size={13} />
                </button>
              </div>
            )}
            {restrictionCheck && !restrictionCheck.blocked && (
              <p className="mt-1.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckSquare size={12} /> Clinician cleared — no restrictions
              </p>
            )}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Start time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">End time</label>
              <input type="time" value={endTime}   onChange={(e) => setEndTime(e.target.value)}   className={inputCls} />
            </div>
          </div>

          {/* Service code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Service Code <span className="text-slate-400 font-normal">(Practice type)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_CODES.map(({ code, active, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setServiceCode(code)}
                  className={[
                    "rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95",
                    serviceCode === code ? active + " shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <p className="font-extrabold">{code}</p>
                  <p className="text-[10px] opacity-70 mt-0.5 leading-tight">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cover reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Cover Reason</label>
            <textarea
              value={coverReason}
              onChange={(e) => setCoverReason(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Reason for cover assignment…"
            />
          </div>

          {/* Experience level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Experience Level <span className="text-slate-400 font-normal">(for matching)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXP_LEVELS.map(({ value, label, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setExpLevel(value)}
                  className={[
                    "rounded-xl border px-3 py-2.5 text-left text-xs transition-all hover:scale-[1.02] active:scale-95",
                    expLevel === value
                      ? "border-violet-300 bg-violet-50 text-violet-800 font-bold shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 font-semibold hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <p>{label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Compliance checklist */}
          <div id="compliance-section">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Compliance Checklist <span className="text-red-500">*</span>
              </label>
              {allCompliant
                ? <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"><CheckSquare size={12} /> All clear</span>
                : <span className="text-[11px] font-semibold text-orange-500">{Object.values(compliance).filter(Boolean).length}/{COMPLIANCE_ITEMS.length} checked</span>
              }
            </div>
            <div className={[
              "rounded-xl border p-3 space-y-2 transition-colors",
              !allCompliant ? "border-orange-200 bg-orange-50" : "border-emerald-200 bg-emerald-50",
            ].join(" ")}>
              {COMPLIANCE_ITEMS.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={compliance[id]}
                    onChange={() => toggleCompliance(id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  />
                  <span className={`text-xs font-medium transition-colors ${compliance[id] ? "text-emerald-700 line-through opacity-70" : "text-slate-700 group-hover:text-slate-900"}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* System access */}
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={accessRequest}
              onChange={(e) => setAccessRequest(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            />
            <div>
              <p className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">System access request needed</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Check if clinician needs system access for this practice</p>
            </div>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Additional notes…"
            />
          </div>

          {/* API error */}
          {assignCover.isError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              {String((assignCover.error as any)?.message ?? "Failed to assign cover")}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5 pt-4 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400">
            {!allCompliant && <span className="text-orange-500 font-semibold">Complete checklist to assign</span>}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={assignCover.isPending || isCheckingRestriction || !clinicianId.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignCover.isPending || isCheckingRestriction
                ? <><Loader2 size={14} className="animate-spin" />{isCheckingRestriction ? "Checking…" : "Assigning…"}</>
                : <><UserCheck size={14} /> Assign Cover</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
