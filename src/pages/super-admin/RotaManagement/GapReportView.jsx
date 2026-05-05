import { useState } from "react";
import { useGapReport, useCoverRequests } from "../../../hooks/useRota";
import CoverBookingModal from "./CoverBookingModal";
import { Building2, Users, Calendar, Clock, AlertTriangle, CheckCircle, Mail, Send } from "lucide-react";

export default function GapReportView() {
  const [days, setDays] = useState(14);
  const { data, isLoading, isError, error } = useGapReport(days);
  const { data: coverRequests } = useCoverRequests();
  const [coverOpen, setCoverOpen] = useState(false);
  const [gapShift, setGapShift] = useState(null);
  const gaps = data?.data?.gaps || data?.gaps || [];
  const coverRequestsData = coverRequests?.data || [];
  const openCoverRequests = Array.isArray(coverRequestsData) ? coverRequestsData.filter(req => req.status === 'open') : [];

  const urgentCount = gaps.filter((g) => g.urgent).length;

  // Status configuration for visual indicators
  const getStatusConfig = (status) => {
    const configs = {
      working: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Working', icon: '📋' },
      annual_leave: { bg: 'bg-green-50', text: 'text-green-700', label: 'Annual Leave', icon: '🏖️' },
      sick: { bg: 'bg-red-50', text: 'text-red-700', label: 'Sick', icon: '🤒' },
      cppe: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'CPPE', icon: '🎓' },
      cover: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Cover', icon: '👥' },
      gap: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Gap', icon: '⚠️' },
      cancelled: { bg: 'bg-slate-50', text: 'text-slate-700', label: 'Cancelled', icon: '❌' }
    };
    return configs[status] || configs.gap;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header with CPS Requirements Summary */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">Gap Report</div>
                <div className="text-xs text-slate-500 mt-0.5">Unfilled shifts in next {days} days</div>
              </div>
            </div>
            {!isLoading && urgentCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 border border-red-200">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-red-700">{urgentCount} urgent</span>
              </div>
            )}
            {openCoverRequests.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 border border-blue-200">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-blue-700">{openCoverRequests.length} requests</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Show next</span>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {[7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 ${
                    days === d
                      ? "bg-white text-slate-900 shadow-sm border border-slate-300"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {openCoverRequests.length > 0 && (
        <div className="px-5 py-4 bg-blue-50 border-b border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Open Cover Requests</h3>
          <div className="space-y-2">
            {openCoverRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex-1">
                  <div className="text-xs font-medium text-blue-800">
                    {req.practice_name} - {String(req.date || "").slice(0, 10)}
                  </div>
                  <div className="text-xs text-blue-600">
                    {req.hours_needed}h needed
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGapShift({
                      id: req.shift_id,
                      practice_id: req.practice_id,
                      date: req.date,
                      start_time: req.start_time,
                      end_time: req.end_time,
                      hours_to_cover: req.hours_needed
                    });
                    setCoverOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Cover
                </button>
              </div>
            ))}
            {openCoverRequests.length > 5 && (
              <div className="text-xs text-blue-600 text-center">
                +{openCoverRequests.length - 5} more requests
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-sm text-slate-400">
            <svg className="h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading gaps…
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">{String(error?.message || "Failed")}</div>
        ) : gaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <svg className="h-10 w-10 mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-600">No gaps in next {days} days</p>
            <p className="text-xs text-slate-400 mt-1">All shifts are covered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Practice</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gaps.map((g) => (
                  <tr key={g.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-800 font-medium">
                      {String(g.date || "").slice(0, 10)}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{String(g.practice_id || "—")}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{g.hours != null ? `${g.hours}h` : "—"}</td>
                    <td className="px-5 py-3">
                      {g.urgent ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          Urgent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => { setGapShift(g); setCoverOpen(true); }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-95 group-hover:shadow-md"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Assign cover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CoverBookingModal 
        open={coverOpen} 
        onClose={() => {
          setCoverOpen(false);
          setGapShift(null);
        }} 
        gapShift={gapShift}
        onAssign={() => {
          // Refresh data after cover assignment
          window.location.reload();
        }}
      />
    </div>
  );
}