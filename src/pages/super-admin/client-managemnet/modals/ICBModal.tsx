import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { ICB, ICBFormState } from "../ICBListPage";

interface ICBModalProps {
  existing: ICB | null;
  onClose: () => void;
  onSave: (form: ICBFormState) => Promise<void>;
}

const ICBModal: React.FC<ICBModalProps> = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState<ICBFormState>({
    name: existing?.name || "",
    region: existing?.region || "",
    code: existing?.code || "",
    notes: existing?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.name.trim()) { setError("ICB name is required"); return; }
    setSaving(true); setError("");
    try { await onSave(form); onClose(); } catch (e: any) { setError(e.message || "An error occurred"); } finally { setSaving(false); }
  };


return (
    <ModalShell
      title={existing ? "Edit ICB" : "Add ICB"}
      onClose={onClose}
      footer={
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all bg-white">Cancel</button>
          <button
            onClick={handle}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
            {existing ? "Save Changes" : "Create ICB"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <div>{error}</div> : null}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">ICB Name *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. NHS Greater Manchester ICB"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Region</label>
            <input
              value={form.region}
              onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
              placeholder="North West"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Code</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="QOP"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
          />
        </div>
      </div>
    </ModalShell>
  );
};

export default ICBModal;
