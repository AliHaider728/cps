/**
 * ClientFormModals.jsx
 * All create/edit modals for the Client Management module.
 * 
 * Modals:
 *  1. ICBModal         — ICB
 *  2. FederationModal  — Federation / INT  (NEW — was missing)
 *  3. PCNModal         — PCN (now includes Federation dropdown + contract/xero fields)
 *  4. PracticeModal    — Practice (now includes full onboarding checklist fields)
 */
import { Loader2, Check, Building2, Network, Stethoscope, Layers } from "lucide-react";
import { Modal, Field, Input, Textarea, Btn } from "./ClientUtils.jsx";

/* ── Shared save footer ── */
function Footer({ onClose, onSave, saving }) {
  return (
    <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100 justify-end">
      <Btn variant="outline" onClick={onClose}>Cancel</Btn>
      <Btn onClick={onSave} disabled={saving}>
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        {saving ? "Saving…" : "Save"}
      </Btn>
    </div>
  );
}

/* ── Select field ── */
function Select({ value, onChange, children, className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
        bg-slate-50 text-slate-800
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        focus:bg-white transition-all ${className}`}
    >
      {children}
    </select>
  );
}

/* ── Modal header ── */
function ModalHeader({ icon: Icon, iconBg, iconColor, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon size={15} className={iconColor} />
      </div>
      <span>{title}</span>
    </div>
  );
}

/*  
   1. ICB Modal
  */
export function ICBModal({ mode, form, setForm, onSave, onClose, saving }) {
  const s = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <Modal
      title={<ModalHeader icon={Building2} iconBg="bg-blue-100" iconColor="text-blue-600"
        title={mode === "add" ? "Add ICB" : "Edit ICB"} />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <Field label="ICB Name" required>
          <Input value={form.name} onChange={e => s("name", e.target.value)}
            placeholder="e.g. NHS Greater Manchester ICB" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Region">
            <Input value={form.region} onChange={e => s("region", e.target.value)}
              placeholder="e.g. North West" />
          </Field>
          <Field label="Code">
            <Input value={form.code} onChange={e => s("code", e.target.value)}
              placeholder="e.g. QOP" />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={form.notes} onChange={e => s("notes", e.target.value)} />
        </Field>
      </div>
      <Footer onClose={onClose} onSave={onSave} saving={saving} />
    </Modal>
  );
}

/*  
   2. Federation / INT Modal  (NEW)
  */
export function FederationModal({ mode, form, setForm, icbs, onSave, onClose, saving }) {
  const s = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <Modal
      title={<ModalHeader icon={Layers} iconBg="bg-indigo-100" iconColor="text-indigo-600"
        title={mode === "add" ? "Add Federation / INT" : "Edit Federation / INT"} />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <Input value={form.name} onChange={e => s("name", e.target.value)}
            placeholder="e.g. Salford Together Federation" />
        </Field>
        <Field label="ICB" required>
          <Select value={form.icb} onChange={e => s("icb", e.target.value)}>
            <option value="">Select ICB…</option>
            {(icbs || []).map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </Select>
        </Field>
        <Field label="Type">
          <Select value={form.type} onChange={e => s("type", e.target.value)}>
            <option value="federation">Federation</option>
            <option value="INT">Integrated Neighbourhood Team (INT)</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Notes">
          <Textarea value={form.notes} onChange={e => s("notes", e.target.value)} />
        </Field>
      </div>
      <Footer onClose={onClose} onSave={onSave} saving={saving} />
    </Modal>
  );
}

/*  
   3. PCN Modal — fully updated
  */
export function PCNModal({ mode, form, setForm, icbs, federations, onSave, onClose, saving }) {
  const s = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Filter federations by selected ICB
  const filteredFeds = (federations || []).filter(f =>
    !form.icb || String(f.icb?._id || f.icb) === String(form.icb)
  );

  return (
    <Modal
      title={<ModalHeader icon={Network} iconBg="bg-purple-100" iconColor="text-purple-600"
        title={mode === "add" ? "Add PCN" : "Edit PCN"} />}
      onClose={onClose}
      width="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Core */}
        <Section title="Core Details">
          <div className="space-y-3">
            <Field label="PCN Name" required>
              <Input value={form.name} onChange={e => s("name", e.target.value)}
                placeholder="e.g. Salford Central PCN" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="ICB" required>
                <Select value={form.icb} onChange={e => { s("icb", e.target.value); s("federation", ""); }}>
                  <option value="">Select ICB…</option>
                  {(icbs || []).map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                </Select>
              </Field>
              <Field label="Federation / INT">
                <Select value={form.federation} onChange={e => s("federation", e.target.value)}>
                  <option value="">Select Federation…</option>
                  {filteredFeds.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </Section>

        {/* Contract & Financial */}
        <Section title="Contract & Financial">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Contract Type">
              <Select value={form.contractType} onChange={e => s("contractType", e.target.value)}>
                <option value="">Select…</option>
                <option value="ARRS">ARRS</option>
                <option value="EA">EA</option>
                <option value="Direct">Direct</option>
                <option value="Mixed">Mixed</option>
              </Select>
            </Field>
            <Field label="Annual Spend (£)">
              <Input type="number" value={form.annualSpend} onChange={e => s("annualSpend", e.target.value)}
                placeholder="0" min="0" />
            </Field>
            <Field label="Contract Renewal Date">
              <Input type="date" value={form.contractRenewalDate} onChange={e => s("contractRenewalDate", e.target.value)} />
            </Field>
            <Field label="Contract Expiry Date">
              <Input type="date" value={form.contractExpiryDate} onChange={e => s("contractExpiryDate", e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Xero */}
        <Section title="Xero Codes">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Xero Code">
              <Input value={form.xeroCode} onChange={e => s("xeroCode", e.target.value)} placeholder="e.g. SAL1" />
            </Field>
            <Field label="Category">
              <Select value={form.xeroCategory} onChange={e => s("xeroCategory", e.target.value)}>
                <option value="">Select…</option>
                <option value="PCN">PCN</option>
                <option value="GPX">GPX</option>
                <option value="EAX">EAX</option>
              </Select>
            </Field>
          </div>
        </Section>

        {/* Notes */}
        <Field label="Notes">
          <Textarea value={form.notes} onChange={e => s("notes", e.target.value)}
            placeholder="Internal notes…" />
        </Field>
      </div>
      <Footer onClose={onClose} onSave={onSave} saving={saving} />
    </Modal>
  );
}

/*  
   4. Practice / Surgery Modal — fully updated
  */
export function PracticeModal({ mode, form, setForm, pcns, onSave, onClose, saving }) {
  const s = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal
      title={<ModalHeader icon={Stethoscope} iconBg="bg-emerald-100" iconColor="text-emerald-600"
        title={mode === "add" ? "Add Practice / Surgery" : "Edit Practice / Surgery"} />}
      onClose={onClose}
      width="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Core */}
        <Section title="Core Details">
          <div className="space-y-3">
            <Field label="Practice Name" required>
              <Input value={form.name} onChange={e => s("name", e.target.value)}
                placeholder="e.g. Pendleton Medical Centre" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="PCN" required>
                <Select value={form.pcn} onChange={e => s("pcn", e.target.value)}>
                  <option value="">Select PCN…</option>
                  {(pcns || []).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label="ODS Code">
                <Input value={form.odsCode} onChange={e => s("odsCode", e.target.value)} placeholder="e.g. P84001" />
              </Field>
            </div>
          </div>
        </Section>

        {/* Address */}
        <Section title="Address">
          <div className="space-y-3">
            <Field label="Street Address">
              <Input value={form.address} onChange={e => s("address", e.target.value)} placeholder="Street address" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <Input value={form.city} onChange={e => s("city", e.target.value)} placeholder="City" />
              </Field>
              <Field label="Postcode">
                <Input value={form.postcode} onChange={e => s("postcode", e.target.value)} placeholder="Postcode" />
              </Field>
            </div>
          </div>
        </Section>

        {/* Contract */}
        <Section title="Contract & Finance">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Contract Type">
              <Select value={form.contractType} onChange={e => s("contractType", e.target.value)}>
                <option value="">Select…</option>
                <option value="ARRS">ARRS</option>
                <option value="EA">EA</option>
                <option value="Direct">Direct</option>
                <option value="Mixed">Mixed</option>
              </Select>
            </Field>
            <Field label="FTE">
              <Input value={form.fte} onChange={e => s("fte", e.target.value)}
                placeholder="e.g. 0.5 FTE (20HRS/WEEK)" />
            </Field>
            <Field label="Xero Code">
              <Input value={form.xeroCode} onChange={e => s("xeroCode", e.target.value)} placeholder="e.g. PEN1" />
            </Field>
            <Field label="Xero Category">
              <Select value={form.xeroCategory} onChange={e => s("xeroCategory", e.target.value)}>
                <option value="">Select…</option>
                <option value="GPX">GPX</option>
                <option value="PCN">PCN</option>
                <option value="EAX">EAX</option>
              </Select>
            </Field>
          </div>
        </Section>

        {/* System Access */}
        <Section title="System Access Notes">
          <Textarea value={form.systemAccessNotes} onChange={e => s("systemAccessNotes", e.target.value)}
            placeholder="e.g. EMIS Web — full access granted. ICE, AccuRx, Docman required." />
        </Section>

        {/* Notes */}
        <Field label="Internal Notes">
          <Textarea value={form.notes} onChange={e => s("notes", e.target.value)} />
        </Field>
      </div>
      <Footer onClose={onClose} onSave={onSave} saving={saving} />
    </Modal>
  );
}

/* ── Section wrapper ── */
function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</p>
      {children}
    </div>
  );
}