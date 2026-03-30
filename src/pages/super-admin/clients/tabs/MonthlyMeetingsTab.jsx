/**
 * tabs/MonthlyMeetingsTab.jsx
 * Client-facing dashboard showing monthly meetings and clinician meetings per PCN.
 * From spec section 2.2: "Client-facing front screen showing monthly meetings and clinician meetings"
 */
import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, CheckCircle2, Clock, XCircle, Plus, Loader2 } from "lucide-react";
import { Btn, Field, Input } from "../ClientUtils.jsx";

const API = import.meta.env.VITE_API_URL;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENT_YEAR = new Date().getFullYear();
const MONTHS_FULL = MONTHS.map(m => `${m}-${CURRENT_YEAR}`);

const STATUS_CONFIG = {
  scheduled:  { label: "Scheduled",  color: "bg-blue-100 text-blue-700",    icon: Clock },
  completed:  { label: "Completed",  color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700",      icon: XCircle },
  not_booked: { label: "Not Booked", color: "bg-slate-100 text-slate-500",   icon: Calendar },
};

const TYPE_LABELS = {
  monthly_review:    "Monthly Review",
  clinician_meeting: "Clinician Meeting",
  governance:        "Governance",
  other:             "Other",
};

export default function MonthlyMeetingsTab({ pcnId, pcnName }) {
  const [meetings, setMeetings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    month: MONTHS_FULL[new Date().getMonth()],
    type: "monthly_review",
    date: "",
    attendees: "",
    notes: "",
    status: "scheduled",
  });

  const fetchMeetings = async () => {
    try {
      const { data } = await axios.get(`${API}/clients/pcn/${pcnId}/meetings`);
      setMeetings(data.meetings || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMeetings(); }, [pcnId]);

  const saveMeeting = async () => {
    if (!form.month) return;
    setSaving(true);
    try {
      await axios.post(`${API}/clients/pcn/${pcnId}/meetings`, {
        ...form,
        attendees: form.attendees.split(",").map(s => s.trim()).filter(Boolean),
      });
      await fetchMeetings();
      setShowForm(false);
    } catch {}
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Build month grid — show all 12 months with meeting status
  const meetingByMonthType = {};
  for (const m of meetings) {
    meetingByMonthType[`${m.month}::${m.type}`] = m;
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 size={22} className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Monthly Meetings {CURRENT_YEAR}
        </p>
        <Btn size="sm" onClick={() => setShowForm(s => !s)}>
          <Plus size={13} /> Log Meeting
        </Btn>
      </div>

      {/* Add meeting form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Log / Update Meeting</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Month">
              <select value={form.month} onChange={e => set("month", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                  focus:outline-none focus:border-blue-400 transition-all">
                {MONTHS_FULL.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Meeting Type">
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                  focus:outline-none focus:border-blue-400 transition-all">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                  focus:outline-none focus:border-blue-400 transition-all">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Attendees (comma-separated)">
              <Input value={form.attendees} onChange={e => set("attendees", e.target.value)} placeholder="Dr Smith, Jane Doe…" />
            </Field>
            <Field label="Notes">
              <Input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Meeting notes…" />
            </Field>
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Btn>
            <Btn size="sm" onClick={saveMeeting} disabled={saving}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : null}
              Save
            </Btn>
          </div>
        </div>
      )}

      {/* Month-by-month grid */}
      <div className="space-y-3">
        {["monthly_review", "clinician_meeting"].map(mType => (
          <div key={mType}>
            <p className="text-xs font-bold text-slate-600 mb-2">{TYPE_LABELS[mType]}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {MONTHS.map((month, i) => {
                const key     = `${month}-${CURRENT_YEAR}::${mType}`;
                const meeting = meetingByMonthType[key];
                const status  = meeting?.status || "not_booked";
                const conf    = STATUS_CONFIG[status];
                const Icon    = conf.icon;
                const isPast  = i < new Date().getMonth();
                return (
                  <div key={month}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center
                      ${conf.color.replace("text-", "border-").replace("100", "200")}
                      ${conf.color.includes("bg-slate") ? "border-slate-200" : ""}
                      ${isPast && status === "not_booked" ? "opacity-50" : ""}`}>
                    <Icon size={14} className={conf.color.split(" ")[1]} />
                    <p className="text-[11px] font-bold text-slate-700 mt-1">{month}</p>
                    <p className={`text-[9px] font-semibold mt-0.5 ${conf.color.split(" ")[1]}`}>
                      {conf.label}
                    </p>
                    {meeting?.date && (
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        {new Date(meeting.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Meeting log */}
      {meetings.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">All Logged Meetings</p>
          <div className="space-y-2">
            {[...meetings].reverse().map((m, i) => {
              const conf = STATUS_CONFIG[m.status] || STATUS_CONFIG.not_booked;
              const Icon = conf.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Icon size={14} className={conf.color.split(" ")[1]} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      {TYPE_LABELS[m.type]} — {m.month}
                    </p>
                    {m.date && (
                      <p className="text-xs text-slate-500">
                        {new Date(m.date).toLocaleDateString("en-GB", { weekday:"short", day:"2-digit", month:"short" })}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conf.color}`}>
                    {conf.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}