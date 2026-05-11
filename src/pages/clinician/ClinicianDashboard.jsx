/**
 * ClinicianDashboard.jsx — Clinician Portal
 *
 * UPDATED: Real clock-in / clock-out timer tied to today's shift.
 * Spec: CPS_Rota_Management_Specification §2.5 — Clinician Personal Rota / Diary
 *
 * Shows:
 *  - Clock In / Clock Out button with live elapsed timer
 *  - Today's shift (if clinicianId resolvable from user profile)
 *  - Annual leave balance (if clinicianId available)
 *  - Recent time entries (last 5)
 */

import { useState, useEffect } from "react";
import { Clock, CalendarCheck, ClipboardCheck, Timer, LogIn, LogOut, AlertCircle } from "lucide-react";
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

/* ── Live timer sub-component ─────────────────────────────────── */
function LiveTimer({ clockIn }) {
  const [display, setDisplay] = useState(() => formatDuration(clockIn));
  useEffect(() => {
    const id = setInterval(() => setDisplay(formatDuration(clockIn)), 1000);
    return () => clearInterval(id);
  }, [clockIn]);
  return (
    <span className="font-mono text-3xl font-bold text-blue-700 tracking-wider">
      {display}
    </span>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function ClinicianDashboard() {
  const { user } = useAuth();

  // clinicianId may be embedded in user profile by some setups; otherwise null
  // The backend resolves it from user.id when clock-in/out is called
  const clinicianId = user?.clinicianId || null;

  /* Active clock-in entry */
  const { data: activeEntry, isLoading: activeLoading } = useActiveTimeEntry();
  const isClockedIn = !!activeEntry;

  /* Leave balance — only if clinicianId is known */
  const { data: leaveData } = useClinicianLeave(clinicianId);
  const arrsBalance = leaveData?.balances?.find((b) => b.contract === "ARRS") || null;

  /* Recent entries (last 5) */
  const { data: recentEntries = [] } = useTimeEntries({ limit: 5 });

  /* Mutations */
  const clockInMutation  = useClockIn();
  const clockOutMutation = useClockOut();
  const [feedback, setFeedback] = useState(null);

  const handleClockIn = async () => {
    try {
      setFeedback(null);
      await clockInMutation.mutateAsync({});
      setFeedback({ type: "success", msg: "Clocked in successfully!" });
    } catch (err) {
      setFeedback({ type: "error", msg: err.response?.data?.message || "Clock-in failed" });
    }
  };

  const handleClockOut = async () => {
    try {
      setFeedback(null);
      const result = await clockOutMutation.mutateAsync();
      setFeedback({
        type: "success",
        msg: `Clocked out. Total: ${result?.actual_hours ?? "0"}h`,
      });
    } catch (err) {
      setFeedback({ type: "error", msg: err.response?.data?.message || "Clock-out failed" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinician Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.name || "Clinician"} —{" "}
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-sm">
          {(user?.name || "C")[0].toUpperCase()}
        </div>
      </div>

      {/* ── Clock In / Out Card ────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-600" />
              Shift Timer
            </h2>
            {isClockedIn && activeEntry?.shift_date && (
              <p className="text-sm text-gray-500 mt-1">
                Shift date:{" "}
                {new Date(activeEntry.shift_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {activeEntry.start_time &&
                  ` · ${activeEntry.start_time.slice(0, 5)}–${activeEntry.end_time?.slice(0, 5) || "?"}`}
                {activeEntry.planned_hours
                  ? ` · ${activeEntry.planned_hours}h planned`
                  : ""}
              </p>
            )}
          </div>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              isClockedIn
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isClockedIn ? "● On Shift" : "○ Off Shift"}
          </span>
        </div>

        {/* Live elapsed timer */}
        {isClockedIn && activeEntry && (
          <div className="mb-5 flex flex-col items-center py-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-500 font-medium mb-1 uppercase tracking-wide">
              Elapsed Time
            </p>
            <LiveTimer clockIn={activeEntry.clock_in} />
            <p className="text-xs text-blue-400 mt-2">
              Clocked in at{" "}
              {new Date(activeEntry.clock_in).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {/* Feedback banner */}
        {feedback && (
          <div
            className={`mb-4 flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${
              feedback.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {feedback.msg}
          </div>
        )}

        {/* Action button */}
        {activeLoading ? (
          <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
        ) : isClockedIn ? (
          <button
            onClick={handleClockOut}
            disabled={clockOutMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {clockOutMutation.isPending ? "Clocking Out…" : "Clock Out"}
          </button>
        ) : (
          <button
            onClick={handleClockIn}
            disabled={clockInMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {clockInMutation.isPending ? "Clocking In…" : "Clock In"}
          </button>
        )}
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Leave balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Annual Leave</span>
          </div>
          {arrsBalance ? (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {arrsBalance.remaining} days
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {arrsBalance.used} used of {arrsBalance.total} (ARRS)
              </p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{
                    width: `${Math.min(
                      (arrsBalance.used / arrsBalance.total) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>

        {/* Hours this month (from entries) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-medium text-gray-700">Hours This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recentEntries
              .filter((e) => e.status === "completed")
              .reduce((sum, e) => sum + Number(e.actual_hours || 0), 0)
              .toFixed(1)}
            h
          </p>
          <p className="text-xs text-gray-400 mt-1">clocked (last entries)</p>
        </div>
      </div>

      {/* ── Recent Time Entries ─────────────────────────────────── */}
      {recentEntries.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-slate-500" />
            Recent Time Entries
          </h2>
          <div className="divide-y divide-gray-50">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-2.5 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {new Date(entry.clock_in).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.clock_in).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {entry.clock_out
                      ? ` → ${new Date(entry.clock_out).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : " → Active"}
                  </p>
                </div>
                <div className="text-right">
                  {entry.status === "active" ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-700">
                      {entry.actual_hours != null ? `${entry.actual_hours}h` : "—"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
