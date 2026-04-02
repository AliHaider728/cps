import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Network, Stethoscope, Layers, ChevronRight,
  ChevronDown, Search, RefreshCw, TrendingUp, Users, MapPin,
  ArrowRight, Loader2
} from "lucide-react";
import { getHierarchy, searchClients } from "../../../api/clientApi.js";

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:-translate-y-1 transition-all ease-in-out hover:shadow-lg duration-200">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-slate-800 leading-none mt-1">{value ?? "—"}</p>
    </div>
  </div>
);

/* ── Practice row ── */
const PracticeRow = ({ practice, navigate }) => (
  <button
    onClick={() => navigate(`/dashboard/super-admin/clients/practice/${practice._id}`)}
    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group text-left"
  >
    <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center shrink-0">
      <Stethoscope size={13} className="text-teal-600" />
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-sm font-semibold text-slate-700 group-hover:text-teal-700 truncate block">
        {practice.name}
      </span>
      {practice.odsCode && (
        <span className="text-xs text-slate-400">ODS: {practice.odsCode}</span>
      )}
    </div>
    <div className="flex items-center gap-2">
      {practice.contractType && (
        <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">
          {practice.contractType}
        </span>
      )}
      <ArrowRight size={14} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
    </div>
  </button>
);

/* ── PCN card (inside ICB) ── */
const PCNCard = ({ pcn, navigate }) => {
  const [open, setOpen] = useState(false);
  const practiceCount = pcn.practices?.length || 0;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-2">
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left group"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
          <Network size={16} className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{pcn.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {pcn.federation?.name && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Layers size={10} />
                {pcn.federation.name}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {practiceCount} practice{practiceCount !== 1 ? "s" : ""}
            </span>
            {pcn.annualSpend > 0 && (
              <span className="text-xs font-semibold text-green-600">
                £{pcn.annualSpend.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pcn.contractType && (
            <span className="text-xs bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded-md">
              {pcn.contractType}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/super-admin/clients/pcn/${pcn._id}`); }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-all"
          >
            View
          </button>
          {practiceCount > 0 && (
            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      {open && practiceCount > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 divide-y divide-slate-100">
          {pcn.practices.map(p => (
            <PracticeRow key={p._id} practice={p} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── ICB Section ── */
const ICBSection = ({ icb, navigate }) => {
  const [open, setOpen] = useState(true);
  const pcnCount = icb.pcns?.length || 0;
  const fedCount = icb.federations?.length || 0;
  const practiceCount = icb.pcns?.reduce((s, p) => s + (p.practices?.length || 0), 0) || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
      <button
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors text-left group"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-slate-800">{icb.name}</p>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {icb.region && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin size={11} />
                {icb.region}
              </span>
            )}
            <span className="text-xs text-slate-400">{pcnCount} PCNs</span>
            <span className="text-xs text-slate-400">{fedCount} Federations</span>
            <span className="text-xs text-slate-400">{practiceCount} Practices</span>
          </div>
        </div>

        {icb.code && (
          <span className="text-sm bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg shrink-0">
            {icb.code}
          </span>
        )}
        <ChevronDown
          size={17}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && pcnCount > 0 && (
        <div className="px-6 pb-5 border-t border-slate-100 pt-4">
          {icb.pcns.map(pcn => (
            <PCNCard key={pcn._id} pcn={pcn} navigate={navigate} />
          ))}
        </div>
      )}
      {open && pcnCount === 0 && (
        <div className="px-6 pb-6 pt-3 border-t border-slate-100 text-center text-slate-400 text-sm">
          No active PCNs under this ICB
        </div>
      )}
    </div>
  );
};

/* ── Search Results ── */
const SearchResults = ({ results, navigate, onClose }) => {
  if (!results.length) return null;
  const typeIcon = { icb: Building2, pcn: Network, practice: Stethoscope };
  const typeColor = { icb: "bg-blue-50 text-blue-600", pcn: "bg-purple-50 text-purple-600", practice: "bg-teal-50 text-teal-600" };
  const getPath = (r) => {
    if (r._type === "icb")      return `/dashboard/super-admin/clients/icb/${r._id}`;
    if (r._type === "pcn")      return `/dashboard/super-admin/clients/pcn/${r._id}`;
    if (r._type === "practice") return `/dashboard/super-admin/clients/practice/${r._id}`;
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
      {results.map((r, i) => {
        const Icon = typeIcon[r._type] || Building2;
        return (
          <button
            key={i}
            onClick={() => { navigate(getPath(r)); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColor[r._type]}`}>
              <Icon size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{r.name}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{r._type}{r.odsCode ? ` · ${r.odsCode}` : ""}{r.region ? ` · ${r.region}` : ""}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
export default function ClientsPage() {
  const navigate = useNavigate();
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await getHierarchy();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const d = await searchClients(search);
        setSearchResults(d.results || []);
        setShowSearch(true);
      } catch {}
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading client hierarchy…</p>
      </div>
    </div>
  );

  const counts = data?.counts || {};

  return (
    <div>
      {/* Page header */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Client Management</h1>
          <p className="text-slate-500 text-sm mt-1">Full hierarchy: ICB → Federation / INT → PCN → Practice</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/dashboard/super-admin/clients/icb")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            <Building2 size={14} />
            Manage ICBs
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard icon={Building2}    label="ICBs"        value={counts.icbs}        color="bg-blue-600" />
        <StatCard icon={Layers}       label="Federations" value={counts.federations}  color="bg-indigo-500" />
        <StatCard icon={Network}      label="PCNs"        value={counts.pcns}         color="bg-purple-600" />
        <StatCard icon={Stethoscope}  label="Practices"   value={counts.practices}    color="bg-teal-600" />
      </div>

      {/* Search */}
      <div className="relative mb-7">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          {searching && <Loader2 size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => searchResults.length && setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            placeholder="Search ICBs, PCNs, Practices or ODS codes…"
            className="w-full pl-12 pr-5 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
          />
        </div>
        {showSearch && searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            navigate={navigate}
            onClose={() => { setShowSearch(false); setSearch(""); }}
          />
        )}
      </div>

      {/* Quick nav buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {[
          { label: "ICBs",        path: "/dashboard/super-admin/clients/icb",        icon: Building2,   color: "border-blue-200 hover:bg-blue-50 hover:border-blue-300",       iconColor: "text-blue-600" },
          { label: "Federations", path: "/dashboard/super-admin/clients/federation",  icon: Layers,      color: "border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300", iconColor: "text-indigo-600" },
          { label: "PCNs",        path: "/dashboard/super-admin/clients/pcn",         icon: Network,     color: "border-purple-200 hover:bg-purple-50 hover:border-purple-300", iconColor: "text-purple-600" },
          { label: "Practices",   path: "/dashboard/super-admin/clients/practice",    icon: Stethoscope, color: "border-teal-200 hover:bg-teal-50 hover:border-teal-300",       iconColor: "text-teal-600" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-white transition-all group ${item.color}`}
            >
              <Icon size={18} className={item.iconColor} />
              <span className="text-sm font-semibold text-slate-700">{item.label}</span>
              <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 ml-auto transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Hierarchy tree */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={14} />
          Hierarchy View
        </h2>

        {!data?.tree?.length ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No data found</p>
            <p className="text-slate-400 text-sm mt-1">Add ICBs to get started</p>
          </div>
        ) : (
          data.tree.map(icb => (
            <ICBSection key={icb._id} icb={icb} navigate={navigate} />
          ))
        )}
      </div>
    </div>
  );
}