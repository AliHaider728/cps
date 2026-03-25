import React, { useState } from "react";
import { useListTeamMembers, useTriggerOutlookSync } from "../lib/api.js";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { OutlookConnectModal } from "../components/layout/OutlookConnectModal.jsx";
import { InviteMemberModal } from "../components/layout/InviteMemberModal.jsx";
import { Copy, RefreshCw, CheckCircle2, XCircle, Mail, Users, UserPlus, Wifi } from "lucide-react";
import { getInitials, formatSmartDate } from "../lib/utils.js";

export default function Team() {
  const { data, isLoading, refetch } = useListTeamMembers();
  const members = data?.members || [];
  const { mutate: syncOutlook, isPending: isSyncing } = useTriggerOutlookSync();

  const [copiedId, setCopiedId] = useState(null);
  const [outlookModal, setOutlookModal] = useState({ open: false, memberId: "", memberName: "", isConnected: false });
  const [inviteOpen, setInviteOpen] = useState(false);

  const copyBcc = (id, bcc) => {
    navigator.clipboard.writeText(bcc);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SUMMARY = [
    { icon: Users,  label: "Members",     value: members.length,                                         bg: "bg-blue-50",   color: "text-blue-600" },
    { icon: Wifi,   label: "Synced",      value: members.filter((m) => m.outlookConnected).length,        bg: "bg-emerald-50",color: "text-emerald-600" },
    { icon: Mail,   label: "Total Emails",value: members.reduce((a, m) => a + (m.emailCount || 0), 0),   bg: "bg-purple-50", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Coverage</h1>
          <p className="text-slate-500 mt-1">Manage team members, Outlook sync, and BCC settings.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4" /> Invite Member
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {SUMMARY.map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 font-semibold uppercase">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Spinner className="w-10 h-10" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {members.map((member, i) => (
            <Card key={member.id} className="border-t-4 border-t-slate-800" style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
              <CardContent className="p-6">
                {/* Member header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-xl font-bold text-slate-700">
                      {member.avatarInitials || getInitials(member.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                      <p className="text-sm text-slate-500">{member.role || "Account Manager"} · {member.email}</p>
                    </div>
                  </div>
                  {member.outlookConnected
                    ? <Badge color="success"><CheckCircle2 className="w-3.5 h-3.5" /> Synced</Badge>
                    : <Badge color="default"><XCircle className="w-3.5 h-3.5" /> Disconnected</Badge>}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: Users, label: "Clients", value: member.clientCount || 0, bg: "bg-blue-100",   color: "text-blue-600" },
                    { icon: Mail,  label: "Emails",  value: member.emailCount  || 0, bg: "bg-emerald-100",color: "text-emerald-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${s.bg} ${s.color} flex items-center justify-center`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
                        <p className="text-xs font-semibold text-slate-500 uppercase mt-1">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BCC */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Unique BCC Address</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2.5 bg-slate-900 text-emerald-400 rounded-lg text-xs break-all">
                        {member.bccAddress || `activity+${member.id}@ourcrm.com`}
                      </code>
                      <button
                        onClick={() => copyBcc(member.id, member.bccAddress || "")}
                        className="shrink-0 w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        {copiedId === member.id
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <Copy className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {member.lastSyncAt ? `Last sync: ${formatSmartDate(member.lastSyncAt)}` : "Never synced"}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOutlookModal({ open: true, memberId: member.id, memberName: member.name, isConnected: !!member.outlookConnected })}
                      >
                        {member.outlookConnected ? "Reconnect" : "Connect Outlook"}
                      </Button>
                      {member.outlookConnected && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => syncOutlook({ data: { memberId: member.id } }, { onSuccess: refetch })}
                          disabled={isSyncing}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} /> Force Sync
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OutlookConnectModal
        isOpen={outlookModal.open}
        onClose={() => setOutlookModal((s) => ({ ...s, open: false }))}
        memberId={outlookModal.memberId}
        memberName={outlookModal.memberName}
        isConnected={outlookModal.isConnected}
      />
      <InviteMemberModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={refetch} />

      <style>{`@keyframes fadeUp { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}