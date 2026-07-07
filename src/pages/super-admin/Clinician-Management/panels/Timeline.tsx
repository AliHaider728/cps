import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useClinicianRota } from "../../../../hooks/useRota";
import { usePractices } from "../../../../hooks/usePractice";
import { buildPracticeNameMap, resolvePracticeName, isWorkingShift } from "../../../../lib/practiceNames";
import { useTimeEntries, useActiveTimeEntry } from "../../../../hooks/useTimeEntry";
import { apiClient } from "../../../../services/api/client";
import { useQuery } from "@tanstack/react-query";
import AddShiftModal from "../../../super-admin/RotaManagement/AddShiftModal";
import {
  ChevronLeft, ChevronRight, List, Clock, MapPin, AlertTriangle,
  Briefcase, Umbrella, Thermometer, BookOpen, UserPlus, XCircle,
  Timer, Activity, Zap, FileText, X, Plus, Edit2,
  Calendar, ChevronDown as ChevronDownIcon, TrendingUp, Layers,
  CheckCircle2, ArrowRight, LucideIcon
} from "lucide-react";
import { LoadingFallback } from "../../../../components/ui/Spinner";

export interface Shift {
  id?: string;
  date?: string;
  practice_id?: string;
  surgery_id?: string;
  practice_name?: string;
  surgery_name?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  hourly_rate?: number;
  hourlyRate?: number;
  service_code?: string;
  hours?: number;
  [key: string]: any;
}

export interface MergedShift extends Shift {
  _dateFrom: string;
  _dateTo: string;
  _count: number;
  _totalHours: number;
  _key: string;
}

export interface ShiftStats {
  working: number;
  leave: number;
  sick: number;
  cover: number;
  gaps: number;
  totalHours: number;
}

/* ── Status config ── */
type StatusConfigType = {
  [key: string]: {
    bg: string;
    dot: string;
    light: string;
    text: string;
    border: string;
    label: string;
    Icon: LucideIcon;
  };
};

