import { useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { useBasePatterns, useCreateBasePattern, useUpdateBasePattern } from "../../../hooks/useBasePattern";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BasePatternPage() {
  const [clinicianId, setClinicianId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ clinician_id: "", surgery_id: "", day_of_week: [], start_time: "09:00", end_time: "17:00", expected_hours: 7.5, contract_type: "ARRS", effective_from: new Date().toISOString().slice(0, 10) });
  const { data: patterns = [] } = useBasePatterns(clinicianId || form.clinician_id);
  const createPattern = useCreateBasePattern();
  const updatePattern = useUpdateBasePattern();
  const toggleDay = (index) => setForm((cur) => ({ ...cur, day_of_week: cur.day_of_week.includes(index) ? cur.day_of_week.filter((day) => day !== index) : [...cur.day_of_week, index] }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-slate-900">Base Patterns</h1><Button onClick={() => setFormOpen(true)}>Add Pattern</Button></div>
      <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <input placeholder="Filter by clinician ID" value={clinicianId} onChange={(e) => setClinicianId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <input placeholder="Surgery" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option>All contracts</option><option>ARRS</option><option>EA</option><option>Direct</option></select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Clinician</th><th className="px-4 py-3">Surgery</th><th className="px-4 py-3">Day</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Contract</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {patterns.map((pattern) => (
              <tr key={pattern.id}><td className="px-4 py-3">{pattern.clinician_id}</td><td className="px-4 py-3">{pattern.surgery_id}</td><td className="px-4 py-3">{days[pattern.day_of_week]}</td><td className="px-4 py-3">{pattern.start_time} - {pattern.end_time}</td><td className="px-4 py-3"><Badge>{pattern.contract_type}</Badge></td><td className="px-4 py-3"><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setEditingId(pattern.id); setForm({ ...pattern, day_of_week: [pattern.day_of_week] }); setFormOpen(true); }}>Edit</Button><Button variant="outline" size="sm" onClick={() => updatePattern.mutate({ id: pattern.id, data: { is_active: false } })}>Deactivate</Button></div></td></tr>
            ))}
            {patterns.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Enter a clinician ID to view active patterns.</td></tr>}
          </tbody>
        </table>
      </div>
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Add Pattern</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["clinician_id", "surgery_id", "start_time", "end_time", "expected_hours", "effective_from"].map((key) => <input key={key} type={key.includes("time") ? "time" : key === "effective_from" ? "date" : "text"} placeholder={key.replace(/_/g, " ")} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />)}
              <select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option>ARRS</option><option>EA</option><option>Direct</option></select>
              <div className="flex flex-wrap gap-2">{days.slice(1, 6).map((label, i) => <button key={label} type="button" onClick={() => toggleDay(i + 1)} className={`rounded-lg border px-3 py-2 text-sm ${form.day_of_week.includes(i + 1) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200"}`}>{label}</button>)}</div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setFormOpen(false); setEditingId(null); }}>Cancel</Button>
              <Button onClick={() => {
                const request = editingId
                  ? updatePattern.mutateAsync({ id: editingId, data: { ...form, day_of_week: form.day_of_week[0] } })
                  : createPattern.mutateAsync(form);
                return request.then(() => { setFormOpen(false); setEditingId(null); });
              }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
