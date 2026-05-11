import { useState, useEffect } from "react";
import { 
  Clock, 
  CalendarCheck, 
  ClipboardCheck, 
  Timer, 
  LogIn, 
  LogOut, 
  AlertCircle,
  TrendingUp,
  User,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  useActiveTimeEntry,
  useClockIn,
  useClockOut,
  useTimeEntries,
} from "../../hooks/useTimeEntry";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";

/* ── Helpers ──────────────────────────────────────────────────── */
function formatDuration(startIso) {
  if (!startIso) return "00:00:00";
  const diffMs = Date.now() - new Date(startIso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  const s = Math.floor((diffMs % 60_000) / 1_000);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/* ── Live Timer Component (Refined) ─────────────────────────── */
function LiveTimer({ clockIn }) {
  const [display, setDisplay] = useState(() => formatDuration(clockIn));
  useEffect(() => {
    const id = setInterval(() => setDisplay(formatDuration(clockIn)), 1000);
    return () => clearInterval(id);
  }, [clockIn]);

  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-5xl font-extrabold tracking-tighter text-slate-900 tabular-nums">
        {display}
      </span>
      <div className="flex gap-8 mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
        <span>Hours</span>
        <span>Minutes</span>
        <span>Seconds</span>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function ClinicianDashboard() {
  const { user } = useAuth();
  const clinicianId = user?.clinicianId || null;

  const { data: activeEntry, isLoading: activeLoading } = useActiveTimeEntry();
  const isClockedIn = !!activeEntry;

  const { data: leaveData } = useClinicianLeave(clinicianId);
  const arrsBalance = leaveData?.balances?.find((b) => b.contract === "ARRS") || null;

  const { data: recentEntries = [] } = useTimeEntries({ limit: 5 });

  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const [feedback, setFeedback] = useState(null);

  const handleClockIn = async () => {
    try {
      setFeedback(null);
      await clockInMutation.mutateAsync({});
      setFeedback({ type: "success", msg: "Shift started successfully." });
    } catch (err) {
      setFeedback({ type: "error", msg: err.response?.data?.message || "Clock-in failed" });
    }
  };

  const handleClockOut = async () => {
    try {
      setFeedback(null);
      const result = await clockOutMutation.mutateAsync();
      setFeedback({ type: "success", msg: `Shift ended. Total: ${result?.actual_hours ?? "0"}h` });
    } catch (err) {
      setFeedback({ type: "error", msg: err.response?.data?.message || "Clock-out failed" });
    }
  };

  return (
    <div className="max-w-full mx-auto min-h-screen bg-[#F8FAFC] pb-12 antialiased">
      {/* ── Top Navigation / Header ────────────────────────────── */}
      <header className="flex items-center justify-between py-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1.5 pr-4 rounded-full border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 leading-none">{user?.name || "Clinician"}</span>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Medical Staff</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── LEFT COLUMN: Clocking & Stats ────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Timer Card */}
          <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
            
            <div className="relative flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isClockedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                  <Timer size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Shift Controller</h2>
                  <p className="text-xs text-slate-400 font-medium">Manage your daily attendance</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${
                isClockedIn 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                : "bg-slate-50 text-slate-400 border-slate-100"
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${isClockedIn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {isClockedIn ? "Live Session" : "Inactive"}
              </div>
            </div>

            {isClockedIn ? (
              <div className="py-6 mb-10">
                <LiveTimer clockIn={activeEntry.clock_in} />
                <div className="flex justify-center gap-4 mt-8">
                   <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Started At</p>
                      <p className="text-sm font-bold text-slate-700">
                        {new Date(activeEntry.clock_in).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                   <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Planned Hours</p>
                      <p className="text-sm font-bold text-slate-700">{activeEntry.planned_hours || "—"}h</p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="py-12 mb-10 text-center">
                <p className="text-slate-400 font-medium">Ready to start your rotation?</p>
                <p className="text-sm text-slate-300">Clock in to begin tracking your active hours.</p>
              </div>
            )}

            {feedback && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
                feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                <AlertCircle size={18} />
                {feedback.msg}
              </div>
            )}

            <button
              onClick={isClockedIn ? handleClockOut : handleClockIn}
              disabled={clockInMutation.isPending || clockOutMutation.isPending}
              className={`group relative w-full overflow-hidden rounded-[1.25rem] py-4 font-bold transition-all duration-300 transform active:scale-[0.98] ${
                isClockedIn 
                ? "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 text-white"
              }`}
            >
              <div className="relative flex items-center justify-center gap-2 z-10">
                {isClockedIn ? <LogOut size={20} /> : <LogIn size={20} />}
                {isClockedIn ? "End Shift Now" : "Begin New Shift"}
              </div>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><CalendarCheck size={20} /></div>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Leave Balance</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{arrsBalance?.remaining || "0"} <span className="text-sm font-medium text-slate-400">days</span></h3>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${(arrsBalance?.used / arrsBalance?.total) * 100 || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Clock size={20} /></div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Monthly Hours</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">
                  {recentEntries
                    .filter((e) => e.status === "completed")
                    .reduce((sum, e) => sum + Number(e.actual_hours || 0), 0)
                    .toFixed(1)}
                  <span className="text-sm font-medium text-slate-400 ml-1">hrs</span>
                </h3>
                <p className="text-[11px] text-emerald-600 font-bold mt-2 uppercase tracking-tight">+12% from last month</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Activity Log ────────────────────────── */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm h-full overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardCheck className="text-slate-400" size={22} />
                  Recent Activity
                </h2>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">
                  View All
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          entry.status === 'active' 
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-600' 
                          : 'border-slate-100 bg-white text-slate-400'
                        }`}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {new Date(entry.clock_in).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {new Date(entry.clock_in).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}
                            {entry.clock_out ? ` — ${new Date(entry.clock_out).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}` : " — Currently Active"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-black ${entry.status === 'active' ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {entry.status === "active" ? "Active" : `${entry.actual_hours}h`}
                        </span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 text-sm italic">No recent activity found.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-slate-50/50 mt-auto border-t border-slate-100">
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
                Secure Clinician Portal v3.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}