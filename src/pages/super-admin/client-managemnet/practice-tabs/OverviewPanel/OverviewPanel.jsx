import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit2, FileCheck, Save, ShieldCheck, X, MapPin } from "lucide-react";

const Spinner = ({ cls = "border-white" }) => (
  <span
    className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`}
  />
);

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

const EditRow = ({
  label,
  value,
  onChange,
  type = "text",
  options,
  placeholder,
}) => (
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

export default function OverviewPanel({
  practice,
  linkedClient,
  groups,
  groupsLoading,
  patch,
}) {
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

  // ensure currently-assigned compliance group is always represented
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                editing
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
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
            <EditRow label="ODS Code" value={form.odsCode} onChange={set("odsCode")} />
            <EditRow label="FTE" value={form.fte} onChange={set("fte")} />
            <EditRow
              label="Contract Type"
              value={form.contractType}
              onChange={set("contractType")}
              options={["ARRS", "EA", "Direct", "Mixed"]}
            />
            <EditRow label="Xero Code" value={form.xeroCode} onChange={set("xeroCode")} />
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

            <EditRow label="Address" value={form.address} onChange={set("address")} />
            <EditRow label="City" value={form.city} onChange={set("city")} />
            <EditRow label="Postcode" value={form.postcode} onChange={set("postcode")} />
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
                  ? `${currentGroup.documents.length} document${
                      currentGroup.documents.length !== 1 ? "s" : ""
                    }`
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
            <DetailRow label="Priority" value={practice.priority || "normal"} />
          </div>
        )}
      </div>

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
        </div>

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
                          className={
                            d.mandatory ? "text-red-500" : "text-slate-400"
                          }
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
            <p className="text-sm text-slate-400">No compliance group assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}
