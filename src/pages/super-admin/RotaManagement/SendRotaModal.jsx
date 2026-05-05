import { useMemo, useState } from "react";
import { useSendRotaToClient } from "../../../hooks/useRota";

export default function SendRotaModal({ open, onClose, month, year }) {
  const send = useSendRotaToClient();
  const [clientId, setClientId] = useState("");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const title = useMemo(() => `Send rota - ${String(month).padStart(2, "0")}/${year}`, [month, year]);

  const onSubmit = async () => {
    const recipients = recipientsRaw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    await send.mutateAsync({ clientId, data: { month, year, recipients } });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose} type="button">Close</button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <input value={clientId} onChange={(e) => setClientId(e.target.value)} className="h-10 w-full px-3 rounded-md border border-slate-200 bg-white text-sm" placeholder="Client ID" />
          <textarea value={recipientsRaw} onChange={(e) => setRecipientsRaw(e.target.value)} className="min-h-[110px] w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-sm" placeholder="email1@domain.com, email2@domain.com" />
          {send.isError ? <div className="text-sm text-red-700">{String(send.error?.message || "Failed")}</div> : null}
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-md border border-slate-200 text-slate-700 text-sm">Cancel</button>
          <button type="button" onClick={onSubmit} disabled={send.isPending || !clientId} className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm disabled:opacity-60">{send.isPending ? "Sending..." : "Send"}</button>
        </div>
      </div>
    </div>
  );
}
