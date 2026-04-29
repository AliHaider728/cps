import { X, Check } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   Shared atoms used across all Clinician Management panels
   (mirrors PCNDetailPage atoms — same look & feel)
══════════════════════════════════════════════════════════ */

export const Spinner = ({ cls = "border-white" }) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);

export const Btn = ({ onClick, disabled, variant = "primary", size = "md", type = "button", children, cls = "" }) => {
  const V = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    teal:    "bg-teal-600 text-white hover:bg-teal-700",
    ghost:   "border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger:  "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    success: "bg-green-600 text-white hover:bg-green-700",
    warn:    "bg-amber-500 text-white hover:bg-amber-600",
  };
  const S = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${V[variant]} ${S[size]} ${cls}`}
    >
      {children}
    </button>
  );
};

export const ModalShell = ({ title, onClose, children, footer, wide }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] w-full ${wide ? "max-w-2xl" : "max-w-lg"}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
          type="button"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:thin]">{children}</div>
      {footer && (
        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-slate-100 shrink-0">{footer}</div>
      )}
    </div>
  </div>
);

export const FormField = ({ label, value, onChange, type = "text", placeholder, options, required, textarea, rows = 4, cls = "" }) => {
  const id = `f_${label?.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
  return (
    <div className={cls}>
      <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {options ? (
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer"
        >
          <option value="">—</option>
          {options.map((o) => {
            const [v, l] = Array.isArray(o) ? o : [o, o];
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
      ) : textarea ? (
        <textarea
          id={id}
          rows={rows}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
        />
      )}
    </div>
  );
};

export const DetailRow = ({ label, value, mono }) => (
  <div className="flex justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className={`text-sm text-slate-800 font-semibold text-right truncate max-w-[60%] ${mono ? "font-mono" : ""}`}>
      {value || value === 0 ? value : "—"}
    </span>
  </div>
);

export const EditRow = ({ label, value, onChange, type = "text", options }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-44 shrink-0">{label}</span>
    {options ? (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
      >
        <option value="">—</option>
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    ) : (
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-400 transition-all"
      />
    )}
  </div>
);

export const ToggleRow = ({ label, checked, onChange, disabled }) => (
  <label className={`flex items-center justify-between gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white ${disabled ? "opacity-60" : "cursor-pointer hover:bg-slate-50"}`}>
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="accent-blue-600 w-4 h-4"
    />
  </label>
);

export const RagBadge = ({ status }) => {
  const map = {
    red:   "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };
  const cls = map[status] || "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${cls}`}>
      {status || "n/a"}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    missing:   "bg-slate-100 text-slate-600 border-slate-200",
    uploaded:  "bg-blue-50 text-blue-700 border-blue-200",
    approved:  "bg-green-50 text-green-700 border-green-200",
    expired:   "bg-amber-50 text-amber-700 border-amber-200",
    rejected:  "bg-red-50 text-red-700 border-red-200",
    active:    "bg-green-50 text-green-700 border-green-200",
    ended:     "bg-slate-100 text-slate-600 border-slate-200",
    restricted:"bg-red-50 text-red-700 border-red-200",
  };
  const cls = map[status] || "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${cls}`}>
      {status || "—"}
    </span>
  );
};

export const ConfirmIcon = () => <Check size={14} />;

export const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB");
  } catch {
    return String(d);
  }
};

export const fmtDateInput = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return "";
  }
};
