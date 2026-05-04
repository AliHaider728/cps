import { useState } from "react";
import { Users, Plus, Trash2, Check } from "lucide-react";
import {
  useClinicianSupervision,
  useAddSupervisionLog,
  useUpdateSupervisionLog,
  useDeleteSupervisionLog,
} from "../../../../hooks/useClinicianSupervision";
import { Btn, ModalShell, FormField, Spinner, RagBadge, fmtDate } from "./shared.jsx";

// ✅ FIXED: Match backend ragStatus values exactly
const RAG_OPTS = [
  ["green", "Green — No concerns"],
  ["amber", "Amber — Minor concerns"],
  ["red",   "Red — Significant concerns"],
];

export default function SupervisionPanel({ clinicianId, canManage, users = [] }) {
  const { data, isLoading } = useClinicianSupervision(clinicianId);
  const addM = useAddSupervisionLog(clinicianId);
  const updM = useUpdateSupervisionLog(clinicianId);
  const delM = useDeleteSupervisionLog(clinicianId);

  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({});

  // ✅ FIXED: Build form using backend field names (ragStatus, notes, actionItems)
  const open = (log) => {
    setForm({
      _id:         log?._id          || "",
      sessionDate: log?.sessionDate
        ? new Date(log.sessionDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      ragStatus:   log?.ragStatus   || "green",
      supervisor:  log?.supervisor?._id || log?.supervisor || "",
      notes:       log?.notes        || "",
      actionItems: log?.actionItems  || [],
    });
    setModal(log ? "edit" : "add");
  };

  const submit = async () => {
    // ✅ FIXED: Send backend field names
    const payload = {
      sessionDate: form.sessionDate,
      ragStatus:   form.ragStatus,
      supervisor:  form.supervisor || null,
      notes:       form.notes,
      actionItems: form.actionItems || [],
    };
    if (form._id) await updM.mutateAsync({ logId: form._id, data: payload });
    else          await addM.mutateAsync(payload);
    setModal(null);
  };

  // Action items helpers
  const addAction = () => {
    setForm((f) => ({
      ...f,
      actionItems: [...(f.actionItems || []), { text: "", dueDate: "", done: false }],
    }));
  };

  const updateAction = (idx, patch) => {
    setForm((f) => {
      const next = [...(f.actionItems || [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, actionItems: next };
    });
  };

  const removeAction = (idx) => {
    setForm((f) => {
      const next = [...(f.actionItems || [])];
      next.splice(idx, 1);
      return { ...f, actionItems: next };
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <Spinner cls="border-blue-600" />
      </div>
    );
  }

  const logs    = data?.logs || [];
  const userOpts = users.map((u) => [u._id, u.fullName || u.email]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
            <Users size={18} className="text-cyan-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Supervision log</h3>
        </div>
        {canManage && (
          <Btn variant="outline" size="sm" onClick={() => open(null)}>
            <Plus size={13} /> Add session
          </Btn>
        )}
      </div>

      {/* RAG summary strip */}
      {logs.length > 0 && (
        <div className="flex gap-3 mb-5">
          {["green", "amber", "red"].map((rag) => {
            const count = logs.filter((l) => l.ragStatus === rag).length;
            const colors = {
              green: "bg-green-50 text-green-700 border-green-200",
              amber: "bg-amber-50 text-amber-700 border-amber-200",
              red:   "bg-red-50 text-red-700 border-red-200",
            };
            return (
              <div key={rag} className={`flex-1 rounded-xl border p-3 text-center ${colors[rag]}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 capitalize">{rag}</p>
                <p className="text-2xl font-extrabold mt-0.5">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Log list */}
      {logs.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">No supervision sessions logged yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div
              key={l._id}
              className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* ✅ FIXED: ragStatus field */}
                  <RagBadge status={l.ragStatus} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">
                      {/* ✅ FIXED: dd/mm/yy format per blueprint */}
                      {fmtDate(l.sessionDate)}
                    </p>
                    {l.supervisor?.fullName && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Supervisor: {l.supervisor.fullName}
                      </p>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1.5 shrink-0">
                    <Btn variant="ghost" size="sm" onClick={() => open(l)}>Edit</Btn>
                    <Btn
                      variant="danger" size="sm"
                      onClick={() => {
                        if (window.confirm("Delete this supervision log?")) delM.mutate(l._id);
                      }}
                    >
                      <Trash2 size={12} />
                    </Btn>
                  </div>
                )}
              </div>
              {/* ✅ FIXED: notes field */}
              {l.notes && <p className="text-sm text-slate-600 mt-1">{l.notes}</p>}
              {/* ✅ FIXED: actionItems array */}
              {l.actionItems?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {l.actionItems.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        a.done ? "bg-green-100 border-green-400" : "border-slate-300"
                      }`}>
                        {a.done && <Check size={8} className="text-green-600" />}
                      </span>
                      <span className={a.done ? "line-through opacity-60" : ""}>{a.text}</span>
                      {a.dueDate && (
                        <span className="text-slate-400">· due {fmtDate(a.dueDate)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
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
            {/* ✅ FIXED: sessionDate in dd/mm/yy display, ISO for input */}
            <FormField
              label="Session date"
              value={form.sessionDate}
              onChange={(v) => setForm((f) => ({ ...f, sessionDate: v }))}
              type="date"
              required
            />
            {/* ✅ FIXED: ragStatus dropdown */}
            <FormField
              label="RAG status"
              value={form.ragStatus}
              onChange={(v) => setForm((f) => ({ ...f, ragStatus: v }))}
              options={RAG_OPTS}
            />
          </div>
          <FormField
            label="Supervisor"
            value={form.supervisor}
            onChange={(v) => setForm((f) => ({ ...f, supervisor: v }))}
            options={userOpts}
          />
          {/* ✅ FIXED: notes field */}
          <FormField
            label="Session notes"
            value={form.notes}
            onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
            textarea
            rows={4}
          />

          {/* ✅ FIXED: actionItems array */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action items</label>
              <Btn variant="ghost" size="sm" onClick={addAction}>
                <Plus size={12} /> Add
              </Btn>
            </div>
            {(form.actionItems || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-xl">
                No action items
              </p>
            ) : (
              <div className="space-y-2">
                {form.actionItems.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!a.done}
                      onChange={(e) => updateAction(i, { done: e.target.checked })}
                      className="accent-blue-600 w-4 h-4 shrink-0"
                    />
                    <input
                      value={a.text || ""}
                      onChange={(e) => updateAction(i, { text: e.target.value })}
                      placeholder="Action item…"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="date"
                      value={a.dueDate || ""}
                      onChange={(e) => updateAction(i, { dueDate: e.target.value })}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 w-36"
                    />
                    <Btn variant="danger" size="sm" onClick={() => removeAction(i)}>
                      <Trash2 size={12} />
                    </Btn>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}