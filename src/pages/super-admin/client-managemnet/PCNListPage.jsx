import { useEffect, useMemo, useState } from "react";
import { Network, Plus, Eye, Edit2, Trash2, X, Check, ChevronRight, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePCNs, useCreatePCN, useUpdatePCN, useDeletePCN } from "../../../hooks/usePCN";
import { useICBs } from "../../../hooks/useICB";
import { useFederations } from "../../../hooks/useFederation";
import { useDocumentGroups } from "../../../hooks/useCompliance";

const F = ({ label, children }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
    {children}
  </div>
);

const buildPCNForm = (existing) => ({
  name: existing?.name || "",
  icb: existing?.icb?._id || existing?.icb || "",
  federation: existing?.federation?._id || existing?.federation || "",
  complianceGroups: existing?.complianceGroups?.length
    ? existing.complianceGroups.map((group) => group?._id || group).filter(Boolean)
    : (existing?.complianceGroup ? [existing?.complianceGroup?._id || existing?.complianceGroup] : []),
  contractType: existing?.contractType || "",
  annualSpend: existing?.annualSpend || "",
  xeroCode: existing?.xeroCode || "",
  xeroCategory: existing?.xeroCategory || "",
  contractRenewalDate: existing?.contractRenewalDate ? new Date(existing.contractRenewalDate).toISOString().split("T")[0] : "",
  contractExpiryDate: existing?.contractExpiryDate ? new Date(existing.contractExpiryDate).toISOString().split("T")[0] : "",
  notes: existing?.notes || "",
});

const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "—";

