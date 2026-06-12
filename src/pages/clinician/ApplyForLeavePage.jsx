import { useMemo, useState, useEffect } from "react";
import {
  CalendarDays, Send, CheckCircle2, Clock, XCircle,
  AlertCircle, TrendingUp, FileText, Loader2, Info,
  Stethoscope, GraduationCap, Umbrella, BookOpen,
  ChevronRight, CalendarCheck, BarChart3, AlertTriangle
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useClinicianLeave, useAddLeave } from "../../hooks/useClinicianLeave";
import { dayCount } from "../../lib/leaveDays";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const CONTRACTS = ["ARRS", "EA", "Direct"];

const LEAVE_TYPES = [
  { value: "annual",   label: "Annual Leave",   icon: Umbrella,      color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-200"   },
  { value: "sick",     label: "Sick Leave",      icon: Stethoscope,   color: "text-red-500",    bg: "bg-red-50",    border: "border-red-200"    },
  { value: "cppe",     label: "CPPE",            icon: BookOpen,      color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
  { value: "other",    label: "Training Leave",  icon: GraduationCap, color: "text-teal-500",   bg: "bg-teal-50",   border: "border-teal-200"   },
];

const CONTRACT_CONFIG = {
  ARRS: {
    gradient     : "from-blue-500 to-blue-700",
    glow         : "group-hover:shadow-blue-200/60",
    accent       : "bg-blue-50 text-blue-700 border border-blue-200",
    bar          : "bg-gradient-to-r from-blue-400 to-blue-600",
    selectedRing : "ring-2 ring-offset-2 ring-blue-400",
    tag          : "bg-blue-100 text-blue-700",
  },
  EA: {
    gradient     : "from-teal-500 to-emerald-600",
    glow         : "group-hover:shadow-teal-200/60",
    accent       : "bg-teal-50 text-teal-700 border border-teal-200",
    bar          : "bg-gradient-to-r from-teal-400 to-emerald-500",
    selectedRing : "ring-2 ring-offset-2 ring-teal-400",
    tag          : "bg-teal-100 text-teal-700",
  },
  Direct: {
    gradient     : "from-purple-500 to-fuchsia-600",
    glow         : "group-hover:shadow-purple-200/60",
    accent       : "bg-purple-50 text-purple-700 border border-purple-200",
    bar          : "bg-gradient-to-r from-purple-400 to-fuchsia-500",
    selectedRing : "ring-2 ring-offset-2 ring-purple-400",
    tag          : "bg-purple-100 text-purple-700",
  },
};

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const isWeekend   = (dateStr) => { const d = new Date(dateStr); return d.getDay() === 0 || d.getDay() === 6; };
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const today       = () => new Date().toISOString().split("T")[0];

/* Count working days (Mon–Fri) between two date strings, inclusive */
const workingDays = (start, end) => {
  if (!start || !end) return 0;
  let count = 0;
  const cur = new Date(start);
  const fin = new Date(end);
  while (cur <= fin) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

/* ── Sub-components ─────────────────────────────────────────────────────────── */
const LeaveTypeCard = ({ type, selected, onClick }) => {
  const Icon = type.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left
        transition-all duration-150 cursor-pointer w-full
        ${selected
          ? `${type.bg} ${type.border} shadow-sm`
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
        ${selected ? type.bg : "bg-slate-100"}`}>
        <Icon size={15} className={selected ? type.color : "text-slate-400"} />
      </div>
      <span className={`text-[13px] font-bold ${selected ? type.color : "text-slate-600"}`}>
        {type.label}
      </span>
      {selected && <CheckCircle2 size={14} className={`ml-auto shrink-0 ${type.color}`} />}
    </button>
  );
};

const DayPreviewBanner = ({ days, calDays, contract, balance }) => {
  if (!days) return null;
  const enough = (balance?.remaining ?? 0) >= days;
  return (
    <div className={`animate-scale-in rounded-xl border px-4 py-3.5 transition-all
      ${enough ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${enough ? "bg-green-100" : "bg-red-100"}`}>
            <CalendarDays size={15} className={enough ? "text-green-600" : "text-red-500"} />
          </div>
          <div>
            <p className={`text-[13px] font-bold ${enough ? "text-green-700" : "text-red-700"}`}>
              {days} working day{days !== 1 ? "s" : ""} requested
              {calDays !== days && (
                <span className="text-[11px] font-normal ml-1 opacity-70">
                  ({calDays} calendar days, weekends excluded)
                </span>
              )}
            </p>
            <p className={`text-[11px] mt-0.5 ${enough ? "text-green-600" : "text-red-600"}`}>
              {enough
                ? `${balance?.remaining ?? 0} days remaining after this request`
                : `Insufficient balance — ${Math.abs((balance?.remaining ?? 0) - days)} day(s) short`}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Contract</p>
            <p className="text-[13px] font-black text-slate-700">{contract}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Balance Left</p>
            <p className={`text-[13px] font-black ${enough ? "text-green-700" : "text-red-600"}`}>
              {(balance?.remaining ?? 0) - days}d
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── History Entry ──────────────────────────────────────────────────────────── */
const HistoryItem = ({ entry, onCancel, cancelling }) => {
  const cfg = CONTRACT_CONFIG[entry.contract];
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors duration-150">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
            ${cfg ? `bg-gradient-to-br ${cfg.gradient}` : "bg-slate-200"}`}>
            <CalendarDays size={12} className="text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-bold text-slate-700 truncate block">
              {entry.contract} · {entry.leaveType}
            </span>
            <span className="text-[11px] text-slate-400">
              {fmtDate(entry.startDate)} – {fmtDate(entry.endDate)} · <strong className="text-slate-600">{entry.days}d</strong>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {entry.rejected ? (
            <span className="badge badge-red"><XCircle size={10} /> Rejected</span>
          ) : entry.approved ? (
            <span className="badge badge-green"><CheckCircle2 size={10} /> Approved</span>
          ) : (
            <span className="badge badge-amber"><Clock size={10} /> Pending</span>
          )}
        </div>
      </div>

      {/* Rejection note */}
      {entry.rejectionNote && (
        <div className="mt-2 flex items-start gap-1.5 text-[11px] text-red-600
          bg-red-50 rounded-lg px-2.5 py-1.5 border border-red-100">
          <AlertCircle size={10} className="mt-0.5 shrink-0" />
          {entry.rejectionNote}
        </div>
      )}

      {/* Cancel button — only pending */}
      {!entry.approved && !entry.rejected && onCancel && (
        <button
          type="button"
          onClick={() => onCancel(entry._id || entry.id)}
          disabled={cancelling}
          className="mt-2 text-[11px] font-bold text-red-500 hover:text-red-700
            flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <XCircle size={11} />
          {cancelling ? "Cancelling…" : "Cancel Request"}
        </button>
      )}
    </div>
  );
};

/* ── Main Page ──────────────────────────────────────────────────────────────── */
export default function ApplyForLeavePage() {
  const { data, refetch }   = useClinicianLeave();
  const clinicianId         = data?.clinicianId;
  const addLeaveM           = useAddLeave(clinicianId);

  const [form, setForm] = useState({
    contract  : "ARRS",
    leaveType : "annual",
    startDate : "",
    endDate   : "",
    notes     : "",
  });
  const [message,    setMessage]    = useState({ text: "", type: "" });
  const [cancellingId, setCancellingId] = useState(null);

  /* History filters */
  const [histSearch,     setHistSearch]     = useState("");
  const [histStatus,     setHistStatus]     = useState("all");   // all | pending | approved | rejected
  const [histPage,       setHistPage]       = useState(1);
  const HIST_PER_PAGE = 5;

  const calDays     = useMemo(() => dayCount(form.startDate, form.endDate),    [form.startDate, form.endDate]);
  const wDays       = useMemo(() => workingDays(form.startDate, form.endDate), [form.startDate, form.endDate]);

  const balance = useMemo(
    () => (data?.balances || []).find((b) => b.contract === form.contract),
    [data, form.contract]
  );

  /* Weekend warning */
  const startIsWeekend = form.startDate && isWeekend(form.startDate);
  const endIsWeekend   = form.endDate   && isWeekend(form.endDate);

  /* ── Filtered + paginated history ── */
  const allEntries = data?.entries || [];
  const filtered = useMemo(() => {
    let list = [...allEntries];
    if (histStatus !== "all") {
      list = list.filter((e) => {
        if (histStatus === "pending")  return !e.approved && !e.rejected;
        if (histStatus === "approved") return e.approved;
        if (histStatus === "rejected") return e.rejected;
        return true;
      });
    }
    if (histSearch.trim()) {
      const q = histSearch.toLowerCase();
      list = list.filter((e) =>
        (e.contract    || "").toLowerCase().includes(q) ||
        (e.leaveType   || "").toLowerCase().includes(q) ||
        (e.startDate   || "").toLowerCase().includes(q) ||
        (e.endDate     || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allEntries, histStatus, histSearch]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / HIST_PER_PAGE));
  const pagedEntries = filtered.slice((histPage - 1) * HIST_PER_PAGE, histPage * HIST_PER_PAGE);

  /* Reset page on filter change */
  useEffect(() => { setHistPage(1); }, [histSearch, histStatus]);

  /* ── Submit ── */
  const submit = async () => {
    setMessage({ text: "", type: "" });
    if (!clinicianId)
      return setMessage({ text: "Account not linked to a clinician profile. Contact admin.", type: "error" });
    if (!form.startDate || !form.endDate)
      return setMessage({ text: "Start date and end date are required.", type: "error" });
    if (new Date(form.endDate) < new Date(form.startDate))
      return setMessage({ text: "End date cannot be before start date.", type: "error" });
    if (wDays === 0)
      return setMessage({ text: "Selected range contains no working days.", type: "error" });
    try {
      const res = await addLeaveM.mutateAsync({
        leaveType : form.leaveType,
        contract  : form.contract,
        startDate : form.startDate,
        endDate   : form.endDate,
        days      : wDays,
        notes     : form.notes,
      });
      setForm({ contract: "ARRS", leaveType: "annual", startDate: "", endDate: "", notes: "" });
      setMessage({
        text: res?.autoApproved
          ? "Leave auto-approved — no clashes found."
          : "Request submitted. Awaiting manager approval.",
        type: "success",
      });
      refetch();
    } catch (err) {
      const payload = err?.response?.data;
      setMessage({ text: payload?.message || err.message || "Unable to submit. Try again.", type: "error" });
    }
  };

  /* ── Cancel pending ── */
  const cancelRequest = async (id) => {
    setCancellingId(id);
    try {
      // Call your cancel endpoint here — e.g. await cancelLeave(clinicianId, id);
      await refetch();
    } finally { setCancellingId(null); }
  };

  /* ── Counts for status tabs ── */
  const pendingCount  = allEntries.filter((e) => !e.approved && !e.rejected).length;
  const approvedCount = allEntries.filter((e) => e.approved).length;
  const rejectedCount = allEntries.filter((e) => e.rejected).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-up">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl gradient-blue-indigo flex items-center justify-center
              shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
              <CalendarDays size={16} className="text-white" />
            </div>
            <h1 className="page-title">Apply for Leave</h1>
          </div>
          <p className="text-[13px] text-slate-500 ml-[2.875rem]">
            Balances are separate per contract · Working days auto-calculated · Short leave may auto-approve
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl
          bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-bold">
          <TrendingUp size={13} className="text-blue-500" />
          {new Date().getFullYear()} Leave Year
        </div>
      </div>

      {/* ── Contract Balance Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CONTRACTS.map((contract) => {
          const cfg        = CONTRACT_CONFIG[contract];
          const b          = (data?.balances || []).find((x) => x.contract === contract) || {};
          const total      = Number(b.total     || 0);
          const used       = Number(b.used      || 0);
          const remaining  = Number(b.remaining ?? total - used);
          const pct        = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
          const isSelected = form.contract === contract;
          const lowBalance = remaining <= 5 && total > 0;

          return (
            <button
              key={contract}
              type="button"
              onClick={() => setForm((f) => ({ ...f, contract }))}
              className={`group card relative overflow-hidden p-5 text-left
                transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                ${cfg.glow} focus:outline-none
                ${isSelected ? cfg.selectedRing : ""}`}
            >
              {/* Blob */}
              <div className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full
                bg-gradient-to-br ${cfg.gradient} opacity-10
                group-hover:opacity-20 group-hover:scale-110 transition-all duration-500`} />
              {/* Bottom bar */}
              <div className={`pointer-events-none absolute left-0 right-0 bottom-0 h-[3px]
                bg-gradient-to-r ${cfg.gradient} transition-opacity
                ${isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-80"}`} />

              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.gradient}
                  flex items-center justify-center shadow-[0_4px_12px_rgba(15,23,42,0.12)]
                  group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <CalendarDays size={18} className="text-white" strokeWidth={2.2} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.accent}`}>
                    {remaining}/{total}d
                  </span>
                  {lowBalance && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200
                      px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle size={9} /> Low
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[13px] font-semibold text-slate-500 mb-1">{contract} Contract</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-3xl font-black text-slate-900 leading-none">{remaining}</span>
                <span className="text-sm font-medium text-slate-400">days left</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Taken <strong className="text-slate-700">{used}d</strong></span>
                <span className="font-bold">{pct}% used</span>
              </div>
              <div className="progress-track">
                <div className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
                  style={{ width: `${pct}%` }} />
              </div>

              {isSelected && (
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                  <CheckCircle2 size={11} /> Selected for this request
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">

        {/* ── Leave Request Form ── */}
        <div className="card overflow-hidden">
          <div className="form-section-header">
            <div className="w-9 h-9 rounded-xl gradient-blue-indigo flex items-center justify-center
              shadow-[0_4px_12px_rgba(59,130,246,0.25)]">
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-slate-800">New Leave Request</p>
              <p className="text-[11px] text-slate-400">Working days are auto-calculated, weekends excluded</p>
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* Leave Type — card picker */}
            <div>
              <label className="field-label">Leave Type</label>
              <div className="grid grid-cols-2 gap-2">
                {LEAVE_TYPES.map((t) => (
                  <LeaveTypeCard
                    key={t.value}
                    type={t}
                    selected={form.leaveType === t.value}
                    onClick={() => setForm({ ...form, leaveType: t.value })}
                  />
                ))}
              </div>
            </div>

            {/* Contract select */}
            <div>
              <label className="field-label">Contract Type</label>
              <div className="flex gap-2">
                {CONTRACTS.map((c) => {
                  const cfg = CONTRACT_CONFIG[c];
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, contract: c })}
                      className={`flex-1 py-2 rounded-xl text-[13px] font-bold border-2 transition-all
                        ${form.contract === c
                          ? `${cfg.tag} border-current`
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  min={today()}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input"
                />
                {startIsWeekend && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} /> This falls on a weekend
                  </p>
                )}
              </div>
              <div>
                <label className="field-label">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || today()}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="input"
                />
                {endIsWeekend && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} /> This falls on a weekend
                  </p>
                )}
              </div>
            </div>

            {/* Live preview banner */}
            <DayPreviewBanner
              days={wDays}
              calDays={calDays}
              contract={form.contract}
              balance={balance}
            />

            {/* Notes */}
            <div>
              <label className="field-label">
                Notes{" "}
                <span className="normal-case font-normal text-slate-400 tracking-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Reason for leave, cover arrangements, emergency contact…"
                className="input resize-none"
              />
            </div>

            {/* Policy notice */}
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-blue-700">
                Annual leave ≤ 14 working days with no booking clashes will be <strong>auto-approved</strong>.
                Sick leave always goes to manager review.
              </p>
            </div>

            {/* Alert message */}
            {message.text && (
              <div className={`animate-scale-in ${message.type === "success" ? "alert-success" : "alert-error"}`}>
                {message.type === "success"
                  ? <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" />
                  : <AlertCircle  size={15} className="text-red-500   mt-0.5 shrink-0" />}
                <p className={`text-[13px] font-medium
                  ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              disabled={addLeaveM.isPending || wDays === 0}
              onClick={submit}
              className="btn btn-primary w-full sm:w-auto justify-center"
            >
              {addLeaveM.isPending
                ? <><Loader2 size={14} className="spin-arc" /> Submitting…</>
                : <><Send size={14} /> Submit Request</>}
            </button>
          </div>
        </div>

        {/* ── Leave History Sidebar ── */}
        <div className="card overflow-hidden flex flex-col">

          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <p className="text-[13px] font-bold text-slate-700">Leave History</p>
              </div>
              <span className="badge badge-slate">{allEntries.length} total</span>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <input
                type="text"
                value={histSearch}
                onChange={(e) => setHistSearch(e.target.value)}
                placeholder="Search contract, type, date…"
                className="input pl-8 py-1.5 text-[12px]"
              />
              <CalendarCheck size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1">
              {[
                { key: "all",      label: "All",      count: allEntries.length },
                { key: "pending",  label: "Pending",  count: pendingCount      },
                { key: "approved", label: "Approved", count: approvedCount     },
                { key: "rejected", label: "Rejected", count: rejectedCount     },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setHistStatus(tab.key)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all
                    ${histStatus === tab.key
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                      : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 ${histStatus === tab.key ? "text-blue-600" : "text-slate-300"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Entries */}
          <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
            {pagedEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
                  <CalendarDays size={18} className="text-slate-300" />
                </div>
                <p className="text-[13px] font-bold text-slate-500">No matching records</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {histSearch || histStatus !== "all" ? "Try adjusting your filters" : "Your leave history will appear here"}
                </p>
              </div>
            ) : (
              pagedEntries.map((entry) => (
                <HistoryItem
                  key={entry._id || entry.id}
                  entry={entry}
                  onCancel={!entry.approved && !entry.rejected ? cancelRequest : null}
                  cancelling={cancellingId === (entry._id || entry.id)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60">
              <button
                type="button"
                disabled={histPage === 1}
                onClick={() => setHistPage((p) => p - 1)}
                className="text-[12px] font-bold text-slate-500 hover:text-slate-800
                  disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="text-[12px] text-slate-400 font-medium">
                Page {histPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={histPage === totalPages}
                onClick={() => setHistPage((p) => p + 1)}
                className="text-[12px] font-bold text-slate-500 hover:text-slate-800
                  disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}