import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Building2, Search, Plus, Loader2 } from "lucide-react";
import HierarchyTree  from "./HierarchyTree.jsx.jsx";
import DetailPanel    from "./DetailPanel.jsx";
import { ICBModal, PCNModal, PracticeModal } from "./ClientFormModals.jsx";
import { Btn } from "./ClientUtils.jsx";

const API = import.meta.env.VITE_API_URL;

const EMPTY_ICB      = { name: "", region: "", notes: "" };
const EMPTY_PCN      = { name: "", icb: "", federation: "", annualSpend: "", notes: "" };
const EMPTY_PRACTICE = { name: "", pcn: "", address: "", odsCode: "", systemAccessNotes: "" };

export default function ClientsModule() {
  const [hierarchy, setHierarchy] = useState({ tree: [], counts: {} });
  const [icbs,      setIcbs]      = useState([]);
  const [pcns,      setPcns]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [saving,    setSaving]    = useState(false);

  // Modal state
  const [icbModal,      setIcbModal]      = useState(null);
  const [pcnModal,      setPcnModal]      = useState(null);
  const [practiceModal, setPracticeModal] = useState(null);
  const [editTarget,    setEditTarget]    = useState(null);
  const [icbForm,       setIcbForm]       = useState(EMPTY_ICB);
  const [pcnForm,       setPcnForm]       = useState(EMPTY_PCN);
  const [practiceForm,  setPracticeForm]  = useState(EMPTY_PRACTICE);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [h, i, p] = await Promise.all([
        axios.get(`${API}/clients/hierarchy`),
        axios.get(`${API}/clients/icb`),
        axios.get(`${API}/clients/pcn`),
      ]);
      setHierarchy(h.data);
      setIcbs(i.data.icbs);
      setPcns(p.data.pcns);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── ICB ──────────────────────────────────────────────────────────
  const saveICB = async () => {
    setSaving(true);
    try {
      if (editTarget) await axios.put(`${API}/clients/icb/${editTarget._id}`, icbForm);
      else            await axios.post(`${API}/clients/icb`, icbForm);
      await fetchAll();
      setIcbModal(null); setEditTarget(null); setIcbForm(EMPTY_ICB);
    } catch {}
    finally { setSaving(false); }
  };

  const deleteICB = async (id) => {
    if (!confirm("Delete this ICB?")) return;
    await axios.delete(`${API}/clients/icb/${id}`);
    await fetchAll();
  };

  // ── PCN ──────────────────────────────────────────────────────────
  const savePCN = async () => {
    setSaving(true);
    try {
      if (editTarget) await axios.put(`${API}/clients/pcn/${editTarget._id}`, pcnForm);
      else            await axios.post(`${API}/clients/pcn`, pcnForm);
      await fetchAll();
      setPcnModal(null); setEditTarget(null); setPcnForm(EMPTY_PCN);
    } catch {}
    finally { setSaving(false); }
  };

  const deletePCN = async (id) => {
    if (!confirm("Delete this PCN?")) return;
    await axios.delete(`${API}/clients/pcn/${id}`);
    await fetchAll();
    if (selected?.data?._id === id) setSelected(null);
  };

  // ── Practice ─────────────────────────────────────────────────────
  const savePractice = async () => {
    setSaving(true);
    try {
      if (editTarget) await axios.put(`${API}/clients/practice/${editTarget._id}`, practiceForm);
      else            await axios.post(`${API}/clients/practice`, practiceForm);
      await fetchAll();
      setPracticeModal(null); setEditTarget(null); setPracticeForm(EMPTY_PRACTICE);
    } catch {}
    finally { setSaving(false); }
  };

  const deletePractice = async (id) => {
    if (!confirm("Delete this Practice?")) return;
    await axios.delete(`${API}/clients/practice/${id}`);
    await fetchAll();
    if (selected?.data?._id === id) setSelected(null);
  };

  // ── Search filter ─────────────────────────────────────────────────
  const filteredTree = hierarchy.tree.map(icb => ({
    ...icb,
    pcns: icb.pcns
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      .map(pcn => ({
        ...pcn,
        practices: pcn.practices.filter(pr =>
          !search || pr.name.toLowerCase().includes(search.toLowerCase())
        ),
      })),
  })).filter(icb =>
    !search ||
    icb.name.toLowerCase().includes(search.toLowerCase()) ||
    icb.pcns.length > 0
  );

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={20} className="text-blue-600"/>
            <h1 className="text-xl font-bold text-slate-800">Client Management</h1>
          </div>
          <p className="text-sm text-slate-500">
            ICB → PCN → Practice hierarchy
            {hierarchy.counts && (
              <span className="ml-2 text-slate-700 font-semibold">
                {hierarchy.counts.icbs} ICBs · {hierarchy.counts.pcns} PCNs · {hierarchy.counts.practices} Practices
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Btn onClick={() => { setIcbModal("add"); setEditTarget(null); setIcbForm(EMPTY_ICB); }} variant="outline" size="sm">
            <Plus size={13}/> Add ICB
          </Btn>
          <Btn onClick={() => { setPcnModal("add"); setEditTarget(null); setPcnForm(EMPTY_PCN); }} variant="outline" size="sm">
            <Plus size={13}/> Add PCN
          </Btn>
          <Btn onClick={() => { setPracticeModal("add"); setEditTarget(null); setPracticeForm(EMPTY_PRACTICE); }} size="sm">
            <Plus size={13}/> Add Practice
          </Btn>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 mb-5 shadow-sm w-full max-w-sm">
        <Search size={14} className="text-slate-400 shrink-0"/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ICB, PCN, Practice…"
          className="text-sm text-slate-700 placeholder-slate-400 outline-none w-full bg-transparent"
        />
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Left: Tree */}
        <div className="w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hierarchy</p>
            </div>
            <HierarchyTree
              tree={filteredTree}
              loading={loading}
              selected={selected}
              onSelect={setSelected}
              onEditICB={(icb) => { setEditTarget(icb); setIcbForm({ name: icb.name, region: icb.region || "", notes: icb.notes || "" }); setIcbModal("edit"); }}
              onDeleteICB={deleteICB}
              onEditPCN={(pcn) => { setEditTarget(pcn); setPcnForm({ name: pcn.name, icb: pcn.icb?._id || pcn.icb, federation: pcn.federation || "", annualSpend: pcn.annualSpend || "", notes: pcn.notes || "" }); setPcnModal("edit"); }}
              onDeletePCN={deletePCN}
              onEditPractice={(pr, pcnId) => { setEditTarget(pr); setPracticeForm({ name: pr.name, pcn: pcnId, address: pr.address || "", odsCode: pr.odsCode || "", systemAccessNotes: pr.systemAccessNotes || "" }); setPracticeModal("edit"); }}
              onDeletePractice={deletePractice}
            />
          </div>
        </div>

        {/* Right: Detail */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center h-64">
              <div className="text-center">
                <Building2 size={36} className="text-slate-200 mx-auto mb-3"/>
                <p className="text-slate-400 text-sm">Select a PCN or Practice to view details</p>
              </div>
            </div>
          ) : (
            <DetailPanel selected={selected} />
          )}
        </div>
      </div>

      {/* Modals */}
      {icbModal && (
        <ICBModal
          mode={icbModal}
          form={icbForm}
          setForm={setIcbForm}
          onSave={saveICB}
          onClose={() => { setIcbModal(null); setEditTarget(null); }}
          saving={saving}
        />
      )}
      {pcnModal && (
        <PCNModal
          mode={pcnModal}
          form={pcnForm}
          setForm={setPcnForm}
          icbs={icbs}
          onSave={savePCN}
          onClose={() => { setPcnModal(null); setEditTarget(null); }}
          saving={saving}
        />
      )}
      {practiceModal && (
        <PracticeModal
          mode={practiceModal}
          form={practiceForm}
          setForm={setPracticeForm}
          pcns={pcns}
          onSave={savePractice}
          onClose={() => { setPracticeModal(null); setEditTarget(null); }}
          saving={saving}
        />
      )}
    </div>
  );
}