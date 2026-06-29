import { useMemo } from "react";
import { useMyRota, useMyTimesheet } from "./useRota";
import { usePractices } from "./usePractice";
import { buildPracticeNameMap, isWorkingShift } from "../lib/practiceNames";

export interface ShiftData {
  shift_date?: string;
  date?: string;
  expected_hours?: string | number;
  hours?: string | number;
  total_hours?: string | number;
  [key: string]: any;
}

export interface TimesheetEntry {
  actual_hours?: string | number;
  [key: string]: any;
}

export interface DashboardStatsResult {
  isLoading: boolean;
  shifts: ShiftData[];
  practiceMap: Record<string, string>;
  workingDays: number;
  expectedHours: number;
  actualHours: number;
  timesheetStatus: string | null;
  timesheets: unknown[];
  hasRota: boolean;
  totalShifts: number;
}

export function useClinicianDashboardStats(month?: number | null, year?: number | null): DashboardStatsResult {
  const rotaQuery      = useMyRota(null, null);
  const timesheetQuery = useMyTimesheet(null, null);
  const { data: practicesData } = usePractices();
  const practiceMap = useMemo(
    () => buildPracticeNameMap(practicesData),
    [practicesData]
  );

  const isLoading = rotaQuery.isLoading || timesheetQuery.isLoading;

  const allShifts = useMemo(() => {
    const raw =
      rotaQuery.data?.shifts ||
      timesheetQuery.data?.shifts ||
      rotaQuery.data?.rota   ||
      [];
    return (Array.isArray(raw) ? raw : []).filter(isWorkingShift) as ShiftData[];
  }, [rotaQuery.data, timesheetQuery.data]);

  const shifts = useMemo(() => {
    if (!month || !year) return allShifts;
    return allShifts.filter((s) => {
      const d = String(s.shift_date || s.date || "").slice(0, 10);
      if (!d) return false;
      const [y, m] = d.split("-").map(Number);
      return m === month && y === year;
    });
  }, [allShifts, month, year]);

  const workingDays = shifts.length;

  // ── Expected hours = sum of each shift's expected_hours ─────────────────
  const expectedHours = useMemo(
    () =>
      shifts.reduce((total, shift) => {
        return (
          total +
          Number(shift.expected_hours ?? shift.hours ?? shift.total_hours ?? 0)
        );
      }, 0),
    [shifts]
  );

  // ── Actual hours (from timesheet entries if available) ───────────────────
  const actualHours = useMemo(() => {
    const entries = (timesheetQuery.data?.entries ?? []) as TimesheetEntry[];
    return entries.reduce(
      (total, e) => total + Number(e.actual_hours || 0),
      0
    );
  }, [timesheetQuery.data]);

  // ── Timesheet status ────────────────────────────────────────────────────
  const timesheetStatus =
    (timesheetQuery.data?.timesheet?.status as string | undefined) ??
    (timesheetQuery.data?.status as string | undefined) ??
    null;

  const timesheets = useMemo(() => {
    const list = timesheetQuery.data?.timesheets;
    return Array.isArray(list) ? list : [];
  }, [timesheetQuery.data]);

  return {
    isLoading,
    shifts,
    // @ts-ignore
    practiceMap,
    workingDays,
    expectedHours: Math.round(expectedHours * 100) / 100,
    actualHours:   Math.round(actualHours   * 100) / 100,
    timesheetStatus,
    timesheets,
    hasRota: allShifts.length > 0,
    totalShifts: allShifts.length,
  };
}


