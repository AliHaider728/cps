import { useMemo, useState } from "react";
import { useCreateRota, useRotaList } from "../../../hooks/useRota";
import {
  Building2, Clock, User, FileText, ChevronDown, Loader2,
  Briefcase, Umbrella, Thermometer, BookOpen, AlertTriangle,
  UserPlus, XCircle, X, Plus, PoundSterling,
} from "lucide-react";

/* ── Status options ─────────────────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: "working",      label: "Working",      color: "bg-emerald-500", Icon: Briefcase     },
  { value: "annual_leave", label: "Annual Leave", color: "bg-blue-500",    Icon: Umbrella      },
  { value: "sick",         label: "Sick",         color: "bg-red-500",     Icon: Thermometer   },
  { value: "cppe",         label: "CPPE",         color: "bg-purple-500",  Icon: BookOpen      },
  { value: "gap",          label: "Gap",          color: "bg-orange-500",  Icon: AlertTriangle },
  { value: "cover",        label: "Cover",        color: "bg-amber-500",   Icon: UserPlus      },
  { value: "cancelled",    label: "Cancelled",    color: "bg-slate-400",   Icon: XCircle       },
];

const CLINICAL_SYSTEMS = ["EMIS", "SystmOne", "Vision", "AccuRx", "ICE", "Other"];
const SERVICE_CODES    = ["GPX", "EAX", "PCN", "EA"];

/* ── Practice list derived from seed / DB (hardcoded known ones + custom) ── */
const KNOWN_PRACTICES = [
  { id: "P84001", name: "Pendleton Medical Centre",    system: "EMIS"      },
  { id: "P84002", name: "Weaste & Seedley Surgery",    system: "EMIS"      },
  { id: "P82001", name: "Fishergate Hill Surgery",     system: "SystmOne"  },
  { id: "P82002", name: "Larches Surgery",             system: "SystmOne"  },
  { id: "P83001", name: "Speke Medical Centre",        system: "SystmOne"  },
];

/* ── Hours calculator ───────────────────────────────────────────────────── */
const calcHours = (start, end) => {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return null;
  return Math.round((diff / 60) * 100) / 100;
};

