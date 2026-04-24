/// practice Deatil Page updates using Replit ai 
import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Network,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Users,
  FileCheck,
  MessageSquare,
  UserX,
  Mail,
  Check,
  X,
  Phone,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Save,
  Wifi,
  Activity,
  Hash,
  MapPin,
  Building2,
  Layers,
  Archive,
  ShieldCheck,
} from "lucide-react";
import { usePractice, useUpdatePractice } from "../../../hooks/usePractice";
import { useDocumentGroups } from "../../../hooks/useCompliance";
import ContactHistoryPanel from "./ContactHistoryPanel.jsx";
import MassEmailModal from "./MassEmailModal.jsx";
import EntityDocumentsTab from "./EntityDocumentsTab.jsx";
import ReportingArchivePanel from "./ReportingArchivePanel.jsx";

/* ══════════════════════════════════════════════════════════
   SHARED UI ATOMS — module-level, never re-created on render
══════════════════════════════════════════════════════════ */
const Spinner = ({ cls = "border-white" }) => (
  <span
    className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`}
  />
);

const ModalShell = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] w-full max-w-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:thin]">
        {children}
      </div>
      {footer && (
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          {footer}
        </div>
      )}
    </div>
  </div>
);

const Btn = ({
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  children,
  cls = "",
  type = "button",
}) => {
  const V = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    teal: "bg-teal-600 text-white hover:bg-teal-700",
    ghost: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  };
  const S = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${V[variant]} ${S[size]} ${cls}`}
    >
      {children}
    </button>
  );
};

/* Safe value renderer — never crashes on objects/arrays */
const renderValue = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "object") return v.name || v.label || JSON.stringify(v);
  return String(v);
};

const DetailRow = ({ label, value, hint }) => (
  <div className="flex justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium shrink-0">{label}</span>
    <div className="text-right min-w-0">
      <span className="text-sm text-slate-800 font-semibold truncate block">
        {renderValue(value)}
      </span>
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </div>
  </div>
);

const EditRow = ({ label, value, onChange, type = "text", options, placeholder }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-40 shrink-0">
      {label}
    </span>
    {options ? (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
      >
        <option value="">—</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    ) : (
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400"
      />
    )}
  </div>
);

const FormField = ({ label, type = "text", value, onChange, options, placeholder, rows }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
      {label}
    </label>
    {options ? (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white cursor-pointer"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    ) : rows ? (
      <textarea
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white resize-none transition-all"
      />
    ) : (
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
      />
    )}
  </div>
);

const ACCESS_STATUS_STYLE = {
  granted: "bg-green-50 text-green-700 border-green-200",
  view_only: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  requested: "bg-purple-50 text-purple-700 border-purple-200",
  not_requested: "bg-slate-50 text-slate-500 border-slate-200",
};

const CONTACT_TYPE_STYLE = {
  decision_maker: "bg-red-50 text-red-700 border-red-200",
  finance: "bg-green-50 text-green-700 border-green-200",
  gp_lead: "bg-purple-50 text-purple-700 border-purple-200",
  practice_manager: "bg-blue-50 text-blue-700 border-blue-200",
  general: "bg-slate-50 text-slate-600 border-slate-200",
};

