import { useState, useEffect } from "react";
import { Network, Plus, Eye, Edit2, Trash2, X, Check, ChevronRight, Building2, Layers, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPCNs, getICBs, getFederations, createPCN, updatePCN, deletePCN } from "../../../api/ClientApi.js";

/* ── PCN Form Modal ── */
const PCNModal = ({ existing, icbs, federations, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:             existing?.name || "",
    icb:              existing?.icb?._id || existing?.icb || "",
    federation:       existing?.federation?._id || existing?.federation || "",
    contractType:     existing?.contractType || "",
    annualSpend:      existing?.annualSpend || "",
    xeroCode:         existing?.xeroCode || "",
    xeroCategory:     existing?.xeroCategory || "",
    contractRenewalDate: existing?.contractRenewalDate ? new Date(existing.contractRenewalDate).toISOString().split("T")[0] : "",
    contractExpiryDate:  existing?.contractExpiryDate  ? new Date(existing.contractExpiryDate).toISOString().split("T")[0]  : "",
    notes:            existing?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const filteredFeds = federations.filter(f => !form.icb || String(f.icb?._id || f.icb) === form.icb);

  const handle = async () => {
    if (!form.name.trim()) { setError("PCN name is required"); return; }
    if (!form.icb)         { setError("ICB is required"); return; }
    setSaving(true); setError("");
    try { await onSave(form); onClose(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const F = ({ label, children }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );

  const input = (key, placeholder, type="text") => (
    <input type={type} value={form[key]} placeholder={placeholder}
      onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-base font-bold text-slate-800">{existing ? "Edit PCN" : "Add PCN"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16}/></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 [scrollbar-width:thin]">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}

          <F label="PCN Name *">{input("name", "e.g. Salford Central PCN")}</F>

          <div className="grid grid-cols-2 gap-3">
            <F label="ICB *">
              <select value={form.icb} onChange={e => setForm(f => ({...f, icb: e.target.value, federation: ""}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">Select ICB…</option>
                {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
            </F>
            <F label="Federation / INT">
              <select value={form.federation} onChange={e => setForm(f => ({...f, federation: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {filteredFeds.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Contract Type">
              <select value={form.contractType} onChange={e => setForm(f => ({...f, contractType: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {["ARRS","EA","Direct","Mixed"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </F>
            <F label="Annual Spend (£)">{input("annualSpend", "0", "number")}</F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Xero Code">{input("xeroCode", "SAL1")}</F>
            <F label="Xero Category">
              <select value={form.xeroCategory} onChange={e => setForm(f => ({...f, xeroCategory: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {["PCN","GPX","EAX"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Contract Renewal">{input("contractRenewalDate", "", "date")}</F>
            <F label="Contract Expiry">{input("contractExpiryDate", "", "date")}</F>
          </div>

          <F label="Notes">
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none" />
          </F>
        </div>

        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check size={15}/>}
            {existing ? "Save Changes" : "Create PCN"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════ */
export default function PCNListPage() {
  const navigate = useNavigate();
  const [pcns,    setPCNs]    = useState([]);
  const [icbs,    setICBs]    = useState([]);
  const [feds,    setFeds]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [icbFilter, setIcbFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (icbFilter) params.icb = icbFilter;
      const [pd, id, fd] = await Promise.all([getPCNs(params), getICBs(), getFederations()]);
      setPCNs(pd.pcns || []);
      setICBs(id.icbs || []);
      setFeds(fd.federations || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [icbFilter]);

  const handleSave = async (form) => {
    if (modal?._id) await updatePCN(modal._id, form);
    else            await createPCN(form);
    await load();
  };

  const handleDelete = async (pcn) => {
    if (!confirm(`Delete "${pcn.name}"?`)) return;
    try { await deletePCN(pcn._id); await load(); }
    catch (e) { alert(e.message); }
  };

  const CONTRACT_COLOR = {
    ARRS:   "bg-blue-50 text-blue-700 border-blue-200",
    EA:     "bg-green-50 text-green-700 border-green-200",
    Direct: "bg-amber-50 text-amber-700 border-amber-200",
    Mixed:  "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <button onClick={() => navigate("/dashboard/super-admin/clients")} className="hover:text-blue-600 transition-colors">Client Management</button>
            <ChevronRight size={13} />
            <span className="text-slate-600 font-medium">PCNs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Primary Care Networks</h1>
          <p className="text-slate-500 text-sm mt-1">{pcns.length} PCN{pcns.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={icbFilter} onChange={e => setIcbFilter(e.target.value)}
            className="text-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="">All ICBs</option>
            {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all">
            <Plus size={15}/> Add PCN
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-[3px] border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pcns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 flex flex-col items-center text-center">
          <Network size={36} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-semibold">No PCNs found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {pcns.map(pcn => (
            <div key={pcn._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
                <Network size={20} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-800">{pcn.name}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {pcn.icb?.name && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Building2 size={11}/> {pcn.icb.name}
                    </span>
                  )}
                  {pcn.federation?.name && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Layers size={11}/> {pcn.federation.name}
                    </span>
                  )}
                  {pcn.annualSpend > 0 && (
                    <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                      £{pcn.annualSpend.toLocaleString()}
                    </span>
                  )}
                  {pcn.xeroCode && (
                    <span className="text-sm text-slate-400">Xero: {pcn.xeroCode}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {pcn.contractType && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${CONTRACT_COLOR[pcn.contractType] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {pcn.contractType}
                  </span>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${pcn._id}`)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
                    <Eye size={15}/>
                  </button>
                  <button onClick={() => setModal(pcn)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Edit2 size={15}/>
                  </button>
                  <button onClick={() => handleDelete(pcn)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <PCNModal
          existing={modal === "add" ? null : modal}
          icbs={icbs}
          federations={feds}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}