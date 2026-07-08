import React, { useMemo, useState } from "react";
import {
  Stethoscope, Plus, Eye, EyeOff, Edit2, Trash2, X, Check,
  Search, SlidersHorizontal, ShieldAlert, RefreshCw,
  AlertCircle, ChevronDown, ShieldCheck, UserPlus, KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClinicians, useCreateClinician, useDeleteClinician } from "../../../hooks/useClinicians";
import { useUpdateClinician } from "../../../hooks/useClinician";
import { useAllUsers, useCreateUser } from "../../../hooks/useAuth";
import DataTable from "../../../components/ui/DataTable";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { resetListFilters, setListFilter } from "../../../slices/clinicianSlice";
import { apiClient } from "../../../services/api/client";
import { DebouncedSearchInput } from "../../../components/shared/DebouncedSearchInput";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { toast } from "sonner";

const TYPE_OPTS     = ["Pharmacist", "Technician", "IP"];
const CONTRACT_OPTS = ["ARRS", "EA", "Direct", "Mixed"];

interface FProps {
  label: string;
  children: React.ReactNode;
}

const F: React.FC<FProps> = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
    {children}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ value, onChange, children, className = "", ...props }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-400 focus:bg-white cursor-pointer transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all ${className}`}
  />
);

interface ClinicianForm {
  fullName: string;
  clinicianType: string;
  email: string;
  phone: string;
  gphcNumber: string;
  contractType: string;
  opsLead: string;
  supervisor: string;
}

const buildForm = (existing?: any): ClinicianForm => ({
  fullName:      existing?.fullName      || "",
  clinicianType: existing?.clinicianType || "Pharmacist",
  email:         existing?.email         || "",
  phone:         existing?.phone         || "",
  gphcNumber:    existing?.gphcNumber    || "",
  contractType:  existing?.contractType  || "ARRS",
  opsLead:       existing?.opsLead?._id    || existing?.opsLead    || "",
  supervisor:    existing?.supervisor?._id || existing?.supervisor || "",
});

/* ══════════ CHANGE PASSWORD MODAL ══════════ */
interface ChangePasswordModalProps {
  clinician: any;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ clinician, onClose }) => {
  const [newPassword,  setNewPassword]  = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);

  const handle = async () => {
    if (!newPassword.trim())       { setError("Password is required"); return; }
    if (newPassword.length < 6)    { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirm)   { setError("Passwords do not match"); return; }
    setSaving(true);
    setError("");
    try {
      await apiClient.put(`/auth/users/${clinician._id}/password`, { password: newPassword });
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Change Password</h3>
            <p className="text-xs text-slate-400 mt-0.5">{clinician.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-sm text-emerald-700">
              <Check size={14} className="shrink-0" /> Password updated successfully!
            </div>
          )}

          <F label="New Password">
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </F>

          <F label="Confirm Password">
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </F>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={saving || success}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-all"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <KeyRound size={15} />
            }
            {saving ? "Saving…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════ CLINICIAN MODAL ══════════ */
interface ClinicianModalProps {
  existing?: any;
  users: any[];
  onClose: () => void;
  onSave: (form: ClinicianForm, loginInfo: any) => Promise<void>;
}

const ClinicianModal: React.FC<ClinicianModalProps> = ({ existing, users, onClose, onSave }) => {
  const [form, setForm]     = useState<ClinicianForm>(() => buildForm(existing));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [createLogin, setCreateLogin] = useState(true);
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd]   = useState(false);

  const set = (key: keyof ClinicianForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handle = async () => {
    if (!form.fullName.trim()) { setError("Full name is required"); return; }
    if (!existing && createLogin && !loginPassword.trim()) {
      setError("Password is required to create a login account"); return;
    }
    if (!existing && createLogin && loginPassword.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setSaving(true); setError("");
    try {
      await onSave(form, existing ? null : (createLogin ? { email: form.email, password: loginPassword } : null));
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {existing ? "Edit Clinician" : "Add New Clinician"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Module 3 · Clinician Management</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Full Name"><Input value={form.fullName} onChange={set("fullName")} placeholder="Dr. John Smith" /></F>
            <F label="Type">
              <Select value={form.clinicianType} onChange={set("clinicianType")}>
                {TYPE_OPTS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </F>
            <F label="Email"><Input type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" /></F>
            <F label="Phone"><Input value={form.phone} onChange={set("phone")} placeholder="+44 7700 000000" /></F>
            <F label="GPhC Number"><Input value={form.gphcNumber} onChange={set("gphcNumber")} placeholder="1234567" /></F>
            <F label="Contract Type">
              <Select value={form.contractType} onChange={set("contractType")}>
                {CONTRACT_OPTS.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </F>
            <F label="Ops Lead">
              <Select value={form.opsLead} onChange={set("opsLead")}>
                <option value="">— None —</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.name || u.email}</option>)}
              </Select>
            </F>
            <F label="Supervisor">
              <Select value={form.supervisor} onChange={set("supervisor")}>
                <option value="">— None —</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.fullName || u.name || u.email}</option>)}
              </Select>
            </F>
          </div>

          {!existing && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <UserPlus size={15} className="text-blue-600" />
                  <span className="text-sm font-bold text-slate-700">Create Login Account</span>
                </div>
                <button type="button" onClick={() => setCreateLogin((v) => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${createLogin ? "bg-blue-600" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${createLogin ? "translate-x-5" : ""}`} />
                </button>
              </div>
              {createLogin ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <KeyRound size={13} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700">
                      Login will be created using the email above. Clinician logs in at <strong>/portal/clinician</strong>.
                    </p>
                  </div>
                  <F label="Password">
                    <div className="relative">
                      <Input
                        type={showLoginPwd ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPwd(!showLoginPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </F>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-400">No login now. Add later from Manage Users.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 sm:px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={handle} disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-all">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
            {saving ? "Saving…" : "Save Clinician"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════ MAIN PAGE ══════════ */
export default function CliniciansListPage() {
    const confirm = useConfirm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const filters  = useAppSelector((s: any) => s.clinician?.listFilters || {});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useClinicians(filters);
  const usersQ      = useAllUsers();
  const createM     = useCreateClinician();
  const createUserM = useCreateUser();
  const updateM     = useUpdateClinician();
  const deleteM     = useDeleteClinician();

  const [modal,     setModal]     = useState<any>(null);
  const [pwdModal,  setPwdModal]  = useState<any>(null);
  const [userError, setUserError] = useState<string | null>(null);

  const items = (data?.clinicians || []).map((c: any) => ({
    ...(c.data || c),
    _id:        c._id || c.id,
    restricted: c.data?.isRestricted ?? c.data?.restricted ?? c.isRestricted ?? c.restricted ?? false,
  }));

  const users = (usersQ.data as any)?.users || usersQ.data || [];

  const setFilter = (patch: any) => {
    const key   = Object.keys(patch)[0];
    const value = Object.values(patch)[0];
    dispatch(setListFilter({ key, value: value as any }));
  };

  const handleSave = async (form: ClinicianForm, loginInfo: any) => {
    setUserError(null);
    try {
      if (modal?.clinician) {
        await updateM.mutateAsync({ id: modal.clinician._id, data: form });
        toast.success("Clinician updated successfully");
      } else {
        await createM.mutateAsync(form as any);
        toast.success("Clinician created successfully");
        if (loginInfo?.email && loginInfo?.password) {
          try {
            await createUserM.mutateAsync({
              name:     form.fullName,
              email:    loginInfo.email,
              password: loginInfo.password,
              role:     "clinician",
            });
            toast.success("Login account created successfully");
          } catch (userErr: any) {
            setUserError(
              userErr?.response?.data?.message ||
              "Clinician saved, but login account creation failed. Create it manually in Manage Users."
            );
          }
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save clinician. Please try again.");
      throw err; // throw to be caught by the modal
    }
  };

  const handleDelete = async (c: any) => {
    if (!await confirm({ title: `Delete ${c.fullName}? This cannot be undone.` })) return;
    try {
      await deleteM.mutateAsync(c._id);
      toast.success("Clinician deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete clinician. Please try again.");
    }
  };

  const hasActiveFilters = filters.search || filters.type || filters.contract || filters.restricted;

  const columns = useMemo(() => ([
    {
      header: "Name",
      render: (c: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Stethoscope size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{c.fullName || "—"}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{c.email || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      render: (c: any) => {
        const colors: Record<string, string> = {
          Pharmacist: "bg-purple-50 text-purple-700 border-purple-200",
          Technician: "bg-amber-50 text-amber-700 border-amber-200",
          IP:         "bg-teal-50 text-teal-700 border-teal-200",
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap ${colors[c.clinicianType] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
            {c.clinicianType || "—"}
          </span>
        );
      },
    },
    {
      header: "Contract",
      render: (c: any) => {
        const colors: Record<string, string> = {
          ARRS:   "bg-blue-50 text-blue-700",
          EA:     "bg-green-50 text-green-700",
          Direct: "bg-orange-50 text-orange-700",
          Mixed:  "bg-pink-50 text-pink-700",
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${colors[c.contractType] || "text-slate-600"}`}>
            {c.contractType || "—"}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (c: any) => (
        c.restricted ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-red-50 text-red-700 border-red-200 whitespace-nowrap">
            <ShieldAlert size={11} /> Restricted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap">
            <ShieldCheck size={11} /> Active
          </span>
        )
      ),
    },
    /* ── HIGH-END COMPLIANCE SaaS COLUMN ── */
    {
      header: "Compliance Data",
      render: (c: any) => {
        const summary = c.complianceSummary ?? c.compliance ?? null;
        const groups   = summary?.groups   ?? 0;
        const uploaded = summary?.uploaded ?? 0;
        const total    = summary?.total    ?? 0;
        const missing  = summary?.missing  ?? Math.max(0, total - uploaded);

        // Blank/No assignment state (Minimal & Clean)
        if (total === 0 && uploaded === 0) {
          return (
            <div className="w-[180px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-dashed border-slate-300 text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50">
                 Not Assigned
              </span>
            </div>
          );
        }

        const pct = total > 0 ? Math.min(100, Math.round((uploaded / total) * 100)) : 0;
        const isDone = missing === 0 && total > 0;

        // Micro Themes for clean, focused UX
        let theme = { 
           gradient: "bg-gradient-to-r from-emerald-400 to-emerald-500", 
           textColor: "text-emerald-600",
           titleText: "Compliant" 
        };

        if (!isDone) {
           if (pct < 50) {
               theme = { 
                  gradient: "bg-gradient-to-r from-rose-500 to-rose-400", 
                  textColor: "text-rose-600",
                  titleText: "Action Required" 
               };
           } else {
               theme = { 
                  gradient: "bg-gradient-to-r from-amber-500 to-amber-400", 
                  textColor: "text-amber-600",
                  titleText: "Incomplete" 
               };
           }
        }

        return (
          <div className="w-[180px] flex flex-col gap-2 relative top-0.5">
             
             {/* Text Elements (Top Data Row) */}
             <div className="flex items-center justify-between w-full pr-1">
                {/* Labels left side */}
                <div className="flex flex-col justify-center leading-tight">
                  <span className={`text-[10px] font-black uppercase tracking-wide flex items-center gap-1 ${theme.textColor}`}>
                    {!isDone ? <AlertCircle size={10} className="shrink-0"/> : <ShieldCheck size={10} className="shrink-0" />}
                    {theme.titleText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {pct}% &bull; {groups} Group{groups !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Direct missing actionable tags - Shows to admin EXACTLY whats required right now*/}
                {isDone ? (
                   <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-slate-400 bg-slate-100/50 border border-slate-200">
                     Complete
                   </span>
                ) : (
                   <span className="text-[10px] px-1.5 py-[3px] rounded bg-rose-50 text-rose-600 border border-rose-100 font-extrabold flex items-center gap-1 shrink-0">
                     {missing} Left
                   </span>
                )}
             </div>

             {/* Minimal Sleek Progress Track (Only 5px high) */}
             <div className="w-full bg-slate-100 rounded-full h-[5px] flex items-center shadow-inner overflow-hidden pr-[1px]">
               <div 
                 className={`h-full rounded-full transition-all duration-700 ease-in-out ${theme.gradient}`}
                 style={{ width: `${Math.max(1, pct)}%` }} // Minimum visual trace width 
               />
             </div>

             {/* Total Overview Details - Extremely discreet text below bar */}
             <div className="w-full flex items-center text-[9px] font-semibold tracking-wide text-slate-400 pl-1 uppercase">
                 {uploaded} of {total} Docs Uploaded
             </div>
             
          </div>
        );
      },
    },
    /* ── Actions ── */
    {
      header: "",
      render: (c: any) => (
        <div className="flex items-center gap-1.5 justify-end">
          {/* Change Password — icon only */}
          <button
            onClick={() => setPwdModal(c)}
            title="Change Password"
            className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 inline-flex items-center justify-center transition-all"
          >
            <KeyRound size={13} />
          </button>

          {/* View — icon only */}
          <button
            onClick={() => navigate(`/dashboard/clinicians/${c._id}`)}
            title="View Clinician"
            className="h-8 w-8 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 inline-flex items-center justify-center transition-all"
          >
            <Eye size={13} />
          </button>

          {/* Edit */}
          <button
            onClick={() => setModal({ mode: "edit", clinician: c })}
            title="Edit"
            className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 inline-flex items-center justify-center transition-all"
          >
            <Edit2 size={13} />
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDelete(c)}
            title="Delete"
            className="h-8 w-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:text-red-700 inline-flex items-center justify-center transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), []);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-800 leading-tight">Clinicians</h1>
            <p className="text-xs text-slate-400">Module 3 · Clinician Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`lg:hidden h-9 w-9 rounded-xl border flex items-center justify-center transition-all relative ${filtersOpen ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <SlidersHorizontal size={15} />
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />}
          </button>
          <button
            onClick={() => refetch()}
            className="h-9 px-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="h-9 px-3 sm:px-4 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 inline-flex items-center gap-1.5 shadow-sm shadow-blue-200 transition-all"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add clinician</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* User creation error */}
      {userError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-sm text-amber-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" /> {userError}
          </div>
          <button onClick={() => setUserError(null)} className="shrink-0 text-amber-500 hover:text-amber-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <DebouncedSearchInput
                value={filters.search || ""}
                onSearchChange={(val) => setFilter({ search: val })}
                placeholder="Search name, email, GPhC…"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>
            <Select value={filters.type || ""} onChange={(e) => setFilter({ type: e.target.value })}>
              <option value="">All types</option>
              {TYPE_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select value={filters.contract || ""} onChange={(e) => setFilter({ contract: e.target.value })}>
              <option value="">All contracts</option>
              {CONTRACT_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select value={filters.restricted || ""} onChange={(e) => setFilter({ restricted: e.target.value })}>
              <option value="">Any status</option>
              <option value="false">Active only</option>
              <option value="true">Restricted only</option>
            </Select>
          </div>
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">Filters applied</p>
              <button onClick={() => dispatch(resetListFilters())} className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                <X size={11} /> Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {!isLoading && items.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span><span className="font-bold text-slate-800">{items.length}</span> clinicians</span>
          <span className="text-slate-200">|</span>
          <span><span className="font-bold text-emerald-600">{items.filter((c: any) => !c.restricted).length}</span> active</span>
          {items.filter((c: any) => c.restricted).length > 0 && (
            <>
              <span className="text-slate-200">|</span>
              <span><span className="font-bold text-red-500">{items.filter((c: any) => c.restricted).length}</span> restricted</span>
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={items}
          loading={isLoading || isFetching}
          emptyTitle="No clinicians found"
          emptyDescription="Try adjusting your filters or add a new clinician."
        />
      </div>

      {/* Clinician add/edit modal */}
      {modal && (
        <ClinicianModal
          existing={modal.clinician}
          users={users}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Change Password modal */}
      {pwdModal && (
        <ChangePasswordModal
          clinician={pwdModal}
          onClose={() => setPwdModal(null)}
        />
      )}
    </div>
  );
}


