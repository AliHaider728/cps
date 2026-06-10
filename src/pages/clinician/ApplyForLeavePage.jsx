import { useMemo, useState } from "react";
import {
  CalendarDays, Send, CheckCircle2, Clock, XCircle,
  AlertCircle, TrendingUp, FileText, Loader2, CalendarCheck
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useClinicianLeave, useAddLeave } from "../../hooks/useClinicianLeave";
import { dayCount } from "../../lib/leaveDays";

const CONTRACTS   = ["ARRS", "EA", "Direct"];
const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave"    },
  { value: "sick",   label: "Sick Leave"      },
  { value: "cppe",   label: "CPPE"            },
  { value: "other",  label: "Training Leave"  },
];

const contractConfig = {
  ARRS: {
    gradient:  "from-blue-500 to-blue-700",
    glow:      "group-hover:shadow-blue-200/60 dark:group-hover:shadow-blue-900/40",
    ring:      "ring-blue-100 dark:ring-blue-900/40",
    accent:    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    bar:       "bg-gradient-to-r from-blue-400 to-blue-600",
  },
  EA: {
    gradient:  "from-teal-500 to-emerald-600",
    glow:      "group-hover:shadow-teal-200/60 dark:group-hover:shadow-teal-900/40",
    ring:      "ring-teal-100 dark:ring-teal-900/40",
    accent:    "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    bar:       "bg-gradient-to-r from-teal-400 to-emerald-500",
  },
  Direct: {
    gradient:  "from-purple-500 to-fuchsia-600",
    glow:      "group-hover:shadow-purple-200/60 dark:group-hover:shadow-purple-900/40",
    ring:      "ring-purple-100 dark:ring-purple-900/40",
    accent:    "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    bar:       "bg-gradient-to-r from-purple-400 to-fuchsia-500",
  },
};

