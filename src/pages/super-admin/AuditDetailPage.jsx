import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ScrollText, MapPin, Monitor,
  Hash, Clock, ArrowRight, FileX, ShieldCheck,
} from "lucide-react";

/* ── Maps ─────────────────────────────────────────────────────────── */
const ACTION_COLORS = {
  LOGIN:                    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  LOGOUT:                   "bg-slate-100  text-slate-600  ring-1 ring-slate-200",
  LOGIN_FAILED:             "bg-red-50     text-red-700    ring-1 ring-red-200",
  LOGIN_BLOCKED:            "bg-red-50     text-red-700    ring-1 ring-red-200",
  CREATE_USER:              "bg-blue-50    text-blue-700   ring-1 ring-blue-200",
  UPDATE_USER:              "bg-amber-50   text-amber-700  ring-1 ring-amber-200",
  DELETE_USER:              "bg-red-50     text-red-700    ring-1 ring-red-200",
  GDPR_ANONYMISE:           "bg-purple-50  text-purple-700 ring-1 ring-purple-200",
  CHANGE_PASSWORD:          "bg-teal-50    text-teal-700   ring-1 ring-teal-200",
  CREATE_CLIENT:            "bg-blue-50    text-blue-700   ring-1 ring-blue-200",
  UPDATE_CLIENT:            "bg-amber-50   text-amber-700  ring-1 ring-amber-200",
  DELETE_CLIENT:            "bg-red-50     text-red-700    ring-1 ring-red-200",
  REPORTING_ARCHIVE_ADD:    "bg-indigo-50  text-indigo-700 ring-1 ring-indigo-200",
  REPORTING_ARCHIVE_DELETE: "bg-red-50     text-red-700    ring-1 ring-red-200",
  UPDATE_DECISION_MAKERS:   "bg-cyan-50    text-cyan-700   ring-1 ring-cyan-200",
  UPDATE_FINANCE_CONTACTS:  "bg-cyan-50    text-cyan-700   ring-1 ring-cyan-200",
  UPDATE_CLIENT_FACING:     "bg-violet-50  text-violet-700 ring-1 ring-violet-200",
};

const ACTION_LABEL = {
  LOGIN: "Login", LOGOUT: "Logout", LOGIN_FAILED: "Login Failed",
  LOGIN_BLOCKED: "Login Blocked", CREATE_USER: "Create User",
  UPDATE_USER: "Update User", DELETE_USER: "Delete User",
  GDPR_ANONYMISE: "GDPR Anonymise", CHANGE_PASSWORD: "Change Password",
  CREATE_CLIENT: "Create Client", UPDATE_CLIENT: "Update Client",
  DELETE_CLIENT: "Delete Client", REPORTING_ARCHIVE_ADD: "Archive Add",
  REPORTING_ARCHIVE_DELETE: "Archive Delete",
  UPDATE_DECISION_MAKERS: "Decision Makers",
  UPDATE_FINANCE_CONTACTS: "Finance Contacts",
  UPDATE_CLIENT_FACING: "Client Facing",
};

const STATUS_STYLES = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  fail:    "bg-red-50     text-red-700     ring-1 ring-red-200",
};

/* ── Helpers ──────────────────────────────────────────────────────── */
const fmt = (d) => {
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
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const humanizeKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

const renderValue = (val) => {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    if (typeof val[0] === "object") return `${val.length} item${val.length > 1 ? "s" : ""}`;
    return val.join(", ");
  }
  if (typeof val === "object") {
    if (val.name) return val.name;
    if (val.$date || val._isAMomentObject) return fmt(val);
    const keys = Object.keys(val);
    return keys.length ? `${keys.length} field${keys.length > 1 ? "s" : ""}` : null;
  }
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) return fmt(val);
  return String(val);
};

const IGNORED_KEYS = new Set([
  "_id", "__v", "createdAt", "updatedAt", "createdBy", "viewedBy",
]);

function buildDiff(before, after) {
  const b = before || {};
  const a = after  || {};
  const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]))
    .filter((k) => !IGNORED_KEYS.has(k));

  return keys
    .map((key) => {
      const bv = b[key];
      const av = a[key];
      const same = JSON.stringify(bv) === JSON.stringify(av);
      return { key, before: bv, after: av, changed: !same };
    })
    .sort((x, y) => (x.changed === y.changed ? 0 : x.changed ? -1 : 1));
}

