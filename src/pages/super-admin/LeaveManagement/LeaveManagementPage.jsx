import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Check, X, Download, Search } from "lucide-react";
import { leaveService } from "../../../services/api/leaveService";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";

const TABS = [
  { id: "pending", label: "Leave Pending Approval" },
  { id: "approved", label: "Approved Leave" },
  { id: "report", label: "Leave Report" },
];

const leaveTypeLabel = (t) => {
  const map = { annual: "Annual Leave", sick: "Sick", cppe: "CPPE", other: "Other" };
  return map[t] || t || "—";
};

export default function LeaveManagementPage() {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const qc = useQueryClient();

  const listQ = useQuery({
    queryKey: ["leaves", tab, search],
    queryFn: () =>
      tab === "report"
        ? leaveService.report().then((r) => r.data)
        : leaveService.list({ status: tab, search: search || undefined }).then((r) => r.data),
    enabled: tab !== "report" || true,
  });

  const reviewM = useMutation({
    mutationFn: ({ id, action, rejection_note }) =>
      leaveService.review(id, { action, rejection_note }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setRejectId(null);
      setRejectNote("");
    },
  });

  const pendingRows = listQ.data?.leaves || [];
  const reportRows = listQ.data?.rows || [];

  const exportCsv = (rows, headers, filename) => {
    const lines = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const approvedFiltered = useMemo(() => {
    if (tab !== "approved") return pendingRows;
    return pendingRows;
  }, [tab, pendingRows]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <CalendarOff size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Leave Management</h1>
          <p className="text-sm text-slate-500">Review requests, approved leave, and entitlement report</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t.id
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "report" && (
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinician name…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm"
          />
        </div>
      )}

      {listQ.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {listQ.isError && (
        <p className="text-sm text-red-600">
          {listQ.error?.response?.data?.message || "Failed to load leave data"}
        </p>
      )}

      {tab === "pending" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Contract</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingRows.map((row) => (
                <tr key={row._id}>
                  <td className="px-4 py-3 font-semibold">{row.clinicianName}</td>
                  <td className="px-4 py-3">{row.contractType}</td>
                  <td className="px-4 py-3">{leaveTypeLabel(row.leaveType)}</td>
                  <td className="px-4 py-3">{row.startDate}</td>
                  <td className="px-4 py-3">{row.endDate}</td>
                  <td className="px-4 py-3">{row.days}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => reviewM.mutate({ id: row._id, action: "approve" })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectId(row._id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200"
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingRows.length === 0 && !listQ.isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No pending leave requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "approved" && (
        <>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() =>
                exportCsv(
                  approvedFiltered,
                  ["clinicianName", "contractType", "leaveType", "startDate", "endDate", "days", "approverEmail"],
                  "approved-leave.csv"
                )
              }
            >
              <Download size={14} /> Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Contract</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Approved by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedFiltered.map((row) => (
                  <tr key={row._id}>
                    <td className="px-4 py-3 font-semibold">{row.clinicianName}</td>
                    <td className="px-4 py-3">{row.contractType}</td>
                    <td className="px-4 py-3">{leaveTypeLabel(row.leaveType)}</td>
                    <td className="px-4 py-3">{row.startDate}</td>
                    <td className="px-4 py-3">{row.endDate}</td>
                    <td className="px-4 py-3">{row.days}</td>
                    <td className="px-4 py-3 text-slate-600">{row.approverEmail || "Auto"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "report" && (
        <>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() =>
                exportCsv(reportRows, Object.keys(reportRows[0] || {}), "leave-report.csv")
              }
            >
              <Download size={14} /> Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white text-xs">
            <table className="w-full">
              <thead className="bg-slate-50 text-left uppercase text-slate-500">
                <tr>
                  {Object.keys(reportRows[0] || {
                    employee_name: "",
                    project_name: "",
                    al_entitlement: "",
                  }).map((k) => (
                    <th key={k} className="px-3 py-2 whitespace-nowrap">
                      {k.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRows.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-3 py-2 whitespace-nowrap">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="p-3 text-slate-500 border-t border-slate-100">
              Total records: {reportRows.length}
            </p>
          </div>
        </>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-slate-800">Reject leave request</h3>
            <textarea
              className="mt-3 w-full border border-slate-200 rounded-xl p-3 text-sm"
              rows={3}
              placeholder="Rejection note for clinician…"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setRejectId(null)}>Cancel</Button>
              <Button
                onClick={() =>
                  reviewM.mutate({
                    id: rejectId,
                    action: "reject",
                    rejection_note: rejectNote,
                  })
                }
              >
                Confirm reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
