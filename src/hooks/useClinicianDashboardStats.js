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

export function useClinicianDashboardStats(month, year) {
  const rotaQuery      = useMyRota(month, year);
  const timesheetQuery = useMyTimesheet(month, year);

  const isLoading = rotaQuery.isLoading || timesheetQuery.isLoading;

  // ── Shifts from rota (source of truth for planning stats) ──────────────
  const shifts = useMemo(() => {
    const raw =
      rotaQuery.data?.shifts ||
      timesheetQuery.data?.shifts ||
      rotaQuery.data?.rota   ||
      rotaQuery.data         ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [rotaQuery.data, timesheetQuery.data]);

  // ── Working days = number of assigned shifts ────────────────────────────
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

  return {
    isLoading,
    shifts,
    workingDays,
    expectedHours: Math.round(expectedHours * 100) / 100,
    actualHours:   Math.round(actualHours   * 100) / 100,
    timesheetStatus,
    hasRota:       workingDays > 0,
  };
}