import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Network, Plus, Eye, Edit2, Trash2, X, Check,
  ChevronRight, Search, Filter, Building2, Layers,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePCNs, useCreatePCN, useUpdatePCN, useDeletePCN } from "../../../hooks/usePCN";
import { useICBs } from "../../../hooks/useICB";
import { useFederations } from "../../../hooks/useFederation";
import { useDocumentGroups } from "../../../hooks/useCompliance";
import DataTable from "../../../components/ui/DataTable";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { resetPcnFilters, setPcnFilters } from "../../../slices/pcnSlice";

/* ─── Interfaces ──────────────────────────────────────────────────────── */

interface ICB {
  id?: string;
  _id?: string;
  name?: string;
}

interface Federation {
  id?: string;
  _id?: string;
  name?: string;
  icb?: string | ICB;
}

interface DocumentGroup {
  id?: string;
  _id?: string;
  name?: string;
  colour?: string;
  applicableContractTypes?: string[];
  applicable_contract_types?: string[];
}

interface PCN {
  id?: string;
  _id?: string;
  name?: string;
  icb?: ICB;
  federation?: Federation;
  federationName?: string;
  contractType?: string;
  hourlyRate?: number | string;
  xeroCode?: string;
  xeroCategory?: string;
  contractStartDate?: string;
  contractRenewalDate?: string;
  contractExpiryDate?: string;
  priority?: "normal" | "high" | "low" | string;
  tags?: string[];
  notes?: string;
  complianceGroups?: (string | DocumentGroup)[];
  complianceGroup?: string | DocumentGroup;
}

interface PCNForm {
  name: string;
  icb: string;
  federation: string;
  contractType: string;
  hourlyRate: string;
  xeroCode: string;
  xeroCategory: string;
  contractStartDate: string;
  contractRenewalDate: string;
  contractExpiryDate: string;
  priority: string;
  tags: string;
  notes: string;
  complianceGroups: string[];
}

/* ─── ICB accent colours ──────────────────────────────────────────────── */
const ACCENTS = [
  { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    icon: "text-blue-500"    },
  { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700",  icon: "text-purple-500"  },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" },
  { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    icon: "text-rose-500"    },
  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   icon: "text-amber-500"   },
  { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700",    icon: "text-cyan-500"    },
];

const buildAccentMap = (icbs: ICB[]) => {
  const map: Record<string, number> = {};
  icbs.forEach((icb, idx) => { map[String(icb.id || icb._id)] = idx % ACCENTS.length; });
  return map;
};

/* ─── Federation name resolver ────────────────────────────────────────── */
const resolveFederationName = (pcn: PCN, fedMap: Record<string, Federation>) => {
  if (!pcn) return null;
  if (pcn.federationName) return pcn.federationName;
  const f = pcn.federation;
  if (!f) return null;
  if (typeof f === "object" && f.name) return f.name;
  const fid = (f as any)?.id || (f as any)?._id || f;
  if (fid && fedMap[String(fid)]) return fedMap[String(fid)].name;
  return null;
};

/* ─── Helper: get id ──────────────────────────────────────────────────── */
const getId = (g: any): string => g?.id ?? g?._id ?? g;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const F: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
    {children}
  </div>
);

const FilterChip: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={13} className="shrink-0 text-slate-400" />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </div>
);

const buildPCNForm = (existing: PCN | null): PCNForm => ({
  name:               existing?.name               || "",
  icb:                getId(existing?.icb)         || "",
  federation:         getId(existing?.federation)  || "",
  contractType:       existing?.contractType       || "",
  hourlyRate:         String(existing?.hourlyRate  || ""),
  xeroCode:           existing?.xeroCode           || "",
  xeroCategory:       existing?.xeroCategory       || "",
  contractStartDate: existing?.contractStartDate
    ? new Date(existing.contractStartDate).toISOString().split("T")[0] : "",
  contractRenewalDate: existing?.contractRenewalDate
    ? new Date(existing.contractRenewalDate).toISOString().split("T")[0] : "",
  contractExpiryDate: existing?.contractExpiryDate
    ? new Date(existing.contractExpiryDate).toISOString().split("T")[0]  : "",
  priority: existing?.priority || "normal",
  tags:     existing?.tags?.join(", ") || "",
  notes:    existing?.notes || "",
  complianceGroups: existing?.complianceGroups?.length
    ? existing.complianceGroups.map(getId).filter(Boolean) as string[]
    : existing?.complianceGroup
    ? [getId(existing.complianceGroup)].filter(Boolean) as string[]
    : [],
});

const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

