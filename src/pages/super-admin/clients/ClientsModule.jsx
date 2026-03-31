/**
 * ClientsModule.jsx  —  CPS Client Management
 * FIXES:
 *   ✓ Duplicate axios interceptor removed — AuthContext handles it globally
 *   ✓ UI spacing, padding, typography tightened throughout
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Building2, Network, Stethoscope, GitBranch,
  MessageSquare, UserX, RefreshCw, Plus, Search,
  Pencil, Trash2, Loader2, X, Hash,
  MapPin, Star, Shield, Mail, Phone, Users,
  FileSignature, AlertTriangle, Monitor, StickyNote,
  FileText,
} from "lucide-react";

import HierarchyTree  from "./HierarchyTree.jsx";
import DetailPanel    from "./DetailPanel.jsx";
import StatsBar       from "./StatsBar.jsx";
import EmptyState     from "./EmptyState.jsx";
import SearchBar      from "./SearchBar.jsx";
import { ICBModal, FederationModal, PCNModal, PracticeModal } from "./ClientFormModals.jsx";
import { Btn, fmt }   from "./ClientUtils.jsx";

const API = import.meta.env.VITE_API_URL;

// ── Interceptor removed from here — AuthContext.jsx handles it globally ──

/* ─────────────────────────────────────────────────────────────
   ROOT ROUTER
───────────────────────────────────────────────────────────── */
export default function ClientsModule() {
  const { pathname } = useLocation();
  if (pathname.endsWith("/clients/icb"))       return <ICBsView />;
  if (pathname.endsWith("/clients/pcn"))        return <PCNsView />;
  if (pathname.endsWith("/clients/practice"))   return <PracticesView />;
  if (pathname.endsWith("/clients/history"))    return <HistoryView />;
  if (pathname.endsWith("/clients/restricted")) return <RestrictedView />;
  return <HierarchyView />;
}

/* ─────────────────────────────────────────────────────────────
   BLANK FORM TEMPLATES
───────────────────────────────────────────────────────────── */
const BLANK = {
  icb:        { name: "", region: "", code: "", notes: "" },
  federation: { name: "", icb: "", type: "federation", notes: "" },
  pcn: {
    name: "", icb: "", federation: "", federationName: "",
    annualSpend: "", contractType: "", notes: "",
    contractRenewalDate: "", contractExpiryDate: "",
    xeroCode: "", xeroCategory: "",
  },
  practice: {
    name: "", pcn: "", odsCode: "", address: "", city: "", postcode: "",
    fte: "", contractType: "", systemAccessNotes: "",
    xeroCode: "", xeroCategory: "", notes: "",
  },
};

