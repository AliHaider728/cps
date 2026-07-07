import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { complianceAPI, complianceDocsAPI, documentGroupsAPI, entityDocumentsAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

export const useComplianceStatus = (entityType: string, entityId: string): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: QK.COMPLIANCE(entityType, entityId),
    queryFn:  () => complianceAPI.getStatus(entityType, entityId).then((r: { data: any }) => r.data),
    enabled:  !!entityType && !!entityId,
  });

export const useExpiringDocs = (days: number = 30): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: QK.EXPIRING(days),
    queryFn:  () => complianceAPI.getExpiring(days).then((r: { data: any }) => r.data),
  });

export const useUpsertComplianceDoc = (entityType: string, entityId: string): UseMutationResult<any, Error, { docKey: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docKey, data }: { docKey: string; data: Record<string, unknown> }) =>
      complianceAPI.upsertDoc(entityType, entityId, docKey, data).then((r: { data: any }) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

export const useApproveComplianceDoc = (entityType: string, entityId: string): UseMutationResult<any, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docKey: string) =>
      complianceAPI.approveDoc(entityType, entityId, docKey).then((r: { data: any }) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

export const useRejectComplianceDoc = (entityType: string, entityId: string): UseMutationResult<any, Error, { docKey: string; reason: string }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docKey, reason }: { docKey: string; reason: string }) =>
      complianceAPI.rejectDoc(entityType, entityId, docKey, reason).then((r: { data: any }) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

export const useRunExpiryCheck = (): UseMutationResult<any, Error, void> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => complianceAPI.runExpiryCheck().then((r: { data: any }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["compliance"] }),
  });
};

export const useComplianceDocs = (params: Record<string, unknown> = {}): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...QK.COMPLIANCE_DOCS, params],
    queryFn:  () => complianceDocsAPI.getAll(params).then((r: { data: any }) => r.data),
  });

export const useComplianceDocStats = (): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...QK.COMPLIANCE_DOCS, "stats"],
    queryFn:  () => complianceDocsAPI.getStats().then((r: { data: any }) => r.data),
  });

export const useComplianceDoc = (id: string): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: QK.COMPLIANCE_DOC(id),
    queryFn:  () => complianceDocsAPI.getById(id).then((r: { data: any }) => r.data),
    enabled:  !!id,
  });

export const useCreateComplianceDoc = (): UseMutationResult<any, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => complianceDocsAPI.create(data).then((r: { data: any }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOCS }),
  });
};

export const useUpdateComplianceDoc = (): UseMutationResult<any, Error, { id: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => complianceDocsAPI.update(id, data).then((r: { data: any }) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOCS });
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOC(id) });
    },
  });
};

export const useDeleteComplianceDoc = (): UseMutationResult<any, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => complianceDocsAPI.delete(id).then((r: { data: any }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOCS }),
  });
};

export const useDocumentGroups = (params: Record<string, unknown> = {}): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...QK.DOC_GROUPS, params],
    queryFn:  () => documentGroupsAPI.getAll(params).then((r: { data: any }) => r.data),
  });

export const useDocumentGroupsForEntity = (entityType: string): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...QK.DOC_GROUPS, "for-entity", entityType],
    queryFn:  () => documentGroupsAPI.getForEntity(entityType).then((r: { data: any }) => r.data),
    enabled:  !!entityType,
  });

export const useDocumentGroup = (id: string): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: QK.DOC_GROUP(id),
    queryFn:  () => documentGroupsAPI.getById(id).then((r: { data: any }) => r.data),
    enabled:  !!id,
  });

export const useCreateDocumentGroup = (): UseMutationResult<any, Error, Record<string, unknown>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => documentGroupsAPI.create(data).then((r: { data: any }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.DOC_GROUPS }),
  });
};

export const useUpdateDocumentGroup = (): UseMutationResult<any, Error, { id: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => documentGroupsAPI.update(id, data).then((r: { data: any }) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.DOC_GROUPS });
      qc.invalidateQueries({ queryKey: QK.DOC_GROUP(id) });
    },
  });
};

export const useDeleteDocumentGroup = (): UseMutationResult<any, Error, string> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentGroupsAPI.delete(id).then((r: { data: any }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.DOC_GROUPS }),
  });
};

export const useDuplicateDocumentGroup = (): UseMutationResult<any, Error, { id: string; name: string }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => documentGroupsAPI.duplicate(id, { name }).then((r: { data: any }) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.DOC_GROUPS }),
  });
};

const safeId = (id: unknown): string | null => {
  if (!id) return null;
  if (typeof id === "object" && "_id" in id) return String((id as { _id: unknown })._id);
  return String(id);
};

export const useEntityDocuments = (entityType: string, entityId: unknown): UseQueryResult<any, Error> => {
  const id = safeId(entityId);
  return useQuery({
    // @ts-ignore
    queryKey: QK.ENTITY_DOCUMENTS(entityType, id),
    // @ts-ignore
    queryFn:  () => entityDocumentsAPI.getAll(entityType, id).then((r: { data: any }) => r.data),
    enabled:  !!entityType && !!id && id !== "undefined" && id !== "null",
    retry:    1,
    staleTime: 30_000,
  });
};

export const useUpsertEntityDocument = (entityType: string, entityId: unknown): UseMutationResult<any, Error, { documentId: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  const id = safeId(entityId);
  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: Record<string, unknown> }) =>
      // @ts-ignore
      entityDocumentsAPI.update(entityType, id, documentId, data).then((r: { data: any }) => r.data),
    onSuccess: () => {
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS(entityType, id) });
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};

export const useAddEntityDocumentUploads = (entityType: string, entityId: unknown): UseMutationResult<any, Error, { groupId: string; documentId: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  const id = safeId(entityId);
  return useMutation({
    mutationFn: ({ groupId, documentId, data }: { groupId: string; documentId: string; data: Record<string, unknown> }) =>
      // @ts-ignore
      entityDocumentsAPI.addUploads(entityType, id, groupId, documentId, data).then((r: { data: any }) => r.data),
    onSuccess: () => {
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS(entityType, id) });
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};

export const useUpdateEntityDocumentUpload = (entityType: string, entityId: unknown): UseMutationResult<any, Error, { groupId: string; documentId: string; uploadId: string; data: Record<string, unknown> }> => {
  const qc = useQueryClient();
  const id = safeId(entityId);
  return useMutation({
    mutationFn: ({ groupId, documentId, uploadId, data }: { groupId: string; documentId: string; uploadId: string; data: Record<string, unknown> }) =>
      // @ts-ignore
      entityDocumentsAPI.updateUpload(entityType, id, groupId, documentId, uploadId, data).then((r: { data: any }) => r.data),
    onSuccess: () => {
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS(entityType, id) });
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};

export const useDeleteEntityDocumentUpload = (entityType: string, entityId: unknown): UseMutationResult<any, Error, { groupId: string; documentId: string; uploadId: string }> => {
  const qc = useQueryClient();
  const id = safeId(entityId);
  return useMutation({
    mutationFn: ({ groupId, documentId, uploadId }: { groupId: string; documentId: string; uploadId: string }) =>
      // @ts-ignore
      entityDocumentsAPI.deleteUpload(entityType, id, groupId, documentId, uploadId).then((r: { data: any }) => r.data),
    onSuccess: () => {
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS(entityType, id) });
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
      // @ts-ignore
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};



