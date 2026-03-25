import React from "react";

export function Input({
  className = "",
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  required,
  disabled,
  autoFocus,
  ...rest
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`
        w-full px-3.5 py-2.5 text-sm
        bg-white border border-slate-200 rounded-xl
        text-slate-900 placeholder:text-slate-400
        outline-none transition-all duration-200
        focus:border-primary focus:ring-4 focus:ring-primary/10
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...rest}
    />
  );
}