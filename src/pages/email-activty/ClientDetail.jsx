import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetClient, useGetClientTimeline, useAddNote } from "../lib/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ComposeEmailModal } from "../components/layout/ComposeEmailModal.jsx";
import { ArrowLeft, Mail, Phone, Calendar, ArrowUpRight, ArrowDownLeft, StickyNote, MousePointerClick, Send } from "lucide-react";
import { formatSmartDate, getInitials } from "../lib/utils.js";

const TABS = [
  { value: "all",            label: "All" },
  { value: "email_sent",     label: "Sent" },
  { value: "email_received", label: "Received" },
  { value: "note",           label: "Notes" },
  { value: "engagement",     label: "Engagement" },
];

const TYPE_CONFIG = {
  email_sent:     { bg: "#eff6ff", color: "#2563eb", Icon: ArrowUpRight },
  email_received: { bg: "#ecfdf5", color: "#059669", Icon: ArrowDownLeft },
  engagement:     { bg: "#f5f3ff", color: "#7c3aed", Icon: MousePointerClick },
  note:           { bg: "#fefce8", color: "#d97706", Icon: StickyNote },
};

export default function ClientDetail() {
  const { id: clientId } = useParams();
  const [note, setNote]       = useState("");
  const [filter, setFilter]   = useState("all");
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: client, isLoading: loadingClient } = useGetClient(clientId);
  const { data: timeline, isLoading: loadingTimeline, refetch } = useGetClientTimeline(clientId, { type: filter });
  const { mutate: addNote, isPending: addingNote } = useAddNote();

  const handleAddNote = () => {
    if (!note.trim()) return;
    addNote({ data: { clientId, content: note } }, { onSuccess: () => { setNote(""); refetch(); } });
  };

  if (loadingClient) return <div className="flex justify-center p-20"><Spinner className="w-10 h-10" /></div>;
  if (!client) return <div className="p-8 text-slate-500">Client not found.</div>;

  const entries = timeline?.entries || [];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/clients">
          <Button variant="ghost" className="mb-2 -ml-4 text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Back to Clients
          </Button>
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
              {getInitials(client.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge color="dark">{client.pcnNumber}</Badge>
                {client.surgeryName && <span className="text-slate-500 font-medium">{client.surgeryName}</span>}
              </div>
            </div>
          </div>
          <Button onClick={() => setComposeOpen(true)}>
            <Mail className="w-4 h-4" /> Email Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column */}
        <div className="space-y-6 lg:sticky lg:top-28">
          {/* Contact info */}
          <Card className="border-t-4 border-t-blue-600">
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { Icon: Mail,     value: client.email || "No email provided" },
                { Icon: Phone,    value: client.phone || "No phone provided" },
                { Icon: Calendar, value: `Added ${new Date(client.createdAt).toLocaleDateString()}` },
              ].map(({ Icon, value }) => (
                <div key={value} className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account Manager */}
          <Card>
            <CardHeader><CardTitle>Account Manager</CardTitle></CardHeader>
            <CardContent>
              {client.accountManagerName ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                    {getInitials(client.accountManagerName)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{client.accountManagerName}</p>
                    <p className="text-xs text-slate-500">Primary Contact</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center border border-dashed border-slate-300">
                  No account manager assigned
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity summary */}
          <Card>
            <CardHeader><CardTitle>Activity Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total events",     value: timeline?.total || 0,                                                    color: "text-slate-900" },
                { label: "Emails sent",      value: entries.filter((e) => e.type === "email_sent").length,     color: "text-blue-600" },
                { label: "Replies received", value: entries.filter((e) => e.type === "email_received").length, color: "text-emerald-600" },
                { label: "Notes logged",     value: entries.filter((e) => e.type === "note").length,           color: "text-amber-600" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Note input */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <StickyNote className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Log a note or internal update..."
                    className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none outline-none text-sm"
                  />
                  <div className="absolute bottom-3 right-3">
                    <Button size="sm" onClick={handleAddNote} disabled={!note.trim() || addingNote}>
                      {addingNote ? <Spinner className="w-4 h-4" /> : <><Send className="w-3.5 h-3.5" /> Log Note</>}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                Activity Timeline
                <Badge color="default">{timeline?.total || 0}</Badge>
              </h3>
              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filter === tab.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingTimeline ? (
              <div className="py-10 text-center"><Spinner className="w-8 h-8 mx-auto" /></div>
            ) : entries.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 pl-8 space-y-8 pb-10">
                {entries.map((entry, i) => {
                  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.note;
                  return (
                    <div key={entry.id} className="relative group" style={{ animation: `fadeUp 0.3s ease ${i * 0.07}s both` }}>
                      <div
                        className="absolute -left-[43px] top-1 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      >
                        <cfg.Icon className="w-4 h-4" />
                      </div>
                      <Card className="border-transparent shadow-md hover:border-slate-200 transition-colors">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-slate-900">
                                  {entry.type === "email_sent"     ? "You sent an email" :
                                   entry.type === "email_received" ? `${entry.fromName || entry.fromEmail} replied` :
                                   entry.type === "engagement"     ? "Client Engagement" : "Note Added"}
                                </span>
                                {entry.type === "email_sent" && entry.openCount > 0 && <Badge color="purple">Opened</Badge>}
                              </div>
                              {entry.subject && <p className="text-sm font-semibold text-slate-700">Subject: {entry.subject}</p>}
                            </div>
                            <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-100 px-2.5 py-1 rounded-full">
                              {formatSmartDate(entry.occurredAt)}
                            </span>
                          </div>
                          <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                            {entry.content || entry.preview}
                          </div>
                          {(entry.type === "email_sent" || entry.type === "email_received") && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs text-slate-400">Logged via Outlook Sync</span>
                              <Button variant="link" size="sm">View Full Email</Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No activity found.</p>
                <p className="text-sm text-slate-400 mt-1">
                  {filter !== "all" ? "Try switching to 'All' to see everything." : "Send an email or add a note to get started."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ComposeEmailModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} defaultClientId={clientId} defaultToEmail={client.email || ""} defaultToName={client.name} />

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}