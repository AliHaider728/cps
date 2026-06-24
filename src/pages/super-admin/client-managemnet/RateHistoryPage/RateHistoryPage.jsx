import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  History, ChevronRight, ChevronDown, Search, DollarSign,
  Calendar, TrendingUp, TrendingDown, Building2, RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/api.js"; // adjust path to your axios instance if different

/* ── Data hooks (inline — move to hooks/usePCN.js if you prefer) ── */
const useRateSummary = () =>
  useQuery({
    queryKey: ["pcn-rate-summary"],
    queryFn: async () => (await api.get("/clients/pcn/rate-history/summary")).data,
  });

const useRateHistory = (id, enabled) =>
  useQuery({
    queryKey: ["pcn-rate-history", id],
    queryFn: async () => (await api.get(`/clients/pcn/${id}/rate-history`)).data,
    enabled: !!id && enabled,
  });

/* ── Helpers ─────────────────────────────────────────────────────── */
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");
const fmtRate = (r) => (r != null && r !== "" ? `£${Number(r).toFixed(2)}/hr` : "—");

const fmtValue = (field, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "hourlyRate") return `£${Number(value).toFixed(2)}/hr`;
  return fmtDate(value);
};

const FIELD_ICON = {
  hourlyRate:          DollarSign,
  contractStartDate:   Calendar,
  contractRenewalDate: Calendar,
  contractExpiryDate:  Calendar,
};

/* ── Single client's expandable history row ─────────────────────── */
const ClientHistoryRow = ({ client, navigate }) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useRateHistory(client._id, open);
  const history = data?.history || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
          <Building2 size={17} className="text-purple-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-[15px] font-bold text-slate-800 hover:text-purple-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/super-admin/clients/pcn/${client._id}`);
              }}
            >
              {client.name}
            </p>
            {client.contractType && (
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-md">
                {client.contractType}
              </span>
            )}
          </div>
          {client.icbName && (
            <p className="text-xs text-slate-400 mt-0.5">{client.icbName}</p>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Rate</p>
            <p className="text-sm font-bold text-green-700">{fmtRate(client.hourlyRate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Start</p>
            <p className="text-sm text-slate-600">{fmtDate(client.contractStartDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Renewal</p>
            <p className="text-sm text-slate-600">{fmtDate(client.contractRenewalDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Expiry</p>
            <p className="text-sm text-slate-600">{fmtDate(client.contractExpiryDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {client.historyCount > 0 ? (
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
              {client.historyCount} change{client.historyCount !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md">
              No changes
            </span>
          )}
          {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Mobile summary (shown below sm breakpoint) */}
      <div className="sm:hidden grid grid-cols-2 gap-2 px-5 pb-3 -mt-1 text-xs">
        <div><span className="text-slate-400">Rate: </span><span className="font-semibold text-green-700">{fmtRate(client.hourlyRate)}</span></div>
        <div><span className="text-slate-400">Start: </span><span className="text-slate-600">{fmtDate(client.contractStartDate)}</span></div>
        <div><span className="text-slate-400">Renewal: </span><span className="text-slate-600">{fmtDate(client.contractRenewalDate)}</span></div>
        <div><span className="text-slate-400">Expiry: </span><span className="text-slate-600">{fmtDate(client.contractExpiryDate)}</span></div>
      </div>

      {/* Expanded timeline */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No rate or contract changes recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((entry, idx) => {
                const Icon = FIELD_ICON[entry.field] || History;
                const isIncrease =
                  entry.field === "hourlyRate" &&
                  Number(entry.newValue) > Number(entry.oldValue || 0);
                const isDecrease =
                  entry.field === "hourlyRate" &&
                  Number(entry.newValue) < Number(entry.oldValue || 0);
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={13} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 px-4 py-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-700">{entry.fieldLabel}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(entry.changedAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                          {entry.changedBy?.name ? ` · ${entry.changedBy.name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-sm">
                        <span className="text-slate-400 line-through">
                          {fmtValue(entry.field, entry.oldValue)}
                        </span>
                        <ChevronRight size={13} className="text-slate-300" />
                        <span className="font-bold text-slate-800">
                          {fmtValue(entry.field, entry.newValue)}
                        </span>
                        {isIncrease && <TrendingUp size={14} className="text-green-500" />}
                        {isDecrease && <TrendingDown size={14} className="text-red-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
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
  const { data, isLoading, refetch } = useRateSummary();
  const [search, setSearch] = useState("");

  const clients = data?.clients || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.icbName, c.contractType].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [clients, search]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-slate-400">
            <span className="font-medium text-slate-600">Finance</span>
            <ChevronRight size={13} />
            <span className="font-medium text-slate-600">Rate & Contract History</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History size={22} className="text-purple-600" />
            Rate & Contract History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track hourly rate changes and contract date amendments across all clients — see what it was, and what it is now.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name, ICB, or contract type…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-purple-400 focus:outline-none shadow-sm"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-9 h-9 border-[3px] border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 py-14 flex flex-col items-center text-slate-400 gap-3">
          <History size={32} className="opacity-40" />
          <p className="font-semibold">No clients found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((client) => (
            <ClientHistoryRow key={client._id} client={client} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}