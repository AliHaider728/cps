/**
 * tabs/RestrictedTab.jsx
 */
import { useState, useEffect } from "react";
import { UserX, Shield, Trash2, Search, Plus, Loader2 } from "lucide-react";
import { Btn } from "../ClientUtils.jsx";
import { authAPI, pcnAPI, practiceAPI } from "../../../../api/api.js";

export default function RestrictedTab({ data, entityType, entityId, onRefresh }) {
  const restricted = data?.restrictedClinicians || [];
  const [allClinicians,      setAllClinicians]      = useState([]);
  const [search,             setSearch]             = useState("");
  const [showAdd,            setShowAdd]            = useState(false);
  const [saving,             setSaving]             = useState(false);
  const [loadingClinicians,  setLoadingClinicians]  = useState(false);

  /* Fetch all users and filter clinicians client-side */
  useEffect(() => {
    if (!showAdd) return;
    setLoadingClinicians(true);
    authAPI.getAllUsers()
      .then(r => {
        const users = r.data.users || [];
        setAllClinicians(users.filter(u => u.role === "clinician"));
      })
      .catch(() => {})
      .finally(() => setLoadingClinicians(false));
  }, [showAdd]);

  const restrictedIds = restricted.map(c => String(c._id || c));

  const patch = async (ids) => {
    if (entityType === "PCN") {
      await pcnAPI.updateRestricted(entityId, ids);
    } else {
      await practiceAPI.updateRestricted(entityId, ids);
    }
  };

  const addRestricted = async (clinicianId) => {
    if (restrictedIds.includes(String(clinicianId))) return;
    setSaving(true);
    try {
      await patch([...restrictedIds, clinicianId]);
      onRefresh?.();
      setShowAdd(false);
    } catch {}
    finally { setSaving(false); }
  };

  const removeRestricted = async (clinicianId) => {
    if (!window.confirm("Remove restriction for this clinician?")) return;
    setSaving(true);
    try {
      await patch(restrictedIds.filter(id => id !== String(clinicianId)));
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
    <div className="p-4 sm:p-6 space-y-4">

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
            <div className="max-h-52 overflow-y-auto space-y-1.5
              [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
              {available.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No clinicians found</p>
              ) : available.map(c => (
                <div key={c._id}
                  onClick={() => !saving && addRestricted(c._id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl
                    hover:bg-red-50 hover:border-red-200 border border-transparent
                    cursor-pointer transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400
                    flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                  </div>
                  {saving
                    ? <Loader2 size={12} className="animate-spin text-slate-400 shrink-0" />
                    : <span className="text-xs font-bold text-red-500 shrink-0">Restrict</span>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restricted list */}
      {restricted.length === 0 && !showAdd ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <UserX size={22} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500 font-medium">No restrictions</p>
          <p className="text-xs text-slate-400 mt-1">All clinicians are eligible for placement here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {restricted.map(c => (
            <div key={c._id || c}
              className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl
                hover:border-red-300 transition-all">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-400 to-red-600
                flex items-center justify-center text-white font-bold text-sm shrink-0
                shadow-sm shadow-red-200">
                {(c.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{c.name || "Unknown"}</p>
                <p className="text-xs text-slate-500 truncate">{c.email}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full
                bg-red-100 text-red-700 border border-red-200 shrink-0 hidden sm:inline-flex">
                Restricted
              </span>
              <button
                onClick={() => removeRestricted(c._id || c)}
                disabled={saving}
                className="w-7 h-7 flex items-center justify-center rounded-lg
                  text-red-400 hover:bg-red-100 hover:text-red-700
                  disabled:opacity-50 transition-colors shrink-0"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}