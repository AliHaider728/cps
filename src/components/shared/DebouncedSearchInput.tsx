import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface DebouncedSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onSearchChange: (val: string) => void;
  delay?: number;
  icon?: boolean;
}

export const DebouncedSearchInput: React.FC<DebouncedSearchInputProps> = ({
  value,
  onSearchChange,
  delay = 350,
  icon = true,
  className = "",
  ...props
}) => {
  const [localSearch, setLocalSearch] = useState(value || "");

  useEffect(() => {
    setLocalSearch(value || "");
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== value) {
        onSearchChange(localSearch);
      }
    }, delay);
    return () => clearTimeout(handler);
  }, [localSearch, value, onSearchChange, delay]);

  return (
    <div className="relative w-full">
      {icon && <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className={`${icon ? "pl-9" : "pl-3"} pr-3 py-2 text-sm focus:outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
};
