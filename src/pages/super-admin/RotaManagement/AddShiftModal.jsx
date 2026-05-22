import { useEffect, useMemo, useState } from "react";
import {
  Building2, CalendarDays, ChevronDown, Clock,
  FileText, Loader2, Plus, PoundSterling, User, X, AlertCircle
} from "lucide-react";
import { useCreateBulkRota } from "../../../hooks/useRota";
import { useClinicians } from "../../../hooks/useClinicians";
import { usePractices } from "../../../hooks/usePractice";

const STATUS_OPTIONS = [
  ["working",      "Working"],
  ["annual_leave", "Annual Leave"],
  ["sick",         "Sick"],
  ["cppe",         "CPPE"],
  ["gap",          "Gap"],
  ["cover",        "Cover"],
  ["cancelled",    "Cancelled"],
];

const CLINICAL_SYSTEMS = ["EMIS", "SystmOne", "Vision", "AccuRx", "ICE", "Other"];

// ✅ Aligned with backend SERVICE_CODES set (PCN, GP, EA only)
const SERVICE_CODES = ["PCN", "GP", "EA"];

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const FIELD_CLASS =
  "w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400";

const calcHours = (start, end) => {
  const [sh, sm] = String(start || "").split(":").map(Number);
  const [eh, em] = String(end   || "").split(":").map(Number);
  if (![sh, sm, eh, em].every(Number.isFinite)) return null;
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? Math.round((diff / 60) * 100) / 100 : null;
};

const serviceCodeFromContract = (contract) => {
  const value = String(contract || "").toUpperCase();
  if (value.includes("EA"))  return "EA";
  if (value.includes("GP"))  return "GP";
  return "PCN";
};

