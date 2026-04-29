import { useMemo, useState } from "react";
import { CalendarDays, Plus, Trash2, Check } from "lucide-react";
import {
  useClinicianLeave, useAddLeave, useUpdateLeave, useDeleteLeave,
} from "../../../../hooks/useClinicianLeave";
import { Btn, ModalShell, FormField, Spinner, fmtDate } from "./shared.jsx";

const LEAVE_TYPES = ["Annual", "Sick", "Study", "Maternity/Paternity", "Compassionate", "Unpaid", "Other"];

export default function CalendarPanel({ clinicianId, clinician, canManage }) {
  const { data, isLoading } = useClinicianLeave(clinicianId);
  const addM = useAddLeave(clinicianId);
  const updM = useUpdateLeave(clinicianId);
  const delM = useDeleteLeave(clinicianId);

  const [modal, setModal] = useState(null); // 'add' | { entry }
  const [form,  setForm]  = useState({});

  const summary = useMemo(() => {
    const items = data?.entries || [];
    const totals = { Annual: 0, Sick: 0, Study: 0, Other: 0 };
    items.forEach((e) => {
      const days = Number(e.days) || 0;
      if (e.type === "Annual") totals.Annual += days;
      else if (e.type === "Sick") totals.Sick += days;
      else if (e.type === "Study") totals.Study += days;
      else totals.Other += days;
    });
    return { totals, count: items.length, items };
  }, [data]);

  const allowance = clinician?.annualLeaveAllowance ?? 28;
  const remaining = Math.max(0, allowance - summary.totals.Annual);

  const openAdd = (entry) => {
    setForm({
      _id:        entry?._id || "",
      type:       entry?.type || "Annual",
      startDate:  entry?.startDate ? new Date(entry.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      endDate:    entry?.endDate   ? new Date(entry.endDate).toISOString().split("T")[0]   : new Date().toISOString().split("T")[0],
      days:       entry?.days || 1,
      approved:   entry?.approved ?? false,
      notes:      entry?.notes || "",
    });
    setModal(entry ? { edit: true } : "add");
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      type: form.type, startDate: form.startDate, endDate: form.endDate,
      days: Number(form.days) || 0, approved: !!form.approved, notes: form.notes,
    };
    if (form._id) await updM.mutateAsync({ entryId: form._id, data: payload });
    else          await addM.mutateAsync(payload);
    setModal(null);
  };

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center"><Spinner cls="border-blue-600" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Annual taken",   value: summary.totals.Annual, sub: `of ${allowance}`, cls: "bg-blue-50 text-blue-700" },
          { label: "Annual left",    value: remaining,             cls: "bg-green-50 text-green-700" },
          { label: "Sick days",      value: summary.totals.Sick,   cls: "bg-red-50 text-red-700" },
          { label: "Study days",     value: summary.totals.Study,  cls: "bg-purple-50 text-purple-700" },
        ].map((t) => (
          <div key={t.label} className={`rounded-xl p-3 ${t.cls}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{t.label}</p>
            <p className="text-2xl font-extrabold mt-1">{t.value}</p>
            {t.sub && <p className="text-[11px] mt-0.5 opacity-70">{t.sub}</p>}
          </div>
        ))}
      </div>

      {summary.items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">No leave entries.</p>
      ) : (
        <div className="space-y-2">
          {summary.items.map((e) => (
            <div key={e._id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">
                  {e.type} · {e.days} day{e.days === 1 ? "" : "s"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {fmtDate(e.startDate)} → {fmtDate(e.endDate)}
                </p>
                {e.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{e.notes}</p>}
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                e.approved ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
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
          <FormField label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={LEAVE_TYPES} required />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date" value={form.startDate} onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} type="date" required />
            <FormField label="End date"   value={form.endDate}   onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} type="date" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Days"       value={form.days}      onChange={(v) => setForm((f) => ({ ...f, days: Number(v) || 0 }))} type="number" />
            <FormField label="Approved?"  value={form.approved ? "true" : "false"} onChange={(v) => setForm((f) => ({ ...f, approved: v === "true" }))} options={[["true","Approved"], ["false","Pending"]]} />
          </div>
          <FormField label="Notes" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} textarea rows={3} />
        </ModalShell>
      )}
    </div>
  );
}
