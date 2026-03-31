import { useState, useEffect } from "react";
import { Network, Stethoscope, Loader2, AlertCircle } from "lucide-react";
import { pcnAPI, practiceAPI } from "../../../api/api";
import OverviewTab         from "./tabs/OverviewTab.jsx";
import ContactsTab         from "./tabs/ContactsTab.jsx";
import PracticesTab        from "./tabs/PracticesTab.jsx";
import MonthlyMeetingsTab  from "./tabs/MonthlyMeetingsTab.jsx";
import SystemAccessTab     from "./tabs/SystemAccessTab.jsx";
import ContactHistoryPanel from "./ContactHistoryPanel.jsx";
import RestrictedTab       from "./tabs/RestrictedTab.jsx";

const PCN_TABS      = [
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

  const loadData = () => {
    setLoading(true); setError(null);
    const req = isPCN
      ? pcnAPI.getById(selected.data._id)
      : practiceAPI.getById(selected.data._id);
    req
      .then(res => setData(res.data.pcn || res.data.practice))
      .catch(() => setError("Failed to load details. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setActiveTab("overview"); setData(null); loadData(); }, [selected.data._id, selected.type]);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center h-full min-h-[380px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm flex flex-col items-center justify-center h-full min-h-[380px] gap-3">
      <AlertCircle size={28} className="text-red-400" />
      <p className="text-sm text-red-600 font-medium">{error}</p>
      <button onClick={loadData} className="text-sm text-blue-600 hover:underline font-semibold">Try again</button>
    </div>
  );

  const d = data || selected.data;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 bg-gradient-to-r ${isPCN ? "from-blue-600 to-blue-700" : "from-emerald-600 to-emerald-700"} shrink-0`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPCN ? "bg-blue-500/40" : "bg-emerald-500/40"}`}>
            {isPCN ? <Network size={18} className="text-white" /> : <Stethoscope size={18} className="text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-[16px] leading-tight truncate">{d.name}</h2>
            <p className="text-white/70 text-xs mt-0.5">
              {isPCN
                ? ["PCN", d.federation?.name || d.federationName, d.icb?.name].filter(Boolean).join(" · ")
                : ["Practice", d.odsCode && `ODS: ${d.odsCode}`, d.pcn?.name].filter(Boolean).join(" · ")}
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

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`relative px-4 py-3 text-[12.5px] font-semibold whitespace-nowrap transition-colors shrink-0 ${activeTab === t.id ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
            {activeTab === t.id && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
        {activeTab === "overview"   && <OverviewTab data={d} isPCN={isPCN} />}
        {activeTab === "contacts"   && <ContactsTab data={d} entityType={entityType} entityId={d._id} onRefresh={onRefresh} />}
        {activeTab === "practices"  && <PracticesTab practices={d.practices} />}
        {activeTab === "meetings"   && <MonthlyMeetingsTab pcnId={d._id} pcnName={d.name} />}
        {activeTab === "system"     && <SystemAccessTab data={d} entityType={entityType} entityId={d._id} onRefresh={onRefresh} />}
        {activeTab === "history"    && <div className="p-5"><ContactHistoryPanel entityType={entityType} entityId={d._id} /></div>}
        {activeTab === "restricted" && <RestrictedTab data={d} entityType={entityType} entityId={d._id} onRefresh={onRefresh} />}
      </div>
    </div>
  );
}