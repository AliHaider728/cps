import React from "react";
import { Database, LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Database,
  title = "No data",
  message,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <Icon size={32} className="text-slate-300 mb-3" />
      <p className="text-sm font-bold text-slate-600">{title}</p>
      {message && <p className="text-xs text-slate-400 mt-1 max-w-sm">{message}</p>}
    </div>
  );
}
