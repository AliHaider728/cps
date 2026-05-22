import { useMemo, useState } from "react";
import { CalendarDays, Send } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useClinicianLeave, useAddLeave } from "../../hooks/useClinicianLeave";
import { dayCount } from "../../lib/leaveDays";

const CONTRACTS = ["ARRS", "EA", "Direct"];
const LEAVE_TYPES = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick" },
  { value: "cppe", label: "CPPE" },
  { value: "other", label: "Training Leave" },
];

export default function ApplyForLeavePage() {
  const { data, refetch } = useClinicianLeave();
  const clinicianId = data?.clinicianId;
  const addLeaveM = useAddLeave(clinicianId);

  const [form, setForm] = useState({
    contract: "ARRS",
    leaveType: "annual",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  const requestedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    return dayCount(form.startDate, form.endDate);
  }, [form.startDate, form.endDate]);

  const balance = useMemo(
    () => (data?.balances || []).find((item) => item.contract === form.contract),
    [data, form.contract]
  );

  const submit = async () => {
    setMessage("");
    if (!clinicianId) {
      return setMessage("Your account is not linked to a clinician profile. Contact admin.");
    }
    if (!form.startDate || !form.endDate) {
      return setMessage("Start date and end date are required.");
    }
    try {
      const res = await addLeaveM.mutateAsync({
        leaveType: form.leaveType,
        contract: form.contract,
        startDate: form.startDate,
        endDate: form.endDate,
        days: requestedDays,
        notes: form.notes,
      });
      setForm({ contract: "ARRS", leaveType: "annual", startDate: "", endDate: "", notes: "" });
      setMessage(
        res?.autoApproved
          ? "Leave approved automatically (≤2 weeks, no clashes)."
          : "Leave request submitted for approval."
      );
      refetch();
    } catch (err) {
      const payload = err?.response?.data;
      if (payload?.code === "HARD_BLOCK") {
        setMessage(payload.message || "Insufficient leave balance for this contract type.");
      } else {
        setMessage(payload?.message || err.message || "Unable to submit leave request.");
      }
    }
  };

  const statusBadge = (entry) => {
    if (entry.rejected) return <Badge color="danger">Rejected</Badge>;
    if (entry.approved) return <Badge color="success">Approved</Badge>;
    return <Badge color="warning">Pending</Badge>;
  };

  return (
    <div className="mx-auto max-w-full space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Apply for Leave</h1>
        <p className="mt-1 text-sm text-slate-500">
          Balances are separate per contract (ARRS, EA, Direct). Short annual leave may auto-approve.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {CONTRACTS.map((contract) => {
          const b = (data?.balances || []).find((x) => x.contract === contract) || {};
          return (
            <div key={contract} className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <Badge color={contract === "ARRS" ? "blue" : contract === "EA" ? "success" : "warning"}>
                {contract}
              </Badge>
              <p className="mt-2 text-slate-600">
                <strong className="text-slate-900">{b.remaining ?? 0}</strong> days remaining ·{" "}
                {b.used ?? 0} taken / {b.total ?? 0}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Leave type
              <select
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Contract type
              <select
                value={form.contract}
                onChange={(e) => setForm({ ...form, contract: e.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                {CONTRACTS.map((contract) => (
                  <option key={contract} value={contract}>
                    {contract}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Start date
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              End date
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
          {requestedDays > 0 && (
            <p className="mt-4 text-sm text-slate-600">
              Requesting <strong>{requestedDays} day(s)</strong> from{" "}
              <strong>{form.contract}</strong> balance (
              {balance?.remaining ?? 0} days remaining).
            </p>
          )}
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Notes
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          {message && (
            <p
              className={`mt-4 text-sm font-medium ${
                message.includes("balance") || message.includes("enough")
                  ? "text-red-700"
                  : "text-slate-700"
              }`}
            >
              {message}
            </p>
          )}
          <Button className="mt-5" isLoading={addLeaveM.isPending} onClick={submit}>
            <Send size={16} /> Submit
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4 font-bold text-slate-900">Leave history</div>
          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {(data?.entries || []).map((entry) => (
              <div key={entry._id || entry.id} className="p-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {entry.contract} · {entry.leaveType}
                  </span>
                  {statusBadge(entry)}
                </div>
                <div className="mt-1 flex items-center gap-1 text-slate-500">
                  <CalendarDays size={14} /> {entry.startDate} – {entry.endDate} · {entry.days}d
                </div>
                {entry.rejectionNote && (
                  <p className="mt-1 text-xs text-red-600">{entry.rejectionNote}</p>
                )}
              </div>
            ))}
            {(data?.entries || []).length === 0 && (
              <div className="p-4 text-sm text-slate-500">No leave requests yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
