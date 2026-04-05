const BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api" ||
  "https://cps-backend-ten.vercel.app/api";

// ── Authenticated request
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("cps_token") || ""}`,
});

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
};

// ─────────────────────────────────────────────────────────
//  AUTH / USERS
// ─────────────────────────────────────────────────────────
export const getAllUsers    = ()        => req("GET",    "/auth/users");
export const createUser    = (d)       => req("POST",   "/auth/users", d);
export const updateUser    = (id, d)   => req("PUT",    `/auth/users/${id}`, d);
export const deleteUser    = (id)      => req("DELETE", `/auth/users/${id}`);
export const anonymiseUser = (id)      => req("POST",   `/auth/users/${id}/gdpr`);

// ─────────────────────────────────────────────────────────
//  AUDIT
// ─────────────────────────────────────────────────────────
export const getAuditLogs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req("GET", `/audit${qs ? `?${qs}` : ""}`);
};

// ─────────────────────────────────────────────────────────
//  HIERARCHY
// ─────────────────────────────────────────────────────────
export const getHierarchy  = ()  => req("GET", "/clients/hierarchy");
export const searchClients = (q) => req("GET", `/clients/search?q=${encodeURIComponent(q)}`);

// ─────────────────────────────────────────────────────────
//  ICB
// ─────────────────────────────────────────────────────────
export const getICBs    = ()        => req("GET",    "/clients/icb");
export const getICBById = (id)      => req("GET",    `/clients/icb/${id}`);
export const createICB  = (d)       => req("POST",   "/clients/icb", d);
export const updateICB  = (id, d)   => req("PUT",    `/clients/icb/${id}`, d);
export const deleteICB  = (id)      => req("DELETE", `/clients/icb/${id}`);

// ─────────────────────────────────────────────────────────
//  FEDERATION
// ─────────────────────────────────────────────────────────
export const getFederations   = (icb)   => req("GET",    `/clients/federation${icb ? `?icb=${icb}` : ""}`);
export const createFederation = (d)     => req("POST",   "/clients/federation", d);
export const updateFederation = (id, d) => req("PUT",    `/clients/federation/${id}`, d);
export const deleteFederation = (id)    => req("DELETE", `/clients/federation/${id}`);

// ─────────────────────────────────────────────────────────
//  PCN
// ─────────────────────────────────────────────────────────
export const getPCNs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req("GET", `/clients/pcn${qs ? `?${qs}` : ""}`);
};
export const getPCNById    = (id)      => req("GET",    `/clients/pcn/${id}`);
export const getPCNRollup  = (id)      => req("GET",    `/clients/pcn/${id}/rollup`);
export const createPCN     = (d)       => req("POST",   "/clients/pcn", d);
export const updatePCN     = (id, d)   => req("PUT",    `/clients/pcn/${id}`, d);
export const deletePCN     = (id)      => req("DELETE", `/clients/pcn/${id}`);
export const updateRestrictedClinicians = (id, ids) =>
  req("PATCH", `/clients/pcn/${id}/restricted`, { clinicianIds: ids });
export const getMonthlyMeetings   = (id)    => req("GET",  `/clients/pcn/${id}/meetings`);
export const upsertMonthlyMeeting = (id, d) => req("POST", `/clients/pcn/${id}/meetings`, d);

// ─────────────────────────────────────────────────────────
//  PRACTICE
// ─────────────────────────────────────────────────────────
export const getPractices    = (pcn)    => req("GET",    `/clients/practice${pcn ? `?pcn=${pcn}` : ""}`);
export const getPracticeById = (id)     => req("GET",    `/clients/practice/${id}`);
export const createPractice  = (d)      => req("POST",   "/clients/practice", d);
export const updatePractice  = (id, d)  => req("PUT",    `/clients/practice/${id}`, d);
export const deletePractice  = (id)     => req("DELETE", `/clients/practice/${id}`);
export const updateRestrictedPractice = (id, ids) =>
  req("PATCH", `/clients/practice/${id}/restricted`, { clinicianIds: ids });
export const requestSystemAccess = (entityType, entityId, d) =>
  req("POST", `/clients/${entityType}/${entityId}/system-access-request`, d);

// ─────────────────────────────────────────────────────────
//  CONTACT HISTORY
// ─────────────────────────────────────────────────────────
export const getContactHistory = (type, id, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req("GET", `/clients/${type}/${id}/history${qs ? `?${qs}` : ""}`);
};
export const addContactHistory    = (type, id, d) => req("POST",   `/clients/${type}/${id}/history`, d);
export const updateContactHistory = (logId, d)    => req("PUT",    `/clients/history/${logId}`, d);
export const toggleStarred        = (logId)       => req("PATCH",  `/clients/history/${logId}/star`);
export const deleteContactHistory = (logId)       => req("DELETE", `/clients/history/${logId}`);

// ─────────────────────────────────────────────────────────
//  MASS EMAIL
// ─────────────────────────────────────────────────────────
export const sendMassEmail = (type, id, d) =>
  req("POST", `/clients/${type}/${id}/mass-email`, d);

// ─────────────────────────────────────────────────────────
//  COMPLIANCE (Entity-level)
// ─────────────────────────────────────────────────────────
export const getComplianceStatus = (entityType, entityId) =>
  req("GET", `/clients/${entityType}/${entityId}/compliance/status`);

export const upsertComplianceDoc = (entityType, entityId, docKey, body) =>
  req("PATCH", `/clients/${entityType}/${entityId}/compliance/${docKey}`, body);

export const approveComplianceDoc = (entityType, entityId, docKey) =>
  req("POST", `/clients/${entityType}/${entityId}/compliance/${docKey}/approve`);

export const rejectComplianceDoc = (entityType, entityId, docKey, reason) =>
  req("POST", `/clients/${entityType}/${entityId}/compliance/${docKey}/reject`, { reason });

export const getExpiringDocs = (days = 30) =>
  req("GET", `/clients/compliance/expiring?days=${days}`);

export const runExpiryCheck = () =>
  req("POST", "/clients/compliance/run-expiry");

// ─────────────────────────────────────────────────────────
//  COMPLIANCE DOCUMENTS (Global CRUD)
// ─────────────────────────────────────────────────────────
export const getComplianceDocs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req("GET", `/compliance/documents${qs ? `?${qs}` : ""}`);
};
export const getComplianceDocById = (id)     => req("GET",    `/compliance/documents/${id}`);
export const createComplianceDoc  = (d)      => req("POST",   "/compliance/documents", d);
export const updateComplianceDoc  = (id, d)  => req("PUT",    `/compliance/documents/${id}`, d);
export const deleteComplianceDoc  = (id)     => req("DELETE", `/compliance/documents/${id}`);

// ─────────────────────────────────────────────────────────
//  DOCUMENT GROUPS
// ─────────────────────────────────────────────────────────
export const getDocumentGroups = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req("GET", `/compliance/groups${qs ? `?${qs}` : ""}`);
};
export const getDocumentGroupById = (id)     => req("GET",    `/compliance/groups/${id}`);
export const createDocumentGroup  = (d)      => req("POST",   "/compliance/groups", d);
export const updateDocumentGroup  = (id, d)  => req("PUT",    `/compliance/groups/${id}`, d);
export const deleteDocumentGroup  = (id)     => req("DELETE", `/compliance/groups/${id}`);