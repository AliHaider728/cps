import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScrollText, Search, RefreshCw, Filter,
  Eye, X, Calendar,
} from "lucide-react";
import { useAuditLogs } from "../../hooks/useAudit";
import DataTable from "../../components/ui/DataTable";
import { AuditLog } from "./AuditDetailPage";

/* ── Action colour map ────────────────────────────────────────────── */
const ACTION_COLORS: Record<string, string> = {
  LOGIN:           "bg-emerald-100 text-emerald-700",
  LOGOUT:          "bg-slate-100   text-slate-600",
  LOGIN_FAILED:    "bg-red-100     text-red-700",
  LOGIN_BLOCKED:   "bg-red-100     text-red-700",
  CREATE_USER:     "bg-blue-100    text-blue-700",
  UPDATE_USER:     "bg-amber-100   text-amber-700",
  DELETE_USER:     "bg-red-100     text-red-700",
  GDPR_ANONYMISE:  "bg-purple-100  text-purple-700",
  CHANGE_PASSWORD: "bg-teal-100    text-teal-700",
  CREATE_CLIENT:   "bg-blue-100    text-blue-700",
  UPDATE_CLIENT:   "bg-amber-100   text-amber-700",
  DELETE_CLIENT:   "bg-red-100     text-red-700",
  REPORTING_ARCHIVE_ADD:    "bg-indigo-100  text-indigo-700",
  REPORTING_ARCHIVE_DELETE: "bg-red-100     text-red-700",
  UPDATE_DECISION_MAKERS:   "bg-cyan-100  text-cyan-700",
  UPDATE_FINANCE_CONTACTS:  "bg-cyan-100  text-cyan-700",
  UPDATE_CLIENT_FACING:     "bg-violet-100 text-violet-700",
};

const ACTION_LABEL: Record<string, string> = {
  LOGIN:                    "Login",
  LOGOUT:                   "Logout",
  LOGIN_FAILED:             "Login Failed",
  LOGIN_BLOCKED:            "Login Blocked",
  CREATE_USER:              "Create User",
  UPDATE_USER:              "Update User",
  DELETE_USER:              "Delete User",
  GDPR_ANONYMISE:           "GDPR Anonymise",
  CHANGE_PASSWORD:          "Change Password",
  CREATE_CLIENT:            "Create Client",
  UPDATE_CLIENT:            "Update Client",
  DELETE_CLIENT:            "Delete Client",
  REPORTING_ARCHIVE_ADD:    "Archive Add",
  REPORTING_ARCHIVE_DELETE: "Archive Delete",
  UPDATE_DECISION_MAKERS:   "Decision Makers",
  UPDATE_FINANCE_CONTACTS:  "Finance Contacts",
  UPDATE_CLIENT_FACING:     "Client Facing",
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  fail:    "bg-red-100     text-red-700",
};

const ALL_ACTIONS = [
  "",
  "LOGIN", "LOGOUT", "LOGIN_FAILED", "LOGIN_BLOCKED",
  "CREATE_USER", "UPDATE_USER", "DELETE_USER", "GDPR_ANONYMISE", "CHANGE_PASSWORD",
  "CREATE_CLIENT", "UPDATE_CLIENT", "DELETE_CLIENT",
  "REPORTING_ARCHIVE_ADD", "REPORTING_ARCHIVE_DELETE",
  "UPDATE_DECISION_MAKERS", "UPDATE_FINANCE_CONTACTS", "UPDATE_CLIENT_FACING",
];

const ALL_RESOURCES = ["", "User", "PCN", "Practice", "Federation", "ICB"];

/* ── Helpers ──────────────────────────────────────────────────────── */
const fmt = (d?: string | Date | null) => {
  if (!d) return "—";
  const date = new Date(d);
  return `${date.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  })}, ${date.toLocaleTimeString("en-GB", {
    hour: "numeric", minute: "2-digit", hour12: true,
  })}`;
};

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];

/* ── Sub-components ───────────────────────────────────────────────── */
const FilterChip = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Filter size={14} className="shrink-0 text-slate-400" />
    {children}
  </div>
);

