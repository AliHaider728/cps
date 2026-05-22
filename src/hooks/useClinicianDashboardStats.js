/**
 * useClinicianDashboardStats.js
 *
 * Provides Working Days + Expected Hours for the clinician dashboard
 * by reading directly from rota shifts (not time_entries).
 *
 * Drop-in replacement for any useMyTimesheet / useTimeEntries usage
 * in dashboard cards.
 *
 * Usage:
 *   const { workingDays, expectedHours, isLoading, shifts } =
 *     useClinicianDashboardStats(month, year);
 */

import { useMemo } from "react";
import { useMyRota, useMyTimesheet } from "./useRota";
import { usePractices } from "./usePractice";
import { buildPracticeNameMap, isWorkingShift } from "../lib/practiceNames";

export function useClinicianDashboardStats(month, year) {
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
    return (Array.isArray(raw) ? raw : []).filter(isWorkingShift);
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
    const entries = timesheetQuery.data?.entries ?? [];
    return entries.reduce(
      (total, e) => total + Number(e.actual_hours || 0),
      0
    );
  }, [timesheetQuery.data]);

  // ── Timesheet status ────────────────────────────────────────────────────
  const timesheetStatus =
    timesheetQuery.data?.timesheet?.status ??
    timesheetQuery.data?.status ??
    null;

  const timesheets = useMemo(() => {
    const list = timesheetQuery.data?.timesheets;
    return Array.isArray(list) ? list : [];
  }, [timesheetQuery.data]);

  return {
    isLoading,
    shifts,
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