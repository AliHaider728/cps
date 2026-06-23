// src/hooks/useAudit.js
import { useQuery } from "@tanstack/react-query";
import { auditAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: audit logs (with filters/pagination)
// Auto-refreshes so new actions show up without a manual page reload.
export const useAuditLogs = (params = {}) =>
  useQuery({
    queryKey: QK.AUDIT(params),
    queryFn:  () => auditAPI.getLogs(params).then((r) => r.data),

    //  Poll every 10s while the tab is open and on screen
    refetchInterval: 10000,
    refetchIntervalInBackground: false,

    //  Refetch immediately when the user comes back to this tab/window
    refetchOnWindowFocus: true,

    //  Refetch when network reconnects (e.g. wifi drop)
    refetchOnReconnect: true,

    // Data is considered stale immediately so the above triggers actually refetch
    staleTime: 0,
  });