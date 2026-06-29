import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { auditAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

export interface AuditLogParams {
  [key: string]: any;
}

export interface AuditLogData {
  id: string;
  [key: string]: any;
}

export const useAuditLogs = (params: AuditLogParams = {}): UseQueryResult<AuditLogData[], Error> =>
  useQuery<AuditLogData[], Error>({
    queryKey: QK.AUDIT(params),
    queryFn:  () => auditAPI.getLogs(params).then((r: { data: AuditLogData[] }) => r.data),
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

