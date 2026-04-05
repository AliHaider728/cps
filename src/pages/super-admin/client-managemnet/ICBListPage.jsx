// ═══════════════════════════════════════════
// ICBListPage.jsx
// ═══════════════════════════════════════════
import { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2, X, Check, MapPin, Hash, FileText, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getICBs, createICB, updateICB, deleteICB } from "../../../api/clientAPI.js";

const ICBModal = ({ existing, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:   existing?.name   || "",
    region: existing?.region || "",
    code:   existing?.code   || "",
    notes:  existing?.notes  || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = async () => {
    if (!form.name.trim()) { setError("ICB name is required"); return; }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{existing ? "Edit ICB" : "Add ICB"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">ICB Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              placeholder="e.g. NHS Greater Manchester ICB"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Region</label>
              <input value={form.region} onChange={e => setForm(f => ({...f, region: e.target.value}))}
                placeholder="North West"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Code</label>
              <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))}
                placeholder="QOP"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={3} placeholder="Additional notes…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none" />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check size={15}/>}
            {existing ? "Save Changes" : "Create ICB"}
          </button>
        </div>
      </div>
    </div>
  );
};

export function ICBListPage() {
  const navigate = useNavigate();
  const [icbs,    setICBs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  const load = async () => {
    setLoading(true);
    try { const d = await getICBs(); setICBs(d.icbs || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (modal?._id) await updateICB(modal._id, form);
    else            await createICB(form);
    await load();
  };

  const handleDelete = async (icb) => {
    if (!confirm(`Delete "${icb.name}"? This cannot be undone.`)) return;
    try { await deleteICB(icb._id); await load(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <button onClick={() => navigate("/dashboard/super-admin/clients")} className="hover:text-blue-600 transition-colors">
              Client Management
            </button>
            <ChevronRight size={13} />
            <span className="text-slate-600 font-medium">ICBs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Integrated Care Boards</h1>
          <p className="text-slate-500 text-sm mt-1">Manage NHS ICBs — top-level governance bodies</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
        >
          <Plus size={15} />
          Add ICB
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : icbs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 flex flex-col items-center text-center">
          <Building2 size={36} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-semibold">No ICBs added yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add ICB" to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {icbs.map(icb => (
            <div key={icb._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-800">{icb.name}</p>
                <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                  {icb.region && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <MapPin size={11} />
                      {icb.region}
                    </span>
                  )}
                  {icb.code && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Hash size={11} />
                      {icb.code}
                    </span>
                  )}
                  {icb.notes && (
                    <span className="text-sm text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                      <FileText size={11} />
                      {icb.notes}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setModal(icb)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(icb)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ICBModal
          existing={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ICBListPage;