const STATUS_CONFIG: StatusConfigType = {
  working:      { bg: "bg-blue-500",    dot: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    label: "Working",      Icon: Briefcase    },
  annual_leave: { bg: "bg-amber-400",   dot: "bg-amber-400",   light: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   label: "Annual Leave", Icon: Umbrella     },
  sick:         { bg: "bg-orange-500",  dot: "bg-orange-500",  light: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  label: "Sick",         Icon: Thermometer  },
  cppe:         { bg: "bg-emerald-500", dot: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "CPPE",         Icon: BookOpen     },
  cover:        { bg: "bg-violet-500",  dot: "bg-violet-500",  light: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  label: "Cover",        Icon: UserPlus     },
  gap:          { bg: "bg-rose-500",    dot: "bg-rose-500",    light: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    label: "Gap",          Icon: AlertTriangle},
  cancelled:    { bg: "bg-slate-300",   dot: "bg-slate-300",   light: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200",   label: "Cancelled",    Icon: XCircle      },
};
const getStatus = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.cancelled;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmtTime = (t: string | null | undefined) => t ? String(t).slice(0,5) : "";
const fmtHours = (s: string | null | undefined, e: string | null | undefined) => {
  if (!s || !e) return null;
  const [sh,sm] = s.split(":").map(Number);
  const [eh,em] = e.split(":").map(Number);
  const d = ((eh*60+em)-(sh*60+sm))/60;
  return d > 0 ? Math.round(d*100)/100 : null;
};
const formatLive = (iso: string | null | undefined) => {
  if (!iso) return "00:00:00";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000), s = Math.floor((ms%60000)/1000);
  return [h,m,s].map(n => String(n).padStart(2,"0")).join(":");
};
const fmtDateShort = (ds: string | null | undefined) => {
  if (!ds) return "";
  const d = new Date(String(ds).slice(0,10) + "T00:00:00");
  if (isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" });
};
const deriveStats = (shifts: Shift[]): ShiftStats => {
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

/* ── Admin time-entry hook ── */
function useAdminTimeEntries(clinicianId: string | null) {
  return useQuery({
    queryKey: ["time-entries","admin",clinicianId],
    queryFn: () => apiClient.get(`/time-entries/admin/clinician/${clinicianId}`).then(r => r.data?.data ?? { entries:[], is_clocked_in:false, active_since:null }),
    enabled: !!clinicianId,
    refetchInterval: 30_000,
  });
}

/* ─────────────────────────────────────────────────────────────
   MERGE CONSECUTIVE / SAME-DAY SHIFTS
   Groups shifts by: practice + status + start_time + end_time + rate
   If consecutive days (or same-day multiple entries same time),
   collapses into one row showing dateFrom → dateTo + totalHours
─────────────────────────────────────────────────────────────── */
function mergeShiftRanges(shifts: Shift[]): MergedShift[] {
  if (!shifts.length) return [];

  // Sort by date
  const sorted = [...shifts].sort((a,b) => String(a.date).localeCompare(String(b.date)));

  const groupKey = (s: Shift) =>
    [
      s.practice_id || s.surgery_id || "",
      s.status || "",
      s.start_time || "",
      s.end_time || "",
      String(s.hourly_rate ?? s.hourlyRate ?? ""),
      s.service_code || "",
    ].join("|");

  const ranges: MergedShift[] = [];
  let current: MergedShift | null = null;

  for (const shift of sorted) {
    const key = groupKey(shift);
    if (!current) {
      current = { ...shift, _dateFrom: shift.date || "", _dateTo: shift.date || "", _count: 1, _totalHours: fmtHours(shift.start_time, shift.end_time) ?? shift.hours ?? 0, _key: key };
      continue;
    }

    // Check if consecutive day with same profile
    const prevDate = new Date(String(current._dateTo).slice(0,10) + "T00:00:00");
    const currDate = new Date(String(shift.date).slice(0,10) + "T00:00:00");
    const dayDiff  = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
    const isSameKey = key === current._key;

    // Merge if: same key AND (consecutive day OR same day)
    if (isSameKey && (dayDiff === 1 || dayDiff === 0)) {
      current._dateTo    = shift.date || "";
      current._count    += dayDiff === 0 ? 0 : 1;
      current._totalHours += fmtHours(shift.start_time, shift.end_time) ?? shift.hours ?? 0;
      current._totalHours = Math.round(current._totalHours * 100) / 100;
    } else {
      ranges.push(current);
      current = { ...shift, _dateFrom: shift.date || "", _dateTo: shift.date || "", _count: 1, _totalHours: fmtHours(shift.start_time, shift.end_time) ?? shift.hours ?? 0, _key: key };
    }
  }
  if (current) ranges.push(current);
  return ranges;
}

/* ════════════════════════════════════════════════════════════
   PROFESSIONAL LIST VIEW  — merged rows, clean layout
════════════════════════════════════════════════════════════ */
interface ProfessionalListViewProps {
  shifts: Shift[];
  canManage: boolean;
  isLoading: boolean;
  monthLabel: string;
  stats: ShiftStats;
  getPracticeName: (shift: Shift) => string | undefined;
  onAddShift: (date?: string | null) => void;
  onEditShift: (shift: Shift) => void;
}

function ProfessionalListView({ shifts, canManage, isLoading, monthLabel, stats, getPracticeName, onAddShift, onEditShift }: ProfessionalListViewProps) {
  const workingShifts = shifts.filter(isWorkingShift);
  const otherShifts   = shifts.filter(s => !isWorkingShift(s) && s.status !== "gap");
  const gapShifts     = shifts.filter(s => s.status === "gap");

  // Group working shifts by practice, then merge ranges within each group
  const practiceGroups = useMemo(() => {
    const map = new Map<string, Shift[]>();
    workingShifts.forEach(s => {
      const name = getPracticeName(s) || "Unknown Practice";
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push(s);
    });
    const result: Array<{ practiceName: string, rows: MergedShift[], totalHours: number, count: number }> = [];
    map.forEach((pShifts, practiceName) => {
      const merged = mergeShiftRanges(pShifts);
      const totalH = Math.round(merged.reduce((s,r) => s + (r._totalHours||0), 0) * 10) / 10;
      result.push({ practiceName, rows: merged, totalHours: totalH, count: pShifts.length });
    });
    return result.sort((a,b) => a.practiceName.localeCompare(b.practiceName));
  }, [workingShifts, getPracticeName]);

  const otherMerged = useMemo(() => mergeShiftRanges(otherShifts), [otherShifts]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (name: string) => setCollapsed(p => ({...p, [name]: !p[name]}));

  if (isLoading) return <LoadingFallback text="Loading timeline..." />;

  if (!shifts.length) return (
    <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center mb-4">
        <Calendar size={28} className="text-slate-300"/>
      </div>
      <p className="text-base font-bold text-slate-600 mb-1">No shifts this month</p>
      <p className="text-sm text-slate-400 mb-6">Nothing recorded for {monthLabel}</p>
      {canManage && (
        <button onClick={() => onAddShift()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all">
          <Plus size={14}/> Add First Shift
        </button>
      )}
    </div>
  );

  return (
    <div className="divide-y divide-slate-100">

      {/* ── Summary bar ── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Layers size={13} className="text-slate-400"/>
          <span>
            <strong className="text-slate-800">{shifts.length}</strong> shifts ·{" "}
            <strong className="text-slate-800">{practiceGroups.length}</strong> practice{practiceGroups.length !== 1 ? "s" : ""}
          </span>
        </div>
        {stats.totalHours > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <TrendingUp size={13} className="text-indigo-500"/>
            <span><strong className="text-indigo-700">{stats.totalHours}h</strong> total</span>
          </div>
        )}
        {gapShifts.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-rose-600">
            <AlertTriangle size={13}/> {gapShifts.length} gap{gapShifts.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Working shifts by practice ── */}
      {practiceGroups.map(({ practiceName, rows, totalHours, count }) => {
        const isCol = collapsed[practiceName];
        return (
          <div key={practiceName} className="bg-white">
            {/* Practice header */}
            <button type="button" onClick={() => toggle(practiceName)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/80 transition-colors text-left group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
                <MapPin size={14} className="text-white"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{practiceName}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-400">{count} shift{count !== 1 ? "s" : ""}</span>
                  {totalHours > 0 && (
                    <span className="text-xs font-bold text-indigo-600">{totalHours}h total</span>
                  )}
                </div>
              </div>
              <ChevronDownIcon size={15} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCol ? "-rotate-90" : ""}`}/>
            </button>

            {/* Shift rows */}
            {!isCol && (
              <div className="border-t border-slate-100">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2 bg-slate-50/60 border-b border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date / Period</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[110px] text-center">Time</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[60px] text-center">Hours</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[90px] text-center">Rate</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[80px] text-center">Total</p>
                </div>

                {rows.map((row, i) => {
                  const cfg         = getStatus(row.status || "");
                  const isRange     = row._dateFrom !== row._dateTo;
                  const dateLabel   = isRange
                    ? <span className="inline-flex items-center gap-1.5">{fmtDateShort(row._dateFrom)}<ArrowRight size={10} className="text-slate-400 shrink-0"/>{fmtDateShort(row._dateTo)}</span>
                    : fmtDateShort(row._dateFrom);
                  const rate        = row.hourly_rate ?? row.hourlyRate;
                  const rowHours    = row._totalHours || 0;
                  const totalCost   = rate && rowHours ? (rate * rowHours).toFixed(2) : null;
                  const shiftHours  = fmtHours(row.start_time, row.end_time);

                  return (
                    <div key={row.id || i}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-indigo-50/30 transition-colors group border-b border-slate-50 last:border-0">

                      {/* Date / badge */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-1 h-9 rounded-full shrink-0 ${cfg.bg}`}/>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 flex-wrap">
                            {dateLabel}
                            {isRange && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold whitespace-nowrap">
                                {row._count} days
                              </span>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${cfg.light} ${cfg.text} border ${cfg.border}`}>
                            <cfg.Icon size={9}/> {cfg.label}
                            {row.service_code && <span className="ml-1 opacity-60">· {row.service_code}</span>}
                          </span>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="w-[110px] text-center">
                        {row.start_time ? (
                          <span className="text-xs font-mono text-slate-600">
                            {fmtTime(row.start_time)}–{fmtTime(row.end_time)}
                          </span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </div>

                      {/* Hours */}
                      <div className="w-[60px] text-center">
                        <span className="text-sm font-bold text-indigo-600">
                          {rowHours > 0 ? `${rowHours}h` : "—"}
                        </span>
                      </div>

                      {/* Rate */}
                      <div className="w-[90px] text-center">
                        {rate != null ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                            £{rate}/hr
                          </span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </div>

                      {/* Total cost + edit */}
                      <div className="w-[80px] flex items-center justify-end gap-2">
                        {totalCost ? (
                          <span className="text-xs font-bold text-slate-700">£{totalCost}</span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                        {canManage && (
                          <button onClick={() => onEditShift(row)}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 inline-flex items-center justify-center transition-all shrink-0">
                            <Edit2 size={10}/>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Other status shifts (leave, sick, cppe, cover) ── */}
      {otherMerged.length > 0 && (
        <div className="bg-white">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/40">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-white"/>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Other Activities</p>
              <p className="text-xs text-slate-400">{otherMerged.length} entr{otherMerged.length !== 1 ? "ies" : "y"}</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {otherMerged.map((row, i) => {
              const cfg     = getStatus(row.status || "");
              const isRange = row._dateFrom !== row._dateTo;
              return (
                <div key={row.id || `other-${i}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors group">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}/>
                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cfg.light} ${cfg.text} ${cfg.border}`}>
                      <cfg.Icon size={9}/> {cfg.label}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {fmtDateShort(row._dateFrom)}
                      {isRange && <>{" "}<ArrowRight size={10} className="inline text-slate-400"/>{" "}{fmtDateShort(row._dateTo)}</>}
                    </span>
                    {isRange && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold">
                        {row._count} days
                      </span>
                    )}
                  </div>
                  {canManage && (
                    <button onClick={() => onEditShift(row)}
                      className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 inline-flex items-center justify-center transition-all shrink-0">
                      <Edit2 size={11}/>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Gap shifts ── */}
      {gapShifts.length > 0 && (
        <div className="px-5 py-4 bg-rose-50/40">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-rose-600"/>
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wide">{gapShifts.length} Unfilled Gap{gapShifts.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mergeShiftRanges(gapShifts).map((row, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-700">
                <AlertTriangle size={10}/>
                {fmtDateShort(row._dateFrom)}
                {row._dateFrom !== row._dateTo && <><ArrowRight size={9} className="text-rose-400"/>{fmtDateShort(row._dateTo)}</>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 bg-slate-50/80">
        <span className="text-xs text-slate-400 font-medium">{monthLabel}</span>
        <div className="flex items-center gap-4 text-xs">
          {stats.totalHours > 0 && <span className="text-slate-500"><strong className="text-slate-700">{stats.totalHours}h</strong> logged</span>}
          {stats.working > 0    && <span className="text-slate-500"><strong className="text-slate-700">{stats.working}</strong> working days</span>}
          {stats.leave > 0      && <span className="text-amber-600"><strong>{stats.leave}</strong> leave</span>}
          {stats.sick > 0       && <span className="text-orange-600"><strong>{stats.sick}</strong> sick</span>}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CALENDAR VIEW
════════════════════════════════════════════════════════════ */
interface CalendarViewProps {
  month: number;
  year: number;
  shifts: Shift[];
  canManage: boolean;
  onAddShift: (date?: string | null) => void;
  onEditShift: (shift: Shift) => void;
  getPracticeName: (shift: Shift) => string | undefined;
}

function CalendarView({ month, year, shifts, canManage, onAddShift, onEditShift, getPracticeName }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { days, startPad } = useMemo(() => {
    const firstDay    = new Date(year, month-1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    return { days: daysInMonth, startPad: firstDay };
  }, [month, year]);

  const shiftsByDate = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    shifts.forEach(s => {
      const key = String(s.date||"").slice(0,10);
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [shifts]);

  const todayStr     = new Date().toISOString().slice(0,10);
  const cells: Array<{ day: number, dateStr: string } | null> = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    const ds = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cells.push({ day: d, dateStr: ds });
  }

  const selectedShifts = useMemo(() => selectedDate ? shiftsByDate[selectedDate] || [] : [], [selectedDate, shiftsByDate]);

  return (
    <div className="p-4 sm:p-5 space-y-4">
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`pad-${idx}`}/>;
          const { day, dateStr } = cell;
          const dayShifts = shiftsByDate[dateStr] || [];
          const isToday   = dateStr === todayStr;
          const isSel     = dateStr === selectedDate;
          const statusList = [...new Set(dayShifts.map(s => s.status))].slice(0,2);

          return (
            <button key={dateStr} type="button"
              onClick={() => setSelectedDate(isSel ? null : dateStr)}
              className={`relative min-h-[72px] rounded-xl p-1.5 text-left transition-all border
                ${isSel
                  ? "border-indigo-400 bg-indigo-50 shadow-md"
                  : isToday
                  ? "border-blue-300 bg-blue-50"
                  : dayShifts.length > 0
                  ? "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
                  : "border-transparent bg-slate-50/50 hover:bg-slate-100/60"
                }`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold mb-1 ${isToday ? "bg-blue-600 text-white" : "text-slate-600"}`}>
                {day}
              </span>
              <div className="space-y-0.5">
                {statusList.map(st => {
                  const cfg = getStatus(st || "");
                  const cnt = dayShifts.filter(s => s.status === st).length;
                  return (
                    <div key={st} className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate ${cfg.light} ${cfg.text}`}>
                      {cfg.label}{cnt > 1 ? ` ×${cnt}` : ""}
                    </div>
                  );
                })}
                {[...new Set(dayShifts.map(s=>s.status))].length > 2 && (
                  <div className="text-[9px] text-slate-400 font-semibold pl-1">
                    +{[...new Set(dayShifts.map(s=>s.status))].length - 2} more
                  </div>
                )}
              </div>
              {isToday && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-b-xl"/>}
            </button>
          );
        })}
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" })}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{selectedShifts.length} shift{selectedShifts.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-2">
              {canManage && (
                <button onClick={() => onAddShift(selectedDate)}
                  className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 inline-flex items-center gap-1.5 transition-all">
                  <Plus size={12}/> Add
                </button>
              )}
              <button onClick={() => setSelectedDate(null)}
                className="h-8 w-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 inline-flex items-center justify-center transition-all">
                <X size={13}/>
              </button>
            </div>
          </div>

          {selectedShifts.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Calendar size={28} className="mx-auto mb-3 text-slate-200"/>
              <p className="text-sm text-slate-400">No shifts on this day</p>
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
                const cfg   = getStatus(shift.status || "");
                const hours = fmtHours(shift.start_time, shift.end_time);
                const rate  = shift.hourly_rate ?? shift.hourlyRate;
                const cost  = rate && hours ? (rate * hours).toFixed(2) : null;
                return (
                  <div key={shift.id || i} className="flex items-start gap-3 px-4 py-3.5 group hover:bg-slate-50">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${cfg.dot}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cfg.light} ${cfg.text} ${cfg.border}`}>
                          <cfg.Icon size={9}/> {cfg.label}
                        </span>
                        {shift.service_code && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{shift.service_code}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 truncate">
                        {shift.practice_name || shift.surgery_name || getPracticeName(shift) || "—"}
                      </p>
                      {shift.start_time && (
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {fmtTime(shift.start_time)} – {fmtTime(shift.end_time)}{hours ? ` · ${hours}h` : ""}
                          {rate != null && ` · £${rate}/hr`}
                          {cost && ` = £${cost}`}
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

/* ════════════════════════════════════════════════════════════
   ACTIVE SHIFT CARD
════════════════════════════════════════════════════════════ */
interface ActiveShiftCardProps {
  clinicianId: string;
  isOwnDashboard: boolean;
}

function ActiveShiftCard({ clinicianId, isOwnDashboard }: ActiveShiftCardProps) {
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const [liveDisplay, setLiveDisplay] = useState("00:00:00");

  const adminQ         = useAdminTimeEntries(isOwnDashboard ? null : clinicianId);
  const selfQ          = useActiveTimeEntry();
  const selfEntriesQ   = useTimeEntries({ limit: 50 });

  const isClockedIn  = isOwnDashboard ? !!selfQ.data : (adminQ.data?.is_clocked_in ?? false);
  const activeSince  = isOwnDashboard ? selfQ.data?.clock_in : adminQ.data?.active_since;
  const rawEntries   = isOwnDashboard ? [] : (adminQ.data?.entries ?? []);
  const selfEntries  = useMemo(() => { const d = selfEntriesQ.data as any; return Array.isArray(d) ? d : (d?.entries ?? []); }, [selfEntriesQ.data]);
  const entries      = isOwnDashboard ? selfEntries : rawEntries;
  const now          = new Date();

  const monthlyHours = useMemo(() =>
    entries.filter((e: any) => {
      if (e.status !== "completed") return false;
      const d = new Date(e.clock_in);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).reduce((s: number, e: any) => s + Number(e.actual_hours || 0), 0).toFixed(1), [entries, now]);

  const completedThisMonth = entries.filter((e: any) => {
    if (e.status !== "completed") return false;
    const d = new Date(e.clock_in);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  useEffect(() => {
    if (activeSince) {
      setLiveDisplay(formatLive(activeSince));
      intervalRef.current = setInterval(() => setLiveDisplay(formatLive(activeSince)), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLiveDisplay("00:00:00");
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeSince]);

  if (!isClockedIn && monthlyHours === "0.0" && completedThisMonth === 0) return null;

  return (
    <div className={`rounded-2xl border overflow-hidden ${isClockedIn ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isClockedIn ? "border-emerald-200 bg-emerald-100/50" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isClockedIn ? "bg-emerald-600" : "bg-slate-300"}`}>
            <Timer size={15} className="text-white"/>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{isClockedIn ? "Shift In Progress" : "Shift Activity"}</p>
            <p className="text-xs text-slate-400">Time tracking overview</p>
          </div>
        </div>
        {isClockedIn && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
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
                Started at <strong className="text-slate-600">
                  {new Date(activeSince).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}
                </strong>
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

function StatPill({ label, value, color = "bg-slate-100 text-slate-700" }: { label: string, value: number | string, color?: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${color}`}>
      <span className="text-sm font-black">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN CalendarPanel export
════════════════════════════════════════════════════════════ */
export interface CalendarPanelProps {
  clinicianId: string;
  canManage: boolean;
  userRole?: string;
}

export default function CalendarPanel({ clinicianId, canManage, userRole = "clinician" }: CalendarPanelProps) {
  const now   = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [view,  setView]  = useState("list");

  const [shiftModal, setShiftModal] = useState<{ open: boolean, date: string | null, editShift: Shift | null }>({ open: false, date: null, editShift: null });

  const rotaQ       = useClinicianRota(clinicianId, month, year);
  const practiceMap = usePracticeMap();
  const shifts: Shift[] = rotaQ?.data?.data?.shifts ?? rotaQ?.data?.shifts ?? [];
  const isLoading   = rotaQ?.isLoading;
  const isOwnDashboard = userRole === "clinician";
  const stats       = useMemo(() => deriveStats(shifts), [shifts]);
  const getPracticeName = useCallback((shift: Shift) => resolvePracticeName(shift, practiceMap), [practiceMap]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y+1); } else setMonth(m => m+1); };
  const monthLabel = `${MONTHS[month-1]} ${year}`;

  const openAdd    = (date: string | null = null) => setShiftModal({ open: true, date, editShift: null });
  const openEdit   = (shift: Shift)       => setShiftModal({ open: true, date: null, editShift: shift });
  const closeModal = ()            => setShiftModal({ open: false, date: null, editShift: null });

  return (
    <div className="space-y-4">
      {isOwnDashboard && <ActiveShiftCard clinicianId={clinicianId} isOwnDashboard={isOwnDashboard}/>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/40">

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={prevMonth}
              className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <ChevronLeft size={15} className="text-slate-600"/>
            </button>
            <span className="text-sm font-extrabold text-slate-800 min-w-[150px] text-center">{monthLabel}</span>
            <button type="button" onClick={nextMonth}
              className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <ChevronRight size={15} className="text-slate-600"/>
            </button>
            <button type="button"
              onClick={() => { setMonth(now.getMonth()+1); setYear(now.getFullYear()); }}
              className="h-9 px-3.5 text-xs font-bold text-blue-600 rounded-xl hover:bg-blue-50 transition-colors border border-blue-200 bg-white shadow-sm">
              Today
            </button>
          </div>

          {/* Stats + controls */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {stats.working > 0    && <StatPill label="working" value={stats.working}    color="bg-blue-50 text-blue-700"/>}
            {stats.totalHours > 0 && <StatPill label="hrs"     value={stats.totalHours} color="bg-indigo-50 text-indigo-700"/>}
            {stats.leave > 0      && <StatPill label="leave"   value={stats.leave}      color="bg-amber-50 text-amber-700"/>}
            {stats.gaps > 0       && <StatPill label="gaps"    value={stats.gaps}       color="bg-rose-50 text-rose-700"/>}

            {/* View toggle */}
            <div className="flex rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <button type="button" onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3.5 h-9 text-xs font-bold transition-colors border-r border-slate-200
                  ${view === "list" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                <List size={12}/> List
              </button>
              <button type="button" onClick={() => setView("calendar")}
                className={`flex items-center gap-1.5 px-3.5 h-9 text-xs font-bold transition-colors
                  ${view === "calendar" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                <Calendar size={12}/> Calendar
              </button>
            </div>

            {/* ✅ SINGLE Add Shift button — only here in header, not duplicated below */}
            {canManage && (
              <button onClick={() => openAdd()}
                className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 inline-flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all">
                <Plus size={14}/> Add Shift
              </button>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin"/>
              <p className="text-sm text-slate-400 font-medium">Loading…</p>
            </div>
          </div>
        )}

        {!isLoading && view === "list" && (
          <ProfessionalListView
            shifts={shifts}
            canManage={canManage}
            isLoading={false}
            monthLabel={monthLabel}
            stats={stats}
            getPracticeName={getPracticeName}
            onAddShift={openAdd}
            onEditShift={openEdit}
          />
        )}

        {!isLoading && view === "calendar" && (
          <CalendarView
            month={month} year={year} shifts={shifts}
            canManage={canManage}
            onAddShift={openAdd}
            onEditShift={openEdit}
            getPracticeName={getPracticeName}
          />
        )}
      </div>

      {/* AddShiftModal — handles both add + edit */}
      <AddShiftModal
        open={shiftModal.open}
        onClose={closeModal}
        clinicianId={clinicianId}
        date={shiftModal.date || undefined}
        editShift={shiftModal.editShift}
      />
    </div>
  );
}


