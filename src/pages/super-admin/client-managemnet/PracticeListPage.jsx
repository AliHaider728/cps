import { useState, useEffect } from "react";
import { Stethoscope, Plus, Eye, Edit2, Trash2, X, Check, ChevronRight, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPractices, getPCNs, createPractice, updatePractice, deletePractice } from "../../../api/clientApi.js";

/* ── Practice Form Modal ────────────────────────────────────── */
const PracticeModal = ({ existing, pcns, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:            existing?.name            || "",
    pcn:             existing?.pcn?._id || existing?.pcn || "",
    odsCode:         existing?.odsCode         || "",
    address:         existing?.address         || "",
    city:            existing?.city            || "",
    postcode:        existing?.postcode        || "",
    fte:             existing?.fte             || "",
    contractType:    existing?.contractType    || "",
    xeroCode:        existing?.xeroCode        || "",
    xeroCategory:    existing?.xeroCategory    || "",
    patientListSize: existing?.patientListSize || "",
    notes:           existing?.notes           || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handle = async () => {
    if (!form.name.trim()) { setError("Practice name is required"); return; }
    if (!form.pcn)         { setError("PCN is required"); return; }
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
  const inp = (key, placeholder, type="text") => (
    <input type={type} value={form[key]} placeholder={placeholder}
      onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-[15px] font-bold text-slate-800">{existing ? "Edit Practice" : "Add Practice"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X size={16}/></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 [scrollbar-width:thin]">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">{error}</div>}

          <F label="Practice Name *">{inp("name", "e.g. Pendleton Medical Centre")}</F>

          <div className="grid grid-cols-2 gap-3">
            <F label="PCN *">
              <select value={form.pcn} onChange={e => setForm(f => ({...f, pcn: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">Select PCN…</option>
                {pcns.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </F>
            <F label="ODS Code">{inp("odsCode", "P84001")}</F>
          </div>

          <F label="Address">{inp("address", "15 Broad Street")}</F>

          <div className="grid grid-cols-2 gap-3">
            <F label="City">{inp("city", "Salford")}</F>
            <F label="Postcode">{inp("postcode", "M6 5BN")}</F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="FTE">{inp("fte", "0.5 FTE (20HRS/WEEK)")}</F>
            <F label="Contract Type">
              <select value={form.contractType} onChange={e => setForm(f => ({...f, contractType: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {["ARRS","EA","Direct","Mixed"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Xero Code">{inp("xeroCode", "PEN1")}</F>
            <F label="Xero Category">
              <select value={form.xeroCategory} onChange={e => setForm(f => ({...f, xeroCategory: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                <option value="">None</option>
                {["PCN","GPX","EAX"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </F>
          </div>

          <F label="Patient List Size">{inp("patientListSize", "0", "number")}</F>

          <F label="Notes">
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none" />
          </F>
        </div>

        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handle} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-[13px] font-semibold hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check size={14}/>}
            {existing ? "Save" : "Create Practice"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════ */
export default function PracticeListPage() {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [pcns,      setPCNs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);
  const [pcnFilter, setPcnFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [pd, pcd] = await Promise.all([getPractices(pcnFilter || undefined), getPCNs()]);
      setPractices(pd.practices || []);
      setPCNs(pcd.pcns || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [pcnFilter]);

  const handleSave = async (form) => {
    if (modal?._id) await updatePractice(modal._id, form);
    else            await createPractice(form);
    await load();
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await deletePractice(p._id); await load(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <button onClick={() => navigate("/dashboard/super-admin/clients")} className="hover:text-blue-600 transition-colors">Client Management</button>
            <ChevronRight size={12} />
            <span className="text-slate-600 font-medium">Practices</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Practices / Surgeries</h1>
          <p className="text-slate-500 text-sm mt-1">{practices.length} practice{practices.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={pcnFilter} onChange={e => setPcnFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="">All PCNs</option>
            {pcns.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-[13px] font-semibold hover:bg-teal-700 transition-all">
            <Plus size={14}/> Add Practice
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-[3px] border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : practices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 flex flex-col items-center text-center">
          <Stethoscope size={36} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-semibold">No practices found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {practices.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all p-5 flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
                <Stethoscope size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-slate-800">{p.name}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {p.odsCode && <span className="text-[11px] text-slate-400">ODS: {p.odsCode}</span>}
                  {p.pcn?.name && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Network size={10}/> {p.pcn.name}
                    </span>
                  )}
                  {p.fte && <span className="text-[11px] text-slate-400">{p.fte}</span>}
                  {p.city && <span className="text-[11px] text-slate-400">{p.city}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.contractType && (
                  <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.5 rounded-md">{p.contractType}</span>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate(`/dashboard/super-admin/clients/practice/${p._id}`)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
                    <Eye size={14}/>
                  </button>
                  <button onClick={() => setModal(p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={() => handleDelete(p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <PracticeModal
          existing={modal === "add" ? null : modal}
          pcns={pcns}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}