import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { ModalShell } from "../../../../components/ui/ModalShell";

export interface FedFormState {
  name: string;
  icb: string;
  type: string;
  notes: string;
}

export interface FedModalProps {
  existing?: any;
  icbs: any[];
  onClose: () => void;
  onSave: (form: FedFormState) => Promise<void>;
}

const FedModal = ({ existing, icbs, onClose, onSave }: FedModalProps) => {
  const [form, setForm] = useState<FedFormState>({
    name: existing?.name || "",
    icb: existing?.icb?._id || existing?.icb || "",
    type: existing?.type || "federation",
    notes: existing?.notes || "",
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handle = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.icb) { setError("ICB is required"); return; }
    setSaving(true); setError("");
    try { await onSave(form); onClose(); } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

return (
    <ModalShell
      title={existing ? "Edit Federation" : "Add Federation / INT"}
      onClose={onClose}
      footer={
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all bg-white">Cancel</button>
          <button
            onClick={handle}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
            {existing ? "Save" : "Create"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <div>{error}</div> : null}

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Salford Together Federation"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">ICB *</label>
          <select
            value={form.icb}
            onChange={e => setForm(f => ({ ...f, icb: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">Select ICB...</option>
            {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {["federation", "INT", "other"].map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all 
                  ${form.type === t
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
          />
        </div>
      </div>
    </ModalShell>
  );
};

export default FedModal;
