/**
 * ClinicianDashboard.tsx
 */
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  Clock, FileText, Stethoscope, RefreshCw,
  GraduationCap, Search, SlidersHorizontal, X,
  List, LayoutGrid, LucideIcon
} from "lucide-react";
import PageHeader from "../../components/shared/PageHeader";
import { LoadingFallback } from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useMyRota } from "../../hooks/useRota";
import { usePractices } from "../../hooks/usePractice";
import { useClinicianCompliance } from "../../hooks/useClinicianCompliance";
import { buildPracticeNameMap, resolvePracticeName } from "../../lib/practiceNames";

/* ── Interfaces ───────────────────────────────────────────── */
interface Shift {
  id?: string;
  status?: string;
  shift_type?: string;
  shift_date?: string;
  date?: string;
  expected_hours?: string | number;
  start_time?: string;
  end_time?: string;
  hours?: string | number;
  total_hours?: string | number;
  surgery_name?: string;
  practice_name?: string;
  surgery?: string;
}

interface ComplianceDoc {
  status: string;
}

interface TypeStyle {
  cell: string;
  label: string;
}

/* ── Shift status styles ──────────────────────────────────── */
const TYPE_STYLE: Record<string, TypeStyle> = {
  working:       { cell: "bg-green-50 text-green-700 border-green-200",       label: "Working"      },
  annual_leave:  { cell: "bg-purple-50 text-purple-700 border-purple-200",   label: "Annual Leave" },
  sick:          { cell: "bg-orange-50 text-orange-700 border-orange-200",   label: "Sick"         },
  cppe_training: { cell: "bg-indigo-50 text-indigo-700 border-indigo-200",   label: "CPPE"         },
  cppe:          { cell: "bg-indigo-50 text-indigo-700 border-indigo-200",   label: "CPPE"         },
  cover:         { cell: "bg-blue-50 text-blue-700 border-blue-200",           label: "Cover"        },
  bank_holiday:  { cell: "bg-gray-100 text-gray-600 border-gray-200",         label: "BH"           },
  gap:           { cell: "bg-red-50 text-red-700 border-red-200",              label: "Gap"          },
  cancelled:     { cell: "bg-gray-50 text-gray-500 border-gray-200",           label: "Cancelled"    },
};

const DEFAULT_STYLE: TypeStyle = { cell: "bg-slate-50 text-slate-600 border-slate-200", label: "Shift" };

/* ── Shift type chip colours (filter bar) ─────────────────── */
const TYPE_CHIP: Record<string, { active: string; inactive: string }> = {
  working:      { active: "bg-green-100 text-green-800 border-green-300",       inactive: "bg-gray-100 text-gray-600 border-gray-200"  },
  annual_leave: { active: "bg-purple-100 text-purple-800 border-purple-300", inactive: "bg-gray-100 text-gray-600 border-gray-200"  },
  sick:         { active: "bg-orange-100 text-orange-800 border-orange-300", inactive: "bg-gray-100 text-gray-600 border-gray-200"  },
  cppe:         { active: "bg-indigo-100 text-indigo-800 border-indigo-300", inactive: "bg-gray-100 text-gray-600 border-gray-200"  },
  cover:        { active: "bg-blue-100 text-blue-800 border-blue-300",       inactive: "bg-gray-100 text-gray-600 border-gray-200"  },
  bank_holiday: { active: "bg-gray-200 text-gray-700 border-gray-300",       inactive: "bg-gray-100 text-gray-600 border-gray-200"  },
};

const SHIFT_TYPE_FILTERS = [
  { key: "working",      label: "Working"      },
  { key: "cover",        label: "Cover"        },
  { key: "annual_leave", label: "Annual Leave" },
  { key: "sick",         label: "Sick"         },
  { key: "cppe",         label: "CPPE"         },
  { key: "bank_holiday", label: "Bank Holiday" },
];

const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

/* ── Date helpers ─────────────────────────────────────────── */
const daysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
const pad         = (v: number | string) => String(v).padStart(2, "0");
const dateKey     = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

function getDayOfWeek(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return DAYS_OF_WEEK[(d.getDay() + 6) % 7];
}

