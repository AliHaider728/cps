import { Loader2, Check } from "lucide-react";
import { Modal, Field, Input, Textarea, Btn } from "../clients/ClientUtils.jsx";

export function ICBModal({ mode, form, setForm, onSave, onClose, saving }) {
  return (
    <Modal title={mode === "add" ? "Add ICB" : "Edit ICB"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="ICB Name">
          <Input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. NHS Greater Manchester ICB"
          />
        </Field>
        <Field label="Region">
          <Input
            value={form.region}
            onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
            placeholder="e.g. North West"
          />
        </Field>
        <Field label="Notes">
          <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <Btn onClick={onClose} variant="outline">Cancel</Btn>
        <Btn onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>} Save
        </Btn>
      </div>
    </Modal>
  );
}

export function PCNModal({ mode, form, setForm, icbs, onSave, onClose, saving }) {
  return (
    <Modal title={mode === "add" ? "Add PCN" : "Edit PCN"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="PCN Name">
          <Input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Salford Central PCN"
          />
        </Field>
        <Field label="ICB">
          <select
            value={form.icb}
            onChange={e => setForm(p => ({ ...p, icb: e.target.value }))}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
              bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">Select ICB…</option>
            {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
        </Field>
        <Field label="Federation / INT">
          <Input
            value={form.federation}
            onChange={e => setForm(p => ({ ...p, federation: e.target.value }))}
            placeholder="Federation or INT name"
          />
        </Field>
        <Field label="Annual Spend (£)">
          <Input
            type="number"
            value={form.annualSpend}
            onChange={e => setForm(p => ({ ...p, annualSpend: e.target.value }))}
            placeholder="0"
          />
        </Field>
        <Field label="Notes">
          <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <Btn onClick={onClose} variant="outline">Cancel</Btn>
        <Btn onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>} Save
        </Btn>
      </div>
    </Modal>
  );
}

export function PracticeModal({ mode, form, setForm, pcns, onSave, onClose, saving }) {
  return (
    <Modal title={mode === "add" ? "Add Practice" : "Edit Practice"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Practice Name">
          <Input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Pendleton Medical Centre"
          />
        </Field>
        <Field label="PCN">
          <select
            value={form.pcn}
            onChange={e => setForm(p => ({ ...p, pcn: e.target.value }))}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
              bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">Select PCN…</option>
            {pcns.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Address">
          <Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
        </Field>
        <Field label="ODS Code">
          <Input
            value={form.odsCode}
            onChange={e => setForm(p => ({ ...p, odsCode: e.target.value }))}
            placeholder="NHS ODS code"
          />
        </Field>
        <Field label="System Access Notes">
          <Textarea
            value={form.systemAccessNotes}
            onChange={e => setForm(p => ({ ...p, systemAccessNotes: e.target.value }))}
          />
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <Btn onClick={onClose} variant="outline">Cancel</Btn>
        <Btn onClick={onSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>} Save
        </Btn>
      </div>
    </Modal>
  );
}