import React, { useState, useMemo } from "react";
import { useListEmails } from "../lib/api.js";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ComposeEmailModal } from "../components/layout/ComposeEmailModal.jsx";
import { Search, Mail, ArrowUpRight, ArrowDownLeft, Filter, X, ChevronDown } from "lucide-react";
import { formatSmartDate } from "../lib/utils.js";

const DIRECTIONS = [
  { value: "all",      label: "All emails" },
  { value: "outbound", label: "Sent" },
  { value: "inbound",  label: "Received" },
];

export default function Emails() {
  const { data, isLoading } = useListEmails();
  const emails = data?.emails || [];

  const [search, setSearch]         = useState("");
  const [direction, setDirection]   = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = useMemo(() => emails.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [e.subject, e.fromName, e.toName, e.fromEmail, e.clientName, e.bodyPreview].some((v) => v?.toLowerCase().includes(q));
    const matchDir = direction === "all" || e.direction === direction;
    return matchSearch && matchDir;
  }), [emails, search, direction]);

  const hasFilters = direction !== "all" || search !== "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Tracking</h1>
          <p className="text-slate-500 mt-1">View and track all synced Outlook communications.</p>
        </div>
        <Button onClick={() => setComposeOpen(true)}>
          <Mail className="w-4 h-4" /> Compose Email
        </Button>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails, subjects, or clients..." className="pl-10" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <Button variant="outline" onClick={() => setShowFilter((v) => !v)} className={hasFilters ? "border-blue-500 text-blue-600" : ""}>
            <Filter className="w-4 h-4" />
            {direction === "all" ? "Filter" : DIRECTIONS.find((d) => d.value === direction)?.label}
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          {showFilter && (
            <div className="absolute right-0 top-11 z-30 w-44 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              <div className="p-1.5">
                {DIRECTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setDirection(opt.value); setShowFilter(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${direction === opt.value ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-slate-50 text-slate-700"}`}>
                    {opt.value === "outbound" && <ArrowUpRight className="w-4 h-4 text-blue-500" />}
                    {opt.value === "inbound"  && <ArrowDownLeft className="w-4 h-4 text-emerald-500" />}
                    {opt.value === "all"      && <Mail className="w-4 h-4 text-slate-400" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasFilters && (
          <Button variant="ghost" onClick={() => { setSearch(""); setDirection("all"); }} size="icon">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {!isLoading && (
        <p className="text-sm text-slate-500">{filtered.length} of {emails.length} emails{hasFilters && " (filtered)"}</p>
      )}

      {isLoading ? (
        <div className="flex justify-center p-20"><Spinner className="w-10 h-10" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-20 text-center border-dashed">
          <Mail className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">{hasFilters ? "No results found" : "Inbox Empty"}</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {hasFilters ? "Try adjusting your search or filter." : "Connect your Outlook account or use your personal BCC address to start logging emails."}
          </p>
          {hasFilters && <Button variant="outline" onClick={() => { setSearch(""); setDirection("all"); }} className="mt-4">Clear filters</Button>}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((email, i) => (
            <Card key={email.id} className="hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group overflow-hidden"
              style={{ animation: `fadeUp 0.3s ease ${i * 0.03}s both` }}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                <div className={`w-full sm:w-1.5 h-1.5 sm:h-auto ${email.direction === "outbound" ? "bg-blue-500" : "bg-emerald-500"}`} />
                <div className="p-5 flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-4 w-full sm:w-[250px] shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {email.direction === "outbound"
                        ? <ArrowUpRight className="w-5 h-5 text-blue-600" />
                        : <ArrowDownLeft className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 truncate">
                        {email.direction === "outbound" ? `To: ${email.toName || email.toEmail}` : `From: ${email.fromName || email.fromEmail}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatSmartDate(email.sentAt || email.receivedAt || email.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 mb-1 truncate group-hover:text-blue-600 transition-colors">{email.subject}</h4>
                    <p className="text-sm text-slate-500 truncate">{email.bodyPreview}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {email.clientName && <Badge color="default">{email.clientName}</Badge>}
                    {email.openCount  > 0 && <Badge color="purple">Opened</Badge>}
                    {email.clickCount > 0 && <Badge color="warning">Clicked</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ComposeEmailModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}