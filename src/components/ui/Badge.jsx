import React from "react";

const COLORS = {
  default:  "bg-slate-100 text-slate-700",
  primary:  "bg-primary/10 text-primary",
  success:  "bg-emerald-100 text-emerald-700",
  danger:   "bg-red-100 text-red-700",
  warning:  "bg-amber-100 text-amber-700",
  purple:   "bg-purple-100 text-purple-700",
  blue:     "bg-blue-100 text-blue-700",
  dark:     "bg-slate-800 text-white",
  outline:  "bg-transparent border border-current",
};

export function Badge({ children, color = "default", className = "" }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5
        text-xs font-semibold rounded-full
        ${COLORS[color] || COLORS.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}