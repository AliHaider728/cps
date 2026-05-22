import { useMemo, useState } from "react";
import { CalendarDays, Send } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useClinicianLeave } from "../../hooks/useClinicianLeave";
import { apiClient } from "../../services/api/client";

const CONTRACTS = ["ARRS", "EA", "Direct"];

export default function ApplyForLeavePage() {
  const { user } = useAuth();
  const { data, refetch } = useClinicianLeave(user?.clinicianId);
  const [form, setForm] = useState({ contract: "ARRS", startDate: "", endDate: "", reason: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const balance = useMemo(() => (data?.balances || []).find((item) => item.contract === form.contract), [data, form.contract]);

  const submit = async () => {
    setMessage("");
    if (!form.startDate || !form.endDate) return setMessage("Start date and end date are required.");
    setLoading(true);
    try {
      try {
        await apiClient.post("/leave/apply", { leave_type: form.contract, ...form });
      } catch (err) {
        if (!user?.clinicianId || err.response?.status !== 404) throw err;
        await apiClient.post(`/clinicians/${user.clinicianId}/leave`, {
          leaveType: "annual",
          contract: form.contract,
          startDate: form.startDate,
          endDate: form.endDate,
          notes: form.reason,
        });
      }
      setForm({ contract: "ARRS", startDate: "", endDate: "", reason: "" });
      setMessage("Leave request submitted.");
      refetch();
    } catch (err) {
      const data = err?.response?.data;
      if (data?.code === "HARD_BLOCK") {
        setMessage(data.message || "Insufficient leave balance for this contract type.");
      } else {
        setMessage(data?.message || err.message || "Unable to submit leave request.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-full space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Apply for Leave</h1>
        <p className="mt-1 text-sm text-slate-500">Submit ARRS, EA, or Direct leave for review.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Leave type
              <select value={form.contract} onChange={(e) => setForm({ ...form, contract: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2">
                {CONTRACTS.map((contract) => <option key={contract} value={contract}>{contract}</option>)}
              </select>
            </label>
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-bold text-slate-900">{form.contract} balance</span>
              <div className="mt-1">
                {balance?.remaining ?? (balance?.total || 0) - (balance?.used || 0)} days remaining
                <span className="text-slate-400"> · {balance?.used || 0} taken / {balance?.total || 0} total</span>
              </div>
            </div>
            <label className="text-sm font-semibold text-slate-700">Start date
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm font-semibold text-slate-700">End date
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold text-slate-700">Reason
            <textarea rows={4} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" />
          </label>
          {message && (
            <p className={`mt-4 text-sm font-medium ${message.includes("enough") || message.includes("balance") ? "text-red-700" : "text-slate-700"}`}>
              {message}
            </p>
          )}
          <Button className="mt-5" isLoading={loading} onClick={submit}><Send size={16} /> Submit</Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4 font-bold text-slate-900">Existing Requests</div>
          <div className="divide-y divide-slate-100">
            {(data?.entries || []).slice(0, 8).map((entry) => (
              <div key={entry._id || entry.id} className="p-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{entry.contract || entry.leaveType}</span>
                  <Badge color={entry.approved ? "success" : "warning"}>{entry.approved ? "Approved" : "Pending"}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-1 text-slate-500"><CalendarDays size={14} /> {entry.startDate} - {entry.endDate}</div>
              </div>
            ))}
            {(data?.entries || []).length === 0 && <div className="p-4 text-sm text-slate-500">No leave requests yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
