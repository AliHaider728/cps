import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { xeroApi } from "../../api/api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import {
  AlertCircle, CheckCircle2, RefreshCw, Link as LinkIcon,
  Users, AlertTriangle, Search, Filter, MoreVertical, Check, PenLine, RefreshCcw, XCircle, FileClock, Circle
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "../../components/ui/Spinner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../components/ui/alert-dialog";

/* ---------------------------------------------------------------------
   Design tokens (kept local so this page reads as one deliberate system,
   not ad-hoc Tailwind color picks per element)

   Brand      : blue-600  (#2563EB) — primary actions / connection identity
   Success    : emerald   — matched / healthy
   Attention  : amber     — pending / out of sync
   Critical   : rose      — missing / disconnected
   Info/Other : violet    — xero-only (a category, not an error)
   Neutrals   : slate     — surfaces, text, borders
------------------------------------------------------------------------ */

const formatRelative = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return "Today, " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatMy = (date: Date) => {
  return date.toLocaleString([], { month: 'long', year: 'numeric' });
};

const formatShort = (dateStr: string) => {
  return new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function XeroCodesPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["xero-status"],
    queryFn: xeroApi.getStatus,
  });

  const { data: syncData, isLoading: syncLoading, refetch: refetchSync } = useQuery({
    queryKey: ["xero-sync"],
    queryFn: xeroApi.getSyncStatus,
    enabled: !!status?.connected,
  });

  const { data: auditLog, isLoading: auditLoading } = useQuery({
    queryKey: ["xero-audit"],
    queryFn: xeroApi.getAuditLog,
  });

  const connectMutation = useMutation({
    mutationFn: xeroApi.connectUrl,
    onSuccess: (url) => {
      console.log("Xero connect url returned:", url);
      window.location.href = url;
    },
    onError: (err) => {
      console.error("Xero connect error:", err);
      toast.error("Failed to initiate connection");
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: xeroApi.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xero-status"] });
      queryClient.invalidateQueries({ queryKey: ["xero-sync"] });
      queryClient.invalidateQueries({ queryKey: ["xero-audit"] });
      toast.success("Disconnected from Xero");
    },
    onError: () => toast.error("Failed to disconnect"),
  });

  const syncMutation = useMutation({
    mutationFn: xeroApi.syncContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xero-sync"] });
      queryClient.invalidateQueries({ queryKey: ["xero-audit"] });
      toast.success("Contact synced to Xero");
    },
    onError: () => toast.error("Sync failed — try again"),
  });

  const isDemo = status?.tenantName?.toLowerCase().includes("demo") || status?.tenantName?.toLowerCase().includes("test");

  const filteredRecords = useMemo(() => {
    let records = syncData?.records || [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter((r: any) =>
        r.name?.toLowerCase().includes(q) ||
        r.xero_contact_id?.toLowerCase().includes(q) ||
        r.xeroContactName?.toLowerCase().includes(q)
      );
    }

    if (activeFilter !== "All") {
      switch (activeFilter) {
        case "PCNs":
          records = records.filter((r: any) => r.type === "pcn");
          break;
        case "Practices":
          records = records.filter((r: any) => r.type === "practice");
          break;
        case "Matched":
          records = records.filter((r: any) => r.matchStatus === "Matched");
          break;
        case "Unmatched":
          records = records.filter((r: any) => r.matchStatus === "Out of Sync" || r.matchStatus === "Missing in Xero" || r.matchStatus === "Unsynced");
          break;
        case "Xero Only":
          records = records.filter((r: any) => r.matchStatus === "Xero Only");
          break;
      }
    }

    return records;
  }, [syncData, searchQuery, activeFilter]);

  const stats = syncData?.stats || { totalXeroContacts: 0, matched: 0, unmatched: 0 };

  // Soft, muted badge treatment — meaningful color per status, not decorative color
  const getMatchBadgeStyle = (matchStatus: string) => {
    switch (matchStatus) {
      case "Matched": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Out of Sync": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Missing in Xero": return "bg-rose-50 text-rose-700 border border-rose-200";
      case "Xero Only": return "bg-violet-50 text-violet-700 border border-violet-200";
      default: return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const getAuditIcon = (type: string, logStatus: string) => {
    if (logStatus === "Failed") return <XCircle className="w-4 h-4 text-rose-500" />;
    switch (type) {
      case "connect": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "disconnect": return <XCircle className="w-4 h-4 text-rose-500" />;
      case "sync": return <RefreshCcw className="w-4 h-4 text-amber-500" />;
      case "refresh": return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default: return <PenLine className="w-4 h-4 text-blue-500" />;
    }
  };

  if (statusLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Spinner className="w-8 h-8 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50/80">
      {/* Subtle radial gradient wash */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      
      <div className="relative z-10 space-y-8 max-w-[1600px] mx-auto ">

      {/* 1. Page Header — one live indicator lives here, not on every card */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Xero Codes</h1>
          <p className="text-sm text-slate-500 mt-1">Contact mapping, connection health, and sync history</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Live · {formatMy(new Date())}
        </div>
      </div>

      {/* 2. Safety Banner */}
      {status?.connected && isDemo && (
        <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Connected to a test Xero company
              </h3>
              <p className="text-sm text-amber-700/90 mt-0.5">
                Changes made here affect the demo company only — not production.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-amber-300 text-amber-800 hover:bg-amber-100 bg-white shrink-0">
            Learn more
          </Button>
        </div>
      )}

      {/* 3. Stat strip — a single card, quiet dividers, color used only where it means something */}
      <Card className="border-slate-200/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02),0_10px_15px_-3px_rgb(0,0,0,0.03)] rounded-2xl bg-white/90 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-slate-100">
          <StatCell
            icon={<LinkIcon className="w-4 h-4" />}
            tone={status?.connected ? "blue" : "rose"}
            label="Connection"
            value={status?.connected ? "Connected" : "Disconnected"}
            sub={status?.tenantName || "No organisation linked"}
          />
          <StatCell
            icon={<Users className="w-4 h-4" />}
            tone="slate"
            label="Xero Contacts"
            value={stats.totalXeroContacts}
            sub="Total contacts in Xero"
          />
          <StatCell
            icon={<CheckCircle2 className="w-4 h-4" />}
            tone="emerald"
            label="Matched Records"
            value={stats.matched}
            sub="CPS records matched"
          />
          <StatCell
            icon={<AlertTriangle className="w-4 h-4" />}
            tone={stats.unmatched > 0 ? "amber" : "slate"}
            label="Needs Review"
            value={stats.unmatched}
            sub="Unmatched or out of sync"
          />
        </div>
      </Card>

      {/* 4. Connection Detail Row */}
      <Card className="border-slate-200/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02),0_10px_15px_-3px_rgb(0,0,0,0.03)] rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-5">
            <Field label="Connected Org" value={status?.tenantName || "—"} />
            <Field label="Tenant ID" value={status?.tenantId || "—"} mono />
            <Field label="Last Sync" value={status?.updatedAt ? formatRelative(status.updatedAt) : "—"} />
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Token Status</p>
              {status?.connected ? (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-normal">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
                </Badge>
              ) : (
                <Badge className="bg-rose-50 text-rose-700 border border-rose-200 font-normal">
                  Expired / none
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-end">
            {!status?.connected && (
              <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending} className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-[1.02] border-0 text-white">
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}
            {status?.connected && (
              <>
                <AlertDialog>
                  {/* @ts-ignore */}
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-slate-200 text-slate-600 hover:bg-slate-50"
                      disabled={disconnectMutation.isPending}
                    >
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect from Xero?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to disconnect? This will pause all automated sync operations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => disconnectMutation.mutate()}>
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" className="border-slate-200" onClick={() => refetchSync()} disabled={syncLoading}>
                  {syncLoading ? <Spinner className="mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Refresh Contacts
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Contact Mapping */}
        <Card className="lg:col-span-2 border-slate-200/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02),0_10px_15px_-3px_rgb(0,0,0,0.03)] rounded-2xl flex flex-col bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 bg-slate-50/50">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-[3px] h-4 rounded-full bg-blue-600 shrink-0" />
              Contact Mapping & Validation
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search records…"
                  className="pl-8 h-8 text-sm bg-slate-50 border-slate-200"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600">
                <Filter className="w-3.5 h-3.5 mr-1.5" /> Filters
              </Button>
            </div>
          </CardHeader>

          <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {["All", "PCNs", "Practices", "Matched", "Unmatched", "Xero Only"].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:shadow-sm"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <CardContent className="p-0 flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-100/60 sticky top-0">
                <TableRow>
                  <TableHead className="w-[100px] text-[11px] uppercase tracking-wide text-slate-400 font-medium">Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Record Name</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Saved Code</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Xero Contact Name</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Contact ID</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Match Status</TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-wide text-slate-400 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords?.map((record: any) => (
                  <TableRow key={`${record.type}-${record.id}`} className="group relative hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-xs text-slate-500 capitalize py-3 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-blue-500 transition-colors" />
                      <span className="inline-flex items-center gap-1.5 pl-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          record.type === "pcn" ? "bg-blue-400" : record.type === "practice" ? "bg-emerald-400" : "bg-violet-400"
                        }`} />
                        {record.type.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 font-medium text-sm text-slate-800 max-w-[150px] truncate" title={record.name}>
                      {record.name}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs text-slate-500">
                      {record.xero_code || "—"}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-slate-600 max-w-[150px] truncate" title={record.xeroContactName}>
                      {record.xeroContactName || "—"}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-[11px] text-slate-400 max-w-[100px] truncate" title={record.xero_contact_id}>
                      {record.xero_contact_id || "—"}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className={`font-normal ${getMatchBadgeStyle(record.matchStatus)}`}>
                        {record.matchStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex justify-end items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" title="View history">
                          <FileClock className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-amber-600"
                          disabled={syncMutation.isPending}
                          onClick={() => syncMutation.mutate({
                            id: record.id,
                            type: record.type,
                            name: record.name,
                            xeroCode: record.xero_code
                          })}
                          title="Sync to Xero"
                        >
                          {syncMutation.isPending ? <Spinner /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecords?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="w-8 h-8 text-slate-300 mb-1" />
                        <p className="text-sm font-medium text-slate-500">No records found</p>
                        <p className="text-xs text-slate-400">Connect Xero and refresh contacts to see records here.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
            <div>Showing {filteredRecords.length} records</div>
            <div className="flex items-center gap-2">
              <span className="mr-1">20 per page</span>
              <Button variant="outline" size="sm" className="w-7 h-7 p-0 border-slate-200" disabled>&lt;</Button>
              <Button variant="outline" size="sm" className="w-7 h-7 p-0 bg-slate-900 text-white border-slate-900">1</Button>
              <Button variant="outline" size="sm" className="w-7 h-7 p-0 border-slate-200 disabled:opacity-50" disabled>&gt;</Button>
            </div>
          </div>
        </Card>

        {/* Right Column: Audit Trail — compact timeline instead of repeated big icon rows */}
        <Card className="border-slate-200/60 shadow-[0_1px_3px_0_rgb(0,0,0,0.02),0_10px_15px_-3px_rgb(0,0,0,0.03)] rounded-2xl flex flex-col bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 bg-slate-50/50">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-[3px] h-4 rounded-full bg-blue-600 shrink-0" />
              Write Actions & Audit Trail
            </CardTitle>
            <a href="#" className="text-xs font-medium text-blue-600 hover:underline">View all →</a>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {auditLoading ? (
              <div className="p-5 flex items-center gap-2 text-sm text-slate-400">
                <Spinner /> Loading audit log…
              </div>
            ) : (
              <div className="relative">
                {auditLog?.map((log: any, i: number) => (
                  <div key={log.id} className="relative px-5 py-4 hover:bg-slate-50/60 transition-colors">
                    {i !== auditLog.length - 1 && (
                      <span className="absolute left-[27px] top-11 bottom-0 w-px bg-slate-100" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                        {getAuditIcon(log.action_type, log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h4 className="text-sm font-medium text-slate-900 truncate" title={log.title}>
                            {log.title}
                          </h4>
                          <span className={`text-[10px] font-medium shrink-0 ${
                            log.status === "Success" ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                          {log.description}
                        </p>
                        <div className="flex items-center text-[10px] text-slate-400 gap-1.5">
                          <span>{formatShort(log.created_at)}</span>
                          <span>·</span>
                          <span>{log.user_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!auditLog || auditLog.length === 0) && (
                  <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                      <FileClock className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">No actions logged yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">Automated sync events will appear here.</p>
                    </div>
                    {!status?.connected && (
                      <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending} variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                        Connect Xero
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Small presentational helpers, kept in this file so the page stays a
   single drop-in replacement. Move to /components/ui if reused elsewhere.
------------------------------------------------------------------------ */

function StatCell({
  icon, tone, label, value, sub,
}: {
  icon: React.ReactNode;
  tone: "blue" | "emerald" | "amber" | "rose" | "slate";
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  const toneMap: Record<string, string> = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 ring-1 ring-blue-100",
    emerald: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 ring-1 ring-emerald-100",
    amber: "bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600 ring-1 ring-amber-100",
    rose: "bg-gradient-to-br from-rose-50 to-rose-100/50 text-rose-600 ring-1 ring-rose-100",
    slate: "bg-gradient-to-br from-slate-50 to-slate-100/50 text-slate-500 ring-1 ring-slate-200",
  };
  return (
    <div className="p-5 flex items-center gap-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-white rounded-2xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <h3 className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-900 leading-tight">{value}</h3>
        <p className="text-xs text-slate-400 truncate">{sub}</p>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm text-slate-800 truncate ${mono ? "font-mono text-xs" : "font-medium"}`}>{value}</p>
    </div>
  );
}