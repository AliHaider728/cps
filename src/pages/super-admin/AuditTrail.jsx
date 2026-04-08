import { useState } from "react";
import { ScrollText, Search, RefreshCw, Filter } from "lucide-react";
import { useAuditLogs } from "../../hooks/useAudit";
import DataTable from "../../components/ui/DataTable";

const ACTION_COLORS = {
  LOGIN: "bg-green-100 text-green-700",
  LOGOUT: "bg-slate-100 text-slate-600",
  LOGIN_FAILED: "bg-red-100 text-red-700",
  LOGIN_BLOCKED: "bg-red-100 text-red-700",
  CREATE_USER: "bg-blue-100 text-blue-700",
  UPDATE_USER: "bg-yellow-100 text-yellow-700",
  DELETE_USER: "bg-red-100 text-red-700",
  GDPR_ANONYMISE: "bg-purple-100 text-purple-700",
  CHANGE_PASSWORD: "bg-teal-100 text-teal-700",
};

const STATUS_COLORS = {
  success: "bg-emerald-100 text-emerald-700",
  fail: "bg-red-100 text-red-700",
};

const ACTIONS = [
  "", "LOGIN", "LOGOUT", "LOGIN_FAILED",
  "CREATE_USER", "UPDATE_USER", "DELETE_USER",
  "GDPR_ANONYMISE", "CHANGE_PASSWORD",
];

const fmt = (d) => {
  const date = new Date(d);
  return `${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${date.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })}`;
};

const FilterChip = ({ children }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={14} className="shrink-0 text-slate-400" />
    {children}
  </div>
);

export default function AuditTrail() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const params = { page, limit: pageSize, ...(action && { action }), ...(status && { status }) };
  const { data, isLoading, refetch } = useAuditLogs(params);

  const logs = data?.logs || [];
  const total = data?.pagination?.total || 0;

  const filtered = search
    ? logs.filter((log) =>
      log.userName?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.detail?.toLowerCase().includes(search.toLowerCase()) ||
      log.ip?.includes(search)
    )
    : logs;

  const columns = [
    {
      header: "Timestamp",
      id: "timestamp",
      render: (log) => <span className="font-mono text-xs text-slate-500">{fmt(log.createdAt)}</span>,
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
    },
    {
      header: "User",
      id: "user",
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            {(log.userName || "S").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="whitespace-nowrap text-xs font-semibold text-slate-800">{log.userName}</p>
            <p className="text-xs text-slate-400">{log.userRole}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Action",
      id: "action",
      render: (log) => (
        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${ACTION_COLORS[log.action] || "bg-slate-100 text-slate-600"}`}>
          {log.action}
        </span>
      ),
    },
    {
      header: "Resource",
      id: "resource",
      render: (log) => log.resource,
      cellClassName: "px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-600 align-top",
    },
    {
      header: "Detail",
      id: "detail",
      render: (log) => <span className="block max-w-[220px] truncate text-xs text-slate-500">{log.detail}</span>,
    },
    {
      header: "IP Address",
      id: "ip",
      render: (log) => <span className="font-mono text-xs text-slate-500">{log.ip}</span>,
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
    },
    {
      header: "Status",
      id: "status",
      render: (log) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[log.status] || "bg-slate-100 text-slate-500"}`}>
          {log.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <ScrollText size={20} className="text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Audit Trail</h1>
          </div>
          <p className="text-sm text-slate-500">
            Every system action logged with user, timestamp, and IP address.
            <span className="ml-2 font-semibold text-slate-700">{total.toLocaleString()} total records</span>
          </p>
        </div>
        <button onClick={() => refetch()} className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, action, IP..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        <FilterChip>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            {ACTIONS.map((item) => <option key={item} value={item}>{item || "All Actions"}</option>)}
          </select>
        </FilterChip>
        <FilterChip>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="fail">Failed</option>
          </select>
        </FilterChip>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey="_id"
        loading={isLoading}
        loadingText="Loading audit logs..."
        emptyTitle="No audit records found"
        controlledPage={page}
        onPageChange={setPage}
        controlledPageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        totalItems={search ? filtered.length : total}
        initialPageSize={20}
        pageSizeOptions={[20, 50, 100]}
      />
    </div>
  );
}