/* ── Field normalisation helpers ──────────────────────────── */
function resolveStatus(shift: Shift) {
  return String(shift.status || shift.shift_type || "").toLowerCase();
}

function resolveDate(shift: Shift) {
  return String(shift.shift_date || shift.date || "").slice(0, 10);
}

function resolveHours(shift: Shift): number {
  if (shift.expected_hours != null && shift.expected_hours !== "") {
    return parseFloat(String(shift.expected_hours)) || 0;
  }
  if (shift.start_time && shift.end_time) {
    const [sh, sm] = String(shift.start_time).split(":").map(Number);
    const [eh, em] = String(shift.end_time).split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? Math.round((diff / 60) * 100) / 100 : 0;
  }
  if (shift.hours != null && shift.hours !== "") return parseFloat(String(shift.hours)) || 0;
  if (shift.total_hours != null && shift.total_hours !== "") return parseFloat(String(shift.total_hours)) || 0;
  return 0;
}

/* ── Summary card ─────────────────────────────────────────── */
interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  sub: string;
  Icon: LucideIcon;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  accentColor: string;
}

function SummaryCard({ label, value, sub, Icon, borderColor, iconBg, iconColor, textColor, accentColor }: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} p-5 hover:shadow-lg transition-all relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${accentColor} rounded-l-2xl`} />
      <div className="flex items-start justify-between mb-3 pl-2">
        <p className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{label}</p>
        <div className={`p-2 ${iconBg} rounded-lg`}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 pl-2">{value}</p>
      <p className="text-xs text-slate-500 mt-2 pl-2">{sub}</p>
    </div>
  );
}

/* ── Advanced Filter Bar ──────────────────────────────────── */
interface FilterBarProps {
  searchText: string;
  setSearchText: (v: string) => void;
  practiceFilter: string;
  setPracticeFilter: (v: string) => void;
  dayFilter: string;
  setDayFilter: (v: string) => void;
  minHoursFilter: string;
  setMinHoursFilter: (v: string) => void;
  activeTypeFilters: Set<string>;
  toggleTypeFilter: (key: string) => void;
  clearAllFilters: () => void;
  practiceOptions: string[];
  hasActiveFilters: boolean;
}

function FilterBar({
  searchText, setSearchText,
  practiceFilter, setPracticeFilter,
  dayFilter, setDayFilter,
  minHoursFilter, setMinHoursFilter,
  activeTypeFilters, toggleTypeFilter,
  clearAllFilters,
  practiceOptions,
  hasActiveFilters,
}: FilterBarProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Filter bar header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <SlidersHorizontal size={15} className="text-blue-600" />
        </div>
        <span className="text-sm font-bold text-slate-700">Advanced Filters</span>
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            Active
          </span>
        )}
        <ChevronLeft
          size={15}
          className={`ml-auto text-slate-400 transition-transform ${open ? "-rotate-90" : "rotate-0"}`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-6 py-4 space-y-4">
          {/* Row 1: search + dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search practice or location…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50
                  placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
            </div>

            {/* Practice filter */}
            <select
              value={practiceFilter}
              onChange={(e) => setPracticeFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 text-slate-700
                focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[160px]"
            >
              <option value="">All practices</option>
              {practiceOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Day of week */}
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 text-slate-700
                focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[130px]"
            >
              <option value="">All days</option>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Min hours */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">Min hrs</label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                placeholder="e.g. 4"
                value={minHoursFilter}
                onChange={(e) => setMinHoursFilter(e.target.value)}
                className="w-20 text-sm border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 text-slate-700
                  focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600
                  border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Row 2: type chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 self-center mr-1">Shift type:</span>
            {SHIFT_TYPE_FILTERS.map(({ key, label }) => {
              const isActive = activeTypeFilters.has(key);
              const chipStyle = TYPE_CHIP[key] || TYPE_CHIP.working;
              return (
                <button
                  key={key}
                  onClick={() => toggleTypeFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                    ${isActive ? chipStyle.active : chipStyle.inactive}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── List view row ────────────────────────────────────────── */
function ShiftListRow({ shift, practiceMap }: { shift: Shift, practiceMap: any }) {
  const status = resolveStatus(shift);
  const style  = TYPE_STYLE[status] ?? DEFAULT_STYLE;
  const name   = resolvePracticeName(shift, practiceMap);
  const hrs    = resolveHours(shift);
  const dateStr = resolveDate(shift);
  const dateObj = new Date(dateStr + "T00:00:00");
  const dayStr  = dateObj.toLocaleDateString("en-GB", { weekday: "short" });
  const dateDisplay = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div className="flex items-center gap-4 px-6 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
      {/* Date col */}
      <div className="min-w-[64px]">
        <p className="text-xs font-bold text-slate-700">{dateDisplay}</p>
        <p className="text-[10px] text-gray-500">{dayStr}</p>
      </div>

      {/* Type badge */}
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border min-w-[80px] text-center ${style.cell}`}>
        {style.label}
      </span>

      {/* Practice */}
      <span className="flex-1 text-sm text-gray-800 truncate">{name || "—"}</span>

      {/* Hours */}
      <span className="text-sm font-bold text-gray-600 min-w-[40px] text-right">
        {hrs > 0 ? `${hrs.toFixed(1)}h` : "—"}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function ClinicianDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const now        = new Date();
  const clinicianId = user?.clinicianId;

  const [cursor, setCursor] = useState({
    month: now.getMonth() + 1,
    year:  now.getFullYear(),
  });

  /* ── View toggle ────────────────────────────────────────── */
  const [view, setView] = useState("calendar"); // "calendar" | "list"

  /* ── Filters ────────────────────────────────────────────── */
  const [searchText,     setSearchText]     = useState("");
  const [practiceFilter, setPracticeFilter] = useState("");
  const [dayFilter,      setDayFilter]      = useState("");
  const [minHoursFilter, setMinHoursFilter] = useState("");
  const [activeTypeFilters, setActiveTypeFilters] = useState(
    () => new Set(["working", "cover", "annual_leave", "sick", "cppe", "bank_holiday"])
  );

  const toggleTypeFilter = useCallback((key: string) => {
    setActiveTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchText("");
    setPracticeFilter("");
    setDayFilter("");
    setMinHoursFilter("");
    setActiveTypeFilters(new Set(["working", "cover", "annual_leave", "sick", "cppe", "bank_holiday"]));
  }, []);

  const hasActiveFilters = searchText || practiceFilter || dayFilter || minHoursFilter ||
    activeTypeFilters.size < SHIFT_TYPE_FILTERS.length;

  /* ── Fetch rota shifts ──────────────────────────────────── */
  const { data: rota, isLoading: rotaLoading, isError: rotaError, error: rotaErr } =
    useMyRota(null, null);

  const { data: complianceData } = useClinicianCompliance(clinicianId);

  const { data: practicesData } = usePractices();
  const practiceMap = useMemo(() => buildPracticeNameMap(practicesData), [practicesData]);

  const allShifts: Shift[] = useMemo(() => {
    const raw = rota?.shifts || rota?.data?.shifts || rota?.rota || [];
    return Array.isArray(raw) ? raw : [];
  }, [rota]);

  /* ── Month filter ───────────────────────────────────────── */
  const monthShifts = useMemo(() => {
    return allShifts.filter((s) => {
      const d = resolveDate(s);
      if (!d) return false;
      const [y, m] = d.split("-").map(Number);
      return m === cursor.month && y === cursor.year;
    });
  }, [allShifts, cursor.month, cursor.year]);

  /* ── Practice options for dropdown ─────────────────────── */
  const practiceOptions = useMemo(() => {
    const names = monthShifts
      .map((s) => resolvePracticeName(s, practiceMap))
      .filter(Boolean);
    return [...new Set(names)].sort();
  }, [monthShifts, practiceMap]);

  /* ── Advanced filtered shifts ───────────────────────────── */
  const filteredShifts = useMemo(() => {
    return monthShifts.filter((s) => {
      const status = resolveStatus(s);

      // Normalise cppe_training → cppe for filter purposes
      const filterKey = status === "cppe_training" ? "cppe" : status;
      if (!activeTypeFilters.has(filterKey)) return false;

      const name = resolvePracticeName(s, practiceMap) || "";
      if (searchText && !name.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (practiceFilter && name !== practiceFilter) return false;

      if (dayFilter) {
        const dow = getDayOfWeek(resolveDate(s));
        if (dow !== dayFilter) return false;
      }

      if (minHoursFilter) {
        const minH = parseFloat(minHoursFilter) || 0;
        if (resolveHours(s) < minH) return false;
      }

      return true;
    });
  }, [monthShifts, activeTypeFilters, searchText, practiceFilter, dayFilter, minHoursFilter, practiceMap]);

  /* ── Month navigation ───────────────────────────────────── */
  const moveMonth = useCallback((delta: number) => {
    setCursor((c) => {
      const next = new Date(c.year, c.month - 1 + delta, 1);
      return { month: next.getMonth() + 1, year: next.getFullYear() };
    });
  }, []);

  const monthLabel  = new Date(cursor.year, cursor.month - 1, 1)
    .toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const totalDays   = daysInMonth(cursor.month, cursor.year);
  const firstOffset = (new Date(cursor.year, cursor.month - 1, 1).getDay() + 6) % 7;
  const todayKey    = dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  /* ── Summary stats ──────────────────────────────────────── */
  const workingShifts = useMemo(
    () => filteredShifts.filter((s) => {
      const st = resolveStatus(s);
      return st === "working";
    }), [filteredShifts]
  );

  const coverShifts = useMemo(
    () => filteredShifts.filter((s) => resolveStatus(s) === "cover"),
    [filteredShifts]
  );

  const workingDays = workingShifts.length + coverShifts.length;

  const expectedHours = useMemo(
    () => Math.round(
      [...workingShifts, ...coverShifts].reduce((sum, s) => sum + resolveHours(s), 0) * 100
    ) / 100,
    [workingShifts, coverShifts]
  );

  const leaveCount = useMemo(
    () => filteredShifts.filter((s) => resolveStatus(s) === "annual_leave").length,
    [filteredShifts]
  );

  const coverCount = coverShifts.length;

  const cppeCount = useMemo(
    () => filteredShifts.filter((s) => {
      const st = resolveStatus(s);
      return st === "cppe" || st === "cppe_training";
    }).length,
    [filteredShifts]
  );

  /* ── Calendar shift lookup (filtered) ──────────────────── */
  const shiftsByDate = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    filteredShifts.forEach((s) => {
      const key = resolveDate(s);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [filteredShifts]);

  /* ── Sorted list for list view ──────────────────────────── */
  const sortedFilteredShifts = useMemo(
    () => [...filteredShifts].sort((a, b) => resolveDate(a).localeCompare(resolveDate(b))),
    [filteredShifts]
  );

  /* ════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 pb-16 bg-slate-50 min-h-screen">

      {/* ── Hero Header ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl px-8 py-10 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Stethoscope size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Shifts</h1>
              <p className="text-blue-100 text-sm mt-1">
                {user?.name || "Clinician"} • {monthLabel}
              </p>
            </div>
          </div>

          {/* Month navigator */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl p-2">
            <button
              onClick={() => moveMonth(-1)}
              className="p-2.5 rounded-xl hover:bg-white/20 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <span className="min-w-[140px] text-center text-sm font-bold text-white">
              {monthLabel}
            </span>
            <button
              onClick={() => moveMonth(1)}
              className="p-2.5 rounded-xl hover:bg-white/20 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────── */}
      {rotaError && (
        <div className="mx-1 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {(rotaErr as any)?.message ||
            "Could not load your rota. If this persists, ask an administrator to link your user account to a clinician profile."}
        </div>
      )}

      {/* ── Summary Cards (5) ──────────────────────────────── */}
      {rotaLoading ? (
        <LoadingFallback text="Loading dashboard..." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <SummaryCard
            label="Working Days"
            value={workingDays}
            sub="Shifts this month"
            Icon={Clock}
            borderColor="border-green-200"
            iconBg="bg-green-50"
            iconColor="text-green-600"
            textColor="text-green-600"
            accentColor="bg-green-500"
          />
          <SummaryCard
            label="Expected Hours"
            value={
              <span>
                {expectedHours.toFixed(1)}
                <span className="text-lg text-slate-500">h</span>
              </span>
            }
            sub="Total scheduled"
            Icon={FileText}
            borderColor="border-green-200"
            iconBg="bg-green-50"
            iconColor="text-green-600"
            textColor="text-green-600"
            accentColor="bg-green-500"
          />
          <SummaryCard
            label="Leave Days"
            value={leaveCount}
            sub="Annual leave"
            Icon={CalendarDays}
            borderColor="border-purple-200"
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            textColor="text-purple-600"
            accentColor="bg-purple-500"
          />
          <SummaryCard
            label="Cover Shifts"
            value={coverCount}
            sub="Covering others"
            Icon={RefreshCw}
            borderColor="border-blue-200"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            textColor="text-blue-600"
            accentColor="bg-blue-500"
          />
          <SummaryCard
            label="CPPE Days"
            value={cppeCount}
            sub="Training sessions"
            Icon={GraduationCap}
            borderColor="border-indigo-200"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            textColor="text-indigo-600"
            accentColor="bg-indigo-500"
          />
        </div>
      )}

      {/* ── Compliance Summary ─────────────────────────────── */}
      {(() => {
        const docs: ComplianceDoc[] = complianceData?.docs || complianceData || [];
        if (!Array.isArray(docs) || docs.length === 0) return null;

        const missing = docs.filter((d) => d.status === "missing").length;
        const rejected = docs.filter((d) => d.status === "rejected").length;
        const pending = docs.filter((d) => d.status === "uploaded").length;
        const approved = docs.filter((d) => d.status === "approved").length;
        const needsAction = missing + rejected > 0;

        return (
          <div
            className={`rounded-2xl border p-5 sm:p-6 cursor-pointer hover:shadow-md transition-shadow ${
              needsAction ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
            }`}
            onClick={() => navigate("/portal/clinician/certificates")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/portal/clinician/certificates")}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">My Compliance</h3>
              <span className="text-slate-400 text-sm">→</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {missing > 0 && (
                <div className="flex items-center gap-1.5 text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {missing} required
                </div>
              )}
              {rejected > 0 && (
                <div className="flex items-center gap-1.5 text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {rejected} rejected
                </div>
              )}
              {pending > 0 && (
                <div className="flex items-center gap-1.5 text-yellow-600">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  {pending} under review
                </div>
              )}
              {approved > 0 && (
                <div className="flex items-center gap-1.5 text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {approved} approved
                </div>
              )}
            </div>
            {needsAction && (
              <p className="text-xs text-red-500 mt-3 font-medium">
                Action required — upload missing documents
              </p>
            )}
          </div>
        );
      })()}

      {/* ── Quick Action Buttons ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate("/portal/clinician/my-timesheet")}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700
            hover:from-blue-700 hover:to-blue-800 px-6 py-3 text-sm font-bold text-white
            shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
        >
          <Clock size={17} />
          Enter My Hours
        </button>
        <button
          onClick={() => navigate("/portal/clinician/apply-leave")}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-blue-200
            hover:bg-blue-50 hover:border-blue-300 px-6 py-3 text-sm font-bold text-blue-700
            active:scale-[0.98] transition-all"
        >
          <CalendarDays size={17} />
          Apply for Leave
        </button>
        <button
          onClick={() => navigate("/portal/clinician/leave-balance")}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-slate-200
            hover:bg-slate-50 hover:border-slate-300 px-6 py-3 text-sm font-bold text-slate-700
            active:scale-[0.98] transition-all"
        >
          <FileText size={17} />
          Leave Balance
        </button>
      </div>

      {/* ── Advanced Filter Bar ───────────────────────────── */}
      <FilterBar
        searchText={searchText}           setSearchText={setSearchText}
        practiceFilter={practiceFilter}   setPracticeFilter={setPracticeFilter}
        dayFilter={dayFilter}             setDayFilter={setDayFilter}
        minHoursFilter={minHoursFilter}   setMinHoursFilter={setMinHoursFilter}
        activeTypeFilters={activeTypeFilters}
        toggleTypeFilter={toggleTypeFilter}
        clearAllFilters={clearAllFilters}
        practiceOptions={practiceOptions}
        hasActiveFilters={!!hasActiveFilters}
      />

      {/* ── Calendar / List ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <CalendarDays size={18} className="text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900 flex-1">
            My Shifts — {monthLabel}
          </h2>

          {/* Filtered count badge */}
          {!rotaLoading && (
            <span className="text-xs text-gray-500 font-medium">
              {filteredShifts.length} of {monthShifts.length} shifts
            </span>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${view === "calendar"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid size={13} /> Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${view === "list"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"}`}
            >
              <List size={13} /> List
            </button>
          </div>
        </div>

        {/* Loading state */}
        {rotaLoading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Loading your rota…</p>
          </div>
        ) : view === "calendar" ? (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-2 py-3">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d} className="text-center text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-0.5 bg-slate-100 p-2 pb-3">
              {Array.from({ length: firstOffset }, (_, i) => (
                <div key={`blank-${i}`} className="bg-white min-h-[100px] rounded-lg" />
              ))}

              {Array.from({ length: totalDays }, (_, idx) => {
                const day       = idx + 1;
                const key       = dateKey(cursor.year, cursor.month, day);
                const isToday   = key === todayKey;
                const dayShifts = shiftsByDate[key] ?? [];

                return (
                  <div
                    key={key}
                    className={`bg-white min-h-[100px] p-2.5 rounded-lg transition-all ${
                      isToday
                        ? "ring-2 ring-blue-500 shadow-md bg-gradient-to-br from-blue-50 to-white"
                        : "hover:shadow-md"
                    }`}
                  >
                    <p className={`text-xs font-bold mb-1.5 ${isToday ? "text-blue-700" : "text-slate-600"}`}>
                      {day}
                    </p>
                    <div className="space-y-1">
                      {dayShifts.length === 0 ? (
                        <p className="text-[10px] text-gray-400">—</p>
                      ) : (
                        dayShifts.map((shift) => {
                          const status = resolveStatus(shift);
                          const style  = TYPE_STYLE[status] ?? DEFAULT_STYLE;
                          const name   = resolvePracticeName(shift, practiceMap);
                          const hrs    = resolveHours(shift);
                          return (
                            <div
                              key={shift.id}
                              className={`rounded-lg border-l-2 px-2 py-1.5 text-[10px] font-semibold transition-all hover:shadow-sm ${style.cell}`}
                            >
                              {name && <div className="font-bold truncate">{name}</div>}
                              <div className="opacity-75">
                                {hrs > 0 ? `${hrs.toFixed(1)}h` : style.label}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredShifts.length === 0 && (
              <div className="py-10 text-center text-gray-500 text-sm border-t border-slate-100">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
                <p className="font-semibold">No shifts match your filters for {monthLabel}</p>
                <p className="text-xs mt-1 opacity-70">
                  Try adjusting your filters or contact your administrator.
                </p>
              </div>
            )}
          </>
        ) : (
          /* ── List View ──────────────────────────────────── */
          <div>
            {sortedFilteredShifts.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">
                <List size={32} className="mx-auto mb-2 opacity-40" />
                <p className="font-semibold">No shifts match your filters for {monthLabel}</p>
              </div>
            ) : (
              sortedFilteredShifts.map((shift) => (
                <ShiftListRow key={shift.id} shift={shift} practiceMap={practiceMap} />
              ))
            )}
          </div>  
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Shift Types</h3>
        <div className="flex flex-wrap gap-2.5">
          {[
            { type: "working",      label: "Working"      },
            { type: "cover",        label: "Cover"        },
            { type: "annual_leave", label: "Annual Leave" },
            { type: "sick",         label: "Sick Leave"   },
            { type: "cppe",         label: "CPPE"         },
            { type: "bank_holiday", label: "Bank Holiday" },
          ].map(({ type, label }) => {
            const s = TYPE_STYLE[type] ?? DEFAULT_STYLE;
            return (
              <span
                key={type}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border ${s.cell}`}
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                {label}
              </span>
            );
          })}
        </div>
      </div>

    </div>
  );
}