/* ── Main Modal ─────────────────────────────────────────────────────────── */
export default function AddShiftModal({ open, onClose, clinicianId, date }) {
  const now    = useMemo(() => new Date(), []);
  const month  = now.getMonth() + 1;
  const year   = now.getFullYear();

  // Fetch all clinicians from rota grid for the dropdown
  const { data: rotaData, isLoading: rotaLoading } = useRotaList({ month, year });
  const allClinicians = useMemo(() => {
    const rows = rotaData?.data?.clinicians ?? rotaData?.clinicians ?? [];
    return rows.map((r) => r?.clinician).filter(Boolean);
  }, [rotaData]);

  const create = useCreateRota();

  // Form state
  const [selectedClinicianId, setSelectedClinicianId] = useState(clinicianId || "");
  const [clinicianSearch,     setClinicianSearch]     = useState("");
  const [clinicianDdOpen,     setClinicianDdOpen]     = useState(false);
  const [practiceSearch,      setPracticeSearch]      = useState("");
  const [practiceDdOpen,      setPracticeDdOpen]      = useState(false);
  const [selectedPractice,    setSelectedPractice]    = useState(null);
  const [customPracticeId,    setCustomPracticeId]    = useState("");
  const [showCustomPractice,  setShowCustomPractice]  = useState(false);
  const [status,              setStatus]              = useState("working");
  const [startTime,           setStartTime]           = useState("09:00");
  const [endTime,             setEndTime]             = useState("17:00");
  const [clinicalSystem,      setClinicalSystem]      = useState("");
  const [serviceCode,         setServiceCode]         = useState("GPX");
  const [notes,               setNotes]               = useState("");
  const [isCover,             setIsCover]             = useState(false);
  const [coverReason,         setCoverReason]         = useState("");
  // ── NEW: hourly rate (required by spec — shifts collection has hourly_rate + total_value) ──
  const [hourlyRate,          setHourlyRate]          = useState("");

  // Derived
  const calculatedHours = calcHours(startTime, endTime);
  const totalValue = hourlyRate && calculatedHours
    ? Math.round(parseFloat(hourlyRate) * calculatedHours * 100) / 100
    : null;

  const selectedClinician = allClinicians.find(
    (c) => String(c._id ?? c.id) === String(selectedClinicianId)
  );

  const filteredClinicians = allClinicians.filter((c) => {
    const name  = (c.fullName ?? c.name ?? "").toLowerCase();
    const email = (c.email ?? "").toLowerCase();
    const q     = clinicianSearch.toLowerCase();
    return !q || name.includes(q) || email.includes(q);
  });

  const filteredPractices = KNOWN_PRACTICES.filter((p) => {
    const q = practiceSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const title = useMemo(() => {
    if (!date) return "Add Shift";
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }, [date]);

  const practiceId = showCustomPractice
    ? customPracticeId.trim()
    : (selectedPractice?.id || "");

  const handleCreate = () => {
    if (!practiceId) return;

    create.mutate({
      clinician_id:      selectedClinicianId || null,
      practice_id:       practiceId,
      date,
      day_of_week:       date ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(date + "T00:00:00").getDay()] : null,
      start_time:        startTime,
      end_time:          endTime,
      hours:             calculatedHours,
      hourly_rate:       hourlyRate ? parseFloat(hourlyRate) : null,   // ← NEW
      total_value:       totalValue,                                    // ← NEW (auto-calc)
      clinical_system:   clinicalSystem || selectedPractice?.system || null,
      status,
      service_code:      serviceCode,
      is_cover:          isCover,
      project_code:      isCover ? "COV1" : null,
      cover_reason:      isCover ? coverReason : null,
      workstreams_notes: notes,
      source:            "manual",
    }, {
      onSuccess: () => {
        onClose?.();
      },
    });
  };

  if (!open || !date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 px-5 pt-5 pb-4 border-b border-slate-100 bg-white rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <Plus size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Add Shift</p>
                <p className="text-xs text-slate-500 mt-0.5">{title}</p>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-5 space-y-5">

          {/* ── 1. Clinician ── */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <User size={11} className="inline mr-1" /> Clinician
              <span className="ml-1 text-slate-400 font-normal normal-case">(optional — leave blank for gap)</span>
            </label>

            {clinicianId ? (
              /* Pre-selected (from weekly view cell click) */
              <div className="flex items-center gap-3 h-10 px-3 rounded-xl border border-blue-200 bg-blue-50">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {(selectedClinician?.fullName ?? "?").charAt(0)}
                </div>
                <span className="text-sm font-semibold text-blue-800 truncate">
                  {selectedClinician?.fullName ?? selectedClinician?.name ?? clinicianId}
                </span>
              </div>
            ) : (
              /* Search dropdown */
              <div className="relative">
                <input
                  type="text"
                  value={clinicianSearch}
                  onChange={(e) => { setClinicianSearch(e.target.value); setClinicianDdOpen(true); }}
                  onFocus={() => setClinicianDdOpen(true)}
                  onBlur={() => setTimeout(() => setClinicianDdOpen(false), 200)}
                  placeholder={rotaLoading ? "Loading…" : "Search clinician name or email…"}
                  className="w-full h-10 pl-3 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                {clinicianDdOpen && filteredClinicians.length > 0 && (
                  /*
                   * ✅ FIX: onMouseDown preventDefault stops the input's onBlur from firing
                   *    before the item's onClick — this is what was causing selection to fail.
                   */
                  <div
                    className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-48 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {/* No clinician option */}
                    <button type="button"
                      onClick={() => { setSelectedClinicianId(""); setClinicianSearch(""); setClinicianDdOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-100">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <AlertTriangle size={13} className="text-orange-500" />
                      </div>
                      <span className="text-sm text-slate-500 italic">No clinician (gap shift)</span>
                    </button>
                    {filteredClinicians.map((c) => {
                      const id   = String(c._id ?? c.id ?? "");
                      const name = c.fullName ?? c.name ?? "Unknown";
                      return (
                        <button key={id} type="button"
                          onClick={() => {
                            setSelectedClinicianId(id);
                            setClinicianSearch(name);
                            setClinicianDdOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0 ${
                            selectedClinicianId === id ? "bg-blue-50" : ""}`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${
                            selectedClinicianId === id ? "bg-blue-600" : "bg-slate-400"}`}>
                            {name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                            {c.email && <p className="text-xs text-slate-400 truncate">{c.email}</p>}
                          </div>
                          {/* ✅ Visual tick when selected */}
                          {selectedClinicianId === id && (
                            <span className="text-blue-600 text-xs font-bold shrink-0">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 2. Practice ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Building2 size={11} className="inline mr-1" /> Practice <span className="text-red-500">*</span>
              </label>
              <button type="button"
                onClick={() => { setShowCustomPractice((p) => !p); setSelectedPractice(null); setPracticeSearch(""); }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold">
                {showCustomPractice ? "← Choose from list" : "Enter ID manually →"}
              </button>
            </div>

            {showCustomPractice ? (
              <input
                value={customPracticeId}
                onChange={(e) => setCustomPracticeId(e.target.value)}
                placeholder="ODS code e.g. P84001 or any practice ID"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                  focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={practiceDdOpen ? practiceSearch : (selectedPractice?.name || practiceSearch)}
                  onChange={(e) => { setPracticeSearch(e.target.value); setPracticeDdOpen(true); }}
                  onFocus={() => setPracticeDdOpen(true)}
                  onBlur={() => setTimeout(() => setPracticeDdOpen(false), 200)}
                  placeholder="Search practice name or ODS code…"
                  className="w-full h-10 pl-3 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                />
                <Building2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                {practiceDdOpen && (
                  /*
                   * ✅ FIX: onMouseDown preventDefault stops the input's onBlur from firing
                   *    before the item's onClick — this is what was causing selection to fail.
                   */
                  <div
                    className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-48 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredPractices.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">No practices match. Try "Enter ID manually".</div>
                    ) : filteredPractices.map((p) => (
                      <button key={p.id} type="button"
                        onClick={() => {
                          setSelectedPractice(p);
                          setClinicalSystem(p.system);
                          setPracticeSearch(p.name);
                          setPracticeDdOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0 ${
                          selectedPractice?.id === p.id ? "bg-blue-50" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold ${
                          selectedPractice?.id === p.id
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {p.id.slice(-2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.id} · {p.system}</p>
                        </div>
                        {/* ✅ Visual tick when selected */}
                        {selectedPractice?.id === p.id && (
                          <span className="text-blue-600 text-xs font-bold shrink-0">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected practice chip */}
            {selectedPractice && !showCustomPractice && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Building2 size={13} className="text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-emerald-800 flex-1">{selectedPractice.name}</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{selectedPractice.id}</span>
                <button type="button" onClick={() => { setSelectedPractice(null); setPracticeSearch(""); }}>
                  <X size={12} className="text-emerald-600" />
                </button>
              </div>
            )}
          </div>

          {/* ── 3. Time ── */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <Clock size={11} className="inline mr-1" /> Working Hours
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Start</p>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">End</p>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Total</p>
                <div className={`h-10 flex items-center justify-center rounded-xl border text-sm font-bold ${
                  calculatedHours
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                  {calculatedHours ? `${calculatedHours}h` : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. Hourly Rate (NEW — spec: shifts.hourly_rate + total_value) ── */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <PoundSterling size={11} className="inline mr-1" /> Hourly Rate
              <span className="ml-1 text-slate-400 font-normal normal-case">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">£</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                />
              </div>
              {/* Auto-calculated total */}
              <div className={`h-10 flex items-center justify-between px-3 rounded-xl border text-sm font-bold ${
                totalValue
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                <span className="text-[10px] font-normal text-slate-500">Total</span>
                <span>{totalValue ? `£${totalValue.toFixed(2)}` : "—"}</span>
              </div>
            </div>
          </div>

          {/* ── 5. Status ── */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
            <div className="grid grid-cols-4 gap-2">
              {STATUS_OPTIONS.map(({ value, label, color, Icon }) => (
                <button key={value} type="button" onClick={() => {
                    setStatus(value);
                    if (value === "cover") setIsCover(true);
                    else setIsCover(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-semibold transition-all hover:shadow-sm ${
                    status === value
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                >
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center ${status === value ? "bg-white/20" : color}`}>
                    <Icon size={11} className="text-white" />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 6. Clinical System + Service Code ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <FileText size={11} className="inline mr-1" /> Clinical System
              </label>
              <select value={clinicalSystem} onChange={(e) => setClinicalSystem(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
                  focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                <option value="">Select…</option>
                {CLINICAL_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Service Code
              </label>
              <div className="flex gap-1.5">
                {SERVICE_CODES.map((c) => (
                  <button key={c} type="button" onClick={() => setServiceCode(c)}
                    className={`flex-1 h-10 rounded-xl text-xs font-bold border transition-all ${
                      serviceCode === c
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                  >{c}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 7. Cover details (conditional) ── */}
          {(isCover || status === "cover") && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Cover Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-amber-700 mb-1">Project Code</p>
                  <div className="h-9 flex items-center px-3 rounded-lg bg-amber-100 border border-amber-200 text-sm font-bold text-amber-800">COV1</div>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-amber-700 mb-1">Cover Reason</p>
                <input value={coverReason} onChange={(e) => setCoverReason(e.target.value)}
                  placeholder="e.g. Covering Sarah — sick leave"
                  className="w-full h-9 px-3 rounded-lg border border-amber-200 bg-white text-sm text-slate-800
                    focus:outline-none focus:border-amber-400 transition-all placeholder:text-slate-400" />
              </div>
            </div>
          )}

          {/* ── 8. Notes ── */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900
                placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none
                focus:ring-2 focus:ring-blue-100 resize-none" />
          </div>

          {/* ── Error ── */}
          {create.isError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
              <X size={14} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Failed to create shift</p>
                <p className="mt-0.5 opacity-80">{String(create.error?.response?.data?.message || create.error?.message || "Unknown error")}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="sticky bottom-0 px-5 pb-5 pt-4 flex items-center justify-between gap-3 border-t border-slate-100 bg-white rounded-b-2xl">
          {/* Summary */}
          <div className="text-xs text-slate-400 space-y-0.5">
            {practiceId && <span className="font-semibold text-slate-600">{practiceId}</span>}
            {calculatedHours && <span> · <strong className="text-slate-700">{calculatedHours}h</strong></span>}
            {startTime && endTime && <span> · {startTime}–{endTime}</span>}
            {totalValue && <span> · <strong className="text-emerald-600">£{totalValue.toFixed(2)}</strong></span>}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600
                transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95">
              Cancel
            </button>
            <button type="button" onClick={handleCreate}
              disabled={create.isPending || !practiceId}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white
                shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed">
              {create.isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Creating…</>
              ) : (
                <><Plus size={14} /> Create Shift</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}