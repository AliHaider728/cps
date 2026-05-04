import { useMemo, useState } from "react";
import { CalendarDays, Plus, Trash2, Check } from "lucide-react";
import {
  useClinicianLeave, useAddLeave, useUpdateLeave, useDeleteLeave,
} from "../../../../hooks/useClinicianLeave";
import { Btn, ModalShell, FormField, Spinner, fmtDate } from "./shared.jsx";

// ✅ FIXED: Match backend leaveType values exactly (lowercase)
const LEAVE_TYPES    = ["annual", "sick", "cppe", "other"];
const LEAVE_LABELS   = { annual: "Annual Leave", sick: "Sick Leave", cppe: "CPPE / Study", other: "Other" };
const CONTRACT_OPTS  = ["ARRS", "EA", "Direct"];

export default function CalendarPanel({ clinicianId, clinician, canManage }) {
  const { data, isLoading } = useClinicianLeave(clinicianId);
  const addM = useAddLeave(clinicianId);
  const updM = useUpdateLeave(clinicianId);
  const delM = useDeleteLeave(clinicianId);

  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({});

  // ✅ FIXED: Use balances from API response (per contract), not clinician.annualLeaveAllowance
  const balances = data?.balances || [];
  const entries  = data?.entries  || [];

  // ✅ FIXED: Count using correct lowercase leaveType values
  const summary = useMemo(() => {
    const totals = { annual: 0, sick: 0, cppe: 0, other: 0 };
    entries.forEach((e) => {
      const key = totals.hasOwnProperty(e.leaveType) ? e.leaveType : "other";
      totals[key] += Number(e.days) || 0;
    });
    return totals;
  }, [entries]);

  const openAdd = (entry) => {
    // Detect default contract from clinician
    const defaultContract = clinician?.contractType === "Mixed"
      ? "ARRS"
      : (clinician?.contractType || "ARRS");

    setForm({
      _id:       entry?._id       || "",
      leaveType: entry?.leaveType || "annual",
      contract:  entry?.contract  || defaultContract,
      startDate: entry?.startDate
        ? new Date(entry.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: entry?.endDate
        ? new Date(entry.endDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      days:     entry?.days     ?? 1,
      approved: entry?.approved ?? false,
      notes:    entry?.notes    || "",
    });
    setModal(entry ? { edit: true } : "add");
  };

  const submit = async () => {
    const payload = {
      leaveType: form.leaveType,
      contract:  form.contract,
      startDate: form.startDate,
      endDate:   form.endDate,
      days:      Number(form.days) || 0,
      approved:  !!form.approved,
      notes:     form.notes,
    };
    if (form._id) await updM.mutateAsync({ entryId: form._id, data: payload });
    else          await addM.mutateAsync(payload);
    setModal(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <Spinner cls="border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <CalendarDays size={18} className="text-amber-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Calendar &amp; leave</h3>
        </div>
        {canManage && (
          <Btn variant="outline" size="sm" onClick={() => openAdd(null)}>
            <Plus size={13} /> Add leave
          </Btn>
        )}
      </div>

      {/* ✅ FIXED: Per-contract balance cards from API */}
      {balances.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leave balances by contract</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {balances.map((b) => (
              <div key={b.contract} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{b.contract}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-extrabold text-slate-800">{b.remaining}</p>
                    <p className="text-[11px] text-slate-400">remaining</p>
                  </div>
                  <p className="text-xs text-slate-400">{b.used} / {b.total} used</p>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${b.total > 0 ? Math.min((b.used / b.total) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Annual leave", value: summary.annual, cls: "bg-blue-50 text-blue-700" },
          { label: "Sick days",    value: summary.sick,   cls: "bg-red-50 text-red-700"   },
          { label: "CPPE / study", value: summary.cppe,   cls: "bg-purple-50 text-purple-700" },
          { label: "Other",        value: summary.other,  cls: "bg-slate-50 text-slate-600" },
        ].map((t) => (
          <div key={t.label} className={`rounded-xl p-3 ${t.cls}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{t.label}</p>
            <p className="text-2xl font-extrabold mt-1">{t.value}</p>
            <p className="text-[11px] mt-0.5 opacity-60">days taken</p>
          </div>
        ))}
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">No leave entries yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e._id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">
                  {LEAVE_LABELS[e.leaveType] || e.leaveType} · {e.days} day{e.days === 1 ? "" : "s"}
                  <span className="ml-2 text-[11px] font-semibold text-slate-400">[{e.contract}]</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {fmtDate(e.startDate)} → {fmtDate(e.endDate)}
                </p>
                {e.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{e.notes}</p>}
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                e.approved
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {e.approved ? "Approved" : "Pending"}
              </span>
              {canManage && (
                <div className="flex gap-1.5">
                  <Btn variant="ghost" size="sm" onClick={() => openAdd(e)}>Edit</Btn>
                  <Btn
                    variant="danger" size="sm"
                    onClick={() => { if (window.confirm("Delete this leave entry?")) delM.mutate(e._id); }}
                  >
                    <Trash2 size={12} />
                  </Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(modal === "add" || modal?.edit) && (
        <ModalShell
          title={form._id ? "Edit leave entry" : "Add leave entry"}
          onClose={() => setModal(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">Cancel</Btn>
              <Btn onClick={submit} disabled={addM.isPending || updM.isPending} cls="flex-1">
                {(addM.isPending || updM.isPending) ? <Spinner /> : <Check size={14} />} Save
              </Btn>
            </>
          }
        >
          {/* ✅ FIXED: leaveType uses backend values */}
          <FormField
            label="Leave type"
            value={form.leaveType}
            onChange={(v) => setForm((f) => ({ ...f, leaveType: v }))}
            options={LEAVE_TYPES.map((t) => [t, LEAVE_LABELS[t]])}
            required
          />
          {/* ✅ FIXED: contract field added */}
          <FormField
            label="Contract"
            value={form.contract}
            onChange={(v) => setForm((f) => ({ ...f, contract: v }))}
            options={CONTRACT_OPTS}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date" value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} type="date" required />
            <FormField label="End date"   value={form.endDate}   onChange={(v) => setForm((f) => ({ ...f, endDate: v }))}   type="date" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Days"
              value={form.days}
              onChange={(v) => setForm((f) => ({ ...f, days: Number(v) || 0 }))}
              type="number"
            />
            <FormField
              label="Approved?"
              value={form.approved ? "true" : "false"}
              onChange={(v) => setForm((f) => ({ ...f, approved: v === "true" }))}
              options={[["true", "Approved"], ["false", "Pending"]]}
            />
          </div>
          <FormField label="Notes" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} textarea rows={3} />
        </ModalShell>
      )}
    </div>
  );
}