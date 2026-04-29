import { useState } from "react";
import { Users, Plus, Trash2, Check } from "lucide-react";
import {
  useClinicianSupervision, useAddSupervisionLog,
  useUpdateSupervisionLog, useDeleteSupervisionLog,
} from "../../../../hooks/useClinicianSupervision";
import { Btn, ModalShell, FormField, Spinner, fmtDate } from "./shared.jsx";

const SESSION_TYPES = ["1:1", "Group", "Clinical", "Pastoral", "Annual Appraisal", "Probation Review"];

export default function SupervisionPanel({ clinicianId, canManage, users = [] }) {
  const { data, isLoading } = useClinicianSupervision(clinicianId);
  const addM = useAddSupervisionLog(clinicianId);
  const updM = useUpdateSupervisionLog(clinicianId);
  const delM = useDeleteSupervisionLog(clinicianId);

  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({});

  const open = (log) => {
    setForm({
      _id:           log?._id || "",
      sessionDate:   log?.sessionDate ? new Date(log.sessionDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      sessionType:   log?.sessionType || "1:1",
      durationMins:  log?.durationMins || 30,
      supervisor:    log?.supervisor?._id || log?.supervisor || "",
      summary:       log?.summary || "",
      actions:       log?.actions || "",
      nextSession:   log?.nextSession ? new Date(log.nextSession).toISOString().split("T")[0] : "",
    });
    setModal(log ? "edit" : "add");
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      sessionDate: form.sessionDate, sessionType: form.sessionType,
      durationMins: Number(form.durationMins) || 0, supervisor: form.supervisor || null,
      summary: form.summary, actions: form.actions, nextSession: form.nextSession || null,
    };
    if (form._id) await updM.mutateAsync({ logId: form._id, data: payload });
    else          await addM.mutateAsync(payload);
    setModal(null);
  };

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center"><Spinner cls="border-blue-600" /></div>;
  }

  const logs = data?.logs || [];
  const userOpts = users.map((u) => [u._id, `${u.fullName || u.email}`]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
            <Users size={18} className="text-cyan-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Supervision logs</h3>
        </div>
        {canManage && (
          <Btn variant="outline" size="sm" onClick={() => open(null)}>
            <Plus size={13} /> Add session
          </Btn>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">No supervision sessions logged yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l._id} className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {l.sessionType} · {fmtDate(l.sessionDate)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {l.durationMins || 0} mins
                    {l.supervisorName && <> · with {l.supervisorName}</>}
                    {l.nextSession && <> · next {fmtDate(l.nextSession)}</>}
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-1.5">
                    <Btn variant="ghost" size="sm" onClick={() => open(l)}>Edit</Btn>
                    <Btn
                      variant="danger" size="sm"
                      onClick={() => { if (window.confirm("Delete this session log?")) delM.mutate(l._id); }}
                    >
                      <Trash2 size={12} />
                    </Btn>
                  </div>
                )}
              </div>
              {l.summary && <p className="text-sm text-slate-600 mt-1">{l.summary}</p>}
              {l.actions && <p className="text-xs text-slate-500 italic mt-1">Actions: {l.actions}</p>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ModalShell
          title={form._id ? "Edit supervision session" : "Add supervision session"}
          onClose={() => setModal(null)}
          wide
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)} cls="flex-1">Cancel</Btn>
              <Btn onClick={submit} disabled={addM.isPending || updM.isPending} cls="flex-1">
                {(addM.isPending || updM.isPending) ? <Spinner /> : <Check size={14} />} Save
              </Btn>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Session date" value={form.sessionDate} onChange={(v) => setForm((f) => ({ ...f, sessionDate: v }))} type="date" required />
            <FormField label="Session type" value={form.sessionType} onChange={(v) => setForm((f) => ({ ...f, sessionType: v }))} options={SESSION_TYPES} />
            <FormField label="Duration (mins)" value={form.durationMins} onChange={(v) => setForm((f) => ({ ...f, durationMins: Number(v) || 0 }))} type="number" />
            <FormField label="Supervisor"     value={form.supervisor}    onChange={(v) => setForm((f) => ({ ...f, supervisor: v }))} options={userOpts} />
          </div>
          <FormField label="Summary"        value={form.summary} onChange={(v) => setForm((f) => ({ ...f, summary: v }))} textarea rows={4} />
          <FormField label="Actions agreed" value={form.actions} onChange={(v) => setForm((f) => ({ ...f, actions: v }))} textarea rows={3} />
          <FormField label="Next session"   value={form.nextSession} onChange={(v) => setForm((f) => ({ ...f, nextSession: v }))} type="date" />
        </ModalShell>
      )}
    </div>
  );
}
