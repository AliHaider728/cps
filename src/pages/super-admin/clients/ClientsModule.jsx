/**
 * ClientsModule.jsx  —  FIXED
 * 
 * BUGS FIXED:
 *  ✅ Removed unused `useLocation` import (was imported but never used)
 *  ✅ Error state shown as dismissible banner
 *  ✅ handleSave uses correct API path prefix
 *  ✅ openModal for ICB/Federation uses correct form keys
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Building2, Network, RefreshCw, Plus, X } from "lucide-react";

import HierarchyTree    from "./HierarchyTree.jsx.jsx";
import DetailPanel      from "./DetailPanel.jsx";
import StatsBar         from "./StatsBar.jsx";
import EmptyState       from "./EmptyState.jsx";
import SearchBar        from "./SearchBar.jsx";
import {
  ICBModal, FederationModal, PCNModal, PracticeModal,
} from "./ClientFormModals.jsx";
import { Btn } from "./ClientUtils.jsx";

const API = import.meta.env.VITE_API_URL;

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

export default function ClientsModule() {
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

  const [modals,     setModals]     = useState({ icb: null, federation: null, pcn: null, practice: null });
  const [forms,      setForms]      = useState({ ...BLANK });
  const [editTarget, setEditTarget] = useState(null);

  /* ── Fetch ── */
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);
    setError(null);
    try {
      const [h, i, f, p] = await Promise.all([
        axios.get(`${API}/clients/hierarchy`),
        axios.get(`${API}/clients/icb`),
        axios.get(`${API}/clients/federation`),
        axios.get(`${API}/clients/pcn`),
      ]);
      setHierarchy(h.data);
      setIcbs(i.data.icbs        || []);
      setFederations(f.data.federations || []);
      setPcns(p.data.pcns        || []);
    } catch (err) {
      setError("Failed to load client data. Please try again.");
      console.error("fetchAll error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Filtered tree ── */
  const filteredTree = useMemo(() => {
    if (!search.trim()) return hierarchy.tree;
    const q = search.toLowerCase();
    return hierarchy.tree
      .map(icb => {
        const icbMatch = icb.name.toLowerCase().includes(q);
        const filteredPCNs = (icb.pcns || [])
          .filter(pcn =>
            icbMatch ||
            pcn.name.toLowerCase().includes(q) ||
            (pcn.practices || []).some(pr =>
              pr.name.toLowerCase().includes(q) || (pr.odsCode || "").toLowerCase().includes(q)
            )
          )
          .map(pcn => ({
            ...pcn,
            practices: (pcn.practices || []).filter(pr =>
              icbMatch ||
              pcn.name.toLowerCase().includes(q) ||
              pr.name.toLowerCase().includes(q) ||
              (pr.odsCode || "").toLowerCase().includes(q)
            ),
          }));
        return { ...icb, pcns: filteredPCNs };
      })
      .filter(icb => icb.name.toLowerCase().includes(q) || icb.pcns.length > 0);
  }, [hierarchy.tree, search]);

  /* ── Modal helpers ── */
  const openModal  = (type, mode, target = null, prefill = {}) => {
    setEditTarget(target);
    setForms(f => ({ ...f, [type]: target ? { ...BLANK[type], ...prefill } : { ...BLANK[type] } }));
    setModals(m => ({ ...m, [type]: mode }));
  };
  const closeModal = (type) => { setModals(m => ({ ...m, [type]: null })); setEditTarget(null); };
  const setForm    = (type, updater) =>
    setForms(f => ({ ...f, [type]: typeof updater === "function" ? updater(f[type]) : updater }));

  /* ── Generic CRUD ── */
  const handleSave = async (type, endpoint) => {
    setSaving(true);
    try {
      const form = forms[type];
      if (editTarget) await axios.put(`${API}/${endpoint}/${editTarget._id}`, form);
      else            await axios.post(`${API}/${endpoint}`, form);
      await fetchAll(true);
      closeModal(type);
    } catch (err) {
      alert(err.response?.data?.message || "Save failed. Please check all required fields.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (endpoint, confirmMsg, clearSelected = false) => {
    if (!window.confirm(confirmMsg)) return;
    try {
      await axios.delete(`${API}/${endpoint}`);
      await fetchAll(true);
      if (clearSelected) setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <PageHeader
        refreshing={refreshing}
        onRefresh={() => fetchAll(true)}
        onAddICB={() => openModal("icb", "add")}
        onAddFederation={() => openModal("federation", "add")}
        onAddPCN={() => openModal("pcn", "add")}
        onAddPractice={() => openModal("practice", "add")}
      />

      {/* Stats */}
      <StatsBar counts={hierarchy.counts} loading={loading} />

      {/* Search */}
      <div className="px-6 pb-3">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mb-3 flex items-center gap-2 px-4 py-3 bg-red-50
          border border-red-200 rounded-xl text-sm text-red-700">
          <span className="font-bold">⚠</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => fetchAll()} className="text-red-600 underline text-xs font-semibold">Retry</button>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 gap-5 px-6 pb-6 min-h-0 overflow-hidden">

        {/* Tree */}
        <div className="w-72 xl:w-80 shrink-0 flex flex-col min-h-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden flex-1">
            <TreeLegend />
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
              <HierarchyTree
                tree={filteredTree}
                loading={loading}
                selected={selected}
                onSelect={setSelected}
                onEditICB={icb => openModal("icb", "edit", icb, {
                  name: icb.name, region: icb.region || "", code: icb.code || "", notes: icb.notes || "",
                })}
                onDeleteICB={id => handleDelete(`clients/icb/${id}`, "Delete this ICB? All linked data must be removed first.")}
                onEditFederation={f => openModal("federation", "edit", f, {
                  name: f.name, icb: f.icb?._id || f.icb || "", type: f.type, notes: f.notes || "",
                })}
                onDeleteFederation={id => handleDelete(`clients/federation/${id}`, "Delete this Federation?")}
                onEditPCN={pcn => openModal("pcn", "edit", pcn, {
                  name: pcn.name,
                  icb: pcn.icb?._id || pcn.icb || "",
                  federation: pcn.federation?._id || pcn.federation || "",
                  federationName: pcn.federationName || "",
                  annualSpend: pcn.annualSpend || "",
                  contractType: pcn.contractType || "",
                  xeroCode: pcn.xeroCode || "",
                  xeroCategory: pcn.xeroCategory || "",
                  notes: pcn.notes || "",
                  contractRenewalDate: pcn.contractRenewalDate?.slice?.(0, 10) || "",
                  contractExpiryDate: pcn.contractExpiryDate?.slice?.(0, 10) || "",
                })}
                onDeletePCN={id => handleDelete(`clients/pcn/${id}`, "Delete this PCN?", selected?.data?._id === id)}
                onEditPractice={(pr, pcnId) => openModal("practice", "edit", pr, {
                  name: pr.name, pcn: pcnId,
                  odsCode: pr.odsCode || "", address: pr.address || "",
                  city: pr.city || "", postcode: pr.postcode || "",
                  fte: pr.fte || "", contractType: pr.contractType || "",
                  systemAccessNotes: pr.systemAccessNotes || "",
                  xeroCode: pr.xeroCode || "", xeroCategory: pr.xeroCategory || "",
                  notes: pr.notes || "",
                })}
                onDeletePractice={id => handleDelete(`clients/practice/${id}`, "Delete this Practice?", selected?.data?._id === id)}
              />
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {selected ? (
            <DetailPanel
              key={selected.data._id}
              selected={selected}
              onRefresh={() => fetchAll(true)}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Modals */}
      {modals.icb && (
        <ICBModal mode={modals.icb} form={forms.icb} setForm={v => setForm("icb", v)}
          onSave={() => handleSave("icb", "clients/icb")}
          onClose={() => closeModal("icb")} saving={saving} />
      )}
      {modals.federation && (
        <FederationModal mode={modals.federation} form={forms.federation} setForm={v => setForm("federation", v)}
          icbs={icbs}
          onSave={() => handleSave("federation", "clients/federation")}
          onClose={() => closeModal("federation")} saving={saving} />
      )}
      {modals.pcn && (
        <PCNModal mode={modals.pcn} form={forms.pcn} setForm={v => setForm("pcn", v)}
          icbs={icbs} federations={federations}
          onSave={() => handleSave("pcn", "clients/pcn")}
          onClose={() => closeModal("pcn")} saving={saving} />
      )}
      {modals.practice && (
        <PracticeModal mode={modals.practice} form={forms.practice} setForm={v => setForm("practice", v)}
          pcns={pcns}
          onSave={() => handleSave("practice", "clients/practice")}
          onClose={() => closeModal("practice")} saving={saving} />
      )}
    </div>
  );
}

function PageHeader({ refreshing, onRefresh, onAddICB, onAddFederation, onAddPCN, onAddPractice }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between
      gap-3 px-6 py-5 border-b border-slate-100 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
          <Building2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-[17px] font-bold text-slate-800 leading-tight">Client Management</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">ICB → Federation / INT → PCN → Practice / Surgery</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onRefresh} title="Refresh"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200
            text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
        <Btn onClick={onAddICB}        variant="ghost" size="sm"><Plus size={13} /> ICB</Btn>
        <Btn onClick={onAddFederation} variant="ghost" size="sm"><Plus size={13} /> Federation</Btn>
        <Btn onClick={onAddPCN}        variant="ghost" size="sm"><Plus size={13} /> PCN</Btn>
        <Btn onClick={onAddPractice}   size="sm"><Plus size={13} /> Practice</Btn>
      </div>
    </div>
  );
}

function TreeLegend() {
  return (
    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hierarchy</p>
        <div className="flex items-center gap-2">
          {[
            { color: "bg-blue-500",   label: "ICB" },
            { color: "bg-indigo-500", label: "Fed" },
            { color: "bg-purple-500", label: "PCN" },
            { color: "bg-emerald-500",label: "Practice" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
              <span className="text-[9px] font-bold text-slate-400">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}