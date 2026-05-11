import { 
  Users, 
  CalendarCheck, 
  Clock, 
  AlertTriangle, 
  Timer, 
  TrendingUp, 
  Search, 
  Filter, 
  ChevronRight,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react";
import { useTimeEntryAdminSummary } from "../../hooks/useTimeEntry";

/* ── Professional Stat Card ─────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, colorClass }) {
  return (
    <div className="group bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm   hover:-translate-y-2  hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Decorative background element */}
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-500 ${colorClass.split(' ')[1]}`} />
      
      <div className="flex items-start justify-between relative z-10 ">
        <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon size={22} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <ArrowUpRight size={12} />
          <span>LIVE</span>
        </div>
      </div>

      <div className="mt-5 relative z-10">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider text-[11px]">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { data: summary, isLoading, isError } = useTimeEntryAdminSummary();

  const totals = summary?.totals || {};
  const clinicians = summary?.clinicians || [];
  const month = summary?.month || "";

  return (
    <div className="max-w-7xl mx-auto min-h-screen   pb-12 antialiased">
      
      {/* ── Dashboard Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            System Overview
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest text-[10px]">
              Real-time Monitoring: <span className="text-slate-800">{month || "Loading..."}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            Export Report
          </button>
        </div>
      </div>

      {/* ── Key Metrics Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-50 rounded-[1.5rem] animate-pulse" />
          ))
        ) : (
          <>
            <StatCard icon={Users} label="Clinicians" value={totals.clinicians ?? "0"} sub="Registered Staff" colorClass="bg-indigo-50 text-indigo-600" />
            <StatCard icon={CalendarCheck} label="Shifts" value={totals.shiftsThisMonth ?? "0"} sub="Current Month" colorClass="bg-emerald-50 text-emerald-600" />
            <StatCard icon={Clock} label="Planned" value={`${totals.plannedHours ?? 0}h`} sub="Total Budgeted" colorClass="bg-slate-50 text-slate-600" />
            <StatCard icon={TrendingUp} label="Actual" value={`${totals.actualHours ?? 0}h`} sub="Total Logged" colorClass="bg-blue-50 text-blue-600" />
            <StatCard icon={Timer} label="Active Now" value={totals.currentlyClockedIn ?? 0} sub="Clocked In" colorClass="bg-rose-50 text-rose-600" />
            <StatCard icon={AlertTriangle} label="Pending" value={totals.pendingLeave ?? 0} sub="Leave Requests" colorClass="bg-amber-50 text-amber-600" />
          </>
        )}
      </div>

      {/* ── Clinician Performance Table ────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Clinician Activity Log</h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">
              {clinicians.length} Total
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search staff..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] text-slate-400 uppercase tracking-[0.15em] font-black">
                <th className="text-left px-8 py-4 font-black">Staff Member</th>
                <th className="text-left px-4 py-4 font-black">Designation</th>
                <th className="text-left px-4 py-4 font-black">Contract</th>
                <th className="text-right px-4 py-4 font-black">Monthly Hours</th>
                <th className="text-center px-4 py-4 font-black">Shift Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clinicians.map((c) => {
                const progress = Math.min((c.actualHoursMonth / (c.plannedHoursMonth || 1)) * 100, 100);
                
                return (
                  <tr key={c.clinicianId} className="group hover:bg-slate-50/50 transition-all duration-200">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm">
                          {c.fullName?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{c.fullName || "Unnamed"}</p>
                          <p className="text-[11px] text-slate-400 font-medium">ID: #{c.clinicianId.toString().slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold text-slate-600">{c.clinicianType || "—"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg">
                        {c.contractType || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-black text-slate-800">{c.actualHoursMonth}h</span>
                          <span className="text-[10px] font-bold text-slate-400">/ {c.plannedHoursMonth}h</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              progress > 90 ? 'bg-emerald-500' : progress > 50 ? 'bg-indigo-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        {!c.isActive ? (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Archive</span>
                        ) : c.currentlyClockedIn ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            On Shift
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Offline</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {clinicians.length === 0 && !isLoading && (
          <div className="py-20 text-center">
            <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
              <Users size={32} />
            </div>
            <p className="text-slate-500 font-medium">No clinicians found in the current roster.</p>
          </div>
        )}
      </div>
    </div>
  );
}