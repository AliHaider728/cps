// src/hooks/useCompliance.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceAPI, complianceDocsAPI, documentGroupsAPI, entityDocumentsAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ═══════════════════════════════════════════════
//  ENTITY LEVEL COMPLIANCE
//  Kisi ICB / PCN / Practice ki compliance
// ═══════════════════════════════════════════════

// GET: entity ki compliance status
export const useComplianceStatus = (entityType, entityId) =>
  useQuery({
    queryKey: QK.COMPLIANCE(entityType, entityId),
    queryFn:  () => complianceAPI.getStatus(entityType, entityId).then((r) => r.data),
    enabled:  !!entityType && !!entityId,
  });

// GET: expiring documents list
export const useExpiringDocs = (days = 30) =>
  useQuery({
    queryKey: QK.EXPIRING(days),
    queryFn:  () => complianceAPI.getExpiring(days).then((r) => r.data),
  });

// MUTATION: document upsert
export const useUpsertComplianceDoc = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docKey, data }) =>
      complianceAPI.upsertDoc(entityType, entityId, docKey, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

// MUTATION: document approve
export const useApproveComplianceDoc = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docKey) =>
      complianceAPI.approveDoc(entityType, entityId, docKey).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

// MUTATION: document reject
export const useRejectComplianceDoc = (entityType, entityId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docKey, reason }) =>
      complianceAPI.rejectDoc(entityType, entityId, docKey, reason).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.COMPLIANCE(entityType, entityId) }),
  });
};

// MUTATION: manual expiry check trigger (admin)
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

// GET: all compliance documents
export const useComplianceDocs = (params = {}) =>
  useQuery({
    queryKey: [...QK.COMPLIANCE_DOCS, params],
    queryFn:  () => complianceDocsAPI.getAll(params).then((r) => r.data),
  });

// GET: single compliance document
export const useComplianceDoc = (id) =>
  useQuery({
    queryKey: QK.COMPLIANCE_DOC(id),
    queryFn:  () => complianceDocsAPI.getById(id).then((r) => r.data),
    enabled:  !!id,
  });

// MUTATION: create compliance document
export const useCreateComplianceDoc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => complianceDocsAPI.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.COMPLIANCE_DOCS }),
  });
};

// MUTATION: update compliance document
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

// MUTATION: delete compliance document
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

// GET: all document groups
export const useDocumentGroups = (params = {}) =>
  useQuery({
    queryKey: [...QK.DOC_GROUPS, params],
    queryFn:  () => documentGroupsAPI.getAll(params).then((r) => r.data),
  });

// GET: single document group
export const useDocumentGroup = (id) =>
  useQuery({
    queryKey: QK.DOC_GROUP(id),
    queryFn:  () => documentGroupsAPI.getById(id).then((r) => r.data),
    enabled:  !!id,
  });

// MUTATION: create document group
export const useCreateDocumentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => documentGroupsAPI.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.DOC_GROUPS }),
  });
};

// MUTATION: update document group
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

// MUTATION: delete document group
export const useDeleteDocumentGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentGroupsAPI.delete(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.DOC_GROUPS }),
  });
};

// ═══════════════════════════════════════════════
//  ENTITY DOCUMENTS — Group-based document system
//  PCN / Practice ke liye
// ═══════════════════════════════════════════════

// ✅ FIXED: entityId ko String mein cast karo
// Agar entityId populated object aa jaye (e.g. { _id: "..." }) toh
// API call fail ho jaati thi. Ab String(entityId) se safe hai.
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
    // ✅ FIXED: enabled guard — id string honi chahiye aur non-empty
    enabled:  !!entityType && !!id && id !== "undefined" && id !== "null",
    // ✅ ADDED: retry sirf 1 baar — 500 errors pe infinite retry na ho
    retry: 1,
    // ✅ ADDED: stale time — PCN page open pe baar baar re-fetch na ho
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