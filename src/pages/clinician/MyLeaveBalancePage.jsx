import { CalendarCheck } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";

const contracts = ["ARRS", "EA", "Direct"];

export default function MyLeaveBalancePage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useClinicianLeave(user?.clinicianId);
  const balances = data?.balances || [];
  const entries = data?.entries || [];

  const balanceFor = (contract) => balances.find((item) => item.contract === contract) || { used: 0, total: 0 };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Leave Balance</h1>
        <p className="mt-1 text-sm text-slate-500">Leave balances are split by contract type.</p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading balances...</p>}
      {isError && <p className="text-sm font-medium text-red-600">Unable to load leave balances.</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {contracts.map((contract) => {
          const balance = balanceFor(contract);
          const total = Number(balance.total || 0);
          const used = Number(balance.used || 0);
          const remaining = Number(balance.remaining ?? total - used);
          const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
          return (
            <div key={contract} className="rounded-lg border border-slate-200 bg-white p-5">
              <Badge color={contract === "ARRS" ? "blue" : contract === "EA" ? "success" : "warning"}>
                {contract} Annual Leave
              </Badge>
              <div className="mt-4 text-3xl font-black text-slate-900">
                {remaining}
                <span className="text-base font-normal text-slate-400"> / {total} days</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Taken <strong className="text-slate-700">{used}d</strong></span>
                <span>Remaining <strong className="text-slate-700">{remaining}d</strong></span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 p-4 font-bold text-slate-900"><CalendarCheck size={18} /> Recent Leave History</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Hours/Days</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.slice(0, 10).map((entry) => (
              <tr key={entry._id || entry.id}>
                <td className="px-4 py-3 font-semibold">{entry.contract || entry.leaveType}</td>
                <td className="px-4 py-3">{entry.startDate} - {entry.endDate}</td>
                <td className="px-4 py-3">{entry.hours || entry.days || 0}</td>
                <td className="px-4 py-3"><Badge color={entry.approved ? "success" : "warning"}>{entry.approved ? "Approved" : "Pending"}</Badge></td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No leave history yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
