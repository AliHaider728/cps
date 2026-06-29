import { useState, useMemo } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import {
  History, ChevronRight, ChevronDown, Search, DollarSign,
  Calendar, TrendingUp, TrendingDown, Building2, RefreshCw,
  Filter, X, Clock, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../../services/api/client";

// Interfaces
interface ChangedBy {
  name?: string;
  role?: string;
}

interface RateHistoryEntry {
  field: string;
  fieldLabel: string;
  changedAt: string;
  oldValue: string | number | null;
  newValue: string | number | null;
  changedBy?: ChangedBy;
}

interface ClientData {
  _id: string;
  name: string;
  icbName?: string;
  contractType?: string;
  hourlyRate?: number | string;
  contractStartDate?: string;
  contractRenewalDate?: string;
  contractExpiryDate?: string;
  historyCount: number;
}

interface RateSummaryResponse {
  clients: ClientData[];
}

interface RateHistoryResponse {
  history: RateHistoryEntry[];
}

/* ══════════════════════════════════════════════════════════════════
   DATA HOOKS
══════════════════════════════════════════════════════════════════ */
const useRateSummary = () =>
  useQuery<RateSummaryResponse>({
    queryKey: ["pcn-rate-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/clients/pcn/rate-history/summary");
      return res.data;
    },
  });

const useRateHistory = (id: string | undefined, enabled: boolean) =>
  useQuery<RateHistoryResponse>({
    queryKey: ["pcn-rate-history", id],
    queryFn: async () => {
      const res = await apiClient.get(`/clients/pcn/${id}/rate-history`);
      return res.data;
    },
    enabled: Boolean(id) && Boolean(enabled),
  });

/* ── Helpers ─────────────────────────────────────────────────────── */
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");
const fmtRate = (r?: number | string | null) => (r != null && r !== "" ? `£${Number(r).toFixed(2)}/hr` : "—");

const fmtValue = (field: string, value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "hourlyRate") return `£${Number(value).toFixed(2)}/hr`;
  return fmtDate(String(value));
};