export default function AddShiftModal({ open, onClose, clinicianId, date }) {
  const create = useCreateBulkRota();

  const { data: cliniciansRes, isLoading: cliniciansLoading } = useClinicians({ active: true });
  const { data: practicesRes,  isLoading: practicesLoading  } = usePractices({ active: true });

  const clinicians = useMemo(() => {
    const list = cliniciansRes?.clinicians ?? cliniciansRes?.data ?? cliniciansRes ?? [];
    return Array.isArray(list) ? list : [];
  }, [cliniciansRes]);

  const practices = useMemo(() => {
    const list = practicesRes?.practices ?? practicesRes?.data ?? practicesRes ?? [];
    return Array.isArray(list) ? list : [];
  }, [practicesRes]);

  // ── form state ────────────────────────────────────────────────────────────
  const [selectedClinicianId, setSelectedClinicianId] = useState(clinicianId || "");
  const [clinicianSearch,     setClinicianSearch]     = useState("");
  const [clinicianOpen,       setClinicianOpen]       = useState(false);
  const [selectedPracticeId,  setSelectedPracticeId]  = useState("");
  const [practiceSearch,      setPracticeSearch]      = useState("");
  const [practiceOpen,        setPracticeOpen]        = useState(false);

  const [dateFrom,       setDateFrom]       = useState(date || "");
  const [dateTo,         setDateTo]         = useState(date || "");
  const [daysOfWeek,     setDaysOfWeek]     = useState([1, 2, 3, 4, 5]);
  const [shiftStart,     setShiftStart]     = useState("09:00");
  const [shiftEnd,       setShiftEnd]       = useState("17:00");
  const [hourlyRate,     setHourlyRate]     = useState("");
  const [status,         setStatus]         = useState("working");
  const [clinicalSystem, setClinicalSystem] = useState("");
  const [serviceCode,    setServiceCode]    = useState("PCN");
  const [notes,          setNotes]          = useState("");

  // ── validation errors ─────────────────────────────────────────────────────
  const [validationError, setValidationError] = useState("");

  // ── derived ───────────────────────────────────────────────────────────────
  const selectedClinician = clinicians.find(
    (c) => String(c._id ?? c.id) === String(selectedClinicianId)
  );
  const selectedPractice = practices.find(
    (p) => String(p._id ?? p.id) === String(selectedPracticeId)
  );
  const totalHours = calcHours(shiftStart, shiftEnd);
  const totalCost  =
    hourlyRate && totalHours
      ? Math.round(Number(hourlyRate) * totalHours * 100) / 100
      : null;

  // ── reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setSelectedClinicianId(clinicianId || "");
    setDateFrom(date || "");
    setDateTo(date || "");
    setSelectedPracticeId("");
    setPracticeSearch("");
    setClinicianSearch("");
    setDaysOfWeek([1, 2, 3, 4, 5]);
    setShiftStart("09:00");
    setShiftEnd("17:00");
    setHourlyRate("");
    setStatus("working");
    setClinicalSystem("");
    setServiceCode("PCN");
    setNotes("");
    setValidationError("");
    create.reset?.();
  }, [open]);                // eslint-disable-line react-hooks/exhaustive-deps

  // ── auto-fill clinician defaults ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedClinician) return;
    const rate   = selectedClinician.hourly_rate ?? selectedClinician.hourlyRate ?? "";
    const system = selectedClinician.scope_of_practice ?? selectedClinician.scopeOfPractice ?? "";
    if (rate !== "") setHourlyRate(String(rate));
    if (system && CLINICAL_SYSTEMS.includes(system)) setClinicalSystem(system);
    setServiceCode(
      serviceCodeFromContract(
        selectedClinician.contractType || selectedClinician.contract_type
      )
    );
    setClinicianSearch(selectedClinician.fullName || selectedClinician.name || "");
  }, [selectedClinician]);

  // ── filtered lists ────────────────────────────────────────────────────────
  const filteredClinicians = clinicians.filter((c) => {
    const q     = clinicianSearch.toLowerCase();
    const name  = String(c.fullName || c.name || "").toLowerCase();
    const email = String(c.email || "").toLowerCase();
    return !q || name.includes(q) || email.includes(q);
  });

  const filteredPractices = practices.filter((p) => {
    const q    = practiceSearch.toLowerCase();
    const name = String(p.name || "").toLowerCase();
    const code = String(p.odsCode || p.ods_code || p.id || p._id || "").toLowerCase();
    return !q || name.includes(q) || code.includes(q);
  });

  // ── helpers ───────────────────────────────────────────────────────────────
  const toggleDay = (day) =>
    setDaysOfWeek((cur) =>
      cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day]
    );

  const handleStatus = (value) => {
    setStatus(value);
    if (value === "gap") {
      setSelectedClinicianId("");
      setClinicianSearch("");
    }
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleCreate = () => {
    setValidationError("");

    // ── client-side validation ─────────────────────────────────────────────
    if (!selectedPracticeId) {
      setValidationError("Please select a practice.");
      return;
    }
    if (!dateFrom) {
      setValidationError("Please select a start date.");
      return;
    }
    if (!dateTo) {
      setValidationError("Please select an end date.");
      return;
    }
    if (dateTo < dateFrom) {
      setValidationError("End date must be on or after start date.");
      return;
    }
    if (!totalHours || totalHours <= 0) {
      setValidationError("Shift end time must be after start time.");
      return;
    }
    if (daysOfWeek.length === 0) {
      setValidationError("Please select at least one day of the week.");
      return;
    }
    if (status === "cover" && !serviceCode) {
      setValidationError("Cover shifts require a service code.");
      return;
    }

    const payload = {
      clinician_id:    status === "gap" ? null : (selectedClinicianId || null),
      clinician_name:  status === "gap" ? null : (selectedClinician?.fullName || selectedClinician?.name || null),
      practice_id:     selectedPracticeId,
      practice_name:   selectedPractice?.name || null,
      pcn_id:          selectedPractice?.pcn?._id || selectedPractice?.pcn?.id || selectedPractice?.pcn || null,
      date_from:       dateFrom,
      date_to:         dateTo,
      days_of_week:    daysOfWeek,
      shift_start:     shiftStart,
      shift_end:       shiftEnd,
      hourly_rate:     hourlyRate ? Number(hourlyRate) : null,
      status,
      clinical_system: clinicalSystem || null,
      service_code:    serviceCode || null,
      notes,
    };

    create.mutate(payload, {
      onSuccess: () => {
        onClose?.();
      },
      onError: (err) => {
        console.error("[AddShiftModal] Error:", err?.response?.data || err?.message || err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create shifts. Please try again.";
        setValidationError(msg);
      },
    });
  };

  if (!open) return null;

  const canSubmit =
    !create.isPending &&
    !!selectedPracticeId &&
    !!dateFrom &&
    !!dateTo &&
    !!totalHours &&
    daysOfWeek.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-slate-100 bg-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <Plus size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Add Shift</p>
              <p className="text-xs text-slate-500">
                Create one shift or a date-range rota pattern.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">

          {/* Clinician */}
          <SearchSelect
            label="Clinician"
            icon={User}
            value={
              clinicianOpen
                ? clinicianSearch
                : selectedClinician?.fullName || selectedClinician?.name || clinicianSearch
            }
            onChange={(v) => { setClinicianSearch(v); setClinicianOpen(true); }}
            onFocus={() => setClinicianOpen(true)}
            onBlur={() => setTimeout(() => setClinicianOpen(false), 200)}
            placeholder={
              cliniciansLoading ? "Loading clinicians..." : "Search clinician name or email..."
            }
            disabled={status === "gap"}
            open={clinicianOpen && status !== "gap"}
            items={filteredClinicians}
            renderItem={(c) => c.fullName || c.name || "Unknown clinician"}
            subItem={(c) => c.email}
            onSelect={(c) => {
              setSelectedClinicianId(String(c._id || c.id || ""));
              setClinicianSearch(c.fullName || c.name || "");
              setClinicianOpen(false);
            }}
            emptyAction={() => {
              setSelectedClinicianId("");
              setClinicianSearch("");
              setClinicianOpen(false);
            }}
            emptyLabel="No clinician (gap)"
          />

          {/* Practice */}
          <SearchSelect
            label="Practice"
            icon={Building2}
            required
            value={
              practiceOpen
                ? practiceSearch
                : selectedPractice?.name || practiceSearch
            }
            onChange={(v) => { setPracticeSearch(v); setPracticeOpen(true); }}
            onFocus={() => setPracticeOpen(true)}
            onBlur={() => setTimeout(() => setPracticeOpen(false), 200)}
            placeholder={
              practicesLoading ? "Loading practices..." : "Search practice name or ODS code..."
            }
            open={practiceOpen}
            items={filteredPractices}
            renderItem={(p) => p.name || "Unknown practice"}
            subItem={(p) => p.odsCode || p.ods_code || p._id || p.id}
            onSelect={(p) => {
              setSelectedPracticeId(String(p._id || p.id || ""));
              setPracticeSearch(p.name || "");
              setPracticeOpen(false);
              if (p.clinicalSystem && CLINICAL_SYSTEMS.includes(p.clinicalSystem))
                setClinicalSystem(p.clinicalSystem);
            }}
          />

          {/* Date range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date From" icon={CalendarDays} required>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  if (!dateTo) setDateTo(e.target.value);
                }}
                className={FIELD_CLASS}
              />
            </Field>
            <Field label="Date To" icon={CalendarDays} required>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                onChange={(e) => setDateTo(e.target.value)}
                className={FIELD_CLASS}
              />
            </Field>
          </div>

          {/* Days of week */}
          <Field label="Days of Week">
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`h-10 rounded-xl border text-xs font-bold transition ${
                    daysOfWeek.includes(day.value)
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Shift Start Time" icon={Clock}>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className={FIELD_CLASS}
              />
            </Field>
            <Field label="Shift End Time" icon={Clock}>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className={FIELD_CLASS}
              />
            </Field>
            <Field label="Total Hours">
              <div
                className={`${FIELD_CLASS} flex items-center font-bold text-indigo-700 bg-indigo-50 border-indigo-100`}
              >
                {totalHours ? `${totalHours}h` : "—"}
              </div>
            </Field>
          </div>

          {/* Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Hourly Rate" icon={PoundSterling}>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={FIELD_CLASS}
                placeholder="0.00"
              />
            </Field>
            <Field label="Total Cost">
              <div
                className={`${FIELD_CLASS} flex items-center font-bold text-emerald-700 bg-emerald-50 border-emerald-100`}
              >
                {totalCost ? `GBP ${totalCost.toFixed(2)}` : "—"}
              </div>
            </Field>
          </div>

          {/* Status / system / service code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => handleStatus(e.target.value)}
                className={FIELD_CLASS}
              >
                {STATUS_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Clinical System" icon={FileText}>
              <select
                value={clinicalSystem}
                onChange={(e) => setClinicalSystem(e.target.value)}
                className={FIELD_CLASS}
              >
                <option value="">Select...</option>
                {CLINICAL_SYSTEMS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Service Code">
              <select
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                className={FIELD_CLASS}
              >
                {SERVICE_CODES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes..."
              className={`${FIELD_CLASS} min-h-24 py-3 resize-none`}
            />
          </Field>

          {/* Validation / API error */}
          {(validationError || create.isError) && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>
                {validationError ||
                  create.error?.response?.data?.message ||
                  create.error?.message ||
                  "Failed to create shifts. Please try again."}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-5 py-4 flex items-center justify-between gap-3 border-t border-slate-100 bg-white rounded-b-2xl">
          {/* required fields hint */}
          <p className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Practice, dates &amp; times are required
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {create.isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Creating...</>
              ) : (
                <><Plus size={14} /> Create Shifts</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, icon: Icon, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        {Icon && <Icon size={11} className="inline mr-1" />}
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SearchSelect({
  label, icon, required,
  value, onChange, onFocus, onBlur,
  placeholder, disabled,
  open, items, renderItem, subItem,
  onSelect, emptyAction, emptyLabel,
}) {
  const Icon = icon;
  return (
    <Field label={label} icon={Icon} required={required}>
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${FIELD_CLASS} pr-9 disabled:bg-slate-100 disabled:text-slate-400`}
        />
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        {open && (
          <div
            className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-56 overflow-y-auto"
            onMouseDown={(e) => e.preventDefault()}
          >
            {emptyAction && (
              <button
                type="button"
                onClick={emptyAction}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-50 border-b border-slate-100"
              >
                {emptyLabel}
              </button>
            )}
            {items.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                No results found.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={String(item._id || item.id)}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 border-b border-slate-50 last:border-0"
                >
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {renderItem(item)}
                  </p>
                  {subItem?.(item) && (
                    <p className="text-xs text-slate-400 truncate">{subItem(item)}</p>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </Field>
  );
}