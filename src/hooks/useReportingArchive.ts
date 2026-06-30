/**
 * useReportingArchive.ts
 * Hooks for reporting archive endpoints:
 *   GET    /:entityType/:entityId/reporting-archive
 *   POST   /:entityType/:entityId/reporting-archive   (multipart)
 *   DELETE /:entityType/:entityId/reporting-archive/:reportId
 */
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { QK } from "../lib/queryKeys";
import { reportingArchiveAPI } from "../api/api";

export interface ReportItem {
  id?: string | number;
  [key: string]: any;
}

// ── GET: all reports for an entity ───────────────────────────────────
export function useReportingArchive(entityType: string, entityId: string | number): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: QK.REPORTING_ARCHIVE(entityType, entityId),
    queryFn: () => reportingArchiveAPI.getAll(entityType, entityId).then((r: { data: any }) => r.data),
    enabled: !!entityType && !!entityId,
  });
}

// ── MUTATION: upload a new report ────────────────────────────────────
export function useAddToReportingArchive(entityType: string, entityId: string | number): UseMutationResult<any, Error, any> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: any) =>
      reportingArchiveAPI.add(entityType, entityId, formData).then((r: { data: any }) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.REPORTING_ARCHIVE(entityType, entityId) });
      // Also refresh the parent entity so reportingArchive summary updates
      queryClient.invalidateQueries({ queryKey: QK.PCN(entityId) });
      queryClient.invalidateQueries({ queryKey: QK.PRACTICE(entityId) });
    },
  });
}

// ── MUTATION: delete a report by reportId ────────────────────────────
export function useDeleteFromReportingArchive(entityType: string, entityId: string | number): UseMutationResult<void, Error, string | number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string | number) =>
      reportingArchiveAPI.delete(entityType, entityId, reportId).then((r: { data: void }) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.REPORTING_ARCHIVE(entityType, entityId) });
      queryClient.invalidateQueries({ queryKey: QK.PCN(entityId) });
      queryClient.invalidateQueries({ queryKey: QK.PRACTICE(entityId) });
    },
  });
}



