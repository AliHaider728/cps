/**
 * tabs/SystemAccessTab.jsx
 */
import { useState } from "react";
import { Monitor, CheckCircle2, Clock, AlertCircle, Send, Loader2, X } from "lucide-react";
import { Field, Input, Btn } from "../ClientUtils.jsx";
import { practiceAPI } from "../../../../api/api.js";

const SYSTEMS = ["EMIS", "SystmOne", "ICE", "AccuRx", "Docman", "Softphone", "VPN", "Other"];

const STATUS_CONFIG = {
  not_requested: { label: "Not Requested", color: "bg-slate-100 text-slate-500",     icon: AlertCircle  },
  requested:     { label: "Requested",     color: "bg-blue-100 text-blue-700",       icon: Clock        },
  pending:       { label: "Pending",       color: "bg-amber-100 text-amber-700",     icon: Clock        },
  granted:       { label: "Granted",       color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  view_only:     { label: "View Only",     color: "bg-cyan-100 text-cyan-700",       icon: CheckCircle2 },
};

export default function SystemAccessTab({ data, entityType, entityId, onRefresh }) {
  const systemAccess = data?.systemAccess || [];

  const [showRequest, setShowRequest] = useState(false);
  const [reqForm,     setReqForm]     = useState({
    name: "", gphcNumber: "", smartCardNumber: "", email: "", phone: "",
    systems: [], notes: "",
  });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const set          = (k, v) => setReqForm(f => ({ ...f, [k]: v }));
  const toggleSystem = (sys)  => setReqForm(f => ({
    ...f,
    systems: f.systems.includes(sys)
      ? f.systems.filter(s => s !== sys)
      : [...f.systems, sys],
  }));

  const sendRequest = async () => {
    if (!reqForm.name.trim() || !reqForm.systems.length) return;
    setSending(true);
    try {
      await practiceAPI.requestSystemAccess(entityType, entityId, {
        systems: reqForm.systems,
        clinicianDetails: {
          name:            reqForm.name,
          gphcNumber:      reqForm.gphcNumber,
          smartCardNumber: reqForm.smartCardNumber,
          email:           reqForm.email,
          phone:           reqForm.phone,
        },
        notes: reqForm.notes,
      });
      setSent(true);
      onRefresh?.();
      setTimeout(() => {
        setSent(false);
        setShowRequest(false);
        setReqForm({ name:"", gphcNumber:"", smartCardNumber:"", email:"", phone:"", systems:[], notes:"" });
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const detected = detectSystems(data?.systemAccessNotes || "");

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Access</p>
        <Btn size="sm" onClick={() => setShowRequest(s => !s)}>
          <Send size={12} /> Request Access
        </Btn>
      </div>

      {/* Request form */}
      {showRequest && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Auto-Generate System Access Request
          </p>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-emerald-700">Request sent and logged!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Clinician Name *">
                  <Input value={reqForm.name} onChange={e => set("name", e.target.value)} placeholder="Dr Full Name" />
                </Field>
                <Field label="GPhC Number">
                  <Input value={reqForm.gphcNumber} onChange={e => set("gphcNumber", e.target.value)} placeholder="2012345" />
                </Field>
                <Field label="Smart Card Number">
                  <Input value={reqForm.smartCardNumber} onChange={e => set("smartCardNumber", e.target.value)} placeholder="123456789" />
                </Field>
                <Field label="Email">
                  <Input type="email" value={reqForm.email} onChange={e => set("email", e.target.value)} placeholder="clinician@nhs.uk" />
                </Field>
                <Field label="Phone">
                  <Input value={reqForm.phone} onChange={e => set("phone", e.target.value)} placeholder="07700 900 000" />
                </Field>
              </div>

              <Field label="Systems Required *">
                <div className="flex flex-wrap gap-2 mt-1">
                  {SYSTEMS.map(sys => (
                    <button key={sys} onClick={() => toggleSystem(sys)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                        ${reqForm.systems.includes(sys)
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                        }`}>
                      {sys}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Additional Notes">
                <Input value={reqForm.notes} onChange={e => set("notes", e.target.value)} placeholder="Any extra requirements…" />
              </Field>

              <div className="flex gap-2 justify-end flex-wrap">
                <Btn variant="outline" size="sm" onClick={() => setShowRequest(false)}>
                  <X size={12} /> Cancel
                </Btn>
                <Btn size="sm" onClick={sendRequest}
                  disabled={sending || !reqForm.name.trim() || !reqForm.systems.length}>
                  {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {sending ? "Sending…" : "Send Request"}
                </Btn>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tracked systems */}
      {systemAccess.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3">Tracked Systems</p>
          <div className="space-y-2">
            {systemAccess.map((sa, i) => {
              const conf = STATUS_CONFIG[sa.status] || STATUS_CONFIG.not_requested;
              const Icon = conf.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl
                  hover:border-slate-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                    <Monitor size={14} className="text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{sa.system}</p>
                    {sa.code  && <p className="text-xs text-slate-500 font-mono">{sa.code}</p>}
                    {sa.notes && <p className="text-xs text-slate-500 truncate">{sa.notes}</p>}
                  </div>
                  <span className={`flex items-center gap-1.5 text-[11px] font-bold
                    px-2.5 py-1 rounded-full shrink-0 ${conf.color}`}>
                    <Icon size={10} />
                    <span className="hidden sm:inline">{conf.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detected from free-text notes */}
      {!systemAccess.length && detected.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3">Detected from Notes</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {detected.map((sys, i) => {
              const conf = STATUS_CONFIG[sys.status] || STATUS_CONFIG.not_requested;
              const Icon = conf.icon;
              return (
                <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${conf.color}`}>
                  <Icon size={13} />
                  <span className="text-xs font-semibold">{sys.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw notes */}
      {data?.systemAccessNotes && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Notes</p>
          <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
            <p className="text-sm text-cyan-900 leading-relaxed">{data.systemAccessNotes}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!systemAccess.length && !detected.length && !data?.systemAccessNotes && (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Monitor size={22} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">No system access records</p>
          <p className="text-xs text-slate-400 mt-1">Use "Request Access" to generate an access request</p>
        </div>
      )}
    </div>
  );
}

function detectSystems(notes) {
  const n = notes.toLowerCase();
  const checks = [
    ["EMIS",      "emis",      "granted"      ],
    ["SystmOne",  "systmone",  "granted"      ],
    ["ICE",       "ice",       "granted"      ],
    ["AccuRx",    "accurx",    "granted"      ],
    ["Docman",    "docman",    "granted"      ],
    ["Softphone", "softphone", "not_requested"],
    ["VPN",       "vpn",       "not_requested"],
  ];
  return checks
    .filter(([, key]) => n.includes(key))
    .map(([name, , status]) => {
      let s = status;
      if (n.includes("awaiting") || n.includes("pending")) s = "pending";
      if (n.includes("view only")) s = "view_only";
      return { name, status: s };
    });
}