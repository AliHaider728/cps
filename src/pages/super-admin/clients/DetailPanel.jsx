/**
 * DetailPanel.jsx
 * Right panel — shows full details for selected PCN or Practice.
 * 
 * PCN tabs:     Overview | Contacts | Practices | Meetings | Contact History | Restricted
 * Practice tabs: Overview | Contacts | System Access | Contact History | Restricted
 * 
 * Each tab is a SEPARATE component — no shared content.
 */
import { useState, useEffect } from "react";
import axios from "axios";
import { Network, Stethoscope, Loader2, AlertCircle } from "lucide-react";

import OverviewTab        from "./tabs/OverviewTab.jsx";
import ContactsTab        from "./tabs/ContactsTab.jsx";
import PracticesTab       from "./tabs/PracticesTab.jsx";
import MonthlyMeetingsTab from "./tabs/MonthlyMeetingsTab.jsx";
import SystemAccessTab    from "./tabs/SystemAccessTab.jsx";
import ContactHistoryPanel from "./ContactHistoryPanel.jsx";
import RestrictedTab      from "./tabs/RestrictedTab.jsx";

const API = import.meta.env.VITE_API_URL;

const PCN_TABS = [
  { id: "overview",  label: "Overview" },
  { id: "contacts",  label: "Contacts" },
  { id: "practices", label: "Practices" },
  { id: "meetings",  label: "Monthly Meetings" },
  { id: "history",   label: "Contact History" },
  { id: "restricted",label: "Restricted Clinicians" },
];

const PRACTICE_TABS = [
  { id: "overview",  label: "Overview" },
  { id: "contacts",  label: "Contacts" },
  { id: "system",    label: "System Access" },
  { id: "history",   label: "Contact History" },
  { id: "restricted",label: "Restricted Clinicians" },
];

export default function DetailPanel({ selected, onRefresh }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const isPCN      = selected.type === "pcn";
  const entityType = isPCN ? "PCN" : "Practice";
  const tabs       = isPCN ? PCN_TABS : PRACTICE_TABS;

  useEffect(() => {
    setActiveTab("overview");
    setData(null);
    setError(null);
    setLoading(true);

    const url = isPCN
      ? `${API}/clients/pcn/${selected.data._id}`
      : `${API}/clients/practice/${selected.data._id}`;

    axios.get(url)
      .then(res => setData(res.data.pcn || res.data.practice))
      .catch(() => setError("Failed to load details. Please try again."))
      .finally(() => setLoading(false));
  }, [selected.data._id, selected.type]);

  if (loading) return <LoadingCard />;
  if (error)   return <ErrorCard message={error} onRetry={() => {
    setError(null); setLoading(true);
    const url = isPCN ? `${API}/clients/pcn/${selected.data._id}` : `${API}/clients/practice/${selected.data._id}`;
    axios.get(url).then(r => setData(r.data.pcn || r.data.practice)).catch(() => setError("Failed")).finally(() => setLoading(false));
  }} />;

  const d = data || selected.data;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm
      flex flex-col h-full overflow-hidden">

      {/* Header */}
      <PanelHeader d={d} isPCN={isPCN} />

      {/* Tab bar */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto shrink-0
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(t => (
          <TabBtn key={t.id} tab={t} active={activeTab === t.id} onChange={setActiveTab} />
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto
        [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
        <TabContent
          tabId={activeTab}
          data={d}
          isPCN={isPCN}
          entityType={entityType}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}

/* ── Tab button ── */
function TabBtn({ tab, active, onChange }) {
  return (
    <button
      onClick={() => onChange(tab.id)}
      className={`relative px-4 py-3 text-[12.5px] font-semibold whitespace-nowrap
        transition-colors shrink-0
        ${active ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
    >
      {tab.label}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
      )}
    </button>
  );
}

/* ── Content dispatcher ── */
function TabContent({ tabId, data, isPCN, entityType, onRefresh }) {
  switch (tabId) {
    case "overview":
      return <OverviewTab data={data} isPCN={isPCN} />;
    case "contacts":
      return <ContactsTab data={data} entityType={entityType} entityId={data._id} onRefresh={onRefresh} />;
    case "practices":
      return <PracticesTab practices={data.practices} />;
    case "meetings":
      return <MonthlyMeetingsTab pcnId={data._id} pcnName={data.name} />;
    case "system":
      return <SystemAccessTab data={data} entityType={entityType} entityId={data._id} onRefresh={onRefresh} />;
    case "history":
      return (
        <div className="p-5">
          <ContactHistoryPanel entityType={entityType} entityId={data._id} />
        </div>
      );
    case "restricted":
      return <RestrictedTab data={data} entityType={entityType} entityId={data._id} onRefresh={onRefresh} />;
    default:
      return null;
  }
}

/* ── Panel header ── */
function PanelHeader({ d, isPCN }) {
  const gradient = isPCN
    ? "from-blue-600 to-blue-700"
    : "from-emerald-600 to-emerald-700";

  return (
    <div className={`px-6 py-4 bg-gradient-to-r ${gradient} shrink-0`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${isPCN ? "bg-blue-500/40" : "bg-emerald-500/40"}`}>
          {isPCN
            ? <Network size={18} className="text-white" />
            : <Stethoscope size={18} className="text-white" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-white text-[16px] leading-tight truncate">{d.name}</h2>
          <p className="text-white/70 text-xs mt-0.5">
            {isPCN
              ? [
                  "PCN",
                  d.federation?.name || d.federationName,
                  d.icb?.name,
                ].filter(Boolean).join(" · ")
              : [
                  "Practice",
                  d.odsCode && `ODS: ${d.odsCode}`,
                  d.pcn?.name,
                ].filter(Boolean).join(" · ")
            }
          </p>
        </div>
        {isPCN && d.annualSpend > 0 && (
          <div className="ml-auto bg-white/20 rounded-xl px-3 py-1.5 shrink-0 text-right">
            <p className="text-[10px] text-white/70 font-medium">Annual Spend</p>
            <p className="text-white font-bold text-sm">£{Number(d.annualSpend).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm
      flex items-center justify-center h-full min-h-[380px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm
      flex flex-col items-center justify-center h-full min-h-[380px] gap-3">
      <AlertCircle size={28} className="text-red-400" />
      <p className="text-sm text-red-600 font-medium">{message}</p>
      <button onClick={onRetry} className="text-sm text-blue-600 hover:underline font-semibold">
        Try again
      </button>
    </div>
  );
}