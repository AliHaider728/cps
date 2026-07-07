import React, { useState, useEffect, useMemo } from "react";
import { X, Check } from "lucide-react";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { PCN, ICB, Federation, DocumentGroup, getId, F } from "../PCNListPage";

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

interface PCNModalProps {
  existing: PCN | null;
  icbs: ICB[];
  federations: Federation[];
  fedsLoading: boolean;
  groups: DocumentGroup[];
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

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

export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "—";

export const PRIORITY_STYLE: Record<string, string> = {
  high:   "bg-red-50 text-red-700 border-red-200",
  low:    "bg-amber-50 text-amber-700 border-amber-200",
  normal: "",
};

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
    <ModalShell
        title={existing ? "Edit Client" : "Add Client"}
        onClose={onClose}
        footer={
          <div className="flex w-full gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handle} disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition-all">
              {saving
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Check size={15} />}
              {existing ? "Save Changes" : "Create Client"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {error ? <div>{error}</div> : null}

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
              value={form.notes as string} autoComplete="off" rows={3}
              onChange={(e) => setForm((cur) => ({ ...cur, notes: e.target.value }))}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none"
            />
          </F>
        </div>
      </ModalShell>
  );
};

export default PCNModal;
