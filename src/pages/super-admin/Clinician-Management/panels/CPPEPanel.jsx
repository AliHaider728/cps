import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Plus, Trash2, Save } from "lucide-react";
import {
  useClinicianCPPE, useUpdateClinicianCPPE,
} from "../../../../hooks/useClinician";
import { Btn, FormField, Spinner, ToggleRow, fmtDate } from "./shared.jsx";

const MOD_STATUS = ["pending", "in_progress", "completed"];

export default function CPPEPanel({ clinicianId, canManage }) {
  const { data, isLoading } = useClinicianCPPE(clinicianId);
  const saveM = useUpdateClinicianCPPE(clinicianId);

  const [state, setState] = useState({
    enrolled: false, exempt: false, completed: false,
    enrolledAt: null, completedAt: null, progressPct: 0,
    modules: [], notes: "",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data?.cppe) {
      setState((prev) => ({ ...prev, ...data.cppe, modules: data.cppe.modules || [] }));
      setDirty(false);
    }
  }, [data]);

  const computedPct = useMemo(() => {
    const mods = state.modules || [];
    if (!mods.length) return state.progressPct || 0;
    const done = mods.filter((m) => m?.status === "completed").length;
    return Math.round((done / mods.length) * 100);
  }, [state.modules, state.progressPct]);

  const set = (patch) => { setState((s) => ({ ...s, ...patch })); setDirty(true); };

  const updateMod = (idx, patch) => {
    setState((s) => {
      const next = [...(s.modules || [])];
      next[idx] = { ...next[idx], ...patch };
      return { ...s, modules: next };
    });
    setDirty(true);
  };

  const addMod = () => {
    setState((s) => ({
      ...s,
      modules: [...(s.modules || []), { name: "", status: "pending", completedAt: null }],
    }));
    setDirty(true);
  };

  const delMod = (idx) => {
    setState((s) => {
      const next = [...(s.modules || [])];
      next.splice(idx, 1);
      return { ...s, modules: next };
    });
    setDirty(true);
  };

  const handleSave = async () => {
    await saveM.mutateAsync({
      enrolled:  !!state.enrolled,
      exempt:    !!state.exempt,
      completed: !!state.completed,
      modules:   state.modules || [],
      notes:     state.notes || "",
    });
    setDirty(false);
  };

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center"><Spinner cls="border-blue-600" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <GraduationCap size={18} className="text-rose-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">CPPE training</h3>
        </div>
        {canManage && (
          <Btn size="sm" onClick={handleSave} disabled={!dirty || saveM.isPending}>
            {saveM.isPending ? <Spinner /> : <Save size={13} />} Save
          </Btn>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <ToggleRow label="Enrolled"  checked={state.enrolled}  onChange={(v) => set({ enrolled: v })}  disabled={!canManage} />
        <ToggleRow label="Exempt"    checked={state.exempt}    onChange={(v) => set({ exempt: v })}    disabled={!canManage} />
        <ToggleRow label="Completed" checked={state.completed} onChange={(v) => set({ completed: v })} disabled={!canManage} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-blue-50 text-blue-700 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Progress</p>
          <p className="text-2xl font-extrabold mt-1">{computedPct}%</p>
        </div>
        <div className="rounded-xl bg-slate-50 text-slate-600 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Enrolled at</p>
          <p className="text-sm font-bold mt-1">{fmtDate(state.enrolledAt)}</p>
        </div>
        <div className="rounded-xl bg-green-50 text-green-700 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Completed at</p>
          <p className="text-sm font-bold mt-1">{fmtDate(state.completedAt)}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modules</p>
          {canManage && (
            <Btn variant="ghost" size="sm" onClick={addMod}>
              <Plus size={12} /> Add module
            </Btn>
          )}
        </div>
        {(state.modules || []).length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
            No modules added yet.
          </p>
        ) : (
          <div className="space-y-2">
            {state.modules.map((m, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50">
                <input
                  value={m.name || ""}
                  onChange={(e) => updateMod(i, { name: e.target.value })}
                  placeholder="Module name"
                  disabled={!canManage}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400"
                />
                <select
                  value={m.status || "pending"}
                  onChange={(e) => updateMod(i, {
                    status: e.target.value,
                    completedAt: e.target.value === "completed" ? (m.completedAt || new Date().toISOString()) : null,
                  })}
                  disabled={!canManage}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  {MOD_STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
                {canManage && (
                  <Btn variant="danger" size="sm" onClick={() => delMod(i)}>
                    <Trash2 size={12} />
                  </Btn>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <FormField
        label="Notes"
        value={state.notes}
        onChange={(v) => set({ notes: v })}
        textarea
        rows={4}
      />
    </div>
  );
}
