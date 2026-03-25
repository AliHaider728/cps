import { TrendingUp } from "lucide-react";

/**
 * DashShell — generic placeholder dashboard for each role.
 * Accepts: role, colorClass, stats[]
 */
export default function DashShell({ role, colorClass = "bg-blue-600", stats = [] }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{role} Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back — here's your overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800 leading-none">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming soon placeholder */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
        <TrendingUp size={36} className="text-slate-300 mb-3" />
        <p className="text-slate-500 font-semibold">Module under development</p>
        <p className="text-slate-400 text-sm mt-1">This section will be fully built in the next phase.</p>
      </div>
    </div>
  );
}