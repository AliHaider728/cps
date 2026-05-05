import { useState, useEffect, useMemo, useRef } from "react";
import { useCreateShift, useRotaList } from "../../../hooks/useRota";
import {
  X,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Users,
  Building2,
  ChevronDown,
  Search,
} from "lucide-react";

/* ── Constants ── */
const SERVICE_CODES = ["GPX", "PCN", "EAX"];
const CLINICAL_SYSTEMS = ["EMIS", "SystmOne", "Vision"];
const STATUS_OPTIONS = [
  { value: "working",      label: "Working",      color: "bg-emerald-500" },
  { value: "annual_leave", label: "Annual Leave", color: "bg-blue-500"    },
  { value: "sick",         label: "Sick",         color: "bg-red-500"     },
  { value: "cppe",         label: "CPPE",         color: "bg-purple-500"  },
  { value: "cover",        label: "Cover",        color: "bg-amber-500"   },
  { value: "gap",          label: "Gap",          color: "bg-orange-500"  },
];

export default function AddShiftModal({ open, onClose, date: initDate, clinicianId: initClinicianId }) {
  const createShift = useCreateShift();

  /* ── Form state ── */
  const [date,           setDate]           = useState(initDate ?? new Date().toISOString().slice(0, 10));
  const [startTime,      setStartTime]      = useState("09:00");
  const [endTime,        setEndTime]        = useState("17:00");
  const [status,         setStatus]         = useState("working");
  const [serviceCode,    setServiceCode]    = useState("GPX");
  const [clinicalSystem, setClinicalSystem] = useState("EMIS");
  const [notes,          setNotes]          = useState("");
  const [rate,           setRate]           = useState("30");

  /* ── Clinician search ── */
  const [clinicianQuery, setClinicianQuery] = useState("");
  const [clinicianId,    setClinicianId]    = useState(initClinicianId ?? "");
  const [clinicianOpen,  setClinicianOpen]  = useState(false);
  const clinicianRef = useRef(null);

  /* ── Practice search ── */
  const [practiceQuery, setPracticeQuery] = useState("");
  const [practiceId,    setPracticeId]    = useState("");
  const [practiceOpen,  setPracticeOpen]  = useState(false);
  const practiceRef = useRef(null);

  /* ── Load clinician list for current month ── */
  const now = new Date();
  const { data: rotaData, isLoading: rotaLoading } = useRotaList({
    month: now.getMonth() + 1,
    year:  now.getFullYear(),
  });

  const allClinicians = useMemo(() => {
    const rows = rotaData?.data?.clinicians ?? rotaData?.clinicians ?? [];
    return rows.map((r) => r?.clinician).filter(Boolean);
  }, [rotaData]);

  const filteredClinicians = useMemo(() =>
    allClinicians.filter((c) => {
      const q = clinicianQuery.toLowerCase();
      return !q
        || (c.fullName ?? c.name ?? "").toLowerCase().includes(q)
        || (c.email ?? "").toLowerCase().includes(q);
    }),
  [allClinicians, clinicianQuery]);

  /* ── Sync props ── */
  useEffect(() => {
    if (initDate)         setDate(initDate);
    if (initClinicianId)  setClinicianId(initClinicianId);
  }, [initDate, initClinicianId]);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const h = (e) => {
      if (clinicianRef.current && !clinicianRef.current.contains(e.target)) setClinicianOpen(false);
      if (practiceRef.current  && !practiceRef.current.contains(e.target))  setPracticeOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Computed hours ── */
  const computedHours = useMemo(() => {
    try {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      return diff > 0 ? (diff / 60).toFixed(1) : "0";
    } catch { return "0"; }
  }, [startTime, endTime]);

  const computedTotal = useMemo(() =>
    (parseFloat(computedHours) * parseFloat(rate || "0")).toFixed(0),
  [computedHours, rate]);

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!clinicianId) {
      alert("Please select a clinician");
      return;
    }

    await createShift.mutateAsync({
      clinician_id:    clinicianId,        // UUID from selection
      practice_id:     practiceId || null, // UUID or null
      date,
      start_time:      startTime,
      end_time:        endTime,
      hours:           parseFloat(computedHours),
      status,
      service_code:    serviceCode,
      clinical_system: clinicalSystem,
      workstreams_notes: notes || null,
      rate:            parseFloat(rate) || 30,
      total:           parseFloat(computedTotal) || 0,
      source:          "manual",
      is_cover:        status === "cover",
    });

    onClose?.();
  };

  if (!open) return null;

  const inputCls = "h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 max-h-[92vh] flex flex-col">
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
                <Plus size={17} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Add Shift</p>
                <p className="text-xs text-slate-400 mt-0.5">{date}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Clinician Dropdown */}
          <div ref={clinicianRef}>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users size={12} /> Clinician <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                {rotaLoading
                  ? <Loader2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500 pointer-events-none" />
                  : <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                }
                <input
                  type="text"
                  value={clinicianQuery}
                  onChange={(e) => { setClinicianQuery(e.target.value); setClinicianOpen(true); if (!e.target.value) setClinicianId(""); }}
                  onFocus={() => setClinicianOpen(true)}
                  placeholder="Search clinician…"
                  className={`${inputCls} pl-9 pr-8`}
                />
                <ChevronDown size={13} className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform ${clinicianOpen ? "rotate-180" : ""}`} />
              </div>
              {clinicianId && (
                <p className="mt-1 text-xs text-emerald-600 font-semibold">✓ Selected: {clinicianQuery}</p>
              )}
              {clinicianOpen && (
                <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredClinicians.length === 0 ? (
                      <p className="py-4 text-center text-sm text-slate-400">No clinicians found</p>
                    ) : (
                      filteredClinicians.map((c) => {
                        const id   = c._id ?? c.id ?? "";
                        const name = c.fullName ?? c.name ?? "Unknown";
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => { setClinicianId(id); setClinicianQuery(name); setClinicianOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0 transition-colors ${clinicianId === id ? "bg-blue-50" : ""}`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-300 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                              {c.email && <p className="text-xs text-slate-400 truncate">{c.email}</p>}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Practice Dropdown */}
          <div ref={practiceRef}>
            <label className="  text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 size={12} /> Practice <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={practiceQuery}
                onChange={(e) => { setPracticeQuery(e.target.value); setPracticeId(""); }}
                placeholder="Practice UUID or leave blank…"
                className={`${inputCls} pl-9`}
              />
            </div>
            {practiceQuery && !practiceId && (
              <button
                type="button"
                onClick={() => setPracticeId(practiceQuery)}
                className="mt-1 text-xs text-blue-600 underline"
              >
                Use "{practiceQuery}" as practice ID
              </button>
            )}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1"><Clock size={11} /> Start</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1"><Clock size={11} /> End</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Computed hours */}
          {parseFloat(computedHours) > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 font-semibold">
              <Clock size={13} />
              {computedHours}h @ £{rate}/hr = £{computedTotal}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={[
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95",
                    status === value
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${status === value ? "bg-white" : color}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Service Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Service Code</label>
            <div className="flex gap-2">
              {SERVICE_CODES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setServiceCode(c)}
                  className={[
                    "flex-1 h-10 rounded-xl text-xs font-bold border transition-all",
                    serviceCode === c
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical System */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Clinical System</label>
            <div className="flex gap-2">
              {CLINICAL_SYSTEMS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setClinicalSystem(c)}
                  className={[
                    "flex-1 h-10 rounded-xl text-xs font-bold border transition-all",
                    clinicalSystem === c
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
                  ].join(" ")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Rate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Rate (£/hr)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min="0"
              className={inputCls}
              placeholder="30"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Optional notes…"
            />
          </div>

          {/* Error */}
          {createShift.isError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{String(createShift.error?.message ?? "Failed to create shift")}</span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5 pt-4 border-t border-slate-100 shrink-0 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createShift.isPending || !clinicianId}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createShift.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Adding…</>
              : <><Plus size={14} /> Add Shift</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}