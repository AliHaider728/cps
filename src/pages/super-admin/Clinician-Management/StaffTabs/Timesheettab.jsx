import { useState } from "react";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useClinicianTimesheet, useApproveTimesheet, useRejectTimesheet } from "../../../../hooks/useRota";

const statusClass = {
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  submitted: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function StatusBadge({ status }) {
  return <span className={`rounded-md border px-2 py-1 text-xs font-bold uppercase ${statusClass[status] || statusClass.draft}`}>{status || "draft"}</span>;
}

function diffClass(value) {
  const abs = Math.abs(Number(value || 0));
  if (abs === 0) return "text-emerald-700 bg-emerald-50";
  if (abs <= 1) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

export default function Timesheettab({ clinicianId, canManage = true }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ month: today.getMonth() + 1, year: today.getFullYear() });
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const { data: detail } = useClinicianTimesheet(clinicianId, cursor.month, cursor.year);
  const approve = useApproveTimesheet();
  const reject = useRejectTimesheet();

  const moveMonth = (delta) => {
    setCursor((cur) => {
      const next = new Date(cur.year, cur.month - 1 + delta, 1);
      return { month: next.getMonth() + 1, year: next.getFullYear() };
    });
  };

  const approveSelected = async () => {
    if (!detail?.id) return;
    await approve.mutateAsync(detail.id);
  };

  const rejectSelected = async () => {
    if (!detail?.id || !reason.trim()) return;
    await reject.mutateAsync({ id: detail.id, reason });
    setRejecting(false);
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Timesheets</h2>
          <p className="text-sm text-slate-500">Review expected hours against submitted actual hours.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
          <button onClick={() => moveMonth(-1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronLeft size={16} /></button>
          <span className="min-w-40 text-center text-sm font-semibold">{new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>
          <button onClick={() => moveMonth(1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronRight size={16} /></button>
        </div>
      </div>

      {detail && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">{detail.clinician_name}</h3>
              <p className="text-sm text-slate-500">{detail.month}/{detail.year} timesheet</p>
              {detail.status === "rejected" && <p className="mt-1 text-sm font-semibold text-red-600">{detail.rejection_reason}</p>}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={detail.status} />
              {canManage && detail.status === "submitted" && (
                <>
                  <button onClick={approveSelected} disabled={approve.isPending} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 size={15} />Approve</button>
                  <button onClick={() => setRejecting(true)} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white"><XCircle size={15} />Reject</button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Surgery</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Actual</th>
                  <th className="px-4 py-3">Difference</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(detail.entries || []).map((entry) => {
                  const difference = Number(entry.difference ?? Number(entry.actual_hours || 0) - Number(entry.expected_hours || 0));
                  return (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 font-semibold">{String(entry.shift_date).slice(0, 10)}</td>
                      <td className="px-4 py-3">{entry.surgery_name || "Surgery"}</td>
                      <td className="px-4 py-3">{Number(entry.expected_hours || 0).toFixed(1)}h</td>
                      <td className="px-4 py-3">{Number(entry.actual_hours || 0).toFixed(1)}h</td>
                      <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 font-bold ${diffClass(difference)}`}>{difference.toFixed(1)}h</span></td>
                      <td className="px-4 py-3">{entry.notes || "-"}</td>
                      <td className="px-4 py-3"><StatusBadge status={detail.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">History</h3>
        {(detail?.history || []).length === 0 ? (
          <p className="text-sm text-slate-500">No previous timesheets found for this clinician.</p>
        ) : (
          <div className="space-y-2">
            {detail.history.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-700">{item.month}/{item.year}</span>
                <StatusBadge status={item.status} />
                <span className="text-slate-500">Submitted: {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString("en-GB") : "-"}</span>
                <span className="text-slate-500">Decision: {item.approved_at || item.rejected_at ? new Date(item.approved_at || item.rejected_at).toLocaleDateString("en-GB") : "-"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 className="font-bold text-slate-900">Reject timesheet</h3>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm" placeholder="Rejection reason" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setRejecting(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button>
              <button onClick={rejectSelected} disabled={!reason.trim() || reject.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
