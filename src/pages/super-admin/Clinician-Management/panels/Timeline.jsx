import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useClinicianRota } from "../../../../hooks/useRota";
import { usePractices } from "../../../../hooks/usePractice";
import { buildPracticeNameMap, resolvePracticeName, isWorkingShift } from "../../../../lib/practiceNames";
import { useTimeEntries, useActiveTimeEntry } from "../../../../hooks/useTimeEntry";
import { apiClient } from "../../../../services/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AddShiftModal from "../../../super-admin/RotaManagement/AddShiftModal";
import {
  ChevronLeft, ChevronRight, List, Clock, MapPin, AlertTriangle,
  Briefcase, Umbrella, Thermometer, BookOpen, UserPlus, XCircle,
  Timer, Activity, Zap, FileText, X, Plus, Edit2,
  Calendar, ChevronDown as ChevronDownIcon, TrendingUp, Layers,
  CheckCircle2,
} from "lucide-react";

/* ── Status config ── */
const STATUS_CONFIG = {
  working:      { bg: "bg-blue-500",    dot: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    label: "Working",      Icon: Briefcase   },
  annual_leave: { bg: "bg-amber-400",   dot: "bg-amber-400",   light: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   label: "Annual Leave", Icon: Umbrella    },
  sick:         { bg: "bg-orange-500",  dot: "bg-orange-500",  light: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  label: "Sick",         Icon: Thermometer },
  cppe:         { bg: "bg-emerald-500", dot: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "CPPE",         Icon: BookOpen    },
  cover:        { bg: "bg-violet-500",  dot: "bg-violet-500",  light: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  label: "Cover",        Icon: UserPlus    },
  gap:          { bg: "bg-rose-500",    dot: "bg-rose-500",    light: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    label: "Gap",          Icon: AlertTriangle },
  cancelled:    { bg: "bg-slate-300",   dot: "bg-slate-300",   light: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   label: "Cancelled",    Icon: XCircle     },
};
const getStatus  = s => STATUS_CONFIG[s] || STATUS_CONFIG.cancelled;
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmtTime    = t => t ? String(t).slice(0,5) : "";
const fmtHours   = (s, e) => {
  if (!s || !e) return null;
  const [sh,sm] = s.split(":").map(Number);
  const [eh,em] = e.split(":").map(Number);
  const d = ((eh*60+em)-(sh*60+sm))/60;
  return d > 0 ? Math.round(d*100)/100 : null;
};
const formatLive = (iso) => {
  if (!iso) return "00:00:00";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000), s = Math.floor((ms%60000)/1000);
  return [h,m,s].map(n => String(n).padStart(2,"0")).join(":");
};
const deriveStats = shifts => {
  let working=0,leave=0,sick=0,cover=0,gaps=0,totalHours=0;
  shifts.forEach(s => {
    const h = fmtHours(s.start_time,s.end_time) ?? s.hours ?? 0;
    switch(s.status){
      case "working":      working++;  totalHours+=h; break;
      case "annual_leave": leave++;    break;
      case "sick":         sick++;     break;
      case "cover":        cover++;    totalHours+=h; break;
      case "gap":          gaps++;     break;
    }
  });
  return { working, leave, sick, cover, gaps, totalHours: Math.round(totalHours*10)/10 };
};
const usePracticeMap = () => {
  const { data } = usePractices();
  return useMemo(() => buildPracticeNameMap(data), [data]);
};

/* ── Admin time-entry hooks ── */
function useAdminTimeEntries(clinicianId) {
  return useQuery({
    queryKey: ["time-entries","admin",clinicianId],
    queryFn: () => apiClient.get(`/time-entries/admin/clinician/${clinicianId}`).then(r => r.data?.data ?? { entries:[], is_clocked_in:false, active_since:null }),
    enabled: !!clinicianId,
    refetchInterval: 30_000,
  });
}

