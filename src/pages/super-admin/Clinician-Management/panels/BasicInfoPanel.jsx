import { useEffect, useState } from "react";
import { Edit2, Save, X, User, Link2, KeyRound } from "lucide-react";
import { clinicianService } from "../../../../services/api/clinicianService";
import { Btn, FormField, DetailRow, Spinner, fmtDate } from "./shared.jsx";

const TYPE_OPTS     = ["Pharmacist", "Technician", "IP"];
const CONTRACT_OPTS = ["ARRS", "EA", "Direct", "Mixed"];

export default function BasicInfoPanel({
  clinician,
  onPatch,
  onLinkUser,
  users = [],
  canManage = false,
}) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form,    setForm]    = useState({});
  const [linkUserId, setLinkUserId] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState("");
  const [newLoginEmail, setNewLoginEmail] = useState("");
  const [loginSaving, setLoginSaving] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");

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
    setLinkUserId(
      clinician?.user?._id || clinician?.user?.id || clinician?.user || clinician?.userId || ""
    );
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

  const handleLinkUser = async () => {
    if (!onLinkUser) return;
    const label = linkUserId
      ? userOpts.find(([id]) => String(id) === String(linkUserId))?.[1]
      : "none";
    if (
      linkUserId &&
      !window.confirm(`Link this clinician profile to ${label || "selected user"}?`)
    ) {
      return;
    }
    if (!linkUserId && !window.confirm("Remove login link from this clinician profile?")) {
      return;
    }
    setLinking(true);
    setLinkMsg("");
    try {
      await onLinkUser(linkUserId || null);
      setLinkMsg(linkUserId ? "Login mapping updated." : "Login link removed.");
    } catch (err) {
      setLinkMsg(err?.response?.data?.message || err?.message || "Could not update login mapping.");
    } finally {
      setLinking(false);
    }
  };

  const userLabel = (u) =>
    u?.fullName || u?.name || u?.email || "User";

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

  const clinicianUserOpts = (users || [])
    .filter((u) => String(u.role || "").toLowerCase() === "clinician")
    .map((u) => [u._id || u.id, `${userLabel(u)} (${u.email || ""})`]);

  const linkedUserLabel = (() => {
    const uid = clinician?.user?._id || clinician?.user?.id || clinician?.user || clinician?.userId;
    const u = users.find((x) => String(x._id || x.id) === String(uid));
    return u ? `${userLabel(u)} (${u.email || ""})` : "Not linked";
  })();

  return (
    <div className="space-y-4">
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

      {saveError && (
        <p className="mt-4 text-sm font-medium text-red-600">{saveError}</p>
      )}
    </div>

    {canManage && (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={16} className="text-blue-600" />
          <h3 className="text-base font-bold text-slate-800">Clinician login</h3>
        </div>
        <p className="text-sm text-slate-500 mb-3">
          Current login email:{" "}
          <strong className="text-slate-800">
            {linkedUserLabel.includes("Not linked") ? "—" : linkedUserLabel.match(/\(([^)]+)\)/)?.[1] || linkedUserLabel}
          </strong>
        </p>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New login email</label>
        <input
          type="email"
          value={newLoginEmail}
          onChange={(e) => setNewLoginEmail(e.target.value)}
          placeholder="Update linked user email"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm mb-3"
        />
        <div className="flex flex-wrap gap-2">
          <Btn
            size="sm"
            disabled={loginSaving || !newLoginEmail.trim()}
            onClick={async () => {
              setLoginSaving(true);
              setLoginMsg("");
              try {
                await clinicianService.updateUserLogin(clinician._id || clinician.id, newLoginEmail.trim());
                setLoginMsg("Login email updated.");
                setNewLoginEmail("");
              } catch (err) {
                setLoginMsg(err?.response?.data?.message || "Update failed.");
              } finally {
                setLoginSaving(false);
              }
            }}
          >
            Save email
          </Btn>
          <Btn
            size="sm"
            variant="outline"
            disabled={resettingPw || linkedUserLabel.includes("Not linked")}
            onClick={async () => {
              if (!window.confirm("Send a temporary password to the clinician's email?")) return;
              setResettingPw(true);
              setLoginMsg("");
              try {
                const { data } = await clinicianService.resetUserPassword(clinician._id || clinician.id);
                setLoginMsg(data?.message || "Password reset email sent.");
              } catch (err) {
                setLoginMsg(err?.response?.data?.message || "Reset failed.");
              } finally {
                setResettingPw(false);
              }
            }}
          >
            Reset password
          </Btn>
        </div>
        {loginMsg && <p className="mt-3 text-sm text-slate-600">{loginMsg}</p>}
      </div>
    )}

    {canManage && onLinkUser && (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={16} className="text-blue-600" />
          <h3 className="text-base font-bold text-slate-800">Login mapping</h3>
        </div>
        <p className="text-sm text-slate-500 mb-3">
          Current: <strong className="text-slate-800">{linkedUserLabel}</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clinician user account
            </label>
            <select
              value={linkUserId}
              onChange={(e) => setLinkUserId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">— No linked user —</option>
              {clinicianUserOpts.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
          <Btn size="sm" onClick={handleLinkUser} disabled={linking}>
            {linking ? <Spinner /> : <Save size={13} />} Save mapping
          </Btn>
        </div>
        {linkMsg && <p className="mt-3 text-sm text-slate-600">{linkMsg}</p>}
      </div>
    )}
    </div>
  );
}