export default function ApplyForLeavePage() {
  const { data, refetch }   = useClinicianLeave();
  const clinicianId         = data?.clinicianId;
  const addLeaveM           = useAddLeave(clinicianId);

  const [form, setForm]       = useState({ contract: "ARRS", leaveType: "annual", startDate: "", endDate: "", notes: "" });
  const [message, setMessage] = useState({ text: "", type: "" });

  const requestedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    return dayCount(form.startDate, form.endDate);
  }, [form.startDate, form.endDate]);

  const balance = useMemo(
    () => (data?.balances || []).find((item) => item.contract === form.contract),
    [data, form.contract]
  );

  const submit = async () => {
    setMessage({ text: "", type: "" });
    if (!clinicianId)
      return setMessage({ text: "Your account is not linked to a clinician profile. Contact admin.", type: "error" });
    if (!form.startDate || !form.endDate)
      return setMessage({ text: "Start date and end date are required.", type: "error" });
    try {
      const res = await addLeaveM.mutateAsync({
        leaveType:  form.leaveType,
        contract:   form.contract,
        startDate:  form.startDate,
        endDate:    form.endDate,
        days:       requestedDays,
        notes:      form.notes,
      });
      setForm({ contract: "ARRS", leaveType: "annual", startDate: "", endDate: "", notes: "" });
      setMessage({
        text: res?.autoApproved
          ? "Leave approved automatically (≤2 weeks, no clashes)."
          : "Leave request submitted for approval.",
        type: "success",
      });
      refetch();
    } catch (err) {
      const payload = err?.response?.data;
      setMessage({ text: payload?.message || err.message || "Unable to submit leave request.", type: "error" });
    }
  };

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
            <h1 className="page-title text-gray-900 font-semibold dark:text-slate-100">Apply for Leave</h1>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 ml-[2.875rem]">
            Balances are separate per contract · Short annual leave may auto-approve
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl
          bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
          text-slate-600 dark:text-slate-400 text-xs font-bold">
          <TrendingUp size={13} />
          {new Date().getFullYear()} Leave Year
        </div>
      </div>

      {/* ── Balance Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CONTRACTS.map((contract) => {
          const cfg       = contractConfig[contract];
          const b         = (data?.balances || []).find((x) => x.contract === contract) || {};
          const total     = Number(b.total    || 0);
          const used      = Number(b.used     || 0);
          const remaining = Number(b.remaining ?? total - used);
          const pct       = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
          const isSelected = form.contract === contract;

          return (
            <button
              key={contract}
              type="button"
              onClick={() => setForm((f) => ({ ...f, contract }))}
              className={`group card relative overflow-hidden p-5 text-left
                transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                ${cfg.glow} focus:outline-none focus:ring-4 ${cfg.ring}
                ${isSelected
                  ? "ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-500"
                  : ""}`}
            >
              <div className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full
                bg-gradient-to-br ${cfg.gradient} opacity-10
                group-hover:opacity-20 group-hover:scale-110 transition-all duration-500`} />
              <div className={`pointer-events-none absolute left-0 right-0 bottom-0 h-[3px]
                bg-gradient-to-r ${cfg.gradient} transition-opacity
                ${isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.gradient}
                  flex items-center justify-center shadow-[0_4px_12px_rgba(15,23,42,0.12)]
                  group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <CalendarDays size={18} className="text-white" strokeWidth={2.2} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.accent}`}>
                  {remaining}/{total}d
                </span>
              </div>

              <p className="text-[13px] font-medium text-gray-700 dark:text-slate-400 mb-1">
                {contract} Contract
              </p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-black text-gray-900 dark:text-slate-100 leading-none">{remaining}</span>
                <span className="text-sm font-medium text-gray-500 dark:text-slate-500">days left</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 mb-2">
                <span>Taken <strong className="text-slate-700 dark:text-slate-300">{used}d</strong></span>
                <span className="font-semibold">{pct}% used</span>
              </div>
              <div className="progress-track">
                <div className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
                  style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

        {/* ── Leave Request Form ── */}
        <div className="card overflow-hidden">
          {/* Form header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700/60
            bg-slate-50/60 dark:bg-slate-800/40">
            <div className="w-9 h-9 rounded-xl gradient-blue-indigo flex items-center justify-center
              shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-slate-800 dark:text-slate-200">New Leave Request</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Fill in the details below</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Leave type + contract */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Leave Type</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className="input"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Contract Type</label>
                <select
                  value={form.contract}
                  onChange={(e) => setForm({ ...form, contract: e.target.value })}
                  className="input"
                >
                  {CONTRACTS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Start Date</label>
                <input type="date" value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label className="field-label">End Date</label>
                <input type="date" value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="input" />
              </div>
            </div>

            {/* Day count preview */}
            {requestedDays > 0 && (
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all animate-scale-in
                ${balance?.remaining >= requestedDays
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40"
                  : "bg-red-50   dark:bg-red-900/20   border-red-200   dark:border-red-800/40"}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                  ${balance?.remaining >= requestedDays
                    ? "bg-green-100 dark:bg-green-800/30"
                    : "bg-red-100   dark:bg-red-800/30"}`}>
                  <CalendarDays size={15}
                    className={balance?.remaining >= requestedDays
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500   dark:text-red-400"} />
                </div>
                <p className={`text-[13px] font-medium
                  ${balance?.remaining >= requestedDays
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-600   dark:text-red-400"}`}>
                  Requesting <strong>{requestedDays} day(s)</strong> from <strong>{form.contract}</strong>
                  {" · "}{balance?.remaining ?? 0} days remaining
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="field-label">
                Notes{" "}
                <span className="normal-case font-normal text-slate-400 dark:text-slate-600 tracking-normal">
                  (optional)
                </span>
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional information…"
                className="input resize-none"
              />
            </div>

            {/* Alert message */}
            {message.text && (
              <div className={`flex items-start gap-3 rounded-xl px-4 py-3 border animate-scale-in
                ${message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40"
                  : "bg-red-50   dark:bg-red-900/20   border-red-200   dark:border-red-800/40"}`}>
                {message.type === "success"
                  ? <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" />
                  : <AlertCircle  size={15} className="text-red-500   mt-0.5 shrink-0" />}
                <p className={`text-[13px] font-medium
                  ${message.type === "success"
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-600   dark:text-red-400"}`}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Submit */}
            <Button
              isLoading={addLeaveM.isPending}
              onClick={submit}
              className="btn btn-primary w-full sm:w-auto justify-center"
            >
              {addLeaveM.isPending
                ? <><Loader2 size={14} className="spin-arc" /> Submitting…</>
                : <><Send size={14} /> Submit Request</>}
            </Button>
          </div>
        </div>

        {/* ── Leave History Sidebar ── */}
        <div className="card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5
            border-b border-slate-100 dark:border-slate-700/60
            bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400 dark:text-slate-600" />
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Leave History</p>
            </div>
            <span className="badge badge-slate">
              {(data?.entries || []).length} record{(data?.entries || []).length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[520px] overflow-y-auto">
            {(data?.entries || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800
                  flex items-center justify-center mb-3">
                  <CalendarDays size={20} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400">No requests yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1">
                  Your leave history will appear here
                </p>
              </div>
            ) : (
              (data?.entries || []).map((entry) => {
                const cfg = contractConfig[entry.contract];
                return (
                  <div key={entry._id || entry.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                          ${cfg ? `bg-gradient-to-br ${cfg.gradient}` : "bg-slate-200 dark:bg-slate-700"}`}>
                          <CalendarDays size={12} className="text-white" />
                        </div>
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate">
                          {entry.contract} · {entry.leaveType}
                        </span>
                      </div>

                      {/* Status badge */}
                      {entry.rejected ? (
                        <span className="badge badge-red shrink-0">
                          <XCircle size={10} /> Rejected
                        </span>
                      ) : entry.approved ? (
                        <span className="badge badge-green shrink-0">
                          <CheckCircle2 size={10} /> Approved
                        </span>
                      ) : (
                        <span className="badge badge-amber shrink-0">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-600">
                      <CalendarDays size={10} />
                      <span>{entry.startDate} – {entry.endDate}</span>
                      <span className="font-bold text-slate-600 dark:text-slate-400 ml-1">
                        · {entry.days}d
                      </span>
                    </div>

                    {entry.rejectionNote && (
                      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-red-500 dark:text-red-400
                        bg-red-50 dark:bg-red-900/20 rounded-lg px-2.5 py-1.5 border border-red-100 dark:border-red-800/40">
                        <AlertCircle size={10} className="mt-0.5 shrink-0" />
                        {entry.rejectionNote}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}