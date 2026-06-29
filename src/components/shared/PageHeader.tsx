import React, { ReactNode } from "react";
import { Button } from "../ui/Button";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  actionLabel,
  onAction,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
      <div className="min-w-0">
        {title && <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 truncate">{title}</h1>}
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {children}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="w-full sm:w-auto">
            {actionLabel}
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
