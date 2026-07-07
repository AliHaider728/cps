import React, { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useScrollLock } from "../../hooks/useScrollLock";

export interface ModalShellProps {
  title: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

/**
 * ModalShell - Reusable modal container component
 * Used across admin panels for consistent modal styling and behavior
 */
export const ModalShell = ({ title, onClose, children, footer, wide }: ModalShellProps) => {
  useScrollLock();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
    <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] w-full ${wide ? "max-w-2xl" : "max-w-lg"}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
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
  , document.body);
};
