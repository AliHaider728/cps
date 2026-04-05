import { useState, useEffect } from "react";
import { Layers, Plus, Edit2, Trash2, X, Check, ChevronRight, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFederations, getICBs, createFederation, updateFederation, deleteFederation } from "../../../api/clientAPI.js";

const FedModal = ({ existing, icbs, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:  existing?.name  || "",
    icb:   existing?.icb?._id || existing?.icb || "",
    type:  existing?.type  || "federation",
    notes: existing?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.icb)         { setError("ICB is required"); return; }
    setSaving(true); setError("");
    try { await onSave(form); onClose(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{existing ? "Edit Federation" : "Add Federation / INT"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16}/></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              placeholder="e.g. Salford Together Federation"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">ICB *</label>
            <select value={form.icb} onChange={e => setForm(f => ({...f, icb: e.target.value}))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer">
              <option value="">Select ICB…</option>
              {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["federation","INT","other"].map(t => (
                <button key={t} onClick={() => setForm(f => ({...f, type: t}))}
                  className={`py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all
                    ${form.type === t ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none" />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check size={15}/>}
            {existing ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FederationListPage() {
  const navigate = useNavigate();
  const [feds,    setFeds]    = useState([]);
  const [icbs,    setICBs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [icbFilter, setIcbFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [fd, id] = await Promise.all([getFederations(icbFilter || undefined), getICBs()]);
      setFeds(fd.federations || []);
      setICBs(id.icbs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [icbFilter]);

  const handleSave = async (form) => {
    if (modal?._id) await updateFederation(modal._id, form);
    else            await createFederation(form);
    await load();
  };

  const handleDelete = async (fed) => {
    if (!confirm(`Delete "${fed.name}"?`)) return;
    try { await deleteFederation(fed._id); await load(); }
    catch (e) { alert(e.message); }
  };

  const TYPE_STYLE = {
    federation: "bg-indigo-50 text-indigo-700 border-indigo-200",
    INT:        "bg-amber-50 text-amber-700 border-amber-200",
    other:      "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <button onClick={() => navigate("/dashboard/super-admin/clients")} className="hover:text-blue-600 transition-colors">Client Management</button>
            <ChevronRight size={13} />
            <span className="text-slate-600 font-medium">Federations / INT</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Federations / INT</h1>
          <p className="text-slate-500 text-sm mt-1">Intermediate tier between ICBs and PCNs</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={icbFilter} onChange={e => setIcbFilter(e.target.value)}
            className="text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="">All ICBs</option>
            {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all">
            <Plus size={15}/> Add Federation
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : feds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 flex flex-col items-center text-center">
          <Layers size={36} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-semibold">No federations found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {feds.map(fed => (
            <div key={fed._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
                <Layers size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-800">{fed.name}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {fed.icb?.name && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Building2 size={11}/> {fed.icb.name}
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${TYPE_STYLE[fed.type] || TYPE_STYLE.other}`}>
                    {fed.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(fed)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  <Edit2 size={15}/>
                </button>
                <button onClick={() => handleDelete(fed)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={15}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <FedModal
          existing={modal === "add" ? null : modal}
          icbs={icbs}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}