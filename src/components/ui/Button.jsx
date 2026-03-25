import React from "react";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary/90 shadow-sm",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
  outline:
    "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  link:
    "bg-transparent text-primary underline-offset-2 hover:underline p-0 h-auto",
};

const SIZES = {
  xs: "px-2.5 py-1 text-xs rounded-lg",
  sm: "px-3.5 py-1.5 text-sm rounded-xl",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-base rounded-xl",
  icon: "w-9 h-9 p-0 flex items-center justify-center rounded-full",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  isLoading = false,
  onClick,
  type = "button",
  title,
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClass} ${sizeClass} ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}