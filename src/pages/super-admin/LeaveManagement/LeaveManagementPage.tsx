import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Check, X, Download, Search } from "lucide-react";
import { leaveService } from "../../../services/api/leaveService";
import { Button } from "../../../components/ui/Button";
import { DebouncedSearchInput } from "../../../components/shared/DebouncedSearchInput";

interface LeaveRow {
  _id?: string;
  id?: string;
  clinicianName?: string;
  contractType?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  approverEmail?: string;
  [key: string]: any;
}

const TABS = [
  { id: "pending", label: "Leave Pending Approval" },
  { id: "approved", label: "Approved Leave" },
  { id: "report", label: "Leave Report" },
];

const leaveTypeLabel = (t: string) => {
  const map: Record<string, string> = { annual: "Annual Leave", sick: "Sick", cppe: "CPPE", other: "Other" };
  return map[t] || t || "—";
};

const leaveRowId = (row: LeaveRow) => row?._id || row?.id || null;

const fmtLeaveDate = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const raw = String(value);
  const dateOnly = raw.includes("T") ? raw.split("T")[0] : raw.slice(0, 10);
  try {
    const d = new Date(dateOnly);
    if (Number.isNaN(d.getTime())) return dateOnly;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateOnly;
  }
};

/** One row per leave record — dedupe by id in case API returns duplicates */
function normalizeLeaves(rows: LeaveRow[]) {
  const seen = new Set<string>();
  const out: LeaveRow[] = [];
  for (const row of rows || []) {
    const id = leaveRowId(row);
    if (id) {
      if (seen.has(id)) continue;
      seen.add(id);
    }
    out.push(row);
  }
  return out;
}

export default function LeaveManagementPage() {
  const [tab, setTab] = useState<string>("pending");
  const [search, setSearch] = useState<string>("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");
  const qc = useQueryClient();

  const listQ = useQuery({
    queryKey: ["leaves", tab, search],
    queryFn: () =>
      tab === "report"
        ? leaveService.report().then((r: any) => r.data)
        : leaveService.list({ status: tab, search: search || undefined }).then((r: any) => r.data),
  });

  const reviewM = useMutation({
    mutationFn: ({ id, action, rejection_note }: { id: string; action: string; rejection_note?: string }) =>
      leaveService.review(id, { action, rejection_note }).then((r: any) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setRejectId(null);
      setRejectNote("");
    },
  });

  const pendingRows = useMemo(
    () => normalizeLeaves(listQ.data?.leaves || []),
    [listQ.data?.leaves]
  );
  const reportRows: any[] = listQ.data?.rows || [];

  const exportCsv = (rows: any[], headers: string[], filename: string) => {
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

  const renderActions = (row: LeaveRow) => {
    const id = leaveRowId(row);
    if (!id) return null;
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => reviewM.mutate({ id, action: "approve" })}
          disabled={reviewM.isPending}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100"
        >
          <Check size={12} /> Approve
        </button>
        <button
          type="button"
          onClick={() => setRejectId(id)}
          disabled={reviewM.isPending}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 hover:bg-rose-100"
        >
          <X size={12} /> Reject
        </button>
      </div>
    );
  };

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
            type="button"
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
          <DebouncedSearchInput
            value={search}
            onSearchChange={(val) => setSearch(val)}
            placeholder="Search clinician name..."
            className="w-full border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
          />
        </div>
      )}

      {listQ.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {listQ.isError && (
        <p className="text-sm text-red-600">
          {(listQ.error as any)?.response?.data?.message || "Failed to load leave data"}
        </p>
      )}

      {tab === "pending" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm border-collapse">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Employee</th>
                <th className="px-4 py-3 font-bold">Contract</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">From</th>
                <th className="px-4 py-3 font-bold">To</th>
                <th className="px-4 py-3 font-bold">Days</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingRows.map((row) => {
                const id = leaveRowId(row);
                return (
                  <tr key={id || `${row.clinicianName}-${row.startDate}`} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.clinicianName}</td>
                    <td className="px-4 py-3 text-slate-700">{row.contractType}</td>
                    <td className="px-4 py-3 text-slate-700">{leaveTypeLabel(row.leaveType || "")}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtLeaveDate(row.startDate)}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtLeaveDate(row.endDate)}</td>
                    <td className="px-4 py-3 text-slate-700">{row.days}</td>
                    <td className="px-4 py-3">{renderActions(row)}</td>
                  </tr>
                );
              })}
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
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-sm border-collapse">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Employee</th>
                  <th className="px-4 py-3 font-bold">Contract</th>
                  <th className="px-4 py-3 font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">From</th>
                  <th className="px-4 py-3 font-bold">To</th>
                  <th className="px-4 py-3 font-bold">Days</th>
                  <th className="px-4 py-3 font-bold">Approved by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedFiltered.map((row) => {
                  const id = leaveRowId(row);
                  return (
                    <tr key={id || `${row.clinicianName}-${row.startDate}`} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.clinicianName}</td>
                      <td className="px-4 py-3 text-slate-700">{row.contractType}</td>
                      <td className="px-4 py-3 text-slate-700">{leaveTypeLabel(row.leaveType || "")}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtLeaveDate(row.startDate)}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtLeaveDate(row.endDate)}</td>
                      <td className="px-4 py-3 text-slate-700">{row.days}</td>
                      <td className="px-4 py-3 text-slate-600">{row.approverEmail || "Auto"}</td>
                    </tr>
                  );
                })}
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
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white text-xs shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 text-left uppercase text-slate-500">
                <tr>
                  {Object.keys(reportRows[0] || {
                    employee_name: "",
                    project_name: "",
                    al_entitlement: "",
                  }).map((k) => (
                    <th key={k} className="px-3 py-2 whitespace-nowrap font-bold">
                      {k.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRows.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v: any, j) => (
                      <td key={j} className="px-3 py-2 whitespace-nowrap text-slate-700">
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800">Reject leave request</h3>
            <textarea
              className="mt-3 w-full border border-slate-200 rounded-xl p-3 text-sm bg-white text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              rows={3}
              placeholder="Rejection note for clinician…"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setRejectId(null)}>Cancel</Button>
              <Button
                variant="danger"
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
