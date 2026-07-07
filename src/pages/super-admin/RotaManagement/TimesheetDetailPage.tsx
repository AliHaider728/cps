import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { useApproveTimesheet, useRejectTimesheet, useTimesheetDetail } from "../../../hooks/useTimesheet";
import { useConfirm } from "../../../contexts/ConfirmContext";

interface Clinician {
  full_name?: string;
  clinician_type?: string;
  contract_type?: string;
}

interface Timesheet {
  clinicians?: Clinician;
  month: number;
  year: number;
}

interface Summary {
  total_expected?: number;
  total_actual?: number;
  difference?: number;
  fte?: number;
}

interface Entry {
  id: string;
  is_cover?: boolean;
  shift_date: string;
  surgery_name: string;
  expected_hours: number | string;
  actual_hours: number | string;
  difference: number | string;
  flag_color?: "green" | "yellow" | "red" | string;
  notes?: string;
}

export default function TimesheetDetailPage() {
    const confirm = useConfirm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  
  const idStr = id as string;
  const { data, isLoading } = useTimesheetDetail(idStr);
  const approve = useApproveTimesheet();
  const reject = useRejectTimesheet();
  
  const sheet: Timesheet | undefined = (data as { timesheet?: Timesheet })?.timesheet;
  const summary: Summary = (data as { summary?: Summary })?.summary || ({} as Summary);

  const approveSheet = async () => {
    if (await confirm({ title: "Approve this timesheet?" })) {
      await approve.mutateAsync(idStr);
      navigate(-1);
    }
  };

  const rejectSheet = async () => {
    if (!reason.trim()) return;
    await reject.mutateAsync({ id: idStr, reason });
    navigate(-1);
  };

  return (
    <div className="space-y-5 pb-20">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</Button>
      {isLoading && <p className="text-sm text-slate-500">Loading detail...</p>}
      {sheet && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h1 className="text-xl font-bold text-slate-900">{sheet.clinicians?.full_name || "Clinician"}</h1>
            <p className="text-sm text-slate-500">{sheet.clinicians?.clinician_type || sheet.clinicians?.contract_type || "Role"} - {sheet.month}/{sheet.year}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-4"><p className="text-xs uppercase text-slate-500">Total Expected</p><p className="text-xl font-bold">{summary.total_expected || 0}</p></div>
            <div className="rounded-lg border bg-white p-4"><p className="text-xs uppercase text-slate-500">Total Actual</p><p className="text-xl font-bold">{summary.total_actual || 0}</p></div>
            <div className="rounded-lg border bg-white p-4"><p className="text-xs uppercase text-slate-500">Difference</p><p className="text-xl font-bold">{summary.difference || 0}</p></div>
            <div className="rounded-lg border bg-white p-4"><p className="text-xs uppercase text-slate-500">FTE</p><p className="text-xl font-bold">{summary.fte || 0}</p></div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Surgery</th><th className="px-4 py-3">Expected</th><th className="px-4 py-3">Actual</th><th className="px-4 py-3">Difference</th><th className="px-4 py-3">Notes</th><th className="px-4 py-3">Cover</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(((data as { entries?: Entry[] })?.entries) || []).map((entry: Entry) => (
                  <tr key={entry.id} className={entry.is_cover ? "bg-amber-50" : ""}>
                    <td className="px-4 py-3">{entry.shift_date}</td><td className="px-4 py-3">{entry.surgery_name}</td><td className="px-4 py-3">{entry.expected_hours}</td><td className="px-4 py-3">{entry.actual_hours}</td>
                    <td className="px-4 py-3"><Badge color={entry.flag_color === "green" ? "success" : entry.flag_color === "yellow" ? "warning" : "danger"}>{entry.difference as React.ReactNode}</Badge></td>
                    <td className="px-4 py-3">{entry.notes || "-"}</td><td className="px-4 py-3">{entry.is_cover && <Badge color="warning">Cover</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4 shadow-lg">
            <div className="mx-auto flex max-w-5xl justify-end gap-2">
              <Button variant="danger" onClick={() => setRejecting(true)}><XCircle size={16} /> Reject</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={approveSheet}><CheckCircle2 size={16} /> Approve</Button>
            </div>
          </div>
        </>
      )}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 className="font-bold text-slate-900">Reject timesheet</h2>
            <textarea required rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-3 w-full rounded-lg border border-slate-200 p-3" placeholder="Required reason" />
            <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setRejecting(false)}>Cancel</Button><Button variant="danger" disabled={!reason.trim()} onClick={rejectSheet}>Reject</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