const fmtRelative = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}yr ago`;
};

const FIELD_ICON: Record<string, any> = {
  hourlyRate:          DollarSign,
  contractStartDate:   Calendar,
  contractRenewalDate: Calendar,
  contractExpiryDate:  Calendar,
};

const FIELD_COLOR: Record<string, string> = {
  hourlyRate:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  contractStartDate:   "bg-blue-50 text-blue-700 border-blue-200",
  contractRenewalDate: "bg-violet-50 text-violet-700 border-violet-200",
  contractExpiryDate:  "bg-amber-50 text-amber-700 border-amber-200",
};

/* ── Timeline Entry Card ─────────────────────────────────────────── */
interface TimelineEntryProps {
  entry: RateHistoryEntry;
  idx: number;
  total: number;
}

const TimelineEntry = ({ entry, idx, total }: TimelineEntryProps) => {
  const Icon = FIELD_ICON[entry.field] || History;
  const colorClass = FIELD_COLOR[entry.field] || "bg-slate-50 text-slate-600 border-slate-200";
  const isIncrease = entry.field === "hourlyRate" && Number(entry.newValue) > Number(entry.oldValue || 0);
  const isDecrease = entry.field === "hourlyRate" && Number(entry.newValue) < Number(entry.oldValue || 0);

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon size={13} />
        </div>
        {idx < total - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
      </div>

      {/* Card */}
      <div className="flex-1 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className={`px-4 py-2 border-b flex items-center justify-between gap-2 ${colorClass} border-opacity-60`}>
            <span className="text-xs font-bold uppercase tracking-wider">{entry.fieldLabel}</span>
            <div className="flex items-center gap-2 text-xs opacity-70">
              <Clock size={11} />
              <span>{new Date(entry.changedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
              <span className="opacity-60">·</span>
              <span>{fmtRelative(entry.changedAt)}</span>
            </div>
          </div>

          {/* Card body */}
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-0.5">Previous</p>
              <p className="text-sm text-slate-500 line-through">{fmtValue(entry.field, entry.oldValue)}</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              {isIncrease && <ArrowUpRight size={18} className="text-emerald-500" />}
              {isDecrease && <ArrowDownRight size={18} className="text-red-500" />}
              {!isIncrease && !isDecrease && <Minus size={18} className="text-slate-400" />}
            </div>

            <div className="flex-1 text-right">
              <p className="text-xs text-slate-400 mb-0.5">Updated to</p>
              <p className={`text-sm font-bold ${isIncrease ? "text-emerald-600" : isDecrease ? "text-red-600" : "text-slate-800"}`}>
                {fmtValue(entry.field, entry.newValue)}
              </p>
            </div>
          </div>

          {entry.changedBy?.name && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400">Changed by <span className="font-semibold text-slate-600">{entry.changedBy.name}</span>{entry.changedBy.role ? ` · ${entry.changedBy.role}` : ""}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Filter Bar ──────────────────────────────────────────────────── */
const PERIOD_OPTIONS = [
  { label: "All time",   value: "all" },
  { label: "Last 30d",  value: "30"  },
  { label: "Last 90d",  value: "90"  },
  { label: "Last 6mo",  value: "180" },
  { label: "Last 1yr",  value: "365" },
];

const FIELD_OPTIONS = [
  { label: "All fields",    value: "all"                },
  { label: "Hourly Rate",   value: "hourlyRate"         },
  { label: "Start Date",    value: "contractStartDate"  },
  { label: "Renewal Date",  value: "contractRenewalDate"},
  { label: "Expiry Date",   value: "contractExpiryDate" },
];

/* ── Single client expandable row ───────────────────────────────── */
interface ClientHistoryRowProps {
  client: ClientData;
  navigate: NavigateFunction;
  globalPeriod: string;
  globalField: string;
}

const ClientHistoryRow = ({ client, navigate, globalPeriod, globalField }: ClientHistoryRowProps) => {
  const [open, setOpen] = useState(false);
  const clientId = client?._id;
  const { data, isLoading } = useRateHistory(clientId, open);

  // Apply filters to history entries
  const history = useMemo(() => {
    let entries = data?.history || [];

    if (globalPeriod !== "all") {
      const cutoff = Date.now() - Number(globalPeriod) * 86400000;
      entries = entries.filter((e) => new Date(e.changedAt).getTime() >= cutoff);
    }

    if (globalField !== "all") {
      entries = entries.filter((e) => e.field === globalField);
    }

    return entries.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  }, [data, globalPeriod, globalField]);

  const handleToggle = () => {
    if (!clientId) return;
    setOpen((o) => !o);
  };

  // Rate change indicator for summary
  const lastRateChange = data?.history?.filter(e => e.field === "hourlyRate")
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())[0];
  const rateWent = lastRateChange
    ? Number(lastRateChange.newValue) > Number(lastRateChange.oldValue || 0) ? "up" : "down"
    : null;

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${open ? "border-purple-200 shadow-purple-100" : "border-slate-200 bg-white"}`}>
      {/* Summary row */}
      <button
        onClick={handleToggle}
        className={`w-full flex items-center gap-4 px-5 py-4 transition-colors text-left ${open ? "bg-purple-50/40" : "bg-white hover:bg-slate-50"}`}
      >
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${open ? "bg-purple-100" : "bg-purple-50"}`}>
          <Building2 size={17} className="text-purple-600" />
        </div>

        {/* Name + ICB */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-[15px] font-bold text-slate-800 hover:text-purple-600 cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (clientId) navigate(`/dashboard/super-admin/clients/pcn/${clientId}`);
              }}
            >
              {client.name}
            </p>
            {client.contractType && (
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-md">
                {client.contractType}
              </span>
            )}
            {rateWent === "up" && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><TrendingUp size={10} /> Rate ↑</span>}
            {rateWent === "down" && <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><TrendingDown size={10} /> Rate ↓</span>}
          </div>
          {client.icbName && (
            <p className="text-xs text-slate-400 mt-0.5">{client.icbName}</p>
          )}
        </div>

        {/* Stats — desktop */}
        <div className="hidden lg:flex items-center gap-0 shrink-0 divide-x divide-slate-100">
          {[
            { label: "Current Rate", value: fmtRate(client.hourlyRate), cls: "text-emerald-700 font-bold" },
            { label: "Start",        value: fmtDate(client.contractStartDate),   cls: "text-slate-600" },
            { label: "Renewal",      value: fmtDate(client.contractRenewalDate), cls: "text-violet-600 font-semibold" },
            { label: "Expiry",       value: fmtDate(client.contractExpiryDate),  cls: "text-amber-600" },
          ].map(({ label, value, cls }) => (
            <div key={label} className="px-5 text-right">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
              <p className={`text-sm ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Changes badge + chevron */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {client.historyCount > 0 ? (
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
              {client.historyCount} change{client.historyCount !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-[10px] font-semibold bg-slate-50 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
              No changes
            </span>
          )}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${open ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-400"}`}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        </div>
      </button>

      {/* Mobile quick stats */}
      <div className="lg:hidden grid grid-cols-2 gap-x-4 gap-y-1 px-5 pb-3 text-xs border-t border-slate-100 pt-2">
        <div><span className="text-slate-400">Rate: </span><span className="font-bold text-emerald-700">{fmtRate(client.hourlyRate)}</span></div>
        <div><span className="text-slate-400">Start: </span><span className="text-slate-600">{fmtDate(client.contractStartDate)}</span></div>
        <div><span className="text-slate-400">Renewal: </span><span className="font-semibold text-violet-600">{fmtDate(client.contractRenewalDate)}</span></div>
        <div><span className="text-slate-400">Expiry: </span><span className="text-amber-600">{fmtDate(client.contractExpiryDate)}</span></div>
      </div>

      {/* Expanded timeline */}
      {open && (
        <div className="border-t border-purple-100 bg-slate-50/60 px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2 text-slate-400">
              <History size={28} className="opacity-30" />
              <p className="text-sm font-medium">No changes recorded for this period</p>
              <p className="text-xs opacity-70">Try changing the filter above</p>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Change History · {history.length} record{history.length !== 1 ? "s" : ""}
              </p>
              {history.map((entry, idx) => (
                <TimelineEntry key={idx} entry={entry} idx={idx} total={history.length} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function RateHistoryPage() {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isFetching } = useRateSummary();
  const [search, setSearch]           = useState("");
  const [period, setPeriod]           = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const clients = data?.clients || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) =>
      !q || [c.name, c.icbName, c.contractType].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [clients, search]);

  const hasActiveFilters = period !== "all" || fieldFilter !== "all";

  const clearFilters = () => {
    setPeriod("all");
    setFieldFilter("all");
  };

  // Stats
  const totalChanges = clients.reduce((s, c) => s + (c.historyCount || 0), 0);
  const withChanges  = clients.filter((c) => c.historyCount > 0).length;

  return (
    <div className="space-y-5 max-w-full mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-medium text-slate-500">Finance</span>
            <ChevronRight size={12} />
            <span className="font-medium text-slate-500">Client & Contract History</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5 tracking-tight">
            <span className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm shadow-purple-200">
              <History size={18} className="text-white" />
            </span>
            Rate & Contract History
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 max-w-xl">
            Track hourly rate changes and contract date amendments across all PCN clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-all"
            >
              <X size={12} /> Clear filters
            </button>
          )}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold transition-all ${showFilters || hasActiveFilters ? "border-purple-300 bg-purple-50 text-purple-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <Filter size={13} /> Filters {hasActiveFilters && <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center">{(period !== "all" ? 1 : 0) + (fieldFilter !== "all" ? 1 : 0)}</span>}
          </button>
          <button
            onClick={() => refetch()}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all ${isFetching ? "animate-spin text-purple-500" : ""}`}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      {!isLoading && clients.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Clients",      value: clients.length,  color: "text-slate-700" },
            { label: "With Changes",       value: withChanges,     color: "text-blue-700"  },
            { label: "Total Change Events",value: totalChanges,    color: "text-purple-700"},
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center shadow-sm">
              <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Period</p>
              <div className="flex gap-1.5 flex-wrap">
                {PERIOD_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setPeriod(o.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${period === o.value ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Field Type</p>
              <div className="flex gap-1.5 flex-wrap">
                {FIELD_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setFieldFilter(o.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${fieldFilter === o.value ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Search ── */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name, ICB, or contract type…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      {!isLoading && (
        <p className="text-xs text-slate-400 -mt-2">
          Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of {clients.length} clients
          {hasActiveFilters && <span className="ml-1 text-purple-600 font-medium">· filters active</span>}
        </p>
      )}

      {/* ── List ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-slate-400">
          <div className="w-10 h-10 border-[3px] border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading client history…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center text-slate-400 gap-3">
          <History size={36} className="opacity-30" />
          <p className="font-bold text-slate-500">No clients found</p>
          <p className="text-xs">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <ClientHistoryRow
              key={client._id}
              client={client}
              navigate={navigate}
              globalPeriod={period}
              globalField={fieldFilter}
            />
          ))}
        </div>
      )}
    </div>
  );
}
