import { useEffect, useState } from "react";
import { Edit2, Save, X, User, Sparkles, Plus, Trash2, Pencil, Check } from "lucide-react";
import { Btn, FormField, DetailRow, Spinner } from "./shared.jsx";
import { fmtDate } from "../../../../lib/formatters";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../../../components/ui/alert-dialog.jsx";

const TYPE_OPTS     = ["Pharmacist", "Technician", "IP"];
const CONTRACT_OPTS = ["ARRS", "EA", "Direct", "Mixed"];

const COMMON_SPECIALISMS = [
  "Diabetes", "Asthma", "COPD", "Hypertension", "Heart Failure",
  "Anticoagulation", "Polypharmacy", "Frailty", "Mental Health",
  "Pain Management", "Care Homes", "Structured Medication Reviews",
];

export default function BasicInfoPanel({
  clinician,
  onPatch,
  onLinkUser,
  users = [],
  canManage = false,
}) {
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form,      setForm]      = useState({});

  // Skills state
  const [specs,        setSpecs]        = useState([]);
  const [extraSpec,    setExtraSpec]    = useState("");
  const [editingSpec,  setEditingSpec]  = useState(null);  // index being edited
  const [editSpecVal,  setEditSpecVal]  = useState("");
  const [future,       setFuture]       = useState("");
  const [skillsDirty,  setSkillsDirty]  = useState(false);
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [specToDelete, setSpecToDelete] = useState(null);  // spec string pending delete confirm

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

  useEffect(() => {
    setForm(build());
    setSpecs(clinician?.specialisms || []);
    setFuture(clinician?.futurePotential || "");
    setSkillsDirty(false);
    setEditingSpec(null);
    /* eslint-disable-next-line */
  }, [clinician]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await onPatch(form);
      setEditing(false);
    } catch (err) {
      setSaveError(err?.response?.data?.message || err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Skills helpers ─────────────────────────── */
  const toggleSpec = (s) => {
    setSkillsDirty(true);
    setSpecs((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);
  };

  const addExtraSpec = () => {
    const v = extraSpec.trim();
    if (!v || specs.includes(v)) return;
    setSpecs((cur) => [...cur, v]);
    setSkillsDirty(true);
    setExtraSpec("");
  };

  // Start inline edit of a spec chip
  const startEditSpec = (idx) => {
    setEditingSpec(idx);
    setEditSpecVal(specs[idx]);
  };

  // Confirm inline edit
  const confirmEditSpec = () => {
    const v = editSpecVal.trim();
    if (!v) { setEditingSpec(null); return; }
    setSpecs((cur) => cur.map((s, i) => (i === editingSpec ? v : s)));
    setSkillsDirty(true);
    setEditingSpec(null);
  };

  // Actually delete after dialog confirm
  const confirmDeleteSpec = () => {
    if (specToDelete === null) return;
    setSpecs((cur) => cur.filter((s) => s !== specToDelete));
    setSkillsDirty(true);
    setSpecToDelete(null);
  };

  const handleSkillsSave = async () => {
    setSkillsSaving(true);
    try {
      await onPatch({ specialisms: specs, futurePotential: future });
      setSkillsDirty(false);
    } finally {
      setSkillsSaving(false);
    }
  };

  const allSpecOpts = Array.from(new Set([...COMMON_SPECIALISMS, ...specs]));

  /* ── User label helpers ─────────────────────── */
  const userLabel = (u) => u?.fullName || u?.name || u?.email || "User";

  const userOpts = (users || []).map((u) => [
    u._id || u.id,
    `${userLabel(u)} (${u.role || "user"})`,
  ]);

  const opsLeadName = (() => {
    const u = users.find((x) => String(x._id || x.id) === String(form.opsLead || clinician?.opsLead?._id || clinician?.opsLead));
    return userLabel(u) || userLabel(clinician?.opsLead) || "";
  })();
  const supervisorName = (() => {
    const u = users.find((x) => String(x._id || x.id) === String(form.supervisor || clinician?.supervisor?._id || clinician?.supervisor));
    return userLabel(u) || userLabel(clinician?.supervisor) || "";
  })();

  return (
    <div className="space-y-4">

      {/* ── Basic Info Card ── */}
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
              <DetailRow label="Full name"     value={clinician?.fullName} />
              <DetailRow label="Type"          value={clinician?.clinicianType} />
              <DetailRow label="GPhC number"   value={clinician?.gphcNumber} mono />
              <DetailRow label="Smart card"    value={clinician?.smartCard} mono />
              <DetailRow label="Email"         value={clinician?.email} />
              <DetailRow label="Phone"         value={clinician?.phone} />
              <DetailRow label="Address"       value={[clinician?.addressLine1, clinician?.addressLine2, clinician?.city, clinician?.postcode].filter(Boolean).join(", ")} />
            </div>
            <div>
              <DetailRow label="Contract type" value={clinician?.contractType} />
              <DetailRow label="Working hours" value={clinician?.workingHours ? `${clinician.workingHours} hrs/week` : "—"} />
              <DetailRow label="Notice period" value={clinician?.noticePeriod} />
              <DetailRow label="Start date"    value={fmtDate(clinician?.startDate)} />
              <DetailRow label="End date"      value={fmtDate(clinician?.endDate)} />
              <DetailRow label="Ops lead"      value={opsLeadName} />
              <DetailRow label="Supervisor"    value={supervisorName} />
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

        {saveError && (
          <p className="mt-4 text-sm font-medium text-red-600">{saveError}</p>
        )}
      </div>

      {/* ── Skills & Specialisms Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Skills &amp; specialism</h3>
          </div>
          <Btn size="sm" onClick={handleSkillsSave} disabled={!skillsDirty || skillsSaving}>
            {skillsSaving ? <Spinner /> : <Save size={13} />} Save
          </Btn>
        </div>

        {/* ── Quick-toggle common specialisms ── */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick add</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SPECIALISMS.map((s) => {
              const on = specs.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpec(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                    ${on
                      ? "bg-purple-50 border-purple-300 text-purple-700"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                >
                  {on ? "✓ " : ""}{s}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Current specialisms list (editable chips) ── */}
        {specs.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Current specialisms
            </p>
            <div className="flex flex-wrap gap-2">
              {specs.map((s, idx) => (
                <div
                  key={`${s}-${idx}`}
                  className="group flex items-center gap-1 pl-3 pr-1 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700"
                >
                  {editingSpec === idx ? (
                    /* ── Inline edit mode ── */
                    <>
                      <input
                        autoFocus
                        value={editSpecVal}
                        onChange={(e) => setEditSpecVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEditSpec();
                          if (e.key === "Escape") setEditingSpec(null);
                        }}
                        className="w-32 text-xs bg-white border border-purple-300 rounded-lg px-2 py-0.5 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={confirmEditSpec}
                        className="h-5 w-5 rounded-md flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors"
                        title="Confirm"
                      >
                        <Check size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSpec(null)}
                        className="h-5 w-5 rounded-md flex items-center justify-center text-slate-400 hover:bg-purple-200 transition-colors"
                        title="Cancel"
                      >
                        <X size={11} />
                      </button>
                    </>
                  ) : (
                    /* ── Display mode ── */
                    <>
                      <span className="text-xs font-bold">{s}</span>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => startEditSpec(idx)}
                        className="h-5 w-5 rounded-md flex items-center justify-center text-purple-400 hover:text-purple-700 hover:bg-purple-200 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={10} />
                      </button>

                      {/* Delete button — triggers AlertDialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSpecToDelete(s)}
                            className="h-5 w-5 rounded-md flex items-center justify-center text-purple-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={10} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove specialism?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove <strong>"{s}"</strong> from this clinician's specialisms? You can add it again any time.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSpecToDelete(null)}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={confirmDeleteSpec}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Add custom specialism ── */}
        <div className="flex gap-2 mb-6">
          <input
            value={extraSpec}
            onChange={(e) => setExtraSpec(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExtraSpec())}
            placeholder="Add custom specialism…"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-purple-400"
          />
          <Btn variant="ghost" size="sm" onClick={addExtraSpec} disabled={!extraSpec.trim()}>
            <Plus size={13} /> Add
          </Btn>
        </div>

        <FormField
          label="Future potential / development notes"
          value={future}
          onChange={(v) => { setFuture(v); setSkillsDirty(true); }}
          textarea
          rows={5}
          placeholder="Career aspirations, areas of interest, training goals…"
        />
      </div>

      {/* Login mapping card — temporarily hidden */}
      {/* {canManage && onLinkUser && ( ... )} */}

    </div>
  );
}