/* ── Sub-components ───────────────────────────────────────────────── */
function InfoCard({ icon: Icon, label, value, mono }) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-1.5 flex items-center gap-1.5 text-slate-400">
        <Icon size={13} />
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className={`break-all text-sm font-medium text-slate-700 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}

/* ── DiffRow — the star of the show ──────────────────────────────── */
function DiffRow({ row }) {
  const { key, before, after, changed } = row;
  const bVal = renderValue(before);
  const aVal = renderValue(after);

  return (
    <div className={`grid grid-cols-[160px_1fr_32px_1fr] items-start gap-x-4 px-5 py-3.5 transition-colors ${
      changed ? "bg-amber-50/30" : "hover:bg-slate-50/60"
    }`}>
      {/* Field name */}
      <p className="pt-0.5 text-xs font-semibold text-slate-500 truncate">
        {humanizeKey(key)}
      </p>

      {/* Before value */}
      {changed ? (
        <div className="min-w-0 rounded-lg px-2.5 py-1.5 text-sm leading-snug bg-red-50 border border-red-200">
          {bVal
            ? <span className="text-red-700 line-through decoration-red-400">{bVal}</span>
            : <span className="italic text-red-400">was empty</span>
          }
        </div>
      ) : (
        <div className="min-w-0 px-2.5 py-1.5 text-sm leading-snug text-slate-500">
          {bVal || <span className="italic text-slate-300">empty</span>}
        </div>
      )}

      {/* Arrow */}
      <div className="flex items-center justify-center pt-1.5">
        {changed
          ? <ArrowRight size={13} className="text-amber-500 shrink-0" />
          : <span className="block h-px w-3 bg-slate-200 mx-auto mt-1" />}
      </div>

      {/* After value */}
      {changed ? (
        <div className="min-w-0 rounded-lg px-2.5 py-1.5 text-sm leading-snug bg-emerald-50 border border-emerald-200">
          {aVal
            ? <span className="font-medium text-emerald-700">{aVal}</span>
            : <span className="italic text-emerald-500">cleared / empty</span>
          }
        </div>
      ) : (
        <div className="min-w-0 px-2.5 py-1.5 text-sm leading-snug text-slate-600">
          {aVal || <span className="italic text-slate-300">empty</span>}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function AuditDetailPage() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const location = useLocation();
  const log      = location.state?.log;

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <FileX size={24} className="text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">Audit record not found</p>
          <p className="mt-1 text-xs text-slate-400">
            Open this page by clicking a record from the Audit Trail list.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-1 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
        >
          <ArrowLeft size={14} /> Back to Audit Trail
        </button>
      </div>
    );
  }

  const hasBefore    = log.before && Object.keys(log.before).length > 0;
  const hasAfter     = log.after  && Object.keys(log.after).length  > 0;
  const diff         = (hasBefore || hasAfter) ? buildDiff(log.before, log.after) : [];
  const changedCount = diff.filter((d) => d.changed).length;
  const unchanged    = diff.filter((d) => !d.changed).length;

  return (
    <div className="mx-auto max-w-full space-y-4">

      {/* ── Back button ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Audit Trail
      </button>

      {/* ── Header card ── */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${avatarColor(log.userName)}`}>
            {initials(log.userName)}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">{log.userName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{log.userRole} · {fmt(log.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ACTION_COLORS[log.action] || "bg-slate-100 text-slate-600 ring-1 ring-slate-200"}`}>
            {ACTION_LABEL[log.action] || log.action}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[log.status] || "bg-slate-100 text-slate-500 ring-1 ring-slate-200"}`}>
            {log.status === "success" ? "✓ Success" : "✕ Failed"}
          </span>
        </div>
      </div>

      {/* ── Detail / description ── */}
      {log.detail && (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
          <ScrollText size={15} className="mt-0.5 shrink-0 text-slate-400" />
          <p className="text-sm text-slate-600 leading-relaxed">{log.detail}</p>
        </div>
      )}

      {/* ── Context info cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoCard icon={ShieldCheck} label="Resource"    value={log.resource} />
        <InfoCard icon={Hash}        label="Resource ID" value={log.resourceId} mono />
        <InfoCard icon={MapPin}      label="IP Address"  value={log.ip} mono />
        <InfoCard icon={Clock}       label="Timestamp"   value={fmt(log.createdAt)} />
      </div>

      {/* ── Diff table ── */}
      {diff.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table header bar */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-sm font-semibold text-slate-700">Field changes</p>
            <div className="flex items-center gap-2">
              {unchanged > 0 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                  {unchanged} unchanged
                </span>
              )}
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                {changedCount} field{changedCount === 1 ? "" : "s"} changed
              </span>
            </div>
          </div>

          {/* Column labels */}
          <div className="grid grid-cols-[160px_1fr_32px_1fr] gap-x-4 border-b border-slate-100 px-5 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Field</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-red-400">Before</span>
            <span />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">After</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {diff.map((row) => (
              <DiffRow key={row.key} row={row} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
          <ShieldCheck size={22} className="text-slate-300" />
          <p className="text-sm text-slate-400">No field-level change data was recorded for this action.</p>
        </div>
      )}

      {/* ── User agent footer ── */}
      {log.userAgent && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-400">
          <Monitor size={13} className="shrink-0" />
          <span className="break-all">{log.userAgent}</span>
        </div>
      )}
    </div>
  );
}