const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-red-600 text-white hover:bg-red-700",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  link: "bg-transparent text-blue-600 underline-offset-2 hover:underline p-0 h-auto min-h-0",
};

const SIZES = {
  xs: "px-2.5 py-1 text-xs rounded-lg",
  sm: "px-3.5 py-1.5 text-sm rounded-xl",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-base rounded-xl",
  icon: "w-9 h-9 p-0 flex items-center justify-center rounded-full",
  default: "px-4 py-2 text-sm rounded-xl",
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
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-11 sm:min-h-0 ${variantClass} ${sizeClass} ${className}`}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
