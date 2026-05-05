import { useState } from "react";
import { useGapReport } from "../../../hooks/useRota";
import CoverAssignModal from "./CoverAssignModal";

export default function GapReportView() {
  const [days, setDays] = useState(14);
  const { data, isLoading, isError, error } = useGapReport(days);
  const [coverOpen, setCoverOpen] = useState(false);
  const [gapShift, setGapShift] = useState(null);
  const gaps = data?.data?.gaps || data?.gaps || [];

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="p-3 border-b border-slate-100 flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Gap Report</div>
          <div className="text-xs text-slate-500">Unfilled gaps in the next N days</div>
        </div>
        <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-9 w-20 px-2 rounded-md border border-slate-200 text-sm" />
      </div>
      <div className="p-3">
        {isLoading ? <div className="text-sm text-slate-500">Loading...</div> : null}
        {isError ? <div className="text-sm text-red-700">{String(error?.message || "Failed")}</div> : null}
        {!isLoading && !isError ? (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-3 py-2 border-b border-slate-200">Date</th>
                <th className="text-left px-3 py-2 border-b border-slate-200">Practice</th>
                <th className="text-left px-3 py-2 border-b border-slate-200">Hours</th>
                <th className="text-left px-3 py-2 border-b border-slate-200">Urgency</th>
                <th className="text-right px-3 py-2 border-b border-slate-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((g) => (
                <tr key={g.id} className="odd:bg-white even:bg-slate-50/30">
                  <td className="px-3 py-2 border-b border-slate-100">{String(g.date || "").slice(0, 10)}</td>
                  <td className="px-3 py-2 border-b border-slate-100">{String(g.practice_id || "")}</td>
                  <td className="px-3 py-2 border-b border-slate-100">{g.hours ?? "-"}</td>
                  <td className="px-3 py-2 border-b border-slate-100">{g.urgent ? "URGENT" : "Normal"}</td>
                  <td className="px-3 py-2 border-b border-slate-100 text-right">
                    <button type="button" onClick={() => { setGapShift(g); setCoverOpen(true); }} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm">Assign cover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
      <CoverAssignModal open={coverOpen} onClose={() => setCoverOpen(false)} gapShift={gapShift} />
    </div>
  );
}
