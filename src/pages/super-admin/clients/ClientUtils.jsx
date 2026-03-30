/**
 * ClientUtils.jsx
 * Shared UI primitives for the entire Clients module.
 * Stateless, pure components — import from here everywhere.
 */

/* ── Date formatter ── */
export const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

/* ── Contact type colors (for history panel) ── */
export const TYPE_COLORS = {
  email:         "bg-blue-100 text-blue-700",
  call:          "bg-green-100 text-green-700",
  meeting:       "bg-purple-100 text-purple-700",
  contract:      "bg-orange-100 text-orange-700",
  complaint:     "bg-red-100 text-red-700",
  system_access: "bg-cyan-100 text-cyan-700",
  document:      "bg-indigo-100 text-indigo-700",
  note:          "bg-slate-100 text-slate-600",
  rota:          "bg-teal-100 text-teal-700",
};

export const CONTACT_TYPES = [
  "email", "call", "meeting", "contract",
  "complaint", "system_access", "document",
  "presentation", "note", "rota",
];

/* ══════════════════════════════════
   Form primitives
══════════════════════════════════ */
export function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
        bg-slate-50 text-slate-800 placeholder-slate-400
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        focus:bg-white transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
    />
  );
}

export function Textarea({ className = "", rows = 3, ...props }) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm
        bg-slate-50 text-slate-800 placeholder-slate-400
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        focus:bg-white transition-all resize-none
        ${className}`}
    />
  );
}

/* ══════════════════════════════════
   Button
══════════════════════════════════ */
const BTN_SIZE = {
  xs: "px-2.5 py-1    text-[11px] gap-1",
  sm: "px-3   py-1.5  text-xs     gap-1.5",
  md: "px-4   py-2.5  text-sm     gap-2",
  lg: "px-5   py-3    text-sm     gap-2",
};

const BTN_VARIANT = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200/60",
  outline: "border border-slate-200 hover:bg-slate-50 text-slate-600",
  ghost:   "hover:bg-slate-100 text-slate-600 border border-transparent",
  danger:  "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200/60",
};

export function Btn({
  onClick, variant = "primary", disabled, children,
  size = "sm", className = "", type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${BTN_SIZE[size] || BTN_SIZE.sm}
        ${BTN_VARIANT[variant] || BTN_VARIANT.primary}
        ${className}`}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════
   Modal
══════════════════════════════════ */
export function Modal({ title, onClose, children, width = "max-w-lg" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[92vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-[15px] font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Scrollable body */}
        <div className="px-6 py-5 overflow-y-auto flex-1
          [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   Badge
══════════════════════════════════ */
const BADGE_COLORS = {
  slate:  "bg-slate-100 text-slate-600",
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-emerald-100 text-emerald-700",
  red:    "bg-red-100 text-red-700",
  amber:  "bg-amber-100 text-amber-700",
  purple: "bg-purple-100 text-purple-700",
  cyan:   "bg-cyan-100 text-cyan-700",
};

export function Badge({ label, color = "slate" }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[color] || BADGE_COLORS.slate}`}>
      {label}
    </span>
  );
}