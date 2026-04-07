import { useEffect, useMemo, useState } from "react";
import { Stethoscope, Plus, Eye, Edit2, Trash2, X, Check, ChevronRight, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePractices, useCreatePractice, useUpdatePractice, useDeletePractice } from "../../../hooks/usePractice";
import { usePCNs } from "../../../hooks/usePCN";
import { useDocumentGroups } from "../../../hooks/useCompliance";

const F = ({ label, children }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
    {children}
  </div>
);

const buildPracticeForm = (existing) => ({
  name: existing?.name || "",
  pcn: existing?.pcn?._id || existing?.pcn || "",
  complianceGroup: existing?.complianceGroup?._id || existing?.complianceGroup || "",
  odsCode: existing?.odsCode || "",
  address: existing?.address || "",
  city: existing?.city || "",
  postcode: existing?.postcode || "",
  fte: existing?.fte || "",
  contractType: existing?.contractType || "",
  xeroCode: existing?.xeroCode || "",
  xeroCategory: existing?.xeroCategory || "",
  patientListSize: existing?.patientListSize || "",
  notes: existing?.notes || "",
});

const PracticeModal = ({ existing, pcns, groups, onClose, onSave }) => {
  const [form, setForm] = useState(() => buildPracticeForm(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(buildPracticeForm(existing));
  }, [existing]);

  const handle = async () => {
    if (!form.name.trim()) { setError("Practice name is required"); return; }
    if (!form.pcn) { setError("PCN is required"); return; }
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
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-[15px] font-bold text-slate-800">{existing ? "Edit Practice" : "Add Practice"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1 [scrollbar-width:thin]">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">{error}</div>}
          <F label="Practice Name *">{input("name", "e.g. Pendleton Medical Centre")}</F>
          <div className="grid grid-cols-2 gap-3">
            <F label="PCN *">
              <select value={form.pcn} autoComplete="off" onChange={(e) => setForm((current) => ({ ...current, pcn: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">Select PCN…</option>
                {pcns.map((pcn) => <option key={pcn._id} value={pcn._id}>{pcn.name}</option>)}
              </select>
            </F>
            <F label="ODS Code">{input("odsCode", "P84001")}</F>
          </div>
          <F label="Compliance Group">
            <select value={form.complianceGroup} autoComplete="off" onChange={(e) => setForm((current) => ({ ...current, complianceGroup: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
              <option value="">None</option>
              {groups.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}
            </select>
          </F>
          <F label="Address">{input("address", "15 Broad Street")}</F>
          <div className="grid grid-cols-2 gap-3">
            <F label="City">{input("city", "Salford")}</F>
            <F label="Postcode">{input("postcode", "M6 5BN")}</F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="FTE">{input("fte", "0.5 FTE (20HRS/WEEK)")}</F>
            <F label="Contract Type">
              <select value={form.contractType} autoComplete="off" onChange={(e) => setForm((current) => ({ ...current, contractType: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {["ARRS", "EA", "Direct", "Mixed"].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Xero Code">{input("xeroCode", "PEN1")}</F>
            <F label="Xero Category">
              <select value={form.xeroCategory} autoComplete="off" onChange={(e) => setForm((current) => ({ ...current, xeroCategory: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {["PCN", "GPX", "EAX"].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </F>
          </div>
          <F label="Patient List Size">{input("patientListSize", "0", "number")}</F>
          <F label="Notes">
            <textarea value={form.notes} autoComplete="off" spellCheck={false} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none" />
          </F>
        </div>
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-[13px] font-semibold hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
            {existing ? "Save" : "Create Practice"}
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

export default function PracticeListPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    pcn: "",
    city: "",
    contractType: "",
    group: "",
  });

  const { data: practiceData, isLoading } = usePractices();
  const { data: pcnData } = usePCNs();
  const { data: groupData } = useDocumentGroups({ active: true });

  const practices = practiceData?.practices || [];
  const pcns = pcnData?.pcns || [];
  const groups = groupData?.groups || [];

  const createPractice = useCreatePractice();
  const updatePractice = useUpdatePractice();
  const deletePractice = useDeletePractice();

  const filteredPractices = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return practices.filter((practice) => {
      const matchesSearch = !query || [
        practice.name,
        practice.odsCode,
        practice.pcn?.name,
        practice.city,
        practice.postcode,
        practice.complianceGroup?.name,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
      const matchesPcn = !filters.pcn || String(practice.pcn?._id || practice.pcn) === filters.pcn;
      const matchesCity = !filters.city || String(practice.city || "").toLowerCase().includes(filters.city.toLowerCase());
      const matchesContract = !filters.contractType || practice.contractType === filters.contractType;
      const matchesGroup = !filters.group || String(practice.complianceGroup?._id || practice.complianceGroup || "") === filters.group;
      return matchesSearch && matchesPcn && matchesCity && matchesContract && matchesGroup;
    });
  }, [filters, practices]);

  const handleSave = async (form) => {
    if (modal?._id) await updatePractice.mutateAsync({ id: modal._id, data: form });
    else await createPractice.mutateAsync(form);
    setModal(null);
  };

  const handleDelete = async (practice) => {
    if (!confirm(`Delete "${practice.name}"?`)) return;
    try {
      await deletePractice.mutateAsync(practice._id);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <button onClick={() => navigate("/dashboard/super-admin/clients")} className="hover:text-blue-600 transition-colors">Client Management</button>
            <ChevronRight size={12} />
            <span className="text-slate-600 font-medium">Practices</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Practices / Surgeries</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredPractices.length} visible of {practices.length} practices</p>
        </div>
        <button onClick={() => setModal("add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-[13px] font-semibold hover:bg-teal-700 transition-all">
          <Plus size={14} /> Add Practice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
            placeholder="Search by practice, ODS, PCN, city, postcode, or group..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip label="PCN">
            <select value={filters.pcn} onChange={(e) => setFilters((current) => ({ ...current, pcn: e.target.value }))} className="text-sm bg-transparent outline-none cursor-pointer">
              <option value="">All</option>
              {pcns.map((pcn) => <option key={pcn._id} value={pcn._id}>{pcn.name}</option>)}
            </select>
          </FilterChip>
          <FilterChip label="City">
            <input value={filters.city} onChange={(e) => setFilters((current) => ({ ...current, city: e.target.value }))} placeholder="Any" className="text-sm bg-transparent outline-none w-24" />
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
          {(filters.search || filters.pcn || filters.city || filters.contractType || filters.group) && (
            <button onClick={() => setFilters({ search: "", pcn: "", city: "", contractType: "", group: "" })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="w-7 h-7 border-[3px] border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredPractices.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <Stethoscope size={36} className="text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">No practices match the current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Practice", "PCN", "ODS", "Compliance Group", "City", "Contract", "FTE", "Patients", "Actions"].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPractices.map((practice) => (
                  <tr key={practice._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{practice.name}</div>
                      {practice.notes && <div className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-[260px]">{practice.notes}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{practice.pcn?.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{practice.odsCode || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{practice.complianceGroup?.name || "No group"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{practice.city || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{practice.contractType || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{practice.fte || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{practice.patientListSize ? Number(practice.patientListSize).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/dashboard/super-admin/clients/practice/${practice._id}`)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"><Eye size={14} /></button>
                        <button onClick={() => setModal(practice)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(practice)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <PracticeModal
          key={modal === "add" ? "practice-add" : `practice-${modal._id}`}
          existing={modal === "add" ? null : modal}
          pcns={pcns}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
