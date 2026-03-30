import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ArrowDownLeft, Mail, MousePointerClick, Users, RefreshCw, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { useGetStatsOverview } from "../lib/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ComposeEmailModal } from "../components/layout/ComposeEmailModal.jsx";
import { formatRelative } from "../lib/utils.js";

function StatCard({ title, value, icon: Icon, colorClass, bgClass, delay }) {
  return (
    <div style={{ animation: `fadeUp 0.5s ease ${delay}s both` }}>
      <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass} ${colorClass}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EngagementBar({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-lg font-bold text-slate-900">{value}%</span>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useGetStatsOverview();
  const [composeOpen, setComposeOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Spinner className="w-8 h-8" />
          <p className="font-medium animate-pulse">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-900 mb-2">Could not load dashboard</h3>
        <p className="text-red-600 mb-6">Backend API might be unavailable.</p>
        <Button variant="danger" onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  const STAT_CARDS = [
    { title: "Emails Sent",     value: stats?.totalEmailsSent || 0,     icon: ArrowUpRight,      colorClass: "text-blue-600",   bgClass: "bg-blue-100",   delay: 0 },
    { title: "Emails Received", value: stats?.totalEmailsReceived || 0, icon: ArrowDownLeft,     colorClass: "text-emerald-600",bgClass: "bg-emerald-100",delay: 0.1 },
    { title: "Avg. Open Rate",  value: `${stats?.openRate || 0}%`,      icon: Mail,              colorClass: "text-purple-600", bgClass: "bg-purple-100", delay: 0.2 },
    { title: "Avg. Click Rate", value: `${stats?.clickRate || 0}%`,     icon: MousePointerClick, colorClass: "text-amber-600",  bgClass: "bg-amber-100",  delay: 0.3 },
  ];

  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, John!</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your client communications today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/clients">
            <Button variant="outline">View Clients</Button>
          </Link>
          <Button onClick={() => setComposeOpen(true)}>
            <Mail className="w-4 h-4" /> Compose Email
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STAT_CARDS.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" /> Recent Activity
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">Latest engagements across all accounts</p>
              </div>
              <Link href="/emails">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentActivity?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {stats.recentActivity.map((activity, i) => (
                    <div key={activity.id} className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
                      <div className="mt-1">
                        {activity.type === "email_sent"     && <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><ArrowUpRight className="w-4 h-4" /></div>}
                        {activity.type === "email_received" && <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><ArrowDownLeft className="w-4 h-4" /></div>}
                        {activity.type === "engagement"     && <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><MousePointerClick className="w-4 h-4" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-slate-900 truncate">
                            {activity.type === "email_sent" ? `To: ${activity.subject}` : activity.subject || "Activity Update"}
                          </p>
                          <span className="text-xs text-slate-400 whitespace-nowrap ml-4">{formatRelative(activity.occurredAt)}</span>
                        </div>
                        <p className="text-sm text-slate-600 truncate mb-2">{activity.preview || activity.content}</p>
                        <div className="flex items-center gap-2">
                          <Badge color="default">Client ID: {activity.clientId}</Badge>
                          {activity.openCount > 0 && <Badge color="purple">Opened {activity.openCount}x</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p>No recent activity found. Sync Outlook to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Engagement */}
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Engagement Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-6 pt-2">
                <EngagementBar label="Open rate"  value={stats?.openRate  || 0} color="#8b5cf6" />
                <EngagementBar label="Click rate" value={stats?.clickRate || 0} color="#f59e0b" />
              </div>
            </CardContent>
          </Card>

          {/* Outlook sync */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-2">Outlook Sync Active</h3>
            <p className="text-blue-100 text-sm mb-6">Your inbox is syncing automatically. BCC tracking is active.</p>
            <div className="flex items-center gap-3 bg-black/20 rounded-xl p-4">
              <div className="relative">
                <Users className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-indigo-200 uppercase tracking-wide font-semibold">Active Members</p>
                <p className="font-bold text-lg">{stats?.teamMembersActive || 0}</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <Card>
            <CardHeader className="border-b border-slate-100"><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link href="/clients">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Add New Client</p>
                    <p className="text-xs text-slate-500">Create a PCN / Surgery</p>
                  </div>
                </button>
              </Link>
              <button
                onClick={() => setComposeOpen(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Compose Email</p>
                  <p className="text-xs text-slate-500">Send to any client</p>
                </div>
              </button>
              <Link href="/team">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Sync Outlook</p>
                    <p className="text-xs text-slate-500">Manually sync emails</p>
                  </div>
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <ComposeEmailModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}