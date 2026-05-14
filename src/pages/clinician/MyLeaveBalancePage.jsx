import { CalendarCheck, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";

const CONTRACT_COLORS = {
  ARRS: { bg: "bg-indigo-50", text: "text-indigo-700", bar: "bg-indigo-500" },
  EA: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  Direct: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  Mixed: { bg: "bg-purple-50", text: "text-purple-700", bar: "bg-purple-500" },
};

function BalanceCard({ contract, total, used, remaining }) {
  const pct = total ? Math.round((used / total) * 100) : 0;
  const theme = CONTRACT_COLORS[contract] || CONTRACT_COLORS.ARRS;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-5 ${theme.bg} ${theme.text}`}>
        {contract}
      </div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-sm text-slate-400 font-medium mb-1">Remaining</p>
          <h3 className="text-4xl font-black text-slate-900">{remaining}<span className="text-base text-slate-400 font-medium ml-1">days</span></h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">{used} used / {total} total</p>
          <p className="text-xs text-slate-500 font-semibold">{pct}% used</p>
        </div>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${theme.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MyLeaveBalancePage() {
  const { user } = useAuth();
  const { data: leaveData, isLoading, isError } = useClinicianLeave(user?.clinicianId);

  const balances = leaveData?.balances || [];
  const requests = leaveData?.entries || [];
  const pending = requests.filter((request) => request.status === "pending");

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Leave Balance</h1>
        <p className="text-slate-500 mt-1">Your entitlements and upcoming leave requests.</p>
      </div>

      {isLoading && <p className="text-slate-400 text-sm">Loading leave data...</p>}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm mb-6">
          <AlertCircle size={18} /> Unable to load leave data. Please try again later.
        </div>
      )}

      {balances.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {balances.map((balance) => (
            <BalanceCard
              key={balance.contract}
              contract={balance.contract}
              total={balance.total || 0}
              used={balance.used || 0}
              remaining={balance.remaining || 0}
            />
          ))}
        </div>
      ) : !isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm mb-8">
          No leave balances configured. Contact your ops lead.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck size={20} className="text-slate-400" />
            Leave Requests
          </h2>
          {pending.length > 0 && (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
              {pending.length} pending
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm italic">No leave requests submitted.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => {
              const statusMap = {
                pending: { label: "Pending", cls: "bg-amber-50 text-amber-700" },
                approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700" },
                rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-700" },
              };
              const status = statusMap[request.status] || statusMap.pending;
              const start = new Date(request.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
              const end = new Date(request.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

              return (
                <div key={request.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{request.leaveType?.replace(/_/g, " ") || "Leave"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{start} - {end}</p>
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${status.cls}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
