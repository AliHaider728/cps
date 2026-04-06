/**
 * DocumentGroupDetailPage.jsx
 * Route: /dashboard/super-admin/compliance/groups/:id
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layers, ArrowLeft, Edit2, Trash2, Check,
  CheckCircle2, XCircle, Clock, ChevronRight
} from "lucide-react";
import {
  getDocumentGroupById, updateDocumentGroup, deleteDocumentGroup,
  getComplianceDocs,
} from "../../../api/ClientApi.js";

const Spinner = ({ cls = "border-white" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);
const ActivePill = ({ active }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
    active ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
    {active ? "Active" : "In Active"}
  </span>
);
const BadgeStatus = ({ ok, label }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
    ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
    {ok ? <CheckCircle2 size={9} /> : <XCircle size={9} />} {label}
  </span>
);

export default function DocumentGroupDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [group,   setGroup]   = useState(null);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, dRes] = await Promise.all([
        getDocumentGroupById(id),
        getComplianceDocs(),
      ]);
      setGroup(gRes.group);
      setAllDocs(dRes.docs || []);
      setForm({
        name:         gRes.group.name,
        displayOrder: gRes.group.displayOrder,
        active:       gRes.group.active,
        documents:    (gRes.group.documents || []).map(d => d._id || d),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const toggleDoc = docId => {
    const docs = form.documents || [];
    set("documents")(docs.includes(docId) ? docs.filter(d => d !== docId) : [...docs, docId]);
  };
  const activeDocs = allDocs.filter(d => d.active);
  const allChecked = (form.documents || []).length === activeDocs.length;
  const toggleAll  = () => set("documents")(allChecked ? [] : activeDocs.map(d => d._id));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateDocumentGroup(id, form);
      setGroup(res.group);
      setEditing(false);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete group "${group.name}"?`)) return;
    try { await deleteDocumentGroup(id); navigate(-1); }
    catch (e) { alert(e.message); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-9 h-9 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!group) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
      <Layers size={44} className="opacity-30" />
      <p className="font-semibold text-base">Group not found</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  const groupDocs = allDocs.filter(d => (group.documents || []).some(gd => (gd._id || gd) === d._id));

  // 3-column split for checkbox grid
  const cols = [[], [], []];
  activeDocs.forEach((d, i) => cols[i % 3].push(d));

  return (
    <div className="space-y-4 pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm flex-wrap">
        <button onClick={() => navigate("/dashboard/super-admin/clients")} className="text-slate-400 hover:text-blue-600 transition-colors">Client Management</button>
        <ChevronRight size={13} className="text-slate-300" />
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-blue-600 transition-colors">Document Groups</button>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-700 font-bold truncate">{group.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Layers size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">{group.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-slate-400">Display Order: {group.displayOrder}</span>
              <ActivePill active={group.active} />
              <span className="text-sm text-slate-400">{groupDocs.length} document{groupDocs.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all">
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all">
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        </div>
      </div>

      {/* Detail / Edit card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Group Detail</h2>
          <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {saving ? <Spinner /> : editing ? <><Check size={12} /> Save</> : <><Edit2 size={12} /> Edit</>}
          </button>
        </div>

        {editing ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Group Name *</label>
                <input value={form.name} onChange={e => set("name")(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Display Order</label>
                <input type="number" value={form.displayOrder} onChange={e => set("displayOrder")(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!form.active} onChange={e => set("active")(e.target.checked)} className="w-4 h-4 accent-blue-600" />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>

            {/* Documents checkbox grid */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Documents</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 accent-blue-600" />
                  <span className="text-xs font-semibold text-slate-500">Check ALL</span>
                </label>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-2">
                {cols.map((col, ci) => (
                  <div key={ci} className="space-y-2">
                    {col.map(doc => (
                      <label key={doc._id} className="flex items-start gap-2 cursor-pointer group">
                        <input type="checkbox"
                          checked={(form.documents || []).includes(doc._id)}
                          onChange={() => toggleDoc(doc._id)}
                          className="w-3.5 h-3.5 accent-blue-600 cursor-pointer mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-snug">{doc.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setEditing(false); load(); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {saving ? <Spinner /> : <Check size={15} />} Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group Name</span>
                <span className="text-sm font-semibold text-slate-800">{group.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Order</span>
                <span className="text-sm font-semibold text-slate-800">{group.displayOrder}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Documents in this group ({groupDocs.length})</p>
              {groupDocs.length === 0 ? (
                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 py-8 text-center text-slate-400 text-sm">No documents assigned</div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Document Name", "Display Order", "Mandatory", "Expirable", "Active"].map((h, i) => (
                          <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupDocs.sort((a, b) => a.displayOrder - b.displayOrder).map(doc => (
                        <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{doc.name}</td>
                          <td className="px-4 py-3 text-slate-500">{doc.displayOrder}</td>
                          <td className="px-4 py-3"><BadgeStatus ok={doc.mandatory} label={doc.mandatory ? "Mandatory" : "Non-Mandatory"} /></td>
                          <td className="px-4 py-3"><BadgeStatus ok={doc.expirable} label={doc.expirable ? "Expirable" : "Non-Expirable"} /></td>
                          <td className="px-4 py-3"><ActivePill active={doc.active} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                    <p className="text-xs text-slate-500">Total Records : {groupDocs.length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}