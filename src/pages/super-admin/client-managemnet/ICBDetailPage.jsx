// ═══════════════════════════════════════════
// ICBDetailPage.jsx
// Route: /dashboard/super-admin/clients/icb/:id
// ═══════════════════════════════════════════
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2, MapPin, Hash, FileText, ChevronRight, ArrowLeft,
  RefreshCw, Edit2, Save, Check, X, Network, Layers, Stethoscope,
  MessageSquare, Users, Plus, Eye, DollarSign
} from "lucide-react";
import { useICB, useUpdateICB } from "../../../hooks/useICB";
import ContactHistoryPanel from "./ContactHistoryPanel.jsx";



 
/* ══════════════════════════════════════════════════════════
   SHARED UI ATOMS
══════════════════════════════════════════════════════════ */
const Spinner = ({ cls = "border-white" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);

const Btn = ({ onClick, disabled, variant = "primary", size = "md", children, cls = "" }) => {
  const V = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    ghost:   "border border-slate-200 text-slate-600 hover:bg-slate-50",
    outline: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  };
  const S = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${V[variant]} ${S[size]} ${cls}`}>
      {children}
    </button>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className="text-sm text-slate-800 font-semibold text-right truncate max-w-[55%]">{value || "—"}</span>
  </div>
);

const EditRow = ({ label, value, onChange, type = "text" }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-36 shrink-0">{label}</span>
    <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all" />
  </div>
);

/* ══════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════ */
const TABS = [
  { id: "overview",     label: "Overview",     icon: Building2     },
  { id: "federations",  label: "Federations",  icon: Layers        },
  { id: "pcns",         label: "PCNs",         icon: Network       },
  { id: "history",      label: "History",      icon: MessageSquare },
];

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function ICBDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useICB(id);
  const updateICB = useUpdateICB();

  const icb = data?.icb ?? null;

  const [tab, setTab] = useState("overview");

  const patch = useCallback(async (body) => {
    try {
      await updateICB.mutateAsync({ id, data: body });
    } catch (e) {
      alert(e.message);
    }
  }, [id, updateICB]);

  /* ── Loading / not found ── */
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-9 h-9 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!icb) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
      <Building2 size={44} className="opacity-30" />
      <p className="font-semibold text-base">ICB not found</p>
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  /* ══════════════ TAB PANELS ════════════════════════════ */

  /* ── Overview Panel ── */
  const OverviewPanel = () => {
    const [editing, setEditing] = useState(false);
    const [saving,  setSaving]  = useState(false);
    const [form, setForm] = useState({
      name:   icb.name   || "",
      region: icb.region || "",
      code:   icb.code   || "",
      notes:  icb.notes  || "",
    });
    const set = k => v => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
      setSaving(true);
      try { await patch(form); setEditing(false); }
      finally { setSaving(false); }
    };

    // Summary counts — seed data structure
    const fedCount = icb.summary?.federationCount ?? (icb.federations?.length || 0);
    const pcnCount = icb.summary?.pcnCount ?? (icb.pcns?.length || 0);
    const practiceCount = icb.summary?.practiceCount ?? (icb.pcns?.reduce((s, p) => s + (p.practices?.length || 0), 0) || 0);
    const totalSpend = icb.summary?.totalAnnualSpend ?? (icb.pcns?.reduce((s, p) => s + (Number(p.annualSpend) || 0), 0) || 0);
    const contractBreakdown = (icb.pcns || []).reduce((acc, pcn) => {
      if (pcn.contractType) acc[pcn.contractType] = (acc[pcn.contractType] || 0) + 1;
      return acc;
    }, {});
    const CONTRACT_PILL = { ARRS:"bg-blue-100 text-blue-700", EA:"bg-green-100 text-green-700", Direct:"bg-amber-100 text-amber-700", Mixed:"bg-purple-100 text-purple-700" };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">ICB Details</h3>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${editing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {saving ? <Spinner cls="border-white" /> : editing ? <><Save size={12} /> Save</> : <><Edit2 size={12} /> Edit</>}
            </button>
          </div>

          {editing ? (
            <div>
              <EditRow label="ICB Name"  value={form.name}   onChange={set("name")} />
              <EditRow label="Region"    value={form.region} onChange={set("region")} />
              <EditRow label="Code"      value={form.code}   onChange={set("code")} />
              <div className="pt-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Notes</span>
                <textarea rows={3} value={form.notes} onChange={e => set("notes")(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none transition-all" />
              </div>
            </div>
          ) : (
            <div>
              <DetailRow label="ICB Name" value={icb.name}   />
              <DetailRow label="Region"   value={icb.region} />
              <DetailRow label="Code"     value={icb.code}   />
              {icb.notes && (
                <div className="pt-4 mt-2 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{icb.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Federations", value: fedCount,                                                color: "bg-indigo-50 text-indigo-700", icon: Layers      },
              { label: "PCNs",        value: pcnCount,                                                color: "bg-purple-50 text-purple-700", icon: Network     },
              { label: "Practices",   value: practiceCount,                                           color: "bg-teal-50 text-teal-700",     icon: Stethoscope },
              { label: "Total Spend", value: totalSpend > 0 ? `£${totalSpend.toLocaleString()}` : "—", color: "bg-green-50 text-green-700",  icon: DollarSign  },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`rounded-xl px-4 py-3.5 flex items-center gap-3 ${s.color}`}>
                  <Icon size={18} className="shrink-0 opacity-70" />
                  <div>
                    <p className="text-xl font-bold leading-none">{s.value}</p>
                    <p className="text-xs font-semibold mt-1 opacity-80">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contract type breakdown — from seed data (ARRS, EA, Direct, Mixed) */}
          {Object.keys(contractBreakdown).length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Contract Types</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(contractBreakdown).map(([type, count]) => (
                  <span key={type} className={`text-xs font-bold px-2.5 py-1 rounded-lg ${CONTRACT_PILL[type] || "bg-slate-100 text-slate-600"}`}>
                    {type}: {count} PCN{count !== 1 ? "s" : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick nav buttons */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 flex-wrap">
            <Btn size="sm" variant="outline" onClick={() => navigate("/dashboard/super-admin/clients/federation")}>
              <Layers size={12} /> Manage Federations
            </Btn>
            <Btn size="sm" variant="outline" onClick={() => navigate(`/dashboard/super-admin/clients/pcn`)}>
              <Network size={12} /> Manage PCNs
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  /* ── Federations Panel ── */
  const FederationsPanel = () => {
    const feds = icb.federations || [];
    const TYPE_STYLE = {
      federation: "bg-indigo-50 text-indigo-700 border-indigo-200",
      INT:        "bg-amber-50 text-amber-700 border-amber-200",
      other:      "bg-slate-50 text-slate-600 border-slate-200",
    };
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {feds.length} Federation{feds.length !== 1 ? "s" : ""}
          </p>
          <Btn size="sm" onClick={() => navigate("/dashboard/super-admin/clients/federation")}>
            <Plus size={13} /> Add Federation
          </Btn>
        </div>

        {feds.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <Layers size={32} className="opacity-40" />
            <p className="font-semibold">No federations under this ICB</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {feds.map(fed => (
              <div key={fed._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
                  <Layers size={17} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-800">{fed.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border capitalize ${TYPE_STYLE[fed.type] || TYPE_STYLE.other}`}>
                      {fed.type}
                    </span>
                    <span className="text-xs text-slate-400">{fed.pcnCount ?? fed.pcns?.length ?? 0} PCN{(fed.pcnCount ?? fed.pcns?.length ?? 0) !== 1 ? "s" : ""}</span>
                    <span className="text-xs text-slate-400">{fed.practiceCount || 0} Practice{(fed.practiceCount || 0) !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── PCNs Panel ── */
  const PCNsPanel = () => {
    const pcns = icb.pcns || [];
    const CONTRACT_COLOR = {
      ARRS:   "bg-blue-50 text-blue-700 border-blue-200",
      EA:     "bg-green-50 text-green-700 border-green-200",
      Direct: "bg-amber-50 text-amber-700 border-amber-200",
      Mixed:  "bg-purple-50 text-purple-700 border-purple-200",
    };

    const totalSpend    = pcns.reduce((s, p) => s + (Number(p.annualSpend) || 0), 0);
    const totalPractices = pcns.reduce((s, p) => s + (p.practices?.length || 0), 0);

    return (
      <div className="space-y-4">
        {/* Summary strip */}
        {pcns.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total PCNs",      value: pcns.length,                                             color: "bg-purple-50 text-purple-700" },
              { label: "Total Practices", value: totalPractices,                                          color: "bg-teal-50 text-teal-700"     },
              { label: "Total Spend",     value: totalSpend > 0 ? `£${totalSpend.toLocaleString()}` : "—", color: "bg-green-50 text-green-700"   },
            ].map(s => (
              <div key={s.label} className={`rounded-xl px-3 py-2.5 text-center ${s.color}`}>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs font-semibold mt-0.5 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {pcns.length} PCN{pcns.length !== 1 ? "s" : ""}
          </p>
          <Btn size="sm" onClick={() => navigate("/dashboard/super-admin/clients/pcn")}>
            <Plus size={13} /> Add PCN
          </Btn>
        </div>

        {pcns.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
            <Network size={32} className="opacity-40" />
            <p className="font-semibold">No PCNs under this ICB</p>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {pcns.map(pcn => {
              const practiceCount = pcn.practices?.length || 0;
              return (
                <button key={pcn._id}
                  onClick={() => navigate(`/dashboard/super-admin/clients/pcn/${pcn._id}`)}
                  className="w-full bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-sm transition-all px-5 py-4 flex items-center gap-4 group text-left">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Network size={17} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-slate-800 truncate">{pcn.name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {pcn.federation?.name && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Layers size={10} /> {pcn.federation.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {practiceCount} practice{practiceCount !== 1 ? "s" : ""}
                      </span>
                      {pcn.annualSpend > 0 && (
                        <span className="text-xs font-semibold text-green-600">
                          £{Number(pcn.annualSpend).toLocaleString()}
                        </span>
                      )}
                      {pcn.xeroCode && (
                        <span className="text-xs text-slate-400">
                          Xero: {pcn.xeroCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pcn.contractType && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${CONTRACT_COLOR[pcn.contractType] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                        {pcn.contractType}
                      </span>
                    )}
                    <Eye size={14} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const PANELS = {
    overview:    <OverviewPanel />,
    federations: <FederationsPanel />,
    pcns:        <PCNsPanel />,
    history:     <ContactHistoryPanel entityType="ICB" entityId={icb._id} />,
  };

  /* ══════════════ RENDER ════════════════════════════════ */
  return (
    <div className="space-y-4 pb-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm flex-wrap">
        <button onClick={() => navigate("/dashboard/super-admin/clients")}
          className="text-slate-400 hover:text-blue-600 font-medium transition-colors">
          Client Management
        </button>
        <ChevronRight size={13} className="text-slate-300" />
        <button onClick={() => navigate("/dashboard/super-admin/clients/icb")}
          className="text-slate-400 hover:text-blue-600 font-medium transition-colors">
          ICBs
        </button>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-700 font-bold truncate">{icb.name}</span>
      </nav>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">{icb.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {icb.region && (
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <MapPin size={12} /> {icb.region}
                </span>
              )}
              {icb.code && (
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                  <Hash size={10} /> {icb.code}
                </span>
              )}
              {(icb.pcns?.length > 0) && (
                <span className="text-sm text-slate-400">
                  {icb.pcns.length} PCN{icb.pcns.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => refetch()} title="Refresh"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all">
              <RefreshCw size={15} />
            </button>
            <Btn variant="ghost" size="sm" onClick={() => navigate("/dashboard/super-admin/clients/icb")}>
              <ArrowLeft size={13} /> Back
            </Btn>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-1 p-2 overflow-x-auto [scrollbar-width:none]">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0
                  ${tab === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div>{PANELS[tab]}</div>
    </div>
  );
}
