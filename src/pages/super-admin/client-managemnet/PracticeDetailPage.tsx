import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import { ModalShell } from "../../../components/ui/ModalShell";
import ContactHistoryPanel from "./ContactHistoryPanel";
import MassEmailModal from "./MassEmailModal";
import EntityDocumentsTab from "./EntityDocumentsTab";
import ReportingArchivePanel from "./ReportingArchivePanel";
import OverviewPanel from "./practice-tabs/OverviewPanel/OverviewPanel";
import ContactsPanel from "./practice-tabs/ContactsPanel/ContactsPanel";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { toast } from "sonner";
import { LoadingFallback } from "../../../components/ui/Spinner";

/* ══════════════════════════════════════════════════════════
   SHARED UI ATOMS — module-level, never re-created on render
══════════════════════════════════════════════════════════ */
export const Spinner: React.FC<{ cls?: string }> = ({ cls = "border-white" }) => (
  <span
    className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`}
  />
);

interface BtnProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "teal" | "ghost" | "danger" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
  cls?: string;
  type?: "button" | "submit" | "reset";
}

export const Btn: React.FC<BtnProps> = ({
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  children,
  cls = "",
  type = "button",
}) => {
  const V: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    teal: "bg-teal-600 text-white hover:bg-teal-700",
    ghost: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  };
  const S: Record<string, string> = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
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

interface FormFieldProps {
  label: string;
  type?: string;
  value?: string | number;
  onChange: (val: string) => void;
  options?: [string, string][];
  placeholder?: string;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  options,
  placeholder,
  rows,
}) => (
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

/* ── Predefined contact types ─────────────────────────────────── */
const PREDEFINED_CONTACT_TYPES: [string, string][] = [
  ["general", "General"],
  ["decision_maker", "Decision Maker"],
  ["finance", "Finance"],
  ["gp_lead", "GP Lead"],
  ["practice_manager", "Practice Manager"],
  ["admin", "Admin"],
  ["reception", "Reception"],
  ["clinical_lead", "Clinical Lead"],
  ["__custom__", "Other (custom)…"],
];

const ACCESS_STATUS_STYLE: Record<string, string> = {
  granted: "bg-green-50 text-green-700 border-green-200",
  view_only: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  requested: "bg-purple-50 text-purple-700 border-purple-200",
  not_requested: "bg-slate-50 text-slate-500 border-slate-200",
};

/* ══════════════════════════════════════════════════════════
   CONTACT MODAL
══════════════════════════════════════════════════════════ */
interface ContactModalProps {
  existing: any;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

const ContactModal: React.FC<ContactModalProps> = ({ existing, onClose, onSave }) => {
  const existingId = existing?._id || existing?.id;
  const isEdit = !!(existingId || existing?.name);

  const storedType = existing?.type || "general";
  const isPredefined = PREDEFINED_CONTACT_TYPES.some(
    ([v]) => v !== "__custom__" && v === storedType
  );

  const [form, setForm] = useState({
    name: existing?.name || "",
    role: existing?.role || "",
    email: existing?.email || "",
    phone: existing?.phone || "",
    typeSelect: isPredefined ? storedType : "__custom__",
    typeCustom: isPredefined ? "" : storedType,
    isDecisionMaker: existing?.isDecisionMaker || false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: any) => setForm((f) => ({ ...f, [k]: v }));

  const finalType =
    form.typeSelect === "__custom__"
      ? (form.typeCustom.trim() || "general")
      : form.typeSelect;

  const handle = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        role: form.role,
        email: form.email,
        phone: form.phone,
        type: finalType,
        isDecisionMaker: form.isDecisionMaker,
      };
      if (existingId) payload._id = existingId;
      await onSave(payload);
      onClose();
    } catch (e: any) {
      toast.error(e.message);
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

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
          Type
        </label>
        <select
          value={form.typeSelect}
          onChange={(e) => set("typeSelect")(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white cursor-pointer"
        >
          {PREDEFINED_CONTACT_TYPES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {form.typeSelect === "__custom__" && (
          <input
            type="text"
            value={form.typeCustom}
            onChange={(e) => set("typeCustom")(e.target.value)}
            placeholder="e.g. prescribing_lead, pharmacist…"
            className="mt-2 w-full px-3 py-2.5 rounded-xl border border-blue-300 text-sm bg-white focus:outline-none focus:border-blue-500 transition-all"
          />
        )}
        {form.typeSelect !== "__custom__" && (
          <p className="text-[11px] text-slate-400 mt-1">
            Choose "Other (custom)…" to enter any label you like.
          </p>
        )}
      </div>

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

/* ══════════════════════════════════════════════════════════
   ACCESS MODAL
══════════════════════════════════════════════════════════ */
interface AccessModalProps {
  existing: any;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

const AccessModal: React.FC<AccessModalProps> = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({
    system: existing?.system || "EMIS",
    code: existing?.code || "",
    status: existing?.status || "not_requested",
    notes: existing?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handle = async () => {
    setSaving(true);
    try {
      await onSave({ ...(existing?._id ? { _id: existing._id } : {}), ...form });
      onClose();
    } catch (e: any) {
      toast.error(e.message);
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
          "EMIS","SystmOne","ICE","AccuRx","Docman","Softphone","VPN","Other",
        ].map((s) => [s, s] as [string, string])}
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

/* ══════════════════════════════════════════════════════════
   RESTRICTED ADD MODAL
══════════════════════════════════════════════════════════ */
interface RestrictedAddModalProps {
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

const RestrictedAddModal: React.FC<RestrictedAddModalProps> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: "", email: "", role: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

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
    } catch (e: any) {
      toast.error(e.message);
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
   ACCESS PANEL
══════════════════════════════════════════════════════════ */
interface AccessPanelProps {
  practice: any;
  onAddAccess: () => void;
  onEditAccess: (sys: any) => void;
  onDeleteAccess: (sid: string) => void;
}

const AccessPanel: React.FC<AccessPanelProps> = ({ practice, onAddAccess, onEditAccess, onDeleteAccess }) => {
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
          {systems.map((s: any, idx: number) => (
            <div
              key={s._id || `system-${idx}`}
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

/* ══════════════════════════════════════════════════════════
   RESTRICTED PANEL
══════════════════════════════════════════════════════════ */
interface RestrictedPanelProps {
  practice: any;
  patch: (body: any) => Promise<void>;
}

const RestrictedPanel: React.FC<RestrictedPanelProps> = ({ practice, patch }) => {
    const confirm = useConfirm();
  const restricted = practice.restrictedClinicians || [];
  const [addModal, setAddModal] = useState(false);

  const handleAdd = async (entry: any) => {
    await patch({ restrictedClinicians: [...restricted, entry] });
  };

  const handleRemove = async (cid: string) => {
    if (!await confirm({ title: "Remove this restriction?" })) return;
    const updated = restricted.filter((c: any) => {
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
          {restricted.map((c: any, idx: number) => {
            const cId = typeof c === "object" ? c._id || c.id : c;
            const cName = typeof c === "object" ? c.name : "Unknown";
            const cEmail = typeof c === "object" ? c.email : "";
            const cRole = typeof c === "object" ? c.role : "";
            const cReason = typeof c === "object" ? c.reason : "";
            return (
              <div
                key={String(cId) || `restricted-${idx}`}
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
  { id: "overview",   label: "Overview",   icon: Stethoscope   },
  { id: "contacts",   label: "Contacts",   icon: Users         },
  { id: "documents",  label: "Documents",  icon: FileCheck     },
  { id: "access",     label: "Sys Access", icon: Wifi          },
  { id: "history",    label: "History",    icon: MessageSquare },
  { id: "archive",    label: "Archive",    icon: Archive       },
  { id: "restricted", label: "Restricted", icon: UserX         },
];

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function PracticeDetailPage() {
    const confirm = useConfirm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = usePractice(id || "");
  const updatePracticeMutation = useUpdatePractice();
  const { data: groupsData, isLoading: groupsLoading } = useDocumentGroups({ active: true });

  const practice = data?.practice ?? null;
  const groups = groupsData?.groups || [];

  const [tab, setTab] = useState<string>("overview");
  const [massEmail, setMassEmail] = useState<boolean>(false);
  const [contactModal, setContactModal] = useState<any | null>(null);
  const [accessModal, setAccessModal] = useState<any | null>(null);

  const patch = useCallback(
    async (body: any) => {
      try {
        await updatePracticeMutation.mutateAsync({ id: id || "", data: body });
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [id, updatePracticeMutation],
  );

  const saveContact = useCallback(
    async (form: any) => {
      const contacts = [...(practice?.contacts || [])];
      const formId = form?._id || form?.id;
      if (formId) {
        const i = contacts.findIndex((c: any) => (c?._id || c?.id) === formId);
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
    async (cid: string) => {
      if (!await confirm({ title: "Delete contact?" })) return;
      await patch({
        contacts: (practice?.contacts || []).filter(
          (c: any) => (c?._id || c?.id) !== cid,
        ),
      });
    },
    [practice, patch],
  );

  const saveAccess = useCallback(
    async (form: any) => {
      const systems = [...(practice?.systemAccess || [])];
      if (form._id) {
        const i = systems.findIndex((s: any) => s._id === form._id);
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
    async (sid: string) => {
      if (!await confirm({ title: "Remove system access record?" })) return;
      await patch({
        systemAccess: (practice?.systemAccess || []).filter((s: any) => s._id !== sid),
      });
    },
    [practice, patch],
  );

  if (isLoading)
    return <LoadingFallback text="Loading Practice..." />;

  if (!practice)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
        <Stethoscope size={44} className="opacity-30" />
        <p className="font-semibold text-base">Practice not found</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">
          Go back
        </button>
      </div>
    );

  const linkedClient = practice.client || practice.pcn || {};

  const openContactAdd = () => setContactModal({});
  const openContactEdit = (c: any) => setContactModal(c);

  const openAccessAdd = () => setAccessModal({});
  const openAccessEdit = (s: any) => setAccessModal(s);

  const contactIsExisting =
    contactModal !== null &&
    !!(contactModal?._id || contactModal?.id || contactModal?.name);

  return (
    <div className="space-y-4 pb-8 min-w-0 overflow-x-hidden">
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
                navigate(`/dashboard/super-admin/clients/icb/${linkedClient.icb._id}`)
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
                  <Layers size={12} className="shrink-0" /> {linkedClient.federation.name}
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
                  className={`text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    practice.priority === "high"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {practice.priority.toUpperCase()}
                </span>
              )}
              {(practice.tags || []).map((tag: string, i: number) => (
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-2 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  tab === t.id
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

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
            onAddContact={openContactAdd}
            onEditContact={openContactEdit}
            onDeleteContact={(cid) => { if (cid) deleteContact(cid); }}
            onMassEmail={() => setMassEmail(true)}
            Btn={Btn}
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
            onAddAccess={openAccessAdd}
            onEditAccess={openAccessEdit}
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

      {contactModal !== null && (
        <ContactModal
          existing={contactIsExisting ? contactModal : null}
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


