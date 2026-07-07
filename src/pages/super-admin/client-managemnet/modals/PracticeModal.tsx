import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { ModalShell } from "../../../../components/ui/ModalShell";

interface FProps {
  label: string;
  children: React.ReactNode;
}

export interface ExistingPractice {
  _id?: string;
  name?: string;
  client?: any;
  pcn?: any;
  complianceGroup?: any;
  odsCode?: string;
  address?: string;
  city?: string;
  postcode?: string;
  fte?: string;
  contractType?: string;
  xeroCode?: string;
  xeroCategory?: string;
  patientListSize?: string | number;
  notes?: string;
}

export interface PracticeForm {
  name: string;
  patientListSize: string;
  complianceGroup: string[];
  notes: string;
  address: string;
  city: string;
  postcode: string;
  fte: string;
  contractType: string;
  pcn: string;
  odsCode: string;
  xeroCode: string;
  xeroCategory: string;
}

interface PracticeModalProps {
  existing: ExistingPractice | null;
  pcns: any[];
  groups: any[];
  onClose: () => void;
  onSave: (form: PracticeForm) => Promise<void>;
}

interface FProps {
  label: string;
  children: React.ReactNode;
}

const F: React.FC<FProps> = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
      {label}
    </label>
    {children}
  </div>
);

const buildPracticeForm = (existing?: ExistingPractice | null): PracticeForm => ({
  name:            existing?.name                                                              || "",
  pcn:             existing?.client?._id || existing?.client || existing?.pcn?._id || existing?.pcn || "",
  complianceGroup: Array.isArray(existing?.complianceGroup) ? existing.complianceGroup.map((g: any) => g._id || g) : (existing?.complianceGroup?._id ? [existing.complianceGroup._id] : (existing?.complianceGroup ? [existing.complianceGroup] : [])),
  odsCode:         existing?.odsCode                                                           || "",
  address:         existing?.address                                                           || "",
  city:            existing?.city                                                              || "",
  postcode:        existing?.postcode                                                          || "",
  fte:             existing?.fte                                                               || "",
  contractType:    existing?.contractType                                                      || "",
  xeroCode:        existing?.xeroCode                                                          || "",
  xeroCategory:    existing?.xeroCategory                                                      || "",
  patientListSize: existing?.patientListSize ? String(existing.patientListSize)                : "",
  notes:           existing?.notes                                                             || "",
});

/* ─── Modal ───────────────────────────────────────────────────────────────── */

const PracticeModal: React.FC<PracticeModalProps> = ({ existing, pcns, groups, onClose, onSave }) => {
  const [form, setForm]     = useState<PracticeForm>(() => buildPracticeForm(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => { setForm(buildPracticeForm(existing)); }, [existing]);

  const handle = async () => {
    if (!form.name.trim()) { setError("Practice name is required"); return; }
    if (!form.pcn)         { setError("PCN / Client is required");  return; }
    setSaving(true); setError("");
    try   { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message); }
    finally   { setSaving(false); }
  };

  const input = (key: keyof PracticeForm, placeholder: string, type = "text") => (
    <input type={type} value={form[key]} placeholder={placeholder}
      autoComplete="off" spellCheck={false}
      onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value as any }))}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] transition-all focus:border-blue-400 focus:bg-white focus:outline-none" />
  );


return (
    <ModalShell
      title={existing ? "Edit Practice" : "Add Practice"}
      onClose={onClose}
      footer={
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={handle} disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-[13px] font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-all">
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check size={14} />}
            {existing ? "Save" : "Create Practice"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {error ? <div>{error}</div> : null}

        <F label="Practice Name *">{input("name", "e.g. Pendleton Medical Centre")}</F>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <F label="PCN / Client *">
            <select value={form.pcn} autoComplete="off"
              onChange={(e) => setForm((c) => ({ ...c, pcn: e.target.value }))}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:outline-none">
              <option value="">Select PCN / Client…</option>
              {pcns.map((pcn) => <option key={pcn._id} value={pcn._id}>{pcn.name}</option>)}
            </select>
          </F>
          <F label="ODS Code">{input("odsCode", "P84001")}</F>
        </div>

        <F label="Compliance Groups">
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 [scrollbar-width:thin]">
            {groups.length === 0 && <span className="text-xs text-slate-400">No groups available</span>}
            {groups.map((g) => (
              <label key={g._id} className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
                <input
                  type="checkbox"
                  checked={form.complianceGroup.includes(g._id)}
                  onChange={(e) => {
                    const set = new Set(form.complianceGroup);
                    if (e.target.checked) set.add(g._id);
                    else set.delete(g._id);
                    setForm((c) => ({ ...c, complianceGroup: Array.from(set) }));
                  }}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>{g.name}</span>
              </label>
            ))}
          </div>
        </F>

        <F label="Address">{input("address", "15 Broad Street")}</F>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <F label="City">{input("city", "Salford")}</F>
          <F label="Postcode">{input("postcode", "M6 5BN")}</F>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <F label="FTE">{input("fte", "0.5 FTE (20HRS/WEEK)")}</F>
          <F label="Contract Type">
            <select value={form.contractType} autoComplete="off"
              onChange={(e) => setForm((c) => ({ ...c, contractType: e.target.value }))}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:outline-none">
              <option value="">None</option>
              {["ARRS","EA","Direct","Mixed"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </F>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <F label="Xero Code">{input("xeroCode", "PEN1")}</F>
          <F label="Xero Category">
            <select value={form.xeroCategory} autoComplete="off"
              onChange={(e) => setForm((c) => ({ ...c, xeroCategory: e.target.value }))}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:outline-none">
              <option value="">None</option>
              {["PCN","GPX","EAX"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </F>
        </div>

        <F label="Patient List Size">{input("patientListSize", "0", "number")}</F>

        <F label="Notes">
          <textarea value={form.notes} autoComplete="off" spellCheck={false} rows={3}
            onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:border-blue-400 focus:bg-white focus:outline-none" />
        </F>
      </div>
    </ModalShell>
  );
};

export default PracticeModal;