const PRIORITY_STYLE: Record<string, string> = {
  high:   "bg-red-50 text-red-700 border-red-200",
  low:    "bg-amber-50 text-amber-700 border-amber-200",
  normal: "",
};

/* ─── Portal wrapper ──────────────────────────────────────────────────────*/
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      setMounted(false);
    };
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
};

/* ─── Delete Confirm Dialog ───────────────────────────────────────────── */
interface DeleteDialogProps {
  pcn: PCN | null;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}
const DeleteDialog: React.FC<DeleteDialogProps> = ({ pcn, onConfirm, onCancel, deleting }) => {
  if (!pcn) return null;
  return (
    <Portal>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9999 }}
        className="flex items-center justify-center p-4"
      >
        <div
          style={{ position: "fixed", inset: 0, zIndex: 0 }}
          className="bg-black/50 backdrop-blur-sm"
          onClick={!deleting ? onCancel : undefined}
        />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <h2 className="mb-2 text-base font-bold text-slate-800">Delete Client</h2>
          <p className="mb-6 text-sm text-slate-500 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-700">"{pcn.name}"</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 size={14} />
              )}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

/* ─── PCN Modal ───────────────────────────────────────────────────────── */
interface PCNModalProps {
  existing: PCN | null;
  icbs: ICB[];
  federations: Federation[];
  fedsLoading: boolean;
  groups: DocumentGroup[];
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

const PCNModal: React.FC<PCNModalProps> = ({ existing, icbs, federations, fedsLoading, groups, onClose, onSave }) => {
  const isEdit = !!existing;

  const [form,   setForm]   = useState<PCNForm>(() => buildPCNForm(existing));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => { setForm(buildPCNForm(existing)); }, [existing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filteredFeds = useMemo(() => {
    const savedFedId = String(form.federation || "");
    return federations.filter((f) => {
      const fedId = String(getId(f) || "");
      if (savedFedId && fedId === savedFedId) return true;
      if (!form.icb) return true;
      return String(getId(f.icb) || "") === String(form.icb);
    });
  }, [federations, form.icb, form.federation]);

  const filteredGroups = useMemo(() => {
    if (!form.contractType) return groups;
    return groups.filter((g) => {
      const types = g.applicableContractTypes || g.applicable_contract_types || [];
      return types.length === 0 || types.includes(form.contractType);
    });
  }, [groups, form.contractType]);

  const handleIcbChange = (newIcb: string) => {
    setForm((cur) => {
      const currentFed = federations.find(
        (f) => String(getId(f)) === String(cur.federation)
      );
      const fedBelongsToNewIcb =
        currentFed && String(getId(currentFed.icb) || "") === String(newIcb);
      return {
        ...cur,
        icb: newIcb,
        federation: fedBelongsToNewIcb ? cur.federation : "",
      };
    });
  };

  const handleContractTypeChange = (newType: string) => {
    setForm((cur) => {
      const validGroupIds = new Set(
        groups
          .filter((g) => {
            const types = g.applicableContractTypes || g.applicable_contract_types || [];
            return types.length === 0 || types.includes(newType);
          })
          .map((g) => String(getId(g)))
      );
      return {
        ...cur,
        contractType:     newType,
        complianceGroups: cur.complianceGroups.filter((id) => validGroupIds.has(String(id))),
      };
    });
  };

  const toggleGroup = (groupId: string) =>
    setForm((cur) => {
      const sel   = (cur.complianceGroups || []).map(String);
      const strId = String(groupId);
      return {
        ...cur,
        complianceGroups: sel.includes(strId)
          ? sel.filter((id) => id !== strId)
          : [...sel, strId],
      };
    });

  const handle = async () => {
    if (!form.name.trim()) { setError("Client name is required"); return; }
    setSaving(true); setError("");
    try {
      const { contractStartDate, ...restForm } = form;
      const payload = {
        ...(isEdit ? restForm : form),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      await onSave(payload);
      onClose();
    } catch (e: any) { setError(e.message); }
    finally     { setSaving(false); }
  };

  const inp = (key: keyof PCNForm, placeholder: string, type = "text") => (
    <input
      type={type} value={form[key] as string} placeholder={placeholder} autoComplete="off"
      onChange={(e) => setForm((cur) => ({ ...cur, [key]: e.target.value }))}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all focus:border-blue-400 focus:bg-white focus:outline-none"
    />
  );

  const sel = (key: keyof PCNForm, options: [string, string][], placeholder = "None", onChange?: (v: string) => void) => (
    <select
      value={form[key] as string} autoComplete="off"
      onChange={(e) => onChange ? onChange(e.target.value) : setForm((cur) => ({ ...cur, [key]: e.target.value }))}
      className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <Portal>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9999 }}
        className="flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="flex w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[90vh] flex-col rounded-t-2xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-bold text-slate-800">
              {existing ? "Edit Client" : "Add Client"}
            </h3>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
            <div className="space-y-4 p-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
              )}

