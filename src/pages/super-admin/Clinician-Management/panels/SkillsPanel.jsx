import { useEffect, useState } from "react";
import { Sparkles, Save, Plus, X } from "lucide-react";
import { Btn, FormField, Spinner } from "./shared.jsx";

const COMMON_SPECIALISMS = [
  "Diabetes", "Asthma", "COPD", "Hypertension", "Heart Failure",
  "Anticoagulation", "Polypharmacy", "Frailty", "Mental Health",
  "Pain Management", "Care Homes", "Structured Medication Reviews",
];

export default function SkillsPanel({ clinician, onPatch }) {
  const [specs,  setSpecs]  = useState([]);
  const [extra,  setExtra]  = useState("");
  const [future, setFuture] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty,  setDirty]  = useState(false);

  useEffect(() => {
    setSpecs(clinician?.specialisms || []);
    setFuture(clinician?.futurePotential || "");
    setDirty(false);
  }, [clinician]);

  const toggle = (s) => {
    setDirty(true);
    setSpecs((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);
  };

  const addExtra = () => {
    const v = extra.trim();
    if (!v) return;
    if (!specs.includes(v)) {
      setSpecs((cur) => [...cur, v]);
      setDirty(true);
    }
    setExtra("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onPatch({ specialisms: specs, futurePotential: future });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const allOpts = Array.from(new Set([...COMMON_SPECIALISMS, ...specs]));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <Sparkles size={18} className="text-purple-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Skills &amp; specialism</h3>
        </div>
        <Btn size="sm" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? <Spinner /> : <Save size={13} />} Save
        </Btn>
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Specialisms</p>
        <div className="flex flex-wrap gap-2">
          {allOpts.map((s) => {
            const on = specs.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                  ${on
                    ? "bg-purple-50 border-purple-300 text-purple-700"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExtra())}
            placeholder="Add custom specialism…"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400"
          />
          <Btn variant="ghost" size="sm" onClick={addExtra} disabled={!extra.trim()}>
            <Plus size={13} /> Add
          </Btn>
        </div>
      </div>

      <FormField
        label="Future potential / development notes"
        value={future}
        onChange={(v) => { setFuture(v); setDirty(true); }}
        textarea
        rows={5}
        placeholder="Career aspirations, areas of interest, training goals…"
      />
    </div>
  );
}
