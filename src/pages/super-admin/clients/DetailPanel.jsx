import { useState, useEffect } from "react";
import axios from "axios";
import { Network, Stethoscope, Loader2, AlertTriangle } from "lucide-react";
import ContactHistoryPanel from "./ContactHistoryPanel.jsx";

const API = import.meta.env.VITE_API_URL;

const InfoCard = ({ label, value }) => (
  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-700">{value || "—"}</p>
  </div>
);

const TABS = [
  { id: "overview",   label: "Overview" },
  { id: "contacts",   label: "Contacts" },
  { id: "history",    label: "Contact History" },
  { id: "restricted", label: "Restricted Clinicians" },
];

export default function DetailPanel({ selected }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [fullData,  setFullData]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    setFullData(null);
    setActiveTab("overview");
    const url = selected.type === "pcn"
      ? `${API}/clients/pcn/${selected.data._id}`
      : `${API}/clients/practice/${selected.data._id}`;
    axios.get(url)
      .then(({ data }) => setFullData(data.pcn || data.practice))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected.data._id, selected.type]);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-blue-600"/>
    </div>
  );

  const d = fullData || selected.data;
  const entityType = selected.type === "pcn" ? "PCN" : "Practice";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          {selected.type === "pcn"
            ? <Network size={20} className="opacity-80"/>
            : <Stethoscope size={20} className="opacity-80"/>
          }
          <div>
            <h2 className="font-bold text-lg">{d.name}</h2>
            <p className="text-blue-200 text-sm">
              {selected.type === "pcn"
                ? `PCN${d.federation ? ` · ${d.federation}` : ""}`
                : `Practice${d.odsCode ? ` · ${d.odsCode}` : ""}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-4 bg-slate-50 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors
              ${activeTab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-4">
            {selected.type === "pcn" ? (
              <>
                <InfoCard label="ICB"         value={d.icb?.name} />
                <InfoCard label="Federation"  value={d.federation} />
                <InfoCard label="Annual Spend" value={d.annualSpend ? `£${Number(d.annualSpend).toLocaleString()}` : null} />
                <InfoCard label="Practices"   value={d.practices?.length ?? "—"} />
                {d.notes && <div className="col-span-2"><InfoCard label="Notes" value={d.notes} /></div>}
              </>
            ) : (
              <>
                <InfoCard label="PCN"           value={d.pcn?.name} />
                <InfoCard label="ODS Code"      value={d.odsCode} />
                <InfoCard label="Address"       value={d.address} />
                <InfoCard label="System Access" value={d.systemAccessNotes} />
              </>
            )}
          </div>
        )}

        {activeTab === "contacts" && (
          <div>
            {(!d.contacts || d.contacts.length === 0) ? (
              <p className="text-slate-400 text-sm text-center py-8">No contacts added yet</p>
            ) : (
              <div className="space-y-3">
                {d.contacts.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.role}</p>
                      {c.email && <p className="text-xs text-blue-600">{c.email}</p>}
                      {c.phone && <p className="text-xs text-slate-500">{c.phone}</p>}
                    </div>
                    {c.type !== "general" && (
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full
                        ${c.type === "decision_maker"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {c.type === "decision_maker" ? "Decision Maker" : "Finance"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <ContactHistoryPanel
            entityType={entityType}
            entityId={d._id}
          />
        )}

        {activeTab === "restricted" && (
          <div>
            {(!d.restrictedClinicians || d.restrictedClinicians.length === 0) ? (
              <div className="text-center py-8">
                <AlertTriangle size={28} className="text-slate-200 mx-auto mb-2"/>
                <p className="text-slate-400 text-sm">No restricted clinicians</p>
              </div>
            ) : (
              <div className="space-y-2">
                {d.restrictedClinicians.map(c => (
                  <div key={c._id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Restricted
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}