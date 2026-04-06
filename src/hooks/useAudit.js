// src/hooks/useAudit.js
import { useQuery } from "@tanstack/react-query";
import { auditAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: audit logs (with filters/pagination)
export const useAuditLogs = (params = {}) =>
  useQuery({
    queryKey: QK.AUDIT(params),
    queryFn:  () => auditAPI.getLogs(params).then((r) => r.data),
  });