/* ══════════════════════════════════════════════════════════
   MODALS — module-level so inputs keep focus while typing
══════════════════════════════════════════════════════════ */
const ContactModal = ({ existing, onClose, onSave }) => {
  const isEdit = !!existing?._id;
  const [form, setForm] = useState({
    name: existing?.name || "",
    role: existing?.role || "",
    email: existing?.email || "",
    phone: existing?.phone || "",
    type: existing?.type || "general",
    isDecisionMaker: existing?.isDecisionMaker || false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(isEdit ? { ...form, _id: existing._id } : form);
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={isEdit ? "Edit Contact" : "Add Contact"}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" cls="flex-1" onClick={onClose}>
            Cancel
          </Btn>
          <Btn cls="flex-1" onClick={handle} disabled={saving || !form.name.trim()}>
            {saving ? <Spinner /> : <Check size={14} />}{" "}
            {isEdit ? "Save Changes" : "Add Contact"}
          </Btn>
        </>
      }
    >
      <FormField label="Name *" value={form.name} onChange={set("name")} />
      <FormField label="Role" value={form.role} onChange={set("role")} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Email" type="email" value={form.email} onChange={set("email")} />
        <FormField label="Phone" value={form.phone} onChange={set("phone")} />
      </div>
      <FormField
        label="Type"
        value={form.type}
        onChange={set("type")}
        options={[
          ["general", "General"],
          ["decision_maker", "Decision Maker"],
          ["finance", "Finance"],
          ["gp_lead", "GP Lead"],
          ["practice_manager", "Practice Manager"],
        ]}
      />
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={!!form.isDecisionMaker}
          onChange={(e) => set("isDecisionMaker")(e.target.checked)}
          className="accent-blue-600 w-4 h-4"
        />
        <span className="text-sm text-slate-700 font-medium">
          Mark as Decision Maker
        </span>
      </label>
    </ModalShell>
  );
};

const AccessModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({
    system: existing?.system || "EMIS",
    code: existing?.code || "",
    status: existing?.status || "not_requested",
    notes: existing?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async () => {
    setSaving(true);
    try {
      await onSave({ ...(existing?._id ? { _id: existing._id } : {}), ...form });
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={existing?._id ? "Edit System Access" : "Add System Access"}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" cls="flex-1" onClick={onClose}>
            Cancel
          </Btn>
          <Btn cls="flex-1" onClick={handle} disabled={saving}>
            {saving ? <Spinner /> : <Check size={14} />} Save
          </Btn>
        </>
      }
    >
      <FormField
        label="System"
        value={form.system}
        onChange={set("system")}
        options={[
          "EMIS",
          "SystmOne",
          "ICE",
          "AccuRx",
          "Docman",
          "Softphone",
          "VPN",
          "Other",
        ].map((s) => [s, s])}
      />
      <FormField
        label="Status"
        value={form.status}
        onChange={set("status")}
        options={[
          ["not_requested", "Not Requested"],
          ["requested", "Requested"],
          ["pending", "Pending"],
          ["granted", "Granted"],
          ["view_only", "View Only"],
        ]}
      />
      <FormField
        label="Code / Reference"
        value={form.code}
        onChange={set("code")}
        placeholder="EMIS/1485566"
      />
      <FormField label="Notes" value={form.notes} onChange={set("notes")} rows={3} />
    </ModalShell>
  );
};

const RestrictedAddModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: "", email: "", role: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        _id: `manual-${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim() || "clinician",
        reason: form.reason.trim(),
      });
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Add Restricted Clinician"
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" cls="flex-1" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            variant="danger"
            cls="flex-1"
            onClick={handle}
            disabled={saving || !form.name.trim()}
          >
            {saving ? <Spinner /> : <UserX size={14} />} Flag as Restricted
          </Btn>
        </>
      }
    >
      <FormField
        label="Clinician Name *"
        value={form.name}
        onChange={set("name")}
        placeholder="Dr. John Smith"
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Email" type="email" value={form.email} onChange={set("email")} />
        <FormField label="Role" value={form.role} onChange={set("role")} />
      </div>
      <FormField
        label="Reason for Restriction"
        value={form.reason}
        onChange={set("reason")}
        rows={3}
      />
    </ModalShell>
  );
};

/* ══════════════════════════════════════════════════════════
   PANELS — module-level, take props instead of closing over parent
══════════════════════════════════════════════════════════ */

const OverviewPanel = ({ practice, linkedClient, groups, groupsLoading, patch }) => {
  // NOTE: we store the assigned compliance group's ID (string) in form
  const buildForm = useCallback(
    () => ({
      odsCode: practice.odsCode || "",
      address: practice.address || "",
      city: practice.city || "",
      postcode: practice.postcode || "",
      fte: practice.fte || "",
      contractType: practice.contractType || "",
      xeroCode: practice.xeroCode || "",
      xeroCategory: practice.xeroCategory || "",
      patientListSize: practice.patientListSize ?? "",
      complianceGroup:
        practice.complianceGroup?._id ||
        (typeof practice.complianceGroup === "string"
          ? practice.complianceGroup
          : "") ||
        "",
      systemAccessNotes: practice.systemAccessNotes || "",
      notes: practice.notes || "",
      priority: practice.priority || "normal",
    }),
    [practice],
  );

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(buildForm);

  // Reset form whenever the underlying practice object changes (not just the id)
  useEffect(() => {
    if (!editing) setForm(buildForm());
  }, [buildForm, editing]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await patch(form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    setForm(buildForm());
    setEditing(false);
  };

  // ✅ FIX: ensure currently-assigned compliance group is always represented
  // as an option, even if it's missing from the active groups list.
  const currentGroup = practice.complianceGroup;
  const currentGroupId = currentGroup?._id || "";
  const currentGroupName = currentGroup?.name || "";

  const groupOptions = useMemo(() => {
    const list = (groups || []).map((g) => ({
      value: g._id,
      label: g.name + (g.active === false ? " (inactive)" : ""),
    }));
    if (currentGroupId && !list.some((o) => o.value === currentGroupId)) {
      list.unshift({
        value: currentGroupId,
        label: currentGroupName + " (current)",
      });
    }
    return list;
  }, [groups, currentGroupId, currentGroupName]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* LEFT — Practice details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Practice Details
          </h3>
          <div className="flex items-center gap-2">
            {editing && (
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X size={12} /> Cancel
              </button>
            )}
            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {saving ? (
                <Spinner cls="border-white" />
              ) : editing ? (
                <>
                  <Save size={12} /> Save
                </>
              ) : (
                <>
                  <Edit2 size={12} /> Edit
                </>
              )}
            </button>
          </div>
        </div>

        {editing ? (
          <div>
            <EditRow
              label="ODS Code"
              value={form.odsCode}
              onChange={set("odsCode")}
            />
            <EditRow label="FTE" value={form.fte} onChange={set("fte")} />
            <EditRow
              label="Contract Type"
              value={form.contractType}
              onChange={set("contractType")}
              options={["ARRS", "EA", "Direct", "Mixed"]}
            />
            <EditRow
              label="Xero Code"
              value={form.xeroCode}
              onChange={set("xeroCode")}
            />
            <EditRow
              label="Xero Category"
              value={form.xeroCategory}
              onChange={set("xeroCategory")}
              options={["PCN", "GPX", "EAX"]}
            />
            <EditRow
              label="Patient List"
              value={form.patientListSize}
              onChange={set("patientListSize")}
              type="number"
            />
            <EditRow
              label="Priority"
              value={form.priority}
              onChange={set("priority")}
              options={[
                { value: "normal", label: "Normal" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />

            {/* Compliance Group select with safe fallback */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-40 shrink-0">
                Compliance Group
              </span>
              <div className="flex-1 flex items-center gap-2">
                <select
                  value={form.complianceGroup || ""}
                  onChange={(e) => set("complianceGroup")(e.target.value)}
                  disabled={groupsLoading}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 cursor-pointer disabled:bg-slate-50 disabled:cursor-wait"
                >
                  <option value="">None</option>
                  {groupOptions.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                {groupsLoading && <Spinner cls="border-slate-400" />}
              </div>
            </div>
            {form.complianceGroup && currentGroupId && form.complianceGroup !== currentGroupId && (
              <p className="text-[11px] text-amber-600 px-1 -mt-1 mb-2">
                Changing compliance group will reset this practice's group documents.
              </p>
            )}

            <EditRow
              label="Address"
              value={form.address}
              onChange={set("address")}
            />
            <EditRow label="City" value={form.city} onChange={set("city")} />
            <EditRow
              label="Postcode"
              value={form.postcode}
              onChange={set("postcode")}
            />
            <div className="pt-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                System Access Notes
              </span>
              <textarea
                rows={2}
                value={form.systemAccessNotes || ""}
                onChange={(e) => set("systemAccessNotes")(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
            <div className="pt-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Notes
              </span>
              <textarea
                rows={3}
                value={form.notes || ""}
                onChange={(e) => set("notes")(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
          </div>
        ) : (
          <div>
            <DetailRow label="ODS Code" value={practice.odsCode} />
            <DetailRow label="ICB" value={linkedClient.icb?.name} />
            <DetailRow
              label="Federation"
              value={linkedClient.federation?.name || "Direct to ICB"}
            />
            <DetailRow label="PCN / Client" value={linkedClient.name} />
            <DetailRow
              label="Compliance Group"
              value={
                currentGroupName || (
                  <span className="text-slate-400 italic">
                    No compliance group assigned
                  </span>
                )
              }
              hint={
                currentGroup?.documents?.length
                  ? `${currentGroup.documents.length} document${currentGroup.documents.length !== 1 ? "s" : ""}`
                  : null
              }
            />
            <DetailRow label="Contract Type" value={practice.contractType} />
            <DetailRow label="FTE" value={practice.fte} />
            <DetailRow label="Xero Code" value={practice.xeroCode} />
            <DetailRow label="Xero Category" value={practice.xeroCategory} />
            <DetailRow
              label="Patient List"
              value={
                practice.patientListSize
                  ? Number(practice.patientListSize).toLocaleString()
                  : null
              }
            />
            <DetailRow
              label="Priority"
              value={practice.priority || "normal"}
            />
            {practice.notes && (
              <div className="pt-4 mt-2 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Notes
                </p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {practice.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT — Location + compliance summary */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-w-0">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">
            Location
          </h3>
          {practice.address || practice.city || practice.postcode ? (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-slate-500" />
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                {practice.address && <p>{practice.address}</p>}
                {practice.city && <p>{practice.city}</p>}
                {practice.postcode && (
                  <p className="font-bold text-slate-800">{practice.postcode}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No address on record</p>
          )}

          {practice.systemAccessNotes && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                System Access Notes
              </p>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                {practice.systemAccessNotes}
              </p>
            </div>
          )}
        </div>

        {/* Compliance summary card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Compliance
            </h3>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck size={16} className="text-emerald-600" />
            </div>
          </div>
          {currentGroupName ? (
            <>
              <p className="text-base font-bold text-slate-800">{currentGroupName}</p>
              {currentGroup?.documents?.length > 0 ? (
                <>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    {currentGroup.documents.length} document
                    {currentGroup.documents.length !== 1 ? "s" : ""} required
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 [scrollbar-width:thin]">
                    {currentGroup.documents.map((d) => (
                      <div
                        key={d._id}
                        className="flex items-center gap-2 text-xs text-slate-600"
                      >
                        <FileCheck
                          size={12}
                          className={d.mandatory ? "text-red-500" : "text-slate-400"}
                        />
                        <span className="truncate">{d.name}</span>
                        {d.mandatory && (
                          <span className="ml-auto text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded">
                            REQ
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
                  Group has no documents defined
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-400">
              No compliance group assigned. Use Edit to set one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactsPanel = ({
  practice,
  onAddContact,
  onEditContact,
  onDeleteContact,
  onMassEmail,
}) => {
  const contacts = practice.contacts || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          {contacts.length} Contact{contacts.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm" onClick={onMassEmail}>
            <Mail size={13} /> Mass Email
          </Btn>
          <Btn size="sm" onClick={onAddContact}>
            <Plus size={13} /> Add Contact
          </Btn>
        </div>
      </div>
      {contacts.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
          <Users size={32} className="opacity-40" />
          <p className="font-semibold">No contacts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {contacts.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 group hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-slate-800 truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>
                </div>
                {c.type && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize shrink-0 ${CONTACT_TYPE_STYLE[c.type] || CONTACT_TYPE_STYLE.general}`}
                  >
                    {c.type.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 mb-3">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 truncate"
                  >
                    <Mail size={12} className="shrink-0" />
                    {c.email}
                  </a>
                )}
                {c.phone && (
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={12} className="shrink-0" />
                    {c.phone}
                  </p>
                )}
              </div>
              <div className="flex items-center pt-2.5 border-t border-slate-100">
                {c.isDecisionMaker && (
                  <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-md border border-red-200 mr-2">
                    Decision Maker
                  </span>
                )}
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => onEditContact(c)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    onClick={() => onDeleteContact(c._id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={11} /> Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AccessPanel = ({ practice, onAddAccess, onEditAccess, onDeleteAccess }) => {
  const systems = practice.systemAccess || [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          System Access
        </p>
        <Btn size="sm" onClick={onAddAccess}>
          <Plus size={13} /> Add System
        </Btn>
      </div>
      {practice.systemAccessNotes && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">
            Access Notes
          </p>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">
            {practice.systemAccessNotes}
          </p>
        </div>
      )}
      {systems.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
          <Wifi size={32} className="opacity-40" />
          <p className="font-semibold">No system access records</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {systems.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Activity size={16} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <p className="text-[15px] font-bold text-slate-800">{s.system}</p>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${ACCESS_STATUS_STYLE[s.status] || ACCESS_STATUS_STYLE.not_requested}`}
                  >
                    {s.status?.replace("_", " ")}
                  </span>
                </div>
                {s.code && <p className="text-sm text-slate-400">Code: {s.code}</p>}
                {s.notes && (
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed whitespace-pre-wrap">
                    {s.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEditAccess(s)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDeleteAccess(s._id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RestrictedPanel = ({ practice, patch }) => {
  const restricted = practice.restrictedClinicians || [];
  const [addModal, setAddModal] = useState(false);

  const handleAdd = async (entry) => {
    await patch({ restrictedClinicians: [...restricted, entry] });
  };

  const handleRemove = async (cid) => {
    if (!confirm("Remove this restriction?")) return;
    const updated = restricted.filter((c) => {
      const id = typeof c === "object" ? c._id || c.id : c;
      return String(id) !== String(cid);
    });
    await patch({ restrictedClinicians: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 flex-1 min-w-[260px]">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">
              Restricted / Unsuitable Clinicians
            </p>
            <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
              These clinicians will not be scheduled at this practice.
            </p>
          </div>
        </div>
        <Btn variant="danger" size="sm" onClick={() => setAddModal(true)}>
          <Plus size={13} /> Add Restriction
        </Btn>
      </div>

      {restricted.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
          <UserX size={32} className="opacity-40" />
          <p className="font-semibold">No restricted clinicians</p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {restricted.map((c) => {
            const cId = typeof c === "object" ? c._id || c.id : c;
            const cName = typeof c === "object" ? c.name : "Unknown";
            const cEmail = typeof c === "object" ? c.email : "";
            const cRole = typeof c === "object" ? c.role : "";
            const cReason = typeof c === "object" ? c.reason : "";
            return (
              <div
                key={String(cId)}
                className="bg-white rounded-2xl border border-red-100 p-5 flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <UserX size={17} className="text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-slate-800">{cName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cEmail}
                    {cRole ? ` · ${cRole}` : ""}
                  </p>
                  {cReason && (
                    <p className="text-xs text-red-500 mt-1">Reason: {cReason}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(cId)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 border border-red-200 shrink-0"
                >
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {addModal && (
        <RestrictedAddModal
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   TABS CONFIG
══════════════════════════════════════════════════════════ */
const TABS = [
  { id: "overview", label: "Overview", icon: Stethoscope },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "documents", label: "Documents", icon: FileCheck },
  { id: "access", label: "Sys Access", icon: Wifi },
  { id: "history", label: "History", icon: MessageSquare },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "restricted", label: "Restricted", icon: UserX },
];

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function PracticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = usePractice(id);
  const updatePracticeMutation = useUpdatePractice();
  const { data: groupsData, isLoading: groupsLoading } = useDocumentGroups({
    active: true,
  });

  const practice = data?.practice ?? null;
  const groups = groupsData?.groups || [];

  const [tab, setTab] = useState("overview");
  const [massEmail, setMassEmail] = useState(false);
  const [contactModal, setContactModal] = useState(null);
  const [accessModal, setAccessModal] = useState(null);

  const patch = useCallback(
    async (body) => {
      try {
        await updatePracticeMutation.mutateAsync({ id, data: body });
      } catch (e) {
        alert(e.message);
      }
    },
    [id, updatePracticeMutation],
  );

  const saveContact = useCallback(
    async (form) => {
      const contacts = [...(practice?.contacts || [])];
      if (form._id) {
        const i = contacts.findIndex((c) => c._id === form._id);
        if (i > -1) contacts[i] = { ...contacts[i], ...form };
        else contacts.push(form);
      } else {
        contacts.push(form);
      }
      await patch({ contacts });
    },
    [practice, patch],
  );

  const deleteContact = useCallback(
    async (cid) => {
      if (!confirm("Delete contact?")) return;
      await patch({
        contacts: (practice?.contacts || []).filter((c) => c._id !== cid),
      });
    },
    [practice, patch],
  );

  const saveAccess = useCallback(
    async (form) => {
      const systems = [...(practice?.systemAccess || [])];
      if (form._id) {
        const i = systems.findIndex((s) => s._id === form._id);
        if (i > -1) systems[i] = { ...systems[i], ...form };
        else systems.push(form);
      } else {
        systems.push(form);
      }
      await patch({ systemAccess: systems });
    },
    [practice, patch],
  );

  const deleteAccess = useCallback(
    async (sid) => {
      if (!confirm("Remove system access record?")) return;
      await patch({
        systemAccess: (practice?.systemAccess || []).filter((s) => s._id !== sid),
      });
    },
    [practice, patch],
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-[3px] border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!practice)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
        <Stethoscope size={44} className="opacity-30" />
        <p className="font-semibold text-base">Practice not found</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 text-sm hover:underline"
        >
          Go back
        </button>
      </div>
    );

  // ✅ FIX: linkedClient — backend getPracticeById populates `pcn` but
  // getPractices aliases it as `client`. Fall back so detail page works
  // whether the user navigated from the list or directly.
  const linkedClient = practice.client || practice.pcn || {};

  return (
    <div className="space-y-4 pb-8 min-w-0 overflow-x-hidden">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm flex-wrap">
        <button
          onClick={() => navigate("/dashboard/super-admin/clients")}
          className="text-slate-400 hover:text-blue-600 font-medium transition-colors"
        >
          Client Management
        </button>
        <ChevronRight size={13} className="text-slate-300 shrink-0" />
        {linkedClient.icb?._id && (
          <>
            <button
              onClick={() =>
                navigate(
                  `/dashboard/super-admin/clients/icb/${linkedClient.icb._id}`,
                )
              }
              className="text-slate-400 hover:text-blue-600 font-medium transition-colors truncate max-w-[120px]"
            >
              {linkedClient.icb.name}
            </button>
            <ChevronRight size={13} className="text-slate-300 shrink-0" />
          </>
        )}
        {linkedClient._id && (
          <>
            <button
              onClick={() =>
                navigate(`/dashboard/super-admin/clients/pcn/${linkedClient._id}`)
              }
              className="text-slate-400 hover:text-blue-600 font-medium transition-colors truncate max-w-[120px]"
            >
              {linkedClient.name}
            </button>
            <ChevronRight size={13} className="text-slate-300 shrink-0" />
          </>
        )}
        <span className="text-slate-700 font-bold truncate">{practice.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 min-w-0">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
            <Stethoscope size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight break-words">
              {practice.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              {practice.odsCode && (
                <span className="text-sm text-slate-400 flex items-center gap-1 shrink-0">
                  <Hash size={12} /> {practice.odsCode}
                </span>
              )}
              {linkedClient.icb?.name && (
                <span className="text-sm text-slate-400 flex items-center gap-1 min-w-0 truncate">
                  <Building2 size={12} className="shrink-0" /> {linkedClient.icb.name}
                </span>
              )}
              {linkedClient.federation?.name && (
                <span className="text-sm text-slate-400 flex items-center gap-1 min-w-0 truncate">
                  <Layers size={12} className="shrink-0" />{" "}
                  {linkedClient.federation.name}
                </span>
              )}
              {linkedClient.name && (
                <span className="text-sm text-slate-400 flex items-center gap-1 min-w-0 truncate">
                  <Network size={12} className="shrink-0" /> {linkedClient.name}
                </span>
              )}
              {practice.contractType && (
                <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                  {practice.contractType}
                </span>
              )}
              {practice.complianceGroup?.name && (
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 flex items-center gap-1">
                  <ShieldCheck size={11} /> {practice.complianceGroup.name}
                </span>
              )}
              {practice.fte && (
                <span className="text-sm text-slate-400 shrink-0">{practice.fte}</span>
              )}
              {practice.priority && practice.priority !== "normal" && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 ${practice.priority === "high" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                >
                  {practice.priority.toUpperCase()}
                </span>
              )}
              {(practice.tags || []).map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => refetch()}
              title="Refresh"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
            >
              <RefreshCw size={15} />
            </button>
            <Btn variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={13} /> Back
            </Btn>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-2 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${tab === t.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel — switch instead of pre-built object so unused panels don't render */}
      <div className="min-w-0">
        {tab === "overview" && (
          <OverviewPanel
            practice={practice}
            linkedClient={linkedClient}
            groups={groups}
            groupsLoading={groupsLoading}
            patch={patch}
          />
        )}
        {tab === "contacts" && (
          <ContactsPanel
            practice={practice}
            onAddContact={() => setContactModal({})}
            onEditContact={(c) => setContactModal(c)}
            onDeleteContact={deleteContact}
            onMassEmail={() => setMassEmail(true)}
          />
        )}
        {tab === "documents" && (
          <EntityDocumentsTab
            entityType="Practice"
            entityId={practice._id}
            accent="teal"
          />
        )}
        {tab === "access" && (
          <AccessPanel
            practice={practice}
            onAddAccess={() => setAccessModal({})}
            onEditAccess={(s) => setAccessModal(s)}
            onDeleteAccess={deleteAccess}
          />
        )}
        {tab === "history" && (
          <ContactHistoryPanel entityType="Practice" entityId={practice._id} />
        )}
        {tab === "archive" && (
          <ReportingArchivePanel entityType="Practice" entityId={practice._id} />
        )}
        {tab === "restricted" && (
          <RestrictedPanel practice={practice} patch={patch} />
        )}
      </div>

      {/* Modals */}
      {contactModal !== null && (
        <ContactModal
          existing={contactModal?._id ? contactModal : null}
          onClose={() => setContactModal(null)}
          onSave={saveContact}
        />
      )}
      {accessModal !== null && (
        <AccessModal
          existing={accessModal?._id ? accessModal : null}
          onClose={() => setAccessModal(null)}
          onSave={saveAccess}
        />
      )}
      {massEmail && (
        <MassEmailModal
          entityType="Practice"
          entityId={practice._id}
          contacts={practice.contacts || []}
          onClose={() => setMassEmail(false)}
        />
      )}
    </div>
  );
}
