import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ScrollText, Search, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const ACTION_COLORS = {
  LOGIN:           "bg-green-100 text-green-700",
  LOGOUT:          "bg-slate-100 text-slate-600",
  LOGIN_FAILED:    "bg-red-100 text-red-700",
  LOGIN_BLOCKED:   "bg-red-100 text-red-700",
  CREATE_USER:     "bg-blue-100 text-blue-700",
  UPDATE_USER:     "bg-yellow-100 text-yellow-700",
  DELETE_USER:     "bg-red-100 text-red-700",
  GDPR_ANONYMISE:  "bg-purple-100 text-purple-700",
};

const STATUS_COLORS = {
  success: "bg-emerald-100 text-emerald-700",
  fail:    "bg-red-100 text-red-700",
};

const ACTIONS = ["", "LOGIN", "LOGOUT", "LOGIN_FAILED", "CREATE_USER", "UPDATE_USER", "DELETE_USER", "GDPR_ANONYMISE"];

export default function AuditTrail() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState("");
  const [action,  setAction]  = useState("");
  const [status,  setStatus]  = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (action) params.append("action", action);
      if (status) params.append("status", status);
      const { data } = await axios.get(`${API}/audit?${params}`);
      setLogs(data.logs);
      setPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, action, status]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = search
    ? logs.filter(l =>
        l.userName?.toLowerCase().includes(search.toLowerCase()) ||
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.detail?.toLowerCase().includes(search.toLowerCase()) ||
        l.ip?.includes(search)
      )
    : logs;

  const fmt = (d) => new Date(d).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScrollText size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Audit Trail</h1>
          </div>
          <p className="text-sm text-slate-500">
            Every system action — logged with user, timestamp, and IP address.
            <span className="ml-2 font-semibold text-slate-700">{total.toLocaleString()} total records</span>
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search user, action, IP…"
            className="text-sm text-slate-700 placeholder-slate-400 outline-none w-full bg-transparent"
          />
        </div>
        {/* Action filter */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={action}
            onChange={e => { setAction(e.target.value); setPage(1); }}
            className="text-sm text-slate-700 outline-none bg-transparent"
          >
            {ACTIONS.map(a => <option key={a} value={a}>{a || "All Actions"}</option>)}
          </select>
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="text-sm text-slate-700 outline-none bg-transparent"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="fail">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Timestamp", "User", "Action", "Resource", "Detail", "IP Address", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <RefreshCw size={16} className="animate-spin" />
                      <span className="text-sm">Loading audit logs…</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No audit records found
                  </td>
                </tr>
              ) : (
                filtered.map((log, i) => (
                  <tr
                    key={log._id}
                    className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap font-mono">
                      {fmt(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(log.userName || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{log.userName}</p>
                          <p className="text-slate-400 text-xs">{log.userRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ACTION_COLORS[log.action] || "bg-slate-100 text-slate-600"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-medium">{log.resource}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{log.detail}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{log.ip}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[log.status] || ""}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">Page <span className="font-bold">{page}</span> of <span className="font-bold">{pages}</span></p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}