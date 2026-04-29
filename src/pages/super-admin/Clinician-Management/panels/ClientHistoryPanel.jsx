import { useState } from "react";
import { Building2, Plus, X, Check } from "lucide-react";
import { Btn, ModalShell, FormField, Spinner, StatusBadge, fmtDate } from "./shared.jsx";
import { clinicianService } from "../../../../services/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { QK } from "../../../../lib/queryKeys";

export default function ClientHistoryPanel({ clinicianId, canManage, pcns = [], practices = [] }) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QK.CLINICIAN_CLIENT_HISTORY(clinicianId),
    queryFn:  () => clinicianService.getClientHistory(clinicianId).then((r) => r.data),
    enabled:  !!clinicianId,
  });

  const addM = useMutation({
    mutationFn: (data) => clinicianService.addClientAssignment(clinicianId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_CLIENT_HISTORY(clinicianId) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(clinicianId) });
    },
  });

  const endM = useMutation({
    mutationFn: ({ histId, endDate, reason }) =>
      clinicianService.endClientAssignment(clinicianId, histId, { endDate, reason }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.CLINICIAN_CLIENT_HISTORY(clinicianId) });
      qc.invalidateQueries({ queryKey: QK.CLINICIAN(clinicianId) });
    },
  });

  const [modal, setModal] = useState(null); // 'add' | { histId }
  const [form,  setForm]  = useState({});

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center"><Spinner cls="border-blue-600" /></div>;
  }

  const items = data?.history || [];

  const openAdd = () => {
    setForm({
      pcnId: "", practiceId: "", role: "Clinical Pharmacist",
      startDate: new Date().toISOString().split("T")[0],
      hoursPerWeek: 0, contractType: "ARRS", notes: "",
    });
    setModal("add");
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.pcnId && !form.practiceId) return;
    await addM.mutateAsync(form);
    setModal(null);
  };

  const openEnd = (h) => {
    setForm({ histId: h._id, endDate: new Date().toISOString().split("T")[0], reason: "" });
    setModal({ end: true });
  };
  const submitEnd = async (e) => {
    e.preventDefault();
    await endM.mutateAsync({ histId: form.histId, endDate: form.endDate, reason: form.reason });
    setModal(null);
  };

  const pcnOpts      = pcns.map((p)      => [p._id, p.pcnName || p.name]);
  const practiceOpts = practices.map((p) => [p._id, p.practiceName || p.name]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Building2 size={18} className="text-indigo-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Client history</h3>
        </div>
        {canManage && (
          <Btn variant="outline" size="sm" onClick={openAdd}>
            <Plus size={13} /> Add assignment
          </Btn>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">No client assignments recorded.</p>
      ) : (
        <div className="space-y-2">
          {items.map((h) => {
            const active = !h.endDate || new Date(h.endDate) > new Date();
            return (
              <div key={h._id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {h.pcnName || h.practiceName || h.clientName || "—"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {h.role || "—"} · {h.hoursPerWeek || 0} hrs/week · {h.contractType || "—"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {fmtDate(h.startDate)} → {h.endDate ? fmtDate(h.endDate) : "Ongoing"}
                  </p>
                  {h.endReason && <p className="text-[11px] text-red-500 italic mt-0.5">Ended: {h.endReason}</p>}
                </div>
                <StatusBadge status={active ? "active" : "ended"} />
                {canManage && active && (
                  <Btn variant="ghost" size="sm" onClick={() => openEnd(h)}>End</Btn>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal === "add" && (
        <ModalShell
          title="Add client assignment"
          onClose={() => setModal(null)}
          wide
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">Cancel</Btn>
              <Btn onClick={submitAdd} disabled={addM.isPending || (!form.pcnId && !form.practiceId)} cls="flex-1">
                {addM.isPending ? <Spinner /> : <Check size={14} />} Save
              </Btn>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField label="PCN"      value={form.pcnId}      onChange={(v) => setForm((f) => ({ ...f, pcnId: v, practiceId: v ? "" : f.practiceId }))} options={pcnOpts} />
            <FormField label="Practice" value={form.practiceId} onChange={(v) => setForm((f) => ({ ...f, practiceId: v, pcnId: v ? "" : f.pcnId }))} options={practiceOpts} />
            <FormField label="Role"          value={form.role}         onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
            <FormField label="Contract type" value={form.contractType} onChange={(v) => setForm((f) => ({ ...f, contractType: v }))} options={["ARRS","EA","Direct","Mixed"]} />
            <FormField label="Start date"    value={form.startDate}    onChange={(v) => setForm((f) => ({ ...f, startDate: v }))} type="date" required />
            <FormField label="Hours / week"  value={form.hoursPerWeek} onChange={(v) => setForm((f) => ({ ...f, hoursPerWeek: Number(v) || 0 }))} type="number" />
          </div>
          <FormField label="Notes" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} textarea rows={3} />
        </ModalShell>
      )}

      {modal?.end && (
        <ModalShell
          title="End assignment"
          onClose={() => setModal(null)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">Cancel</Btn>
              <Btn variant="warn" onClick={submitEnd} disabled={endM.isPending} cls="flex-1">
                {endM.isPending ? <Spinner /> : <X size={14} />} End
              </Btn>
            </>
          }
        >
          <FormField label="End date" value={form.endDate} onChange={(v) => setForm((f) => ({ ...f, endDate: v }))} type="date" required />
          <FormField label="Reason"   value={form.reason}  onChange={(v) => setForm((f) => ({ ...f, reason: v }))} textarea rows={3} />
        </ModalShell>
      )}
    </div>
  );
}
