/**
 * tabs/RestrictedTab.jsx
 * Restricted/Unsuitable Clinicians per PCN or Practice.
 * From spec 7.9 and 2.2: "Tab per client to record clinicians who cannot be placed"
 */
import { useState, useEffect } from "react";
import axios from "axios";
import { UserX, Shield, Trash2, Search, Plus, Loader2 } from "lucide-react";
import { Btn } from "../ClientUtils.jsx";

const API = import.meta.env.VITE_API_URL;

export default function RestrictedTab({ data, entityType, entityId, onRefresh }) {
  const restricted  = data?.restrictedClinicians || [];
  const [allClinicians, setAllClinicians] = useState([]);
  const [search,   setSearch]   = useState("");
  const [showAdd,  setShowAdd]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [loadingClinicians, setLoadingClinicians] = useState(false);

  useEffect(() => {
    if (!showAdd) return;
    setLoadingClinicians(true);
    axios.get(`${API}/users?role=clinician`)
      .then(r => setAllClinicians(r.data.users || []))
      .catch(() => {})
      .finally(() => setLoadingClinicians(false));
  }, [showAdd]);

  const restrictedIds = restricted.map(c => String(c._id || c));

  const addRestricted = async (clinicianId) => {
    if (restrictedIds.includes(String(clinicianId))) return;
    setSaving(true);
    try {
      const url = entityType === "PCN"
        ? `${API}/clients/pcn/${entityId}/restricted`
        : `${API}/clients/practice/${entityId}/restricted`;
      await axios.patch(url, { clinicianIds: [...restrictedIds, clinicianId] });
      onRefresh?.();
      setShowAdd(false);
    } catch {}
    finally { setSaving(false); }
  };

  const removeRestricted = async (clinicianId) => {
    if (!window.confirm("Remove restriction for this clinician?")) return;
    const updated = restrictedIds.filter(id => id !== String(clinicianId));
    setSaving(true);
    try {
      const url = entityType === "PCN"
        ? `${API}/clients/pcn/${entityId}/restricted`
        : `${API}/clients/practice/${entityId}/restricted`;
      await axios.patch(url, { clinicianIds: updated });
      onRefresh?.();
    } catch {}
    finally { setSaving(false); }
  };

  const available = allClinicians.filter(c =>
    !restrictedIds.includes(String(c._id)) &&
    (c.name?.toLowerCase().includes(search.toLowerCase()) ||
     c.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Restricted Clinicians ({restricted.length})
        </p>
        <Btn size="sm" variant="danger" onClick={() => setShowAdd(s => !s)}>
          <Plus size={13} /> Add Restriction
        </Btn>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
        <Shield size={14} className="text-red-500 shrink-0 mt-0.5" />
        <p className="text-xs text-red-700 leading-relaxed">
          Clinicians listed here are flagged and <strong>cannot be placed</strong> at this{" "}
          {entityType.toLowerCase()}. These restrictions are visible in rotas and dashboards.
          Booking attempts will be blocked.
        </p>
      </div>

      {/* Add picker */}
      {showAdd && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-slate-700">Select clinician to restrict</p>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clinician…"
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm
                bg-white focus:outline-none focus:border-blue-400 transition-all"
            />
          </div>
          {loadingClinicians ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {available.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No clinicians found</p>
              ) : available.map(c => (
                <div key={c._id}
                  onClick={() => addRestricted(c._id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50
                    hover:border-red-200 border border-transparent cursor-pointer transition-all">
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center
                    text-white text-xs font-bold shrink-0">
                    {c.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                  </div>
                  <span className="text-xs font-bold text-red-500">Restrict</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restricted list */}
      {restricted.length === 0 && !showAdd ? (
        <div className="text-center py-10">
          <UserX size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">No restrictions</p>
          <p className="text-xs text-slate-400 mt-1">All clinicians are eligible for placement here</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {restricted.map(c => (
            <div key={c._id || c}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center
                text-white font-bold text-sm shrink-0">
                {(c.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{c.name || "Unknown"}</p>
                <p className="text-xs text-slate-500">{c.email}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full
                bg-red-100 text-red-700 border border-red-200 shrink-0">
                Restricted
              </span>
              <button
                onClick={() => removeRestricted(c._id || c)}
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  text-red-400 hover:bg-red-100 hover:text-red-700 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}