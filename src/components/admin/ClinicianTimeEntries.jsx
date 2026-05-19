import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../services/api/client";
import { Clock, LogIn, LogOut } from "lucide-react";
import ShiftStatusBadge from "../ui/ShiftStatusBadge";

function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(clockIn, clockOut) {
  if (!clockIn) return "-";
  const end = clockOut ? new Date(clockOut) : new Date();
  const diffMs = end - new Date(clockIn);
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export default function ClinicianTimeEntries({ clinicianId }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-time-entries", clinicianId],
    queryFn: () =>
      apiClient
        .get(`/time-entries/admin/clinician/${clinicianId}`)
        .then((response) => response.data?.data),
    enabled: !!clinicianId,
    refetchInterval: 60_000,
  });

  if (isLoading) return <p className="text-sm text-slate-400 p-4">Loading time entries...</p>;

  const entries = data?.entries || [];
  const isClockedIn = data?.is_clocked_in || false;
  const activeSince = data?.active_since || null;

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
        isClockedIn
          ? "bg-emerald-50 border-emerald-100 text-emerald-800"
          : "bg-slate-50 border-slate-100 text-slate-500"
      }`}>
        <div className={`p-2 rounded-xl ${isClockedIn ? "bg-emerald-100" : "bg-slate-100"}`}>
          <Clock size={18} />
        </div>
        <div>
          <p className="text-sm font-bold">
            {isClockedIn ? "Currently Clocked In" : "Not Currently Clocked In"}
          </p>
          {isClockedIn && activeSince && (
            <p className="text-xs mt-0.5">Since {formatDateTime(activeSince)}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Clock-In History</h3>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-slate-400 italic p-6 text-center">No time entries recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase text-slate-400 tracking-wider bg-slate-50">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Clock In</th>
                  <th className="px-5 py-3 text-left">Clock Out</th>
                  <th className="px-5 py-3 text-right">Duration</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {entry.clock_in ? new Date(entry.clock_in).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : "-"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <LogIn size={13} className="text-emerald-500" />
                        {entry.clock_in ? new Date(entry.clock_in).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {entry.clock_out ? (
                        <span className="flex items-center gap-1.5">
                          <LogOut size={13} className="text-rose-400" />
                          {new Date(entry.clock_out).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-xs">Active Now</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">
                      {entry.status === "active"
                        ? formatDuration(entry.clock_in, null)
                        : entry.actual_hours
                          ? `${Number(entry.actual_hours).toFixed(1)}h`
                          : formatDuration(entry.clock_in, entry.clock_out)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ShiftStatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