/*
   VIEW 1 — HIERARCHY  (/clients)
*/
function HierarchyView() {
  const [hierarchy,   setHierarchy]   = useState({ tree: [], counts: {} });
  const [icbs,        setIcbs]        = useState([]);
  const [federations, setFederations] = useState([]);
  const [pcns,        setPcns]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [saving,      setSaving]      = useState(false);
  const [modals,      setModals]      = useState({ icb: null, federation: null, pcn: null, practice: null });
  const [forms,       setForms]       = useState({ ...BLANK });
  const [editTarget,  setEditTarget]  = useState(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const [h, i, f, p] = await Promise.all([
        axios.get(`${API}/clients/hierarchy`),
        axios.get(`${API}/clients/icb`),
        axios.get(`${API}/clients/federation`),
        axios.get(`${API}/clients/pcn`),
      ]);
      setHierarchy(h.data);
      setIcbs(i.data.icbs || []);
      setFederations(f.data.federations || []);
      setPcns(p.data.pcns || []);
    } catch (err) {
      console.error("fetchAll error:", err);
      setError("Failed to load client data. Please try again.");
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return hierarchy.tree;
    const q = search.toLowerCase();
    return hierarchy.tree
      .map(icb => {
        const icbMatch = icb.name.toLowerCase().includes(q);
        const pcns2 = (icb.pcns || [])
          .filter(pcn => icbMatch || pcn.name.toLowerCase().includes(q) ||
            (pcn.practices || []).some(pr =>
              pr.name.toLowerCase().includes(q) ||
              (pr.odsCode || "").toLowerCase().includes(q)
            ))
          .map(pcn => ({
            ...pcn,
            practices: (pcn.practices || []).filter(pr =>
              icbMatch || pcn.name.toLowerCase().includes(q) ||
              pr.name.toLowerCase().includes(q) ||
              (pr.odsCode || "").toLowerCase().includes(q)
            ),
          }));
        return { ...icb, pcns: pcns2 };
      })
      .filter(icb => icb.name.toLowerCase().includes(q) || icb.pcns.length > 0);
  }, [hierarchy.tree, search]);

  const openModal  = (type, mode, target = null, prefill = {}) => {
    setEditTarget(target);
    setForms(f => ({ ...f, [type]: target ? { ...BLANK[type], ...prefill } : { ...BLANK[type] } }));
    setModals(m => ({ ...m, [type]: mode }));
  };
  const closeModal = (type) => { setModals(m => ({ ...m, [type]: null })); setEditTarget(null); };
  const setForm    = (type, u) => setForms(f => ({ ...f, [type]: typeof u === "function" ? u(f[type]) : u }));

  const handleSave = async (type, endpoint) => {
    setSaving(true);
    try {
      const form = forms[type];
      if (editTarget) await axios.put(`${API}/${endpoint}/${editTarget._id}`, form);
      else            await axios.post(`${API}/${endpoint}`, form);
      await fetchAll(true); closeModal(type);
    } catch (err) { alert(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (endpoint, confirmMsg, clearSelected = false) => {
    if (!window.confirm(confirmMsg)) return;
    try {
      await axios.delete(`${API}/${endpoint}`);
      await fetchAll(true);
      if (clearSelected) setSelected(null);
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between
        gap-3 px-5 py-4 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow shadow-blue-200">
            <GitBranch size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Hierarchy View</h1>
            <p className="text-[11px] text-slate-400">ICB → Federation / INT → PCN → Practice</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => fetchAll(true)} title="Refresh"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200
              text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          </button>
          <Btn onClick={() => openModal("icb", "add")}        variant="ghost" size="sm"><Plus size={12} className="mr-1" />ICB</Btn>
          <Btn onClick={() => openModal("federation", "add")} variant="ghost" size="sm"><Plus size={12} className="mr-1" />Federation</Btn>
          <Btn onClick={() => openModal("pcn", "add")}        variant="ghost" size="sm"><Plus size={12} className="mr-1" />PCN</Btn>
          <Btn onClick={() => openModal("practice", "add")}   size="sm"><Plus size={12} className="mr-1" />Practice</Btn>
        </div>
      </div>

      <StatsBar counts={hierarchy.counts} loading={loading} />

      {/* Search */}
      <div className="px-5 pt-3 pb-2 bg-white border-b border-slate-100">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-5 mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-50
          border border-red-200 rounded-xl text-sm text-red-700">
          <span className="flex-1 text-xs">{error}</span>
          <button onClick={fetchAll} className="text-red-600 underline text-xs font-medium">Retry</button>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-1">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 gap-4 p-5 pt-3 min-h-0 overflow-hidden">
        {/* Tree */}
        <div className="shrink-0 flex flex-col min-h-0" style={{ width: "17rem" }}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden flex-1">
            <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Structure</p>
                <div className="flex items-center gap-2.5">
                  {[["bg-blue-500","ICB"],["bg-indigo-500","Fed"],["bg-purple-500","PCN"],["bg-emerald-500","GP"]].map(([c,l]) => (
                    <span key={l} className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${c}`} />
                      <span className="text-[9px] font-semibold text-slate-400">{l}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
              <HierarchyTree
                tree={filteredTree} loading={loading} selected={selected} onSelect={setSelected}
                onEditICB={icb => openModal("icb","edit",icb,{name:icb.name,region:icb.region||"",code:icb.code||"",notes:icb.notes||""})}
                onDeleteICB={id => handleDelete(`clients/icb/${id}`,"Delete this ICB?")}
                onEditFederation={f => openModal("federation","edit",f,{name:f.name,icb:f.icb?._id||f.icb||"",type:f.type,notes:f.notes||""})}
                onDeleteFederation={id => handleDelete(`clients/federation/${id}`,"Delete this Federation?")}
                onEditPCN={pcn => openModal("pcn","edit",pcn,{
                  name:pcn.name, icb:pcn.icb?._id||pcn.icb||"", federation:pcn.federation?._id||pcn.federation||"",
                  federationName:pcn.federationName||"", annualSpend:pcn.annualSpend||"",
                  contractType:pcn.contractType||"", xeroCode:pcn.xeroCode||"", xeroCategory:pcn.xeroCategory||"",
                  notes:pcn.notes||"", contractRenewalDate:pcn.contractRenewalDate?.slice?.(0,10)||"",
                  contractExpiryDate:pcn.contractExpiryDate?.slice?.(0,10)||"",
                })}
                onDeletePCN={id => handleDelete(`clients/pcn/${id}`,"Delete this PCN?",selected?.data?._id===id)}
                onEditPractice={(pr,pcnId) => openModal("practice","edit",pr,{
                  name:pr.name, pcn:pcnId, odsCode:pr.odsCode||"", address:pr.address||"",
                  city:pr.city||"", postcode:pr.postcode||"", fte:pr.fte||"",
                  contractType:pr.contractType||"", systemAccessNotes:pr.systemAccessNotes||"",
                  xeroCode:pr.xeroCode||"", xeroCategory:pr.xeroCategory||"", notes:pr.notes||"",
                })}
                onDeletePractice={id => handleDelete(`clients/practice/${id}`,"Delete this Practice?",selected?.data?._id===id)}
              />
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {selected
            ? <DetailPanel key={selected.data._id} selected={selected} onRefresh={() => fetchAll(true)} />
            : <EmptyState />
          }
        </div>
      </div>

      {modals.icb        && <ICBModal        mode={modals.icb}        form={forms.icb}        setForm={v=>setForm("icb",v)}        onSave={()=>handleSave("icb","clients/icb")}               onClose={()=>closeModal("icb")}        saving={saving}/>}
      {modals.federation && <FederationModal mode={modals.federation} form={forms.federation} setForm={v=>setForm("federation",v)} icbs={icbs} onSave={()=>handleSave("federation","clients/federation")} onClose={()=>closeModal("federation")} saving={saving}/>}
      {modals.pcn        && <PCNModal        mode={modals.pcn}        form={forms.pcn}        setForm={v=>setForm("pcn",v)}        icbs={icbs} federations={federations} onSave={()=>handleSave("pcn","clients/pcn")} onClose={()=>closeModal("pcn")} saving={saving}/>}
      {modals.practice   && <PracticeModal   mode={modals.practice}   form={forms.practice}   setForm={v=>setForm("practice",v)}   pcns={pcns} onSave={()=>handleSave("practice","clients/practice")} onClose={()=>closeModal("practice")} saving={saving}/>}
    </div>
  );
}

/*
   VIEW 2 — ICBs  (/clients/icb)
*/
function ICBsView() {
  const [icbs,       setIcbs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(BLANK.icb);
  const [saving,     setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await axios.get(`${API}/clients/icb`); setIcbs(data.icbs || []); }
    catch {}
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditTarget(null); setForm(BLANK.icb); setModal("add"); };
  const openEdit = (icb) => {
    setEditTarget(icb);
    setForm({ name: icb.name, region: icb.region||"", code: icb.code||"", notes: icb.notes||"" });
    setModal("edit");
  };
  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editTarget) await axios.put(`${API}/clients/icb/${editTarget._id}`, form);
      else            await axios.post(`${API}/clients/icb`, form);
      await load(); setModal(null);
    } catch (err) { alert(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };
  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await axios.delete(`${API}/clients/icb/${id}`); await load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const filtered = icbs.filter(i =>
    !search ||
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.region||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <ViewHeader icon={Building2} iconBg="bg-blue-600" title="ICBs"
        subtitle={`Integrated Care Boards · ${icbs.length} total`}
        onRefresh={load} onAdd={openAdd} addLabel="Add ICB" />

      <div className="px-5 py-3">
        <SimpleSearch value={search} onChange={setSearch} placeholder="Search ICBs…" className="max-w-xs" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {loading ? <Spinner /> : filtered.length === 0 ? <EmptyMsg icon={Building2} msg="No ICBs found" /> : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {["ICB Name","Region","Code","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(icb => (
                  <tr key={icb._id} className="group hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Building2 size={13} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-800">{icb.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{icb.region || "—"}</td>
                    <td className="px-4 py-3">
                      {icb.code
                        ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{icb.code}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconBtn icon={Pencil} onClick={() => openEdit(icb)} hoverClass="hover:bg-blue-50 hover:text-blue-600" />
                        <IconBtn icon={Trash2} onClick={() => del(icb._id, icb.name)} hoverClass="hover:bg-red-50 hover:text-red-600" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <ICBModal mode={modal} form={form} setForm={setForm} onSave={save} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
}

/*
   VIEW 3 — PCNs  (/clients/pcn)
*/
function PCNsView() {
  const [pcns,       setPcns]       = useState([]);
  const [icbs,       setIcbs]       = useState([]);
  const [feds,       setFeds]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterICB,  setFilterICB]  = useState("");
  const [selected,   setSelected]   = useState(null);
  const [modal,      setModal]      = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(BLANK.pcn);
  const [saving,     setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, i, f] = await Promise.all([
        axios.get(`${API}/clients/pcn`),
        axios.get(`${API}/clients/icb`),
        axios.get(`${API}/clients/federation`),
      ]);
      setPcns(p.data.pcns || []); setIcbs(i.data.icbs || []); setFeds(f.data.federations || []);
    } catch {}
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = pcns.filter(p => {
    const q = search.toLowerCase();
    return (!search || p.name.toLowerCase().includes(q)) &&
           (!filterICB || String(p.icb?._id || p.icb) === filterICB);
  });

  const openEdit = (pcn) => {
    setEditTarget(pcn);
    setForm({
      name: pcn.name, icb: pcn.icb?._id || pcn.icb || "",
      federation: pcn.federation?._id || pcn.federation || "",
      federationName: pcn.federationName || "", annualSpend: pcn.annualSpend || "",
      contractType: pcn.contractType || "", xeroCode: pcn.xeroCode || "",
      xeroCategory: pcn.xeroCategory || "", notes: pcn.notes || "",
      contractRenewalDate: pcn.contractRenewalDate?.slice?.(0, 10) || "",
      contractExpiryDate: pcn.contractExpiryDate?.slice?.(0, 10) || "",
    });
    setModal("edit");
  };
  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editTarget) await axios.put(`${API}/clients/pcn/${editTarget._id}`, form);
      else            await axios.post(`${API}/clients/pcn`, form);
      await load(); setModal(null);
    } catch (err) { alert(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };
  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/clients/pcn/${id}`);
      await load();
      if (selected?.data?._id === id) setSelected(null);
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <ViewHeader icon={Network} iconBg="bg-purple-600" title="PCNs"
        subtitle={`Primary Care Networks · ${pcns.length} total`}
        onRefresh={load} onAdd={() => { setEditTarget(null); setForm(BLANK.pcn); setModal("add"); }} addLabel="Add PCN" />

      <div className="flex flex-1 gap-4 p-5 pt-3 min-h-0 overflow-hidden">
        <div className="w-72 shrink-0 flex flex-col gap-2.5 min-h-0">
          <SimpleSearch value={search} onChange={setSearch} placeholder="Search PCNs…" />
          <select value={filterICB} onChange={e => setFilterICB(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white
              focus:outline-none focus:border-blue-400 transition-all text-slate-600">
            <option value="">All ICBs</option>
            {icbs.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <div className="flex-1 overflow-y-auto space-y-1.5 [scrollbar-width:thin]">
            {loading ? <Spinner /> : filtered.length === 0 ? <EmptyMsg icon={Network} msg="No PCNs found" /> :
              filtered.map(pcn => {
                const active = selected?.data?._id === pcn._id;
                return (
                  <div key={pcn._id} onClick={() => setSelected({ type: "pcn", data: pcn })}
                    className={`group p-3.5 rounded-xl border cursor-pointer transition-all
                      ${active ? "bg-purple-50 border-purple-200 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${active ? "bg-purple-200" : "bg-purple-100"}`}>
                        <Network size={13} className={active ? "text-purple-700" : "text-purple-600"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate leading-tight ${active ? "text-purple-800" : "text-slate-800"}`}>{pcn.name}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{pcn.icb?.name || "No ICB"}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {pcn.annualSpend > 0 && <span className="text-[11px] text-emerald-600 font-bold">£{Number(pcn.annualSpend).toLocaleString()}</span>}
                          {pcn.contractType && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{pcn.contractType}</span>}
                        </div>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                        <IconBtn icon={Pencil} size={11} onClick={e => { e.stopPropagation(); openEdit(pcn); }} hoverClass="hover:bg-blue-50 hover:text-blue-600" />
                        <IconBtn icon={Trash2} size={11} onClick={e => { e.stopPropagation(); del(pcn._id, pcn.name); }} hoverClass="hover:bg-red-50 hover:text-red-600" />
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          {selected
            ? <DetailPanel key={selected.data._id} selected={selected} onRefresh={load} />
            : <SelectPrompt icon={Network} msg="Select a PCN to view its full record" />
          }
        </div>
      </div>

      {modal && <PCNModal mode={modal} form={form} setForm={setForm} icbs={icbs} federations={feds} onSave={save} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
}

/*
   VIEW 4 — PRACTICES  (/clients/practice)
*/
function PracticesView() {
  const [practices, setPractices] = useState([]);
  const [pcns,      setPcns]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filterPCN, setFilterPCN] = useState("");
  const [selected,  setSelected]  = useState(null);
  const [modal,     setModal]     = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form,      setForm]      = useState(BLANK.practice);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, p] = await Promise.all([
        axios.get(`${API}/clients/practice`),
        axios.get(`${API}/clients/pcn`),
      ]);
      setPractices(pr.data.practices || []); setPcns(p.data.pcns || []);
    } catch {}
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = practices.filter(pr => {
    const q = search.toLowerCase();
    return (!search || pr.name.toLowerCase().includes(q) ||
            (pr.odsCode||"").toLowerCase().includes(q) ||
            (pr.city||"").toLowerCase().includes(q)) &&
           (!filterPCN || String(pr.pcn?._id || pr.pcn) === filterPCN);
  });

  const openEdit = (pr) => {
    setEditTarget(pr);
    setForm({
      name: pr.name, pcn: pr.pcn?._id || pr.pcn || "", odsCode: pr.odsCode || "",
      address: pr.address || "", city: pr.city || "", postcode: pr.postcode || "",
      fte: pr.fte || "", contractType: pr.contractType || "",
      systemAccessNotes: pr.systemAccessNotes || "",
      xeroCode: pr.xeroCode || "", xeroCategory: pr.xeroCategory || "", notes: pr.notes || "",
    });
    setModal("edit");
  };
  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editTarget) await axios.put(`${API}/clients/practice/${editTarget._id}`, form);
      else            await axios.post(`${API}/clients/practice`, form);
      await load(); setModal(null);
    } catch (err) { alert(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };
  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/clients/practice/${id}`);
      await load();
      if (selected?.data?._id === id) setSelected(null);
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <ViewHeader icon={Stethoscope} iconBg="bg-emerald-600" title="Practices / Surgeries"
        subtitle={`${practices.length} total across all PCNs`}
        onRefresh={load} onAdd={() => { setEditTarget(null); setForm(BLANK.practice); setModal("add"); }} addLabel="Add Practice" />

      <div className="flex flex-1 gap-4 p-5 pt-3 min-h-0 overflow-hidden">
        <div className="w-72 shrink-0 flex flex-col gap-2.5 min-h-0">
          <SimpleSearch value={search} onChange={setSearch} placeholder="Name, ODS code, city…" />
          <select value={filterPCN} onChange={e => setFilterPCN(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white
              focus:outline-none focus:border-emerald-400 transition-all text-slate-600">
            <option value="">All PCNs</option>
            {pcns.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <div className="flex-1 overflow-y-auto space-y-1.5 [scrollbar-width:thin]">
            {loading ? <Spinner /> : filtered.length === 0 ? <EmptyMsg icon={Stethoscope} msg="No practices found" /> :
              filtered.map(pr => {
                const active = selected?.data?._id === pr._id;
                return (
                  <div key={pr._id} onClick={() => setSelected({ type: "practice", data: pr })}
                    className={`group p-3.5 rounded-xl border cursor-pointer transition-all
                      ${active ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${active ? "bg-emerald-200" : "bg-emerald-100"}`}>
                        <Stethoscope size={13} className={active ? "text-emerald-700" : "text-emerald-600"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate leading-tight ${active ? "text-emerald-800" : "text-slate-800"}`}>{pr.name}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{pr.pcn?.name || "No PCN"}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {pr.odsCode && <span className="flex items-center gap-1 text-[11px] text-slate-400"><Hash size={9} />{pr.odsCode}</span>}
                          {(pr.city || pr.postcode) && <span className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[90px]"><MapPin size={9} />{[pr.city, pr.postcode].filter(Boolean).join(", ")}</span>}
                          {pr.contractType && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">{pr.contractType}</span>}
                        </div>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                        <IconBtn icon={Pencil} size={11} onClick={e => { e.stopPropagation(); openEdit(pr); }} hoverClass="hover:bg-blue-50 hover:text-blue-600" />
                        <IconBtn icon={Trash2} size={11} onClick={e => { e.stopPropagation(); del(pr._id, pr.name); }} hoverClass="hover:bg-red-50 hover:text-red-600" />
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          {selected
            ? <DetailPanel key={selected.data._id} selected={selected} onRefresh={load} />
            : <SelectPrompt icon={Stethoscope} msg="Select a Practice to view its full record" />
          }
        </div>
      </div>

      {modal && <PracticeModal mode={modal} form={form} setForm={setForm} pcns={pcns} onSave={save} onClose={() => setModal(null)} saving={saving} />}
    </div>
  );
}

/*
   VIEW 5 — HISTORY  (/clients/history)
*/
const TYPE_META = {
  email:         { label: "Email",         icon: Mail,          color: "bg-blue-100 text-blue-700"    },
  call:          { label: "Call",          icon: Phone,         color: "bg-green-100 text-green-700"  },
  meeting:       { label: "Meeting",       icon: Users,         color: "bg-purple-100 text-purple-700"},
  contract:      { label: "Contract",      icon: FileSignature, color: "bg-orange-100 text-orange-700"},
  complaint:     { label: "Complaint",     icon: AlertTriangle, color: "bg-red-100 text-red-700"      },
  system_access: { label: "System Access", icon: Monitor,       color: "bg-cyan-100 text-cyan-700"    },
  document:      { label: "Document",      icon: FileText,      color: "bg-indigo-100 text-indigo-700"},
  note:          { label: "Note",          icon: StickyNote,    color: "bg-slate-100 text-slate-600"  },
};

function HistoryView() {
  const [logs,       setLogs]      = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [search,     setSearch]    = useState("");
  const [typeFilter, setTypeFilter]= useState("all");
  const [starOnly,   setStarOnly]  = useState(false);
  const [pcns,       setPcns]      = useState([]);
  const [pcnFilter,  setPcnFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: pd } = await axios.get(`${API}/clients/pcn`);
      const allPCNs = pd.pcns || [];
      setPcns(allPCNs);
      const results = await Promise.all(
        allPCNs.slice(0, 30).map(pcn =>
          axios.get(`${API}/clients/PCN/${pcn._id}/history?limit=50`)
            .then(r => (r.data.logs || []).map(l => ({ ...l, _entityName: pcn.name, _entityId: pcn._id })))
            .catch(() => [])
        )
      );
      setLogs(results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch {}
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleStar = async (id) => {
    await axios.patch(`${API}/clients/history/${id}/star`).catch(() => {});
    setLogs(prev => prev.map(l => l._id === id ? { ...l, starred: !l.starred } : l));
  };

  const visible = logs.filter(l => {
    const q = search.toLowerCase();
    return (!search || l.subject?.toLowerCase().includes(q) || l.notes?.toLowerCase().includes(q) || l._entityName?.toLowerCase().includes(q)) &&
           (typeFilter === "all" || l.type === typeFilter) &&
           (!starOnly || l.starred) &&
           (!pcnFilter || l._entityId === pcnFilter);
  });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <ViewHeader icon={MessageSquare} iconBg="bg-blue-600" title="Contact History"
        subtitle="All communications across PCNs and Practices"
        onRefresh={load} showAdd={false} />

      <div className="px-5 py-3 space-y-2 border-b border-slate-200 bg-white shrink-0">
        <div className="flex gap-2.5 flex-wrap">
          <SimpleSearch value={search} onChange={setSearch} placeholder="Search subject, notes, client…" className="flex-1 min-w-[160px]" />
          <select value={pcnFilter} onChange={e => setPcnFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none text-slate-600 min-w-[150px]">
            <option value="">All PCNs</option>
            {pcns.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button onClick={() => setStarOnly(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
              ${starOnly ? "bg-amber-50 text-amber-600 border-amber-300" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
            <Star size={12} className={starOnly ? "fill-amber-500 text-amber-500" : ""} /> Starred
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <TypePill active={typeFilter === "all"} onClick={() => setTypeFilter("all")} label="All" />
          {Object.entries(TYPE_META).map(([k, { label }]) => (
            <TypePill key={k} active={typeFilter === k} onClick={() => setTypeFilter(k)} label={label} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 [scrollbar-width:thin]">
        {loading ? <Spinner /> : visible.length === 0 ? <EmptyMsg icon={MessageSquare} msg="No history entries found" /> :
          visible.map(log => {
            const meta = TYPE_META[log.type] || TYPE_META.note;
            const Icon = meta.icon;
            return (
              <div key={log._id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all
                  ${log.starred ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm flex-1 leading-tight">{log.subject}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.color}`}>{meta.label}</span>
                  </div>
                  {log.notes && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{log.notes}</p>}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-[11px] text-slate-400">{fmt(log.date)}{log.time ? ` · ${log.time}` : ""}</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Network size={9} />{log._entityName}
                    </span>
                    {log.createdBy?.name && <span className="text-[11px] text-slate-400">by {log.createdBy.name}</span>}
                  </div>
                </div>
                <button onClick={() => toggleStar(log._id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0
                    ${log.starred ? "text-amber-500" : "text-slate-300 hover:text-amber-400"}`}>
                  <Star size={12} className={log.starred ? "fill-amber-500" : ""} />
                </button>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

/*
   VIEW 6 — RESTRICTED  (/clients/restricted)
*/
function RestrictedView() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pd, prd] = await Promise.all([
        axios.get(`${API}/clients/pcn`),
        axios.get(`${API}/clients/practice`),
      ]);
      const rows = [];
      for (const pcn of (pd.data.pcns || [])) {
        if (!pcn.restrictedClinicians?.length) continue;
        const full = await axios.get(`${API}/clients/pcn/${pcn._id}`).catch(() => null);
        const restricted = full?.data?.pcn?.restrictedClinicians || pcn.restrictedClinicians || [];
        for (const c of restricted) rows.push({ entityName: pcn.name, entityType: "PCN", clinician: c });
      }
      for (const pr of (prd.data.practices || [])) {
        if (!pr.restrictedClinicians?.length) continue;
        const full = await axios.get(`${API}/clients/practice/${pr._id}`).catch(() => null);
        const restricted = full?.data?.practice?.restrictedClinicians || pr.restrictedClinicians || [];
        for (const c of restricted) rows.push({ entityName: pr.name, entityType: "Practice", clinician: c });
      }
      setEntries(rows);
    } catch {}
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const byClinician = {};
  const visible = entries.filter(e => {
    const q = search.toLowerCase();
    return !search || (e.clinician?.name || "").toLowerCase().includes(q) || e.entityName.toLowerCase().includes(q);
  });
  for (const e of visible) {
    const key = e.clinician?._id || e.clinician;
    if (!byClinician[key]) byClinician[key] = { clinician: e.clinician, entities: [] };
    byClinician[key].entities.push({ name: e.entityName, type: e.entityType });
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <ViewHeader icon={UserX} iconBg="bg-red-600" title="Restricted Clinicians"
        subtitle={`Flagged across all sites · ${Object.keys(byClinician).length} unique`}
        onRefresh={load} showAdd={false} />

      <div className="px-5 pt-3 pb-2 space-y-2.5">
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
          <Shield size={13} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 leading-relaxed">
            Clinicians listed here are <strong>blocked from placement</strong> at the linked sites.
            Manage restrictions from each PCN or Practice record.
          </p>
        </div>
        <SimpleSearch value={search} onChange={setSearch} placeholder="Search by clinician name or site…" className="max-w-sm" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2.5 [scrollbar-width:thin]">
        {loading ? <Spinner /> : Object.keys(byClinician).length === 0 ? (
          <div className="text-center py-14">
            <UserX size={32} className="text-slate-200 mx-auto mb-2.5" />
            <p className="text-slate-400 font-semibold text-sm">No restrictions found</p>
            <p className="text-slate-400 text-xs mt-1">All clinicians are eligible at all sites</p>
          </div>
        ) : Object.values(byClinician).map((entry, i) => {
          const c = entry.clinician;
          return (
            <div key={i} className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50/60">
                <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {(c?.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm leading-tight">{c?.name || "Unknown"}</p>
                  <p className="text-[11px] text-slate-500">{c?.email || ""}</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                  {entry.entities.length} site{entry.entities.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="px-4 py-3 flex flex-wrap gap-1.5">
                {entry.entities.map((ent, j) => {
                  const EIcon = ent.type === "PCN" ? Network : Stethoscope;
                  return (
                    <span key={j} className="flex items-center gap-1.5 text-xs font-semibold
                      px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                      <EIcon size={10} className={ent.type === "PCN" ? "text-purple-500" : "text-emerald-500"} />
                      {ent.name}
                      <span className="text-[9px] text-slate-400">({ent.type})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*
   SHARED MICRO-COMPONENTS
*/
function ViewHeader({ icon: Icon, iconBg, title, subtitle, onRefresh, onAdd, addLabel, showAdd = true }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shadow shadow-black/10`}>
          <Icon size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">{title}</h1>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={onRefresh}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200
            text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
          <RefreshCw size={13} />
        </button>
        {showAdd && onAdd && (
          <Btn onClick={onAdd} size="sm">
            <Plus size={12} className="mr-1" />{addLabel}
          </Btn>
        )}
      </div>
    </div>
  );
}

function SimpleSearch({ value, onChange, placeholder, className = "max-w-sm" }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-8 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white
          placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
      {value && (
        <button onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={11} />
        </button>
      )}
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, hoverClass, size = 13 }) {
  return (
    <button onClick={onClick}
      className={`w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 transition-colors ${hoverClass}`}>
      <Icon size={size} />
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-14">
      <Loader2 size={22} className="animate-spin text-blue-400" />
    </div>
  );
}

function EmptyMsg({ icon: Icon, msg }) {
  return (
    <div className="text-center py-14">
      <Icon size={26} className="text-slate-200 mx-auto mb-2" />
      <p className="text-sm text-slate-400">{msg}</p>
    </div>
  );
}

function SelectPrompt({ icon: Icon, msg }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm
      flex flex-col items-center justify-center h-full min-h-[340px] text-center p-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-600 mb-1">Select an item</p>
      <p className="text-xs text-slate-400">{msg}</p>
    </div>
  );
}

function TypePill({ active, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all
        ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
      {label}
    </button>
  );
}