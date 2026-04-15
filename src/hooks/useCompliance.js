// src/hooks/useCompliance.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceAPI, complianceDocsAPI, documentGroupsAPI, entityDocumentsAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ═══════════════════════════════════════════════
//  ENTITY LEVEL COMPLIANCE
//  ICB / PCN / Practice ki compliance
// ═══════════════════════════════════════════════

export const useComplianceStatus = (entityType, entityId) =>
  useQuery({
    queryKey: QK.COMPLIANCE(entityType, entityId),
    queryFn:  () => complianceAPI.getStatus(entityType, entityId).then((r) => r.data),
    enabled:  !!entityType && !!entityId,
  });

export const useExpiringDocs = (days = 30) =>
  useQuery({
    queryKey: QK.EXPIRING(days),
    queryFn:  () => complianceAPI.getExpiring(days).then((r) => r.data),
  });

export const useUpsertComplianceDoc = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docKey, data }) =>
      complianceAPI.upsertDoc(entityType, entityId, docKey, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

export const useApproveComplianceDoc = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docKey) =>
      complianceAPI.approveDoc(entityType, entityId, docKey).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

export const useRejectComplianceDoc = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docKey, reason }) =>
      complianceAPI.rejectDoc(entityType, entityId, docKey, reason).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

export const useRunExpiryCheck = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => complianceAPI.runExpiryCheck().then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["compliance"] }),
  });
};

// ═══════════════════════════════════════════════
//  COMPLIANCE DOCUMENTS — Master Library CRUD
// ═══════════════════════════════════════════════

export const useComplianceDocs = (params = {}) =>
  useQuery({
    queryKey: [...QK.COMPLIANCE_DOCS, params],
    queryFn:  () => complianceDocsAPI.getAll(params).then((r) => r.data),
  });

// ✅ NEW: summary stats by category, active/inactive etc.
export const useComplianceDocStats = () =>
  useQuery({
    queryKey: [...QK.COMPLIANCE_DOCS, "stats"],
    queryFn:  () => complianceDocsAPI.getStats().then((r) => r.data),
  });

export const useComplianceDoc = (id) =>
  useQuery({
    queryKey: QK.COMPLIANCE_DOC(id),
    queryFn:  () => complianceDocsAPI.getById(id).then((r) => r.data),
    enabled:  !!id,
  });

export const useCreateComplianceDoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => complianceDocsAPI.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOCS }),
  });
};

export const useUpdateComplianceDoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => complianceDocsAPI.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOCS });
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOC(id) });
    },
  });
};

export const useDeleteComplianceDoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => complianceDocsAPI.delete(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOCS }),
  });
};

// ═══════════════════════════════════════════════
//  DOCUMENT GROUPS
// ═══════════════════════════════════════════════

export const useDocumentGroups = (params = {}) =>
  useQuery({
    queryKey: [...QK.DOC_GROUPS, params],
    queryFn:  () => documentGroupsAPI.getAll(params).then((r) => r.data),
  });

// ✅ NEW: groups applicable to a specific entity type (Clinician / PCN / Practice)
export const useDocumentGroupsForEntity = (entityType) =>
  useQuery({
    queryKey: [...QK.DOC_GROUPS, "for-entity", entityType],
    queryFn:  () => documentGroupsAPI.getForEntity(entityType).then((r) => r.data),
    enabled:  !!entityType,
  });

export const useDocumentGroup = (id) =>
  useQuery({
    queryKey: QK.DOC_GROUP(id),
    queryFn:  () => documentGroupsAPI.getById(id).then((r) => r.data),
    enabled:  !!id,
  });

export const useCreateDocumentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => documentGroupsAPI.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.DOC_GROUPS }),
  });
};

export const useUpdateDocumentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => documentGroupsAPI.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.DOC_GROUPS });
      qc.invalidateQueries({ queryKey: QK.DOC_GROUP(id) });
    },
  });
};

export const useDeleteDocumentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentGroupsAPI.delete(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.DOC_GROUPS }),
  });
};

// ✅ NEW: clone an existing group with a new name
export const useDuplicateDocumentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }) => documentGroupsAPI.duplicate(id, { name }).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.DOC_GROUPS }),
  });
};

// ═══════════════════════════════════════════════
//  ENTITY DOCUMENTS — Group-based document system
//  PCN / Practice ke liye
// ═══════════════════════════════════════════════

const safeId = (id) => {
  if (!id) return null;
  if (typeof id === "object" && id._id) return String(id._id);
  return String(id);
};

export const useEntityDocuments = (entityType, entityId) => {
  const id = safeId(entityId);
  return useQuery({
    queryKey: QK.ENTITY_DOCUMENTS(entityType, id),
    queryFn:  () => entityDocumentsAPI.getAll(entityType, id).then((r) => r.data),
    enabled:  !!entityType && !!id && id !== "undefined" && id !== "null",
    retry:    1,
    staleTime: 30_000,
  });
};

export const useUpsertEntityDocument = (entityType, entityId) => {
  const qc = useQueryClient();
  const id = safeId(entityId);
  return useMutation({
    mutationFn: ({ documentId, data }) =>
      entityDocumentsAPI.update(entityType, id, documentId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS(entityType, id) });
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};

export const useAddEntityDocumentUploads = (entityType, entityId) => {
  const qc = useQueryClient();
  const id = safeId(entityId);
  return useMutation({
    mutationFn: ({ groupId, documentId, data }) =>
      entityDocumentsAPI.addUploads(entityType, id, groupId, documentId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS(entityType, id) });
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};

export const useUpdateEntityDocumentUpload = (entityType, entityId) => {
  const qc = useQueryClient();
  const id = safeId(entityId);
  return useMutation({
    mutationFn: ({ groupId, documentId, uploadId, data }) =>
      entityDocumentsAPI.updateUpload(entityType, id, groupId, documentId, uploadId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS(entityType, id) });
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};

export const useDeleteEntityDocumentUpload = (entityType, entityId) => {
  const qc = useQueryClient();
  const id = safeId(entityId);
  return useMutation({
    mutationFn: ({ groupId, documentId, uploadId }) =>
      entityDocumentsAPI.deleteUpload(entityType, id, groupId, documentId, uploadId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS(entityType, id) });
      qc.invalidateQueries({ queryKey: QK.PCN(id) });
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
    },
  });
};