const PCNModal = ({ existing, icbs, federations, groups, onClose, onSave }) => {
  const [form, setForm] = useState(() => buildPCNForm(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const filteredFeds = federations.filter((f) => !form.icb || String(f.icb?._id || f.icb) === form.icb);

  useEffect(() => {
    setForm(buildPCNForm(existing));
  }, [existing]);

  const toggleGroup = (groupId) => {
    setForm((current) => {
      const selected = current.complianceGroups || [];
      return {
        ...current,
        complianceGroups: selected.includes(groupId)
          ? selected.filter((id) => id !== groupId)
          : [...selected, groupId],
      };
    });
  };

  const handle = async () => {
    if (!form.name.trim()) { setError("PCN name is required"); return; }
    if (!form.icb) { setError("ICB is required"); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const input = (key, placeholder, type = "text") => (
    <input
      type={type}
      value={form[key]}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-base font-bold text-slate-800">{existing ? "Edit PCN" : "Add PCN"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1 [scrollbar-width:thin]">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}
          <F label="PCN Name *">{input("name", "e.g. Salford Central PCN")}</F>
          <div className="grid grid-cols-2 gap-3">
            <F label="ICB *">
              <select
                value={form.icb}
                autoComplete="off"
                onChange={(e) => setForm((current) => ({ ...current, icb: e.target.value, federation: "" }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
              >
                <option value="">Select ICB…</option>
                {icbs.map((icb) => <option key={icb._id} value={icb._id}>{icb.name}</option>)}
              </select>
            </F>
            <F label="Federation / INT">
              <select
                value={form.federation}
                autoComplete="off"
                onChange={(e) => setForm((current) => ({ ...current, federation: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
              >
                <option value="">None</option>
                {filteredFeds.map((fed) => <option key={fed._id} value={fed._id}>{fed.name}</option>)}
              </select>
            </F>
          </div>
          <F label="Compliance Groups">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 max-h-40 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="text-xs text-slate-400">No groups available</p>
              ) : (
                groups.map((group) => (
                  <label key={group._id} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={(form.complianceGroups || []).includes(group._id)} onChange={() => toggleGroup(group._id)} className="w-4 h-4 accent-purple-600" />
                    <span>{group.name}</span>
                  </label>
                ))
              )}
            </div>
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Contract Type">
              <select value={form.contractType} autoComplete="off" onChange={(e) => setForm((current) => ({ ...current, contractType: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {["ARRS", "EA", "Direct", "Mixed"].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </F>
            <F label="Annual Spend (GBP)">{input("annualSpend", "0", "number")}</F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Xero Code">{input("xeroCode", "SAL1")}</F>
            <F label="Xero Category">
              <select value={form.xeroCategory} autoComplete="off" onChange={(e) => setForm((current) => ({ ...current, xeroCategory: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {["PCN", "GPX", "EAX"].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Contract Renewal">{input("contractRenewalDate", "", "date")}</F>
            <F label="Contract Expiry">{input("contractExpiryDate", "", "date")}</F>
          </div>
          <F label="Notes">
            <textarea value={form.notes} autoComplete="off" spellCheck={false} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none" />
          </F>
        </div>
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
            {existing ? "Save Changes" : "Create PCN"}
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterChip = ({ label, children }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
    <Filter size={13} className="text-slate-400 shrink-0" />
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    {children}
  </div>
);

export default function PCNListPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    icb: "",
    contractType: "",
    group: "",
  });

  const { data: pcnData, isLoading } = usePCNs();
  const { data: icbData } = useICBs();
  const { data: fedData } = useFederations();
  const { data: groupData } = useDocumentGroups({ active: true });

  const pcns = pcnData?.pcns || [];
  const icbs = icbData?.icbs || [];
  const feds = fedData?.federations || [];
  const groups = groupData?.groups || [];

  const createPCN = useCreatePCN();
  const updatePCN = useUpdatePCN();
  const deletePCN = useDeletePCN();

  const filteredPCNs = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return pcns.filter((pcn) => {
      const groupNames = (pcn.complianceGroups?.length ? pcn.complianceGroups : (pcn.complianceGroup ? [pcn.complianceGroup] : []))
        .map((group) => group?.name || "")
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || [
        pcn.name,
        pcn.icb?.name,
        pcn.federation?.name,
        pcn.xeroCode,
        pcn.contractType,
        groupNames,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
      const matchesIcb = !filters.icb || String(pcn.icb?._id || pcn.icb) === filters.icb;
      const matchesContract = !filters.contractType || pcn.contractType === filters.contractType;
      const matchesGroup = !filters.group || (pcn.complianceGroups || []).some((group) => String(group?._id || group) === filters.group) || String(pcn.complianceGroup?._id || pcn.complianceGroup || "") === filters.group;
      return matchesSearch && matchesIcb && matchesContract && matchesGroup;
    });
  }, [filters, pcns]);

  const handleSave = async (form) => {
    if (modal?._id) await updatePCN.mutateAsync({ id: modal._id, data: form });
    else await createPCN.mutateAsync(form);
    setModal(null);
  };

  const handleDelete = async (pcn) => {
    if (!confirm(`Delete "${pcn.name}"?`)) return;
    try {
      await deletePCN.mutateAsync(pcn._id);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <button onClick={() => navigate("/dashboard/super-admin/clients")} className="hover:text-blue-600 transition-colors">Client Management</button>
            <ChevronRight size={13} />
            <span className="text-slate-600 font-medium">PCNs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Primary Care Networks</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredPCNs.length} visible of {pcns.length} PCNs</p>
        </div>
        <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all">
          <Plus size={15} /> Add PCN
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
            placeholder="Search by PCN, ICB, federation, Xero code, contract type, or group..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="ICB">
            <select value={filters.icb} onChange={(e) => setFilters((current) => ({ ...current, icb: e.target.value }))} className="text-sm bg-transparent outline-none cursor-pointer">
              <option value="">All</option>
              {icbs.map((icb) => <option key={icb._id} value={icb._id}>{icb.name}</option>)}
            </select>
          </FilterChip>
          <FilterChip label="Contract">
            <select value={filters.contractType} onChange={(e) => setFilters((current) => ({ ...current, contractType: e.target.value }))} className="text-sm bg-transparent outline-none cursor-pointer">
              <option value="">All</option>
              {["ARRS", "EA", "Direct", "Mixed"].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </FilterChip>
          <FilterChip label="Group">
            <select value={filters.group} onChange={(e) => setFilters((current) => ({ ...current, group: e.target.value }))} className="text-sm bg-transparent outline-none cursor-pointer">
              <option value="">All</option>
              {groups.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}
            </select>
          </FilterChip>
          {(filters.search || filters.icb || filters.contractType || filters.group) && (
            <button onClick={() => setFilters({ search: "", icb: "", contractType: "", group: "" })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="w-7 h-7 border-[3px] border-purple-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredPCNs.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <Network size={36} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">No PCNs match the current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["PCN", "ICB", "Federation", "Compliance Groups", "Contract", "Annual Spend", "Renewal", "Xero", "Actions"].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPCNs.map((pcn) => {
                  const assignedGroups = (pcn.complianceGroups?.length ? pcn.complianceGroups : (pcn.complianceGroup ? [pcn.complianceGroup] : []))
                    .map((group) => group?.name || "")
                    .filter(Boolean);
                  return (
                    <tr key={pcn._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{pcn.name}</div>
                        {pcn.notes && <div className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-[260px]">{pcn.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{pcn.icb?.name || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{pcn.federation?.name || "—"}</td>
                      <td className="px-4 py-3">
                        {assignedGroups.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {assignedGroups.map((group) => (
                              <span key={group} className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">{group}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">No groups</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{pcn.contractType || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{pcn.annualSpend ? `£${Number(pcn.annualSpend).toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(pcn.contractRenewalDate)}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        <div>{pcn.xeroCode || "—"}</div>
                        <div className="text-xs text-slate-400">{pcn.xeroCategory || ""}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${pcn._id}`)} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all"><Eye size={15} /></button>
                          <button onClick={() => setModal(pcn)} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(pcn)} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <PCNModal
          key={modal === "add" ? "pcn-add" : `pcn-${modal._id}`}
          existing={modal === "add" ? null : modal}
          icbs={icbs}
          federations={feds}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
