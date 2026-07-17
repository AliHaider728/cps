import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle, AlertCircle, PlayCircle, Settings } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";

export default function HubSpotStatusPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/hubspot/status`);
      const data = await res.json();
      setStatusData(data);
    } catch (err) {
      console.error(err);
      setStatusData({ status: "api_error", error: "Network error fetching HubSpot status" });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryDeadLetter = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/hubspot/jobs/all/retry`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchStatus();
      } else {
        alert("Failed to retry jobs");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'not_configured': return <Settings className="h-5 w-5 text-slate-600" />;
      case 'configuration_error': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default: return <XCircle className="h-5 w-5 text-rose-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-100';
      case 'not_configured': return 'bg-slate-100';
      case 'configuration_error': return 'bg-amber-100';
      default: return 'bg-rose-100';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">HubSpot Integration</h1>
          <p className="text-slate-500">Manage your connection to HubSpot CRM</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-amber-800">Phase 1 Integration</h3>
          <p className="text-sm text-amber-700 mt-1">
            This integration is currently <strong>One-Way (CPS &rarr; HubSpot)</strong>. 
            Only approved PCNs, Practices, and Contacts will be automatically synced from CPS to HubSpot. 
            Do not make edits in HubSpot that you expect to reflect back in CPS.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>View your current HubSpot API configuration and queue status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2 text-slate-500 py-4">
              <Spinner className="w-5 h-5" />
              <span>Checking status...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(statusData?.status)}`}>
                    {getStatusIcon(statusData?.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 uppercase">
                      {statusData?.status?.replace('_', ' ')}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {statusData?.lastSync && (
                        <span className="text-xs text-slate-500">
                          Last sync: {new Date(statusData.lastSync).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={fetchStatus}
                  className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>

              {statusData?.error && (
                <div className="bg-rose-50 text-rose-800 text-sm p-3 rounded-md border border-rose-200 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Status Error:</p>
                    <p>{statusData.error}</p>
                  </div>
                </div>
              )}

              {statusData?.stats && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-4 border border-slate-100 bg-white rounded-lg text-center shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Pending Jobs</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{statusData.stats.pending}</p>
                  </div>
                  <div className="p-4 border border-slate-100 bg-white rounded-lg text-center shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Processing Jobs</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{statusData.stats.processing}</p>
                  </div>
                  <div className="p-4 border border-rose-100 bg-rose-50 rounded-lg text-center shadow-sm relative">
                    <p className="text-sm font-medium text-rose-600">Dead-Letter Jobs</p>
                    <p className="text-2xl font-bold text-rose-700 mt-1">{statusData.stats.deadLetter}</p>
                    {statusData.stats.deadLetter > 0 && (
                      <button 
                        onClick={handleRetryDeadLetter}
                        disabled={retrying}
                        className="absolute top-2 right-2 text-rose-600 hover:text-rose-800 disabled:opacity-50"
                        title="Retry all dead-letter jobs"
                      >
                        <PlayCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {statusData?.stats?.latestError && (
                <div className="bg-slate-50 text-slate-600 text-xs p-3 rounded-md border border-slate-200 mt-4 font-mono">
                  <p className="font-semibold mb-1 text-slate-700 font-sans">Latest Queue Error:</p>
                  <p className="truncate">{statusData.stats.latestError}</p>
                </div>
              )}

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
