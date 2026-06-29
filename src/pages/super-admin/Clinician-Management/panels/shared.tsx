import React, { ReactNode } from "react";
import { X, Check } from "lucide-react";
import { fmtDate, fmtDateInput } from "../../../../lib/formatters";
import { ModalShell } from "../../../../components/ui/ModalShell";

/* ══════════════════════════════════════════════════════════
   Shared atoms used across all Clinician Management panels
══════════════════════════════════════════════════════════ */

interface SpinnerProps {
  cls?: string;
}

export const Spinner = ({ cls = "border-white" }: SpinnerProps) => (
  <span className={`inline-block w-4 h-4 border-2 ${cls} border-t-transparent rounded-full animate-spin`} />
);

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "teal" | "ghost" | "danger" | "outline" | "success" | "warn";
  size?: "sm" | "md" | "lg";
  cls?: string;
}

export const Btn = ({ onClick, disabled, variant = "primary", size = "md", type = "button", children, cls = "" }: BtnProps) => {
  const V: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    teal:    "bg-teal-600 text-white hover:bg-teal-700",
    ghost:   "border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger:  "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    success: "bg-green-600 text-white hover:bg-green-700",
    warn:    "bg-amber-500 text-white hover:bg-amber-600",
  };
  const S: Record<string, string> = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-11 sm:min-h-0 ${V[variant] || V.primary} ${S[size]} ${cls}`}
    >
      {children}
    </button>
  );
};

interface FormFieldProps {
  label?: string;
  value?: string | number | null;
  onChange?: (val: string) => void;
  type?: string;
  placeholder?: string;
  options?: (string | [string, string])[];
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  cls?: string;
}

export const FormField = ({ label, value, onChange, type = "text", placeholder, options, required, textarea, rows = 4, cls = "" }: FormFieldProps) => {
  const id = `f_${label?.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all min-h-11 sm:min-h-0";
  return (
    <div className={cls}>
      <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {options ? (
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${inputCls} cursor-pointer`}
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
          onChange={(e) => onChange?.(e.target.value)}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
};

interface DetailRowProps {
  label?: string;
  value?: string | number | null | ReactNode;
  mono?: boolean;
}

export const DetailRow = ({ label, value, mono }: DetailRowProps) => (
  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className={`text-sm text-slate-800 font-semibold sm:text-right sm:max-w-[60%] break-words ${mono ? "font-mono" : ""}`}>
      {value || value === 0 ? value : "—"}
    </span>
  </div>
);

interface EditRowProps {
  label?: string;
  value?: string | number | null;
  onChange?: (val: string) => void;
  type?: string;
  options?: (string | [string, string])[];
}

export const EditRow = ({ label, value, onChange, type = "text", options }: EditRowProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider sm:w-44 shrink-0">{label}</span>
    {options ? (
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:border-blue-400 transition-all cursor-pointer min-h-11 sm:min-h-0"
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
        onChange={(e) => onChange?.(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:border-blue-400 transition-all min-h-11 sm:min-h-0"
      />
    )}
  </div>
);

interface ToggleRowProps {
  label?: string;
  checked?: boolean;
  onChange?: (val: boolean) => void;
  disabled?: boolean;
}

export const ToggleRow = ({ label, checked, onChange, disabled }: ToggleRowProps) => (
  <label className={`flex items-center justify-between gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white ${disabled ? "opacity-60" : "cursor-pointer hover:bg-slate-50"}`}>
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange?.(e.target.checked)}
      disabled={disabled}
      className="accent-blue-600 w-4 h-4"
    />
  </label>
);

interface BadgeProps {
  status?: string;
}

export const RagBadge = ({ status }: BadgeProps) => {
  const map: Record<string, string> = {
    red:   "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };
  const cls = status && map[status] ? map[status] : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${cls}`}>
      {status || "n/a"}
    </span>
  );
};

export const StatusBadge = ({ status }: BadgeProps) => {
  const map: Record<string, string> = {
    missing:   "bg-slate-100 text-slate-600 border-slate-200",
    uploaded:  "bg-blue-50 text-blue-700 border-blue-200",
    approved:  "bg-green-50 text-green-700 border-green-200",
    expired:   "bg-amber-50 text-amber-700 border-amber-200",
    rejected:  "bg-red-50 text-red-700 border-red-200",
    active:    "bg-green-50 text-green-700 border-green-200",
    ended:     "bg-slate-100 text-slate-600 border-slate-200",
    restricted:"bg-red-50 text-red-700 border-red-200",
  };
  const cls = status && map[status] ? map[status] : "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${cls}`}>
      {status || "—"}
    </span>
  );
};

export const ConfirmIcon = () => <Check size={14} />;
