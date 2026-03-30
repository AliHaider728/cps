/**
 * MassEmailModal.jsx
 * Send mass email to contacts at PCN or Practice level.
 * Emails auto-logged to contact history with open tracking.
 */
import { useState } from "react";
import axios from "axios";
import { Loader2, Send, X, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal, Field, Input, Textarea, Btn } from "./ClientUtils.jsx";

const API = import.meta.env.VITE_API_URL;

export default function MassEmailModal({ entityType, entityId, onClose }) {
  const [subject,    setSubject]    = useState("");
  const [body,       setBody]       = useState("");
  const [recipients, setRecipients] = useState([{ name: "", email: "" }]);
  const [sending,    setSending]    = useState(false);
  const [error,      setError]      = useState("");
  const [sent,       setSent]       = useState(false);

  const addRecipient    = () => setRecipients(p => [...p, { name: "", email: "" }]);
  const removeRecipient = (i) => setRecipients(p => p.filter((_, idx) => idx !== i));
  const update          = (i, field, val) =>
    setRecipients(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const send = async () => {
    setError("");
    const valid = recipients.filter(r => r.email?.includes("@"));
    if (!subject.trim()) return setError("Subject is required");
    if (!body.trim())    return setError("Email body is required");
    if (!valid.length)   return setError("At least one valid recipient email is required");

    setSending(true);
    try {
      await axios.post(
        `${API}/clients/${entityType}/${entityId}/mass-email`,
        { subject, body, recipients: valid }
      );
      setSent(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send. Please try again.");
    } finally { setSending(false); }
  };

  return (
    <Modal title="Send Mass Email" onClose={onClose}>
      {sent ? (
        <div className="text-center py-10">
          <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3" />
          <p className="font-bold text-slate-800 text-lg">Email sent!</p>
          <p className="text-sm text-slate-400 mt-1">Logged to contact history automatically.</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 flex items-start gap-2 px-3.5 py-3 bg-red-50
              border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Subject" required>
              <Input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Email subject…" />
            </Field>

            <Field label="Body" required>
              <Textarea value={body} onChange={e => setBody(e.target.value)}
                placeholder="Email body… HTML is supported for formatting."
                rows={6} />
            </Field>

            <Field label="Recipients">
              <div className="space-y-2.5">
                {recipients.map((r, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={r.name} onChange={e => update(i, "name", e.target.value)}
                      placeholder="Name" className="flex-1" />
                    <Input type="email" value={r.email} onChange={e => update(i, "email", e.target.value)}
                      placeholder="email@nhs.uk" className="flex-1" />
                    {recipients.length > 1 && (
                      <button onClick={() => removeRecipient(i)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                          text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addRecipient}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold">
                  <Plus size={12} /> Add recipient
                </button>
              </div>
            </Field>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100 justify-end">
            <Btn variant="outline" onClick={onClose}>Cancel</Btn>
            <Btn onClick={send} disabled={sending}>
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? "Sending…" : "Send Email"}
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}