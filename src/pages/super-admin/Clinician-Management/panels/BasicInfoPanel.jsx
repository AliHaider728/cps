import { useEffect, useState } from "react";
import { Edit2, Save, X, User } from "lucide-react";
import { Btn, FormField, DetailRow, Spinner, fmtDate } from "./shared.jsx";

const TYPE_OPTS     = ["Pharmacist", "Technician", "IP"];
const CONTRACT_OPTS = ["ARRS", "EA", "Direct", "Mixed"];

export default function BasicInfoPanel({ clinician, onPatch, users = [] }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({});

  const build = () => ({
    fullName:      clinician?.fullName      || "",
    clinicianType: clinician?.clinicianType || "Pharmacist",
    gphcNumber:    clinician?.gphcNumber    || "",
    smartCard:     clinician?.smartCard     || "",
    phone:         clinician?.phone         || "",
    email:         clinician?.email         || "",
    addressLine1:  clinician?.addressLine1  || "",
    addressLine2:  clinician?.addressLine2  || "",
    city:          clinician?.city          || "",
    postcode:      clinician?.postcode      || "",
    contractType:  clinician?.contractType  || "ARRS",
    noticePeriod:  clinician?.noticePeriod  || "",
    workingHours:  clinician?.workingHours  || 0,
    startDate:     clinician?.startDate ? new Date(clinician.startDate).toISOString().split("T")[0] : "",
    endDate:       clinician?.endDate   ? new Date(clinician.endDate).toISOString().split("T")[0]   : "",
    opsLead:       clinician?.opsLead?._id    || clinician?.opsLead    || "",
    supervisor:    clinician?.supervisor?._id || clinician?.supervisor || "",
  });

  useEffect(() => { setForm(build()); /* eslint-disable-next-line */ }, [clinician]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onPatch(form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const userOpts = (users || []).map((u) => [u._id, `${u.fullName || u.email} (${u.role || "user"})`]);
  const opsLeadName = (() => {
    const u = users.find((x) => String(x._id) === String(form.opsLead || clinician?.opsLead?._id || clinician?.opsLead));
    return u?.fullName || clinician?.opsLead?.fullName || "";
  })();
  const supervisorName = (() => {
    const u = users.find((x) => String(x._id) === String(form.supervisor || clinician?.supervisor?._id || clinician?.supervisor));
    return u?.fullName || clinician?.supervisor?.fullName || "";
  })();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <User size={18} className="text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Basic information</h3>
        </div>
        {!editing ? (
          <Btn variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 size={13} /> Edit
          </Btn>
        ) : (
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm" onClick={() => { setForm(build()); setEditing(false); }}>
              <X size={13} /> Cancel
            </Btn>
            <Btn size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Spinner /> : <Save size={13} />} Save
            </Btn>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="grid md:grid-cols-2 gap-x-8">
          <div>
            <DetailRow label="Full name"      value={clinician?.fullName} />
            <DetailRow label="Type"           value={clinician?.clinicianType} />
            <DetailRow label="GPhC number"    value={clinician?.gphcNumber} mono />
            <DetailRow label="Smart card"     value={clinician?.smartCard} mono />
            <DetailRow label="Email"          value={clinician?.email} />
            <DetailRow label="Phone"          value={clinician?.phone} />
            <DetailRow label="Address"        value={[clinician?.addressLine1, clinician?.addressLine2, clinician?.city, clinician?.postcode].filter(Boolean).join(", ")} />
          </div>
          <div>
            <DetailRow label="Contract type"  value={clinician?.contractType} />
            <DetailRow label="Working hours"  value={clinician?.workingHours ? `${clinician.workingHours} hrs/week` : "—"} />
            <DetailRow label="Notice period"  value={clinician?.noticePeriod} />
            <DetailRow label="Start date"     value={fmtDate(clinician?.startDate)} />
            <DetailRow label="End date"       value={fmtDate(clinician?.endDate)} />
            <DetailRow label="Ops lead"       value={opsLeadName} />
            <DetailRow label="Supervisor"     value={supervisorName} />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Full name"      value={form.fullName}      onChange={set("fullName")} required />
          <FormField label="Type"           value={form.clinicianType} onChange={set("clinicianType")} options={TYPE_OPTS} />
          <FormField label="GPhC number"    value={form.gphcNumber}    onChange={set("gphcNumber")} />
          <FormField label="Smart card"     value={form.smartCard}     onChange={set("smartCard")} />
          <FormField label="Email"          value={form.email}         onChange={set("email")} type="email" />
          <FormField label="Phone"          value={form.phone}         onChange={set("phone")} />
          <FormField label="Address line 1" value={form.addressLine1}  onChange={set("addressLine1")} cls="md:col-span-2" />
          <FormField label="Address line 2" value={form.addressLine2}  onChange={set("addressLine2")} cls="md:col-span-2" />
          <FormField label="City"           value={form.city}          onChange={set("city")} />
          <FormField label="Postcode"       value={form.postcode}      onChange={set("postcode")} />

          <div className="md:col-span-2 mt-2 mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Contract</div>
          <FormField label="Contract type"  value={form.contractType}  onChange={set("contractType")} options={CONTRACT_OPTS} />
          <FormField label="Working hours"  value={form.workingHours}  onChange={(v) => set("workingHours")(Number(v) || 0)} type="number" />
          <FormField label="Notice period"  value={form.noticePeriod}  onChange={set("noticePeriod")} placeholder="e.g. 1 month" />
          <div />
          <FormField label="Start date"     value={form.startDate}     onChange={set("startDate")} type="date" />
          <FormField label="End date"       value={form.endDate}       onChange={set("endDate")} type="date" />

          <div className="md:col-span-2 mt-2 mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">People</div>
          <FormField label="Ops lead"       value={form.opsLead}       onChange={set("opsLead")} options={userOpts} />
          <FormField label="Supervisor"     value={form.supervisor}    onChange={set("supervisor")} options={userOpts} />
        </div>
      )}
    </div>
  );
}