const DateChip = ({ icon: Icon, value, onChange, placeholder }: { icon: any, value: string, onChange: (v: string) => void, placeholder: string }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
    <Icon size={14} className="shrink-0 text-slate-400" />
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent text-sm text-slate-700 outline-none"
      placeholder={placeholder}
    />
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function AuditTrail() {
  const navigate = useNavigate();

  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search,   setSearch]   = useState("");
  const [action,   setAction]   = useState("");
  const [resource, setResource] = useState("");
  const [status,   setStatus]   = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const params = useMemo(() => ({
    page,
    limit: pageSize,
    ...(action   && { action }),
    ...(resource && { resource }),
    ...(status   && { status }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo   && { dateTo }),
  }), [page, pageSize, action, resource, status, dateFrom, dateTo]);

  const { data, isLoading, refetch } = useAuditLogs(params);

  const logs: AuditLog[]  = data?.logs              || [];
  const total: number = data?.pagination?.total || 0;

  const filtered = useMemo(() =>
    search
      ? logs.filter((log) =>
          [log.userName, log.action, log.detail, log.ip, log.resource]
            .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
        )
      : logs,
  [logs, search]);

  const columns = useMemo(() => [
    {
      header: "Timestamp",
      id:     "timestamp",
      render: (log: AuditLog) => (
        <span className="font-mono text-xs text-slate-500">{fmt(log.createdAt)}</span>
      ),
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
    },
    {
      header: "User",
      id:     "user",
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${avatarColor(log.userName)}`}>
            {initials(log.userName)}
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
      id:     "action",
      render: (log: AuditLog) => (
        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${ACTION_COLORS[log.action] || "bg-slate-100 text-slate-600"}`}>
          {ACTION_LABEL[log.action] || log.action}
        </span>
      ),
    },
    {
      header: "Resource",
      id:     "resource",
      render: (log: AuditLog) => (
        <span className="text-xs font-medium text-slate-600">{log.resource || "—"}</span>
      ),
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
    },
    {
      header: "Detail",
      id:     "detail",
      render: (log: AuditLog) => (
        <span className="block max-w-[220px] truncate text-xs text-slate-500" title={log.detail}>
          {log.detail || "—"}
        </span>
      ),
    },
    {
      header: "IP Address",
      id:     "ip",
      render: (log: AuditLog) => (
        <span className="font-mono text-xs text-slate-500">{log.ip || "—"}</span>
      ),
      cellClassName: "px-4 py-3 whitespace-nowrap align-top",
    },
    {
      header: "Status",
      id:     "status",
      render: (log: AuditLog) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[log.status] || "bg-slate-100 text-slate-500"}`}>
          {log.status}
        </span>
      ),
    },
    {
      header: "",
      id:     "actions",
      render: (log: AuditLog) => (
        <button
          onClick={() =>
            navigate(`/dashboard/super-admin/audit/${log._id}`, { state: { log } })
          }
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
          title="View full details"
        >
          <Eye size={15} />
        </button>
      ),
      cellClassName: "px-2 py-3 align-top",
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

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
            <span className="ml-2 font-semibold text-slate-700">
              {total.toLocaleString()} total records
            </span>
          </p>
        </div>
        <button onClick={() => refetch()}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, action, detail, IP..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <FilterChip>
          <select value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-slate-700 outline-none">
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>{a ? (ACTION_LABEL[a] || a) : "All Actions"}</option>
            ))}
          </select>
        </FilterChip>

        <FilterChip>
          <select value={resource}
            onChange={(e) => { setResource(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-slate-700 outline-none">
            {ALL_RESOURCES.map((r) => (
              <option key={r} value={r}>{r || "All Resources"}</option>
            ))}
          </select>
        </FilterChip>

        <FilterChip>
          <select value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-slate-700 outline-none">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="fail">Failed</option>
          </select>
        </FilterChip>

        <DateChip icon={Calendar} value={dateFrom}
          onChange={(v) => { setDateFrom(v); setPage(1); }} placeholder="From" />
        <DateChip icon={Calendar} value={dateTo}
          onChange={(v) => { setDateTo(v); setPage(1); }} placeholder="To" />

        {(action || resource || status || dateFrom || dateTo || search) && (
          <button
            onClick={() => {
              setAction(""); setResource(""); setStatus("");
              setDateFrom(""); setDateTo(""); setSearch(""); setPage(1);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
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
        onPageSizeChange={(size: number) => { setPageSize(size); setPage(1); }}
        totalItems={search ? filtered.length : total}
        initialPageSize={20}
        pageSizeOptions={[20, 50, 100]}
      />
    </div>
  );
}