/* ════════ CALENDAR VIEW ════════ */
function CalendarView({ month, year, shifts, canManage, onAddShift, onEditShift, getPracticeName }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const { days, startPad } = useMemo(() => {
    const firstDay = new Date(year, month-1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    return { days: daysInMonth, startPad: firstDay };
  }, [month, year]);

  const shiftsByDate = useMemo(() => {
    const map = {};
    shifts.forEach(s => {
      const key = String(s.date||"").slice(0,10);
      if (!map[key]) map[key]=[];
      map[key].push(s);
    });
    return map;
  }, [shifts]);

  const todayStr = new Date().toISOString().slice(0,10);
  const cells = [];
  for (let i=0;i<startPad;i++) cells.push(null);
  for (let d=1;d<=days;d++) {
    const ds = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cells.push({ day:d, dateStr:ds });
  }

  const selectedShifts = useMemo(() => shiftsByDate[selectedDate]||[], [selectedDate, shiftsByDate]);

  return (
    <div className="p-4 space-y-4">
      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-1.5">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`pad-${idx}`} />;
          const { day, dateStr } = cell;
          const dayShifts = shiftsByDate[dateStr]||[];
          const isToday   = dateStr===todayStr;
          const isSel     = dateStr===selectedDate;
          const statusCounts = {};
          dayShifts.forEach(s => { statusCounts[s.status]=(statusCounts[s.status]||0)+1; });
          const top2 = Object.keys(statusCounts).slice(0,2);

          return (
            <button key={dateStr} type="button"
              onClick={() => setSelectedDate(isSel ? null : dateStr)}
              className={`relative min-h-[68px] rounded-xl p-1.5 text-left transition-all border
                ${isSel ? "border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100/50"
                : isToday ? "border-blue-300 bg-blue-50"
                : dayShifts.length>0 ? "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
                : "border-transparent bg-slate-50/60 hover:bg-slate-100/60"}`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold mb-1
                ${isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"}`}>
                {day}
              </span>
              <div className="space-y-0.5">
                {top2.map(st => {
                  const cfg = getStatus(st);
                  return (
                    <div key={st} className={`w-full px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate ${cfg.light} ${cfg.text}`}>
                      {cfg.label}{statusCounts[st]>1 && ` ×${statusCounts[st]}`}
                    </div>
                  );
                })}
                {Object.keys(statusCounts).length>2 && (
                  <div className="text-[9px] text-slate-400 font-semibold pl-1">+{Object.keys(statusCounts).length-2} more</div>
                )}
              </div>
              {/* Today indicator line */}
              {isToday && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-b-xl" />}
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {new Date(selectedDate+"T00:00:00").toLocaleDateString("en-GB",{ weekday:"long", day:"numeric", month:"long" })}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{selectedShifts.length} shift{selectedShifts.length!==1?"s":""}</p>
            </div>
            <div className="flex items-center gap-2">
              {canManage && (
                <button onClick={() => onAddShift(selectedDate)}
                  className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 inline-flex items-center gap-1.5">
                  <Plus size={12}/> Add
                </button>
              )}
              <button onClick={() => setSelectedDate(null)}
                className="h-8 w-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 inline-flex items-center justify-center">
                <X size={13}/>
              </button>
            </div>
          </div>

          {selectedShifts.length===0 ? (
            <div className="px-4 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Calendar size={20} className="text-slate-400"/>
              </div>
              <p className="text-sm text-slate-500 font-medium">No shifts on this day</p>
              {canManage && (
                <button onClick={() => onAddShift(selectedDate)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
                  <Plus size={12}/> Add Shift
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {selectedShifts.map((shift, i) => {
                const cfg = getStatus(shift.status);
                const hours = fmtHours(shift.start_time, shift.end_time);
                const rate = shift.hourly_rate ?? shift.hourlyRate;
                const cost = rate && hours ? Math.round(rate*hours*100)/100 : null;
                const practice = shift.practice_name || shift.surgery_name || getPracticeName(shift) || "—";
                return (
                  <div key={shift.id||i}
                    className="px-4 py-3.5 flex items-start gap-3 group hover:bg-slate-50/60 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${cfg.bg}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${cfg.light} ${cfg.text} ${cfg.border}`}>
                          <cfg.Icon size={9}/>{cfg.label}
                        </span>
                        {shift.service_code && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{shift.service_code}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate">{practice}</p>
                      {shift.start_time && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {fmtTime(shift.start_time)} – {fmtTime(shift.end_time)}{hours ? ` · ${hours}h` : ""}
                        </p>
                      )}
                      {rate!=null && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          £{rate}/hr{cost ? ` · £${cost.toFixed(2)} total` : ""}
                        </p>
                      )}
                    </div>
                    {canManage && (
                      <button onClick={() => onEditShift(shift)}
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 inline-flex items-center justify-center transition-all shrink-0">
                        <Edit2 size={11}/>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════ LIST VIEW ════════ */
function ListView({ shifts, canManage, isLoading, monthLabel, stats, getPracticeName, onAddShift, onEditShift }) {
  const grouped = useMemo(() => {
    const working  = shifts.filter(isWorkingShift);
    const orderMap = {}, groups = [];
    working.forEach(s => {
      const name = getPracticeName(s)||"Unknown Practice";
      if (orderMap[name]===undefined) { orderMap[name]=groups.length; groups.push({ practiceName:name, shifts:[] }); }
      groups[orderMap[name]].shifts.push(s);
    });
    groups.forEach(g => g.shifts.sort((a,b) => String(a.date).localeCompare(String(b.date))));
    return groups;
  }, [shifts, getPracticeName]);

  const [collapsed, setCollapsed] = useState({});
  const toggle = name => setCollapsed(p => ({...p, [name]:!p[name]}));
  const totalShifts = grouped.reduce((sum,g) => sum+g.shifts.length, 0);

  if (isLoading) return (
    <div className="flex items-center justify-center h-40 gap-3 text-sm text-slate-400">
      <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin"/>Loading shifts…
    </div>
  );

  if (totalShifts===0) return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
        <FileText size={26} className="text-slate-400"/>
      </div>
      <p className="text-sm font-bold text-slate-600 mb-1">No working shifts</p>
      <p className="text-xs text-slate-400 mb-5">No shifts recorded for {monthLabel}</p>
      {canManage && (
        <button onClick={() => onAddShift()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200">
          <Plus size={13}/> Add First Shift
        </button>
      )}
    </div>
  );

  return (
    <div className="divide-y divide-slate-100">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Layers size={12} className="text-slate-400"/>
          <span><strong className="text-slate-700">{totalShifts}</strong> shifts · {grouped.length} practice{grouped.length!==1?"s":""}</span>
        </div>
        {stats.totalHours>0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <TrendingUp size={12} className="text-indigo-500"/>
            <span><strong className="text-indigo-700">{stats.totalHours}h</strong> total</span>
          </div>
        )}
        {stats.gaps>0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
            <AlertTriangle size={12}/>{stats.gaps} gap{stats.gaps!==1?"s":""}
          </div>
        )}
        {canManage && (
          <button onClick={() => onAddShift()}
            className="ml-auto inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700">
            <Plus size={11}/> Add Shift
          </button>
        )}
      </div>

      {/* Groups */}
      {grouped.map(({ practiceName, shifts: gs }) => {
        const isCol = collapsed[practiceName];
        const groupHours = Math.round(gs.reduce((s,sh) => s+(fmtHours(sh.start_time,sh.end_time)??sh.hours??0), 0)*10)/10;

        return (
          <div key={practiceName} className="bg-white">
            <button type="button" onClick={() => toggle(practiceName)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors text-left">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                <MapPin size={13} className="text-indigo-600"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">{practiceName}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {gs.length} shift{gs.length!==1?"s":""}
                  {groupHours>0 && <> · <span className="text-indigo-600 font-bold">{groupHours}h</span></>}
                </p>
              </div>
              <ChevronDownIcon size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCol?"-rotate-90":""}`}/>
            </button>

            {!isCol && (
              <div className="border-t border-slate-100">
                {gs.map((s, i) => {
                  const cfg  = getStatus(s.status);
                  const h    = fmtHours(s.start_time,s.end_time)??s.hours;
                  const rate = s.hourly_rate??s.hourlyRate;
                  const cost = rate&&h ? Math.round(rate*h*100)/100 : null;
                  const dateObj = new Date(String(s.date||"").slice(0,10)+"T00:00:00");
                  const dayLabel = !isNaN(dateObj) ? dateObj.toLocaleDateString("en-GB",{ weekday:"short", day:"numeric", month:"short" }) : String(s.date||"").slice(0,10);

                  return (
                    <div key={s.id||`${practiceName}-${i}`}
                      className="flex items-center gap-3 px-5 py-3 pl-[52px] hover:bg-slate-50/70 transition-colors group border-b border-slate-50 last:border-0">

                      {/* Date + status */}
                      <div className="shrink-0 w-[115px]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`}/>
                          <p className="text-xs font-bold text-slate-800">{dayLabel}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg.light} ${cfg.text} ${cfg.border}`}>
                          <cfg.Icon size={9}/>{cfg.label}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="shrink-0 w-[110px]">
                        {s.start_time ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Clock size={10} className="text-slate-400 shrink-0"/>
                              <span className="text-xs font-mono text-slate-700">{fmtTime(s.start_time)}–{fmtTime(s.end_time)}</span>
                            </div>
                            {h && <p className="text-[10px] text-indigo-600 font-bold mt-0.5 pl-3.5">{h}h</p>}
                          </>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </div>

                      {/* Rate */}
                      <div className="flex-1 min-w-0">
                        {rate!=null ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">£{rate}/hr</span>
                            {cost && <span className="text-xs font-bold text-slate-600">= £{cost.toFixed(2)}</span>}
                          </div>
                        ) : <span className="text-xs text-slate-300">—</span>}
                        {s.service_code && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">{s.service_code}</span>
                        )}
                      </div>

                      {/* Edit btn */}
                      {canManage && (
                        <button onClick={() => onEditShift(s)}
                          className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 inline-flex items-center justify-center transition-all shrink-0">
                          <Edit2 size={11}/>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-slate-50/80">
        <span className="text-[11px] text-slate-400 font-medium">{monthLabel}</span>
        <div className="flex items-center gap-3 text-xs">
          {stats.totalHours>0 && <span className="text-slate-500"><strong className="text-slate-700">{stats.totalHours}h</strong> logged</span>}
          {stats.working>0    && <span className="text-slate-500"><strong className="text-slate-700">{stats.working}</strong> working</span>}
          {stats.gaps>0       && <span className="text-rose-600 font-semibold flex items-center gap-1"><AlertTriangle size={10}/>{stats.gaps} gap{stats.gaps!==1?"s":""}</span>}
        </div>
      </div>
    </div>
  );
}

/* ════════ ACTIVE SHIFT CARD ════════ */
function ActiveShiftCard({ clinicianId, isOwnDashboard }) {
  const intervalRef = useRef(null);
  const [liveDisplay, setLiveDisplay] = useState("00:00:00");

  const adminQ     = useAdminTimeEntries(isOwnDashboard ? null : clinicianId);
  const selfQ      = useActiveTimeEntry();
  const selfEntriesQ = useTimeEntries({ limit: 50 });

  const isClockedIn = isOwnDashboard ? !!selfQ.data : (adminQ.data?.is_clocked_in ?? false);
  const activeSince = isOwnDashboard ? selfQ.data?.clock_in : adminQ.data?.active_since;
  const rawEntries  = isOwnDashboard ? [] : (adminQ.data?.entries ?? []);
  const selfEntries = useMemo(() => { const d=selfEntriesQ.data; return Array.isArray(d)?d:(d?.entries??[]); }, [selfEntriesQ.data]);
  const entries = isOwnDashboard ? selfEntries : rawEntries;
  const now = new Date();

  const monthlyHours = useMemo(() =>
    entries.filter(e => {
      if (e.status!=="completed") return false;
      const d = new Date(e.clock_in);
      return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
    }).reduce((s,e) => s+Number(e.actual_hours||0), 0).toFixed(1), [entries]);

  const completedThisMonth = entries.filter(e => {
    if (e.status!=="completed") return false;
    const d = new Date(e.clock_in);
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth();
  }).length;

  useEffect(() => {
    if (activeSince) {
      setLiveDisplay(formatLive(activeSince));
      intervalRef.current = setInterval(() => setLiveDisplay(formatLive(activeSince)), 1000);
    } else { clearInterval(intervalRef.current); setLiveDisplay("00:00:00"); }
    return () => clearInterval(intervalRef.current);
  }, [activeSince]);

  if (!isClockedIn && monthlyHours==="0.0" && completedThisMonth===0) return null;

  return (
    <div className={`rounded-2xl border overflow-hidden ${isClockedIn ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isClockedIn ? "border-emerald-200 bg-emerald-100/50" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isClockedIn ? "bg-emerald-600" : "bg-slate-300"}`}>
            <Timer size={15} className="text-white"/>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800">{isClockedIn ? "Shift In Progress" : "Shift Activity"}</p>
            <p className="text-xs text-slate-400">Time tracking overview</p>
          </div>
        </div>
        {isClockedIn && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/> Live
          </div>
        )}
      </div>
      <div className="p-4">
        {isClockedIn && (
          <div className="mb-4 p-4 rounded-xl bg-white border border-emerald-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Current Session</p>
            <p className="font-mono text-4xl font-black text-slate-900 tracking-tight tabular-nums">{liveDisplay}</p>
            {activeSince && (
              <p className="text-xs text-slate-400 mt-2">
                Started at <span className="font-bold text-slate-600">
                  {new Date(activeSince).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
                </span>
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Activity size={12} className="text-blue-500"/>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">This Month</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{monthlyHours}<span className="text-xs font-normal text-slate-400 ml-1">hrs</span></p>
            <p className="text-[10px] text-slate-400 mt-0.5">{completedThisMonth} sessions</p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap size={12} className="text-amber-500"/>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
            </div>
            <p className={`text-sm font-black mt-1 ${isClockedIn ? "text-emerald-600" : "text-slate-400"}`}>
              {isClockedIn ? "Clocked In" : "Not Clocked In"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color="bg-slate-100 text-slate-700" }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${color}`}>
      <span className="text-sm font-black">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

/* ════════ MAIN CalendarPanel ════════ */
export default function CalendarPanel({ clinicianId, canManage, userRole="clinician" }) {
  const now   = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth()+1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [view,  setView]  = useState("calendar");

  // AddShiftModal state — handles both add and edit
  const [shiftModal, setShiftModal] = useState({ open:false, date:null, editShift:null });

  const rotaQ       = useClinicianRota(clinicianId, month, year);
  const practiceMap = usePracticeMap();
  const shifts    = rotaQ?.data?.data?.shifts ?? rotaQ?.data?.shifts ?? [];
  const isLoading = rotaQ?.isLoading;
  const isOwnDashboard = userRole==="clinician";
  const stats = useMemo(() => deriveStats(shifts), [shifts]);
  const getPracticeName = useCallback(shift => resolvePracticeName(shift, practiceMap), [practiceMap]);

  const prevMonth = () => { if (month===1) { setMonth(12); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month===12) { setMonth(1); setYear(y=>y+1); } else setMonth(m=>m+1); };
  const monthLabel = `${MONTHS[month-1]} ${year}`;

  const openAdd  = (date=null) => setShiftModal({ open:true, date, editShift:null });
  const openEdit = (shift)     => setShiftModal({ open:true, date:null, editShift:shift });
  const closeModal = () => setShiftModal({ open:false, date:null, editShift:null });

  return (
    <div className="space-y-4">
      {isOwnDashboard && <ActiveShiftCard clinicianId={clinicianId} isOwnDashboard={isOwnDashboard}/>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/40">
          {/* Month nav */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={prevMonth}
              className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
              <ChevronLeft size={14} className="text-slate-600"/>
            </button>
            <span className="text-sm font-bold text-slate-800 min-w-[150px] text-center">{monthLabel}</span>
            <button type="button" onClick={nextMonth}
              className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
              <ChevronRight size={14} className="text-slate-600"/>
            </button>
            <button type="button"
              onClick={() => { setMonth(now.getMonth()+1); setYear(now.getFullYear()); }}
              className="h-9 px-3 text-xs font-bold text-blue-600 rounded-xl hover:bg-blue-50 transition-colors border border-blue-200 shrink-0">
              Today
            </button>
          </div>

          {/* Stats + controls */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {stats.working>0    && <StatPill label="working" value={stats.working}    color="bg-blue-50 text-blue-700"/>}
            {stats.totalHours>0 && <StatPill label="hrs"     value={stats.totalHours} color="bg-indigo-50 text-indigo-700"/>}
            {stats.leave>0      && <StatPill label="leave"   value={stats.leave}      color="bg-amber-50 text-amber-700"/>}
            {stats.gaps>0       && <StatPill label="gaps"    value={stats.gaps}       color="bg-rose-50 text-rose-700"/>}

            {/* View toggle */}
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              <button type="button" onClick={() => setView("list")}
                className={`flex items-center justify-center gap-1.5 px-3 h-9 text-xs font-semibold transition-colors border-r border-slate-200
                  ${view==="list" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                <List size={12}/> List
              </button>
              <button type="button" onClick={() => setView("calendar")}
                className={`flex items-center justify-center gap-1.5 px-3 h-9 text-xs font-semibold transition-colors
                  ${view==="calendar" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                <Calendar size={12}/> Calendar
              </button>
            </div>

            {canManage && (
              <button onClick={() => openAdd()}
                className="shrink-0 h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 inline-flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all">
                <Plus size={14}/> Add Shift
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-40 gap-3 text-sm text-slate-400">
            <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin"/>Loading shifts…
          </div>
        )}

        {/* Views */}
        {!isLoading && view==="calendar" && (
          <CalendarView month={month} year={year} shifts={shifts} canManage={canManage}
            onAddShift={openAdd} onEditShift={openEdit} getPracticeName={getPracticeName}/>
        )}
        {!isLoading && view==="list" && (
          <ListView shifts={shifts} canManage={canManage} isLoading={false}
            monthLabel={monthLabel} stats={stats} getPracticeName={getPracticeName}
            onAddShift={openAdd} onEditShift={openEdit}/>
        )}
      </div>

      {/* Single modal for both add + edit */}
      <AddShiftModal
        open={shiftModal.open}
        onClose={closeModal}
        clinicianId={clinicianId}
        date={shiftModal.date}
        editShift={shiftModal.editShift}
      />
    </div>
  );
}