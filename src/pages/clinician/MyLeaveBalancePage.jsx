import { CalendarCheck, TrendingUp, Clock, CheckCircle2, AlertCircle, CalendarDays } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";

const contracts = ["ARRS", "EA", "Direct"];

const contractConfig = {
  ARRS: {
    gradient:  "from-blue-500 to-blue-700",
    glow:      "group-hover:shadow-blue-200/60 dark:group-hover:shadow-blue-900/40",
    ring:      "ring-blue-100 dark:ring-blue-900/40",
    accent:    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    bar:       "bg-gradient-to-r from-blue-400 to-blue-600",
    iconBg:    "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  EA: {
    gradient:  "from-teal-500 to-emerald-600",
    glow:      "group-hover:shadow-teal-200/60 dark:group-hover:shadow-teal-900/40",
    ring:      "ring-teal-100 dark:ring-teal-900/40",
    accent:    "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    bar:       "bg-gradient-to-r from-teal-400 to-emerald-500",
    iconBg:    "bg-teal-50 dark:bg-teal-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  Direct: {
    gradient:  "from-purple-500 to-fuchsia-600",
    glow:      "group-hover:shadow-purple-200/60 dark:group-hover:shadow-purple-900/40",
    ring:      "ring-purple-100 dark:ring-purple-900/40",
    accent:    "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    bar:       "bg-gradient-to-r from-purple-400 to-fuchsia-500",
    iconBg:    "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

const StatusBadge = ({ approved }) =>
  approved ? (
    <span className="badge badge-green">
      <CheckCircle2 size={10} /> Approved
    </span>
  ) : (
    <span className="badge badge-amber">
      <Clock size={10} /> Pending
    </span>
  );

export default function MyLeaveBalancePage() {
  const { data, isLoading, isError, error } = useClinicianLeave();
  const balances = data?.balances || [];
  const entries  = data?.entries  || [];

  const balanceFor = (contract) =>
    balances.find((item) => item.contract === contract) || { used: 0, total: 0 };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-blue-indigo flex items-center justify-center
            shadow-[0_4px_16px_rgba(59,130,246,0.35)] animate-pulse">
            <CalendarCheck size={18} className="text-white" />
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold">Loading leave balances…</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6 pb-12 animate-fade-up">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl gradient-blue-indigo flex items-center justify-center
              shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
              <CalendarCheck size={16} className="text-white" />
            </div>
            <h1 className="page-title text-gray-900 font-semibold dark:text-slate-100">My Leave Balance</h1>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 ml-[2.875rem]">
            Annual leave allocation split by contract type
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl
          bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
          text-slate-600 dark:text-slate-400 text-xs font-bold">
          <TrendingUp size={13} />
          {new Date().getFullYear()} Leave Year
        </div>
      </div>

      {/* ── Error alert ── */}
      {isError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800/50
          bg-red-50 dark:bg-red-900/20 px-4 py-3 animate-scale-in">
          <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            {error?.response?.data?.message ||
              "Unable to load leave balances. Ask your admin to link your login to a clinician profile."}
          </p>
        </div>
      )}

      {/* ── Balance Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contracts.map((contract) => {
          const cfg       = contractConfig[contract];
          const balance   = balanceFor(contract);
          const total     = Number(balance.total || 0);
          const used      = Number(balance.used  || 0);
          const remaining = Number(balance.remaining ?? total - used);
          const pct       = total ? Math.min(100, Math.round((used / total) * 100)) : 0;

          return (
            <div key={contract}
              className={`group card card-hover relative overflow-hidden p-5 cursor-default
                transition-all duration-300 hover:-translate-y-1
                hover:shadow-xl ${cfg.glow} focus:outline-none focus:ring-4 ${cfg.ring}`}
              tabIndex={0}
            >
              {/* Decorative blob */}
              <div className={`pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full
                bg-gradient-to-br ${cfg.gradient} opacity-10
                group-hover:opacity-20 group-hover:scale-110 transition-all duration-500`} />

              {/* Bottom gradient bar */}
              <div className={`pointer-events-none absolute left-0 right-0 bottom-0 h-[3px]
                bg-gradient-to-r ${cfg.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

              {/* Icon + remaining badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.gradient}
                  flex items-center justify-center
                  shadow-[0_4px_12px_rgba(15,23,42,0.12)]
                  group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <CalendarCheck size={19} className="text-white" strokeWidth={2.2} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.accent}`}>
                  {remaining}/{total}d
                </span>
              </div>

              <p className="text-[13px] font-medium text-gray-500 dark:text-slate-400 mb-1">{contract} Annual Leave</p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-black text-gray-900 dark:text-slate-100 leading-none">{remaining}</span>
                <span className="text-sm font-medium text-gray-500 dark:text-slate-500">days left</span>
              </div>

              <div className="flex justify-between text-xs text-gray-500 dark:text-slate-500 mb-2">
                <span>Taken <strong className="text-gray-700 dark:text-slate-300">{used}d</strong></span>
                <span className="font-semibold">{pct}% used</span>
              </div>

              <div className="progress-track">
                <div className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Leave History ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400 dark:text-slate-600" />
            <h2 className="section-label text-gray-500 dark:text-slate-400">Recent Leave History</h2>
          </div>
          <span className="badge badge-slate">
            {entries.length} record{entries.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="card overflow-hidden">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800
                flex items-center justify-center mb-3
                shadow-[inset_0_1px_3px_rgba(15,23,42,0.06)]">
                <CalendarCheck size={24} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No leave history yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                Your approved leave will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] table-pro">
                <thead>
                  <tr>
                    {["Type", "Dates", "Hrs / Days", "Status"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 10).map((entry) => {
                    const cfg = contractConfig[entry.contract];
                    return (
                      <tr key={entry._id || entry.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                              ${cfg ? `bg-gradient-to-br ${cfg.gradient}` : "bg-slate-200 dark:bg-slate-700"}`}>
                              <CalendarCheck size={13} className="text-white" />
                            </div>
                            <span className="text-[13px] font-bold text-gray-800 dark:text-slate-200">
                              {entry.contract || entry.leaveType}
                            </span>
                          </div>
                        </td>
                        <td className="text-gray-600 dark:text-slate-400 whitespace-nowrap">
                          {entry.startDate} – {entry.endDate}
                        </td>
                        <td>
                          <span className="font-bold text-gray-900 dark:text-slate-300">
                            {entry.hours || entry.days || 0}
                          </span>
                          <span className="text-slate-400 dark:text-slate-600 text-xs ml-1">
                            {entry.hours ? "hrs" : "days"}
                          </span>
                        </td>
                        <td><StatusBadge approved={entry.approved} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