              <F label="Client Name *">{inp("name", "e.g. Salford Central Client")}</F>

              <div className="grid grid-cols-2 gap-3">
                <F label="ICB">
                  <select
                    value={form.icb} autoComplete="off"
                    onChange={(e) => handleIcbChange(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                  >
                    <option value="">Select ICB…</option>
                    {icbs.map((icb) => (
                      <option key={getId(icb)} value={getId(icb)}>{icb.name}</option>
                    ))}
                  </select>
                </F>
                <F label="Federation / INT">
                  <select
                    value={fedsLoading ? "" : form.federation}
                    autoComplete="off"
                    disabled={fedsLoading}
                    onChange={(e) => setForm((cur) => ({ ...cur, federation: e.target.value }))}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none disabled:opacity-60 disabled:cursor-wait"
                  >
                    <option value="">{fedsLoading ? "Loading…" : "None"}</option>
                    {!fedsLoading && filteredFeds.map((fed) => (
                      <option key={getId(fed)} value={getId(fed)}>{fed.name}</option>
                    ))}
                  </select>
                </F>
              </div>

              {/* Contract Type */}
              <div className="grid grid-cols-2 gap-3">
                <F label="Contract Type">
                  {sel(
                    "contractType",
                    [["ARRS","ARRS"],["EA","EA"],["Direct","Direct"],["Mixed","Mixed"]],
                    "Select type…",
                    handleContractTypeChange
                  )}
                </F>
                <F label="Hourly Rate (£)">{inp("hourlyRate", "0", "number")}</F>
              </div>

              {/* Compliance Groups */}
              <F label="Compliance Groups">
                {!form.contractType ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                    Select a contract type first to see applicable groups
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-600">
                    No compliance groups available for <strong>{form.contractType}</strong>
                  </div>
                ) : (
                  <div className="space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 max-h-44 [scrollbar-width:thin]">
                    {filteredGroups.map((g) => {
                      const gId     = String(getId(g));
                      const checked = (form.complianceGroups || []).map(String).includes(gId);
                      const types   = g.applicableContractTypes || g.applicable_contract_types || [];
                      return (
                        <label key={gId} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-slate-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleGroup(gId)}
                            className="h-4 w-4 accent-purple-600 mt-0.5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {g.colour && (
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: g.colour }} />
                              )}
                              <span className="text-sm font-medium text-slate-700">{g.name}</span>
                            </div>
                            {types.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {types.map((t) => (
                                  <span key={t} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border
                                    ${t === form.contractType
                                      ? "bg-purple-100 text-purple-700 border-purple-300"
                                      : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                            {types.length === 0 && (
                              <span className="text-[10px] text-slate-400">All contract types</span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                {(form.complianceGroups || []).length > 0 && (
                  <p className="mt-1.5 text-xs font-semibold text-purple-700">
                    {form.complianceGroups.length} group{form.complianceGroups.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </F>

              <div className="grid grid-cols-2 gap-3">
                <F label="Xero Code">{inp("xeroCode", "SAL1")}</F>
                <F label="Xero Category">{sel("xeroCategory", [["PCN","PCN"],["GPX","GPX"],["EAX","EAX"]])}</F>
              </div>

              {isEdit ? (
                <div className="grid grid-cols-3 gap-3">
                  <F label="Start Date">
                    <div className="relative">
                      <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed">
                        {form.contractStartDate
                          ? new Date(form.contractStartDate).toLocaleDateString("en-GB")
                          : "—"}
                      </div>
                      <span className="absolute -top-1 -right-1 text-[9px] bg-amber-100 text-amber-600 border border-amber-200 px-1 py-0.5 rounded font-bold leading-none">
                        Locked
                      </span>
                    </div>
                  </F>
                  <F label="Renewal Date">{inp("contractRenewalDate", "", "date")}</F>
                  <F label="Expiry Date">{inp("contractExpiryDate", "", "date")}</F>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <F label="Start Date">{inp("contractStartDate", "", "date")}</F>
                  <F label="Renewal Date">{inp("contractRenewalDate", "", "date")}</F>
                  <F label="Expiry Date">{inp("contractExpiryDate", "", "date")}</F>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <F label="Priority">{sel("priority", [["normal","Normal"],["high","High"],["low","Low"]])}</F>
                <F label="Tags (comma separated)">{inp("tags", "urgent, renewal-due")}</F>
              </div>

              <F label="Notes">
                <textarea
                  value={form.notes} autoComplete="off" rows={3}
                  onChange={(e) => setForm((cur) => ({ ...cur, notes: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none"
                />
              </F>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 gap-3 border-t border-slate-100 px-5 py-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handle} disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {saving
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Check size={15} />}
              {existing ? "Save Changes" : "Create Client"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function PCNListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const filters  = useAppSelector((state: any) => state.pcn.filters);
  const [modal,        setModal]       = useState<PCN | "add" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PCN | null>(null);
  const [deleting,     setDeleting]    = useState(false);

  const { data: pcnData, isLoading, refetch } = usePCNs();
  const { data: icbData }   = useICBs();
  const { data: fedData, isLoading: fedsLoading }   = useFederations();
  const { data: groupData } = useDocumentGroups({ active: true });

  const pcns: PCN[]   = pcnData?.pcns        || [];
  const icbs: ICB[]   = icbData?.icbs        || [];
  const feds: Federation[]   = fedData?.federations || [];
  const groups: DocumentGroup[] = groupData?.groups    || [];

  const fedMap = useMemo(() => {
    const map: Record<string, Federation> = {};
    feds.forEach((f) => {
      const id = getId(f);
      if (id) map[String(id)] = f;
    });
    return map;
  }, [feds]);

  const icbAccentMap = useMemo(() => buildAccentMap(icbs), [icbs]);

  const createPCN = useCreatePCN();
  const updatePCN = useUpdatePCN();
  const deletePCN = useDeletePCN();

  const filteredPCNs = useMemo(() => {
    const q = (filters.search || "").trim().toLowerCase();
    return pcns.filter((pcn) => {
      const fedName   = resolveFederationName(pcn, fedMap) || "";
      const matchSearch = !q ||
        [pcn.name, pcn.icb?.name, fedName, pcn.xeroCode, pcn.contractType, pcn.notes]
          .filter(Boolean).join(" ").toLowerCase().includes(q);
      const matchIcb      = !filters.icb         || String(getId(pcn.icb) || "") === filters.icb;
      const matchContract = !filters.contractType || pcn.contractType === filters.contractType;
      return matchSearch && matchIcb && matchContract;
    });
  }, [filters, pcns, fedMap]);

  const avgHourlyRate = useMemo(() => {
    const rated = filteredPCNs.filter((p) => Number(p.hourlyRate) > 0);
    if (!rated.length) return 0;
    return rated.reduce((s, p) => s + Number(p.hourlyRate), 0) / rated.length;
  }, [filteredPCNs]);

  const handleSave = async (form: any) => {
    const id = getId(modal);
    if (id && modal !== "add") await updatePCN.mutateAsync({ id, data: form });
    else                       await createPCN.mutateAsync(form);
    setModal(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePCN.mutateAsync(getId(deleteTarget));
      setDeleteTarget(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: "PCN / Client",
      id: "pcn",
      cellClassName: "px-4 py-3 align-top",
      render: (pcn: PCN) => {
        const priorityStyle = pcn.priority && typeof pcn.priority === "string" ? PRIORITY_STYLE[pcn.priority] || "" : "";
        const icbId     = String(getId(pcn.icb) || "");
        const icbName   = pcn.icb?.name;
        const accentIdx = icbAccentMap[icbId] ?? 0;
        const accent    = ACCENTS[accentIdx];
        const fedName   = resolveFederationName(pcn, fedMap);

        return (
          <div className="space-y-1.5 min-w-[180px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 text-sm leading-tight">{pcn.name}</span>
              {pcn.priority && pcn.priority !== "normal" && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityStyle}`}>
                  {String(pcn.priority).toUpperCase()}
                </span>
              )}
              {(pcn.tags || []).map((tag) => (
                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
              ))}
            </div>
            {icbName && (
              <div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${accent.bg} ${accent.border} ${accent.text}`}>
                  <Building2 size={10} className={accent.icon} />{icbName}
                </span>
              </div>
            )}
            {fedName && (
              <div className="flex items-center gap-1">
                <Layers size={11} className="text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-500 leading-tight">{fedName}</span>
              </div>
            )}
            {pcn.notes && (
              <div className="max-w-[260px] line-clamp-1 text-xs text-slate-400">{pcn.notes}</div>
            )}
          </div>
        );
      },
    },
    {
      header: "Contract",
      id: "contract",
      hideOnMobile: true,
      render: (pcn: PCN) => pcn.contractType
        ? <span className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">{pcn.contractType}</span>
        : <span className="text-slate-400">—</span>,
      cellClassName: "px-4 py-3 align-top",
    },
    {
      header: "Hourly Rate",
      id: "hourlyRate",
      hideOnMobile: true,
      render: (pcn: PCN) => pcn.hourlyRate
        ? <span className="text-sm font-semibold text-green-700">£{Number(pcn.hourlyRate).toLocaleString()}/hr</span>
        : <span className="text-slate-400">—</span>,
      cellClassName: "px-4 py-3 align-top whitespace-nowrap",
    },
    {
      header: "Contract Dates",
      id: "dates",
      hideOnMobile: true,
      render: (pcn: PCN) => {
        if (!pcn.contractStartDate && !pcn.contractRenewalDate && !pcn.contractExpiryDate) {
          return <span className="text-slate-400">—</span>;
        }
        const renewal  = pcn.contractRenewalDate ? new Date(pcn.contractRenewalDate) : null;
        const daysLeft = renewal ? Math.ceil((renewal.getTime() - Date.now()) / 86_400_000) : null;
        const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft > 0;
        const isPast   = daysLeft !== null && daysLeft <= 0;
        return (
          <div className="space-y-0.5 text-xs leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold w-11 shrink-0">Start</span>
              <span className="text-slate-600">{formatDate(pcn.contractStartDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold w-11 shrink-0">Renew</span>
              <span className={isPast ? "text-red-600 font-semibold" : isUrgent ? "text-amber-600 font-semibold" : "text-slate-600"}>
                {formatDate(pcn.contractRenewalDate)}
                {isUrgent && ` (${daysLeft}d)`}
                {isPast && " (overdue)"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold w-11 shrink-0">Expiry</span>
              <span className="text-slate-600">{formatDate(pcn.contractExpiryDate)}</span>
            </div>
          </div>
        );
      },
      cellClassName: "px-4 py-3 align-top whitespace-nowrap",
    },
    {
      header: "Xero",
      id: "xero",
      hideOnMobile: true,
      render: (pcn: PCN) => (
        <div>
          <div className="text-sm text-slate-600">{pcn.xeroCode || "—"}</div>
          <div className="text-xs text-slate-400">{pcn.xeroCategory || ""}</div>
        </div>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      render: (pcn: PCN) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${getId(pcn)}`)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="View">
            <Eye size={15} />
          </button>
          <button onClick={() => setModal(pcn)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
            <Edit2 size={15} />
          </button>
          <button onClick={() => setDeleteTarget(pcn)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-slate-400">
            <button onClick={() => navigate("/dashboard/super-admin/clients")}
              className="transition-colors hover:text-blue-600">Client Management</button>
            <ChevronRight size={13} />
            <span className="font-medium text-slate-600">PCNs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Primary Care Networks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPCNs.length} visible of {pcns.length} Clients
            {avgHourlyRate > 0 && (
              <span className="ml-3 text-green-700 font-semibold">
                · Avg rate: £{avgHourlyRate.toFixed(2)}/hr
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} title="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors">
            <Plus size={15} /> Add Client
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => dispatch(setPcnFilters({ search: e.target.value }))}
            placeholder="Search PCN, ICB, federation, Xero code…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm focus:border-blue-400 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="ICB">
            <select value={filters.icb || ""}
              onChange={(e) => dispatch(setPcnFilters({ icb: e.target.value }))}
              className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              {icbs.map((icb) => <option key={getId(icb)} value={getId(icb)}>{icb.name}</option>)}
            </select>
          </FilterChip>
          <FilterChip label="Contract">
            <select value={filters.contractType || ""}
              onChange={(e) => dispatch(setPcnFilters({ contractType: e.target.value }))}
              className="cursor-pointer bg-transparent text-sm outline-none">
              <option value="">All</option>
              {["ARRS","EA","Direct","Mixed"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FilterChip>
          {(filters.search || filters.icb || filters.contractType) && (
            <button onClick={() => dispatch(resetPcnFilters())}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPCNs}
        rowKey={(row: PCN) => String(getId(row))}
        loading={isLoading}
        loadingText="Loading Clients…"
        emptyState={
          <div className="flex flex-col items-center p-12 text-center">
            <Network size={36} className="mb-3 text-slate-300" />
            <p className="font-semibold text-slate-500">No clients match the current filters</p>
          </div>
        }
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />

      {/* Add / Edit Modal */}
      {modal && (
        <PCNModal
          key={modal === "add" ? "pcn-add" : `pcn-${getId(modal)}`}
          existing={modal === "add" ? null : modal}
          icbs={icbs}
          federations={feds}
          fedsLoading={fedsLoading}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        pcn={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}


