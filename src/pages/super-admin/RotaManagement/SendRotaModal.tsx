import React, { useMemo, useState } from "react";
import { useSendRotaToClient } from "../../../hooks/useRota";
import { X, Mail, Send, Loader2, AlertCircle, Users } from "lucide-react";

const monthLabel = (m: number, y: number) =>
  new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));

interface SendRotaModalProps {
  open?: boolean;
  onClose?: () => void;
  month?: number;
  year?: number;
}

export default function SendRotaModal({
  open  = true,
  onClose,
  month = new Date().getMonth() + 1,
  year  = new Date().getFullYear(),
}: SendRotaModalProps) {
  const send = useSendRotaToClient();
  const [clientId,      setClientId]      = useState<string>("");
  const [recipientsRaw, setRecipientsRaw] = useState<string>("");

  const title          = useMemo(() => monthLabel(month, year), [month, year]);
  const recipientCount = recipientsRaw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean).length;

  const onSubmit = async () => {
    const recipients = recipientsRaw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    await send.mutateAsync({ clientId, data: { month, year, recipients } });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <Mail size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Send Rota</p>
                <p className="text-xs text-slate-400 mt-0.5">{title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-4 space-y-4">
          {/* Client ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Client ID</label>
            <input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900
                placeholder-slate-400 transition-all
                focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. CLT-001"
            />
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users size={12} className="text-slate-400" /> Recipients
              </label>
              {recipientCount > 0 && (
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {recipientCount} email{recipientCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <textarea
              value={recipientsRaw}
              onChange={(e) => setRecipientsRaw(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900
                placeholder-slate-400 resize-none transition-all
                focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="email1@domain.com, email2@domain.com"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">Separate emails with commas or new lines</p>
          </div>

          {/* Error */}
          {send.isError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              {String(send.error?.message ?? "Failed to send")}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={send.isPending || !clientId.trim() || recipientCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white
              shadow-sm hover:bg-slate-800 hover:shadow-md transition-all active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {send.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
              : <><Send size={14} /> Send rota</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
