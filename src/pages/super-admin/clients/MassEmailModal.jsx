import { useState } from "react";
import axios from "axios";
import { Loader2, Send, X } from "lucide-react";
import { Modal, Field, Input, Textarea, Btn } from "./ClientUtils.jsx";

const API = import.meta.env.VITE_API_URL;

export default function MassEmailModal({ entityType, entityId, onClose }) {
  const [subject,    setSubject]    = useState("");
  const [body,       setBody]       = useState("");
  const [recipients, setRecipients] = useState([{ email: "", name: "" }]);
  const [sending,    setSending]    = useState(false);
  const [error,      setError]      = useState("");

  const addRecipient    = () => setRecipients(p => [...p, { email: "", name: "" }]);
  const removeRecipient = (i) => setRecipients(p => p.filter((_, idx) => idx !== i));
  const updateRecipient = (i, field, val) =>
    setRecipients(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const send = async () => {
    const valid = recipients.filter(r => r.email);
    if (!subject || !body || !valid.length) {
      setError("Subject, body, and at least one recipient required");
      return;
    }
    setSending(true); setError("");
    try {
      await axios.post(
        `${API}/clients/${entityType}/${entityId}/mass-email`,
        { subject, body, recipients: valid }
      );
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal title="Send Mass Email" onClose={onClose}>
      {error && (
        <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <Field label="Subject">
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject…" />
        </Field>
        <Field label="Body">
          <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Email body (HTML supported)…" />
        </Field>
        <Field label="Recipients">
          <div className="space-y-2">
            {recipients.map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input value={r.name}  onChange={e => updateRecipient(i, "name",  e.target.value)} placeholder="Name" />
                <Input value={r.email} onChange={e => updateRecipient(i, "email", e.target.value)} placeholder="Email" />
                {recipients.length > 1 && (
                  <button onClick={() => removeRecipient(i)} className="text-red-400 hover:text-red-600 shrink-0">
                    <X size={16}/>
                  </button>
                )}
              </div>
            ))}
            <button onClick={addRecipient} className="text-xs text-blue-600 hover:underline font-semibold">
              + Add recipient
            </button>
          </div>
        </Field>
      </div>
      <div className="flex gap-3 mt-6">
        <Btn onClick={onClose} variant="outline">Cancel</Btn>
        <Btn onClick={send} disabled={sending}>
          {sending ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
          {sending ? "Sending…" : "Send Email"}
        </Btn>
      </div>
    </Modal>
  );
}