/**
 * useReportingArchive.js
 * Hooks for reporting archive endpoints:
 *   GET    /:entityType/:entityId/reporting-archive
 *   POST   /:entityType/:entityId/reporting-archive   (multipart)
 *   DELETE /:entityType/:entityId/reporting-archive/:reportId
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QK } from "../lib/queryKeys.js";
import { reportingArchiveAPI } from "../api/api.js";

// ── GET: all reports for an entity ───────────────────────────────────
export function useReportingArchive(entityType, entityId) {
  return useQuery({
    queryKey: QK.REPORTING_ARCHIVE(entityType, entityId),
    queryFn:  () => reportingArchiveAPI.getAll(entityType, entityId).then((r) => r.data),
    enabled:  !!entityType && !!entityId,
  });
}

// ── MUTATION: upload a new report ────────────────────────────────────
export function useAddToReportingArchive(entityType, entityId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      reportingArchiveAPI.add(entityType, entityId, formData).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.REPORTING_ARCHIVE(entityType, entityId) });
      // Also refresh the parent entity so reportingArchive summary updates
      queryClient.invalidateQueries({ queryKey: QK.PCN(entityId) });
      queryClient.invalidateQueries({ queryKey: QK.PRACTICE(entityId) });
    },
  });
}

// ── MUTATION: delete a report by reportId ────────────────────────────
export function useDeleteFromReportingArchive(entityType, entityId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId) =>
      reportingArchiveAPI.delete(entityType, entityId, reportId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.REPORTING_ARCHIVE(entityType, entityId) });
      queryClient.invalidateQueries({ queryKey: QK.PCN(entityId) });
      queryClient.invalidateQueries({ queryKey: QK.PRACTICE(entityId) });
    },
  });
}