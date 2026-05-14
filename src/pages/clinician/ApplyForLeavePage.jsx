import { useState } from "react";
import { CalendarDays, Send, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/api/client";

const LEAVE_TYPES = [
  { value: "annual_leave", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "cppe", label: "CPPE / Training" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "other", label: "Other" },
];

export default function ApplyForLeavePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    leaveType: "annual_leave",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async () => {
    if (!user?.clinicianId) {
      setStatus("error");
      setMessage("Your clinician profile could not be found. Please contact your ops lead.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setStatus("error");
      setMessage("Please select both start and end dates.");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setStatus("error");
      setMessage("End date must be after start date.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      await apiClient.post(`/clinicians/${user.clinicianId}/leave`, {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        status: "pending",
      });
      setStatus("success");
      setMessage("Leave request submitted successfully. You will be notified once it's approved.");
      setForm({ leaveType: "annual_leave", startDate: "", endDate: "", reason: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to submit leave request. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Apply for Leave</h1>
        <p className="text-slate-500 mt-1">Submit a leave request for review by your ops lead.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Leave Type</label>
          <select
            value={form.leaveType}
            onChange={set("leaveType")}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            {LEAVE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={form.startDate}
                onChange={set("startDate")}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
            <div className="relative">
              <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={form.endDate}
                onChange={set("endDate")}
                min={form.startDate || new Date().toISOString().slice(0, 10)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate) && (
          <div className="px-4 py-3 bg-indigo-50 rounded-xl text-sm text-indigo-700 font-medium">
            Approx. {Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1} calendar days
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Reason <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.reason}
            onChange={set("reason")}
            rows={4}
            placeholder="Add any additional details for your manager..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium">
            <AlertCircle size={18} /> {message}
          </div>
        )}
        {status === "success" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
            <CheckCircle size={18} /> {message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition disabled:opacity-60"
          type="button"
        >
          <Send size={18} />
          {status === "loading" ? "Submitting..." : "Submit Leave Request"}
        </button>
      </div>
    </div>
  );
}
