const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api" || "https://cps-backend-ten.vercel.app/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("cps_token")}`,
});

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── Hierarchy ──────────────────────────────────────────────
export const getHierarchy   = ()         => req("GET",  "/clients/hierarchy");
export const searchClients  = (q)        => req("GET",  `/clients/search?q=${encodeURIComponent(q)}`);

// ── ICB ────────────────────────────────────────────────────
export const getICBs        = ()         => req("GET",  "/clients/icb");
export const getICBById     = (id)       => req("GET",  `/clients/icb/${id}`);
export const createICB      = (d)        => req("POST", "/clients/icb", d);
export const updateICB      = (id, d)    => req("PUT",  `/clients/icb/${id}`, d);
export const deleteICB      = (id)       => req("DELETE",`/clients/icb/${id}`);

// ── Federation ─────────────────────────────────────────────
export const getFederations    = (icb)      => req("GET",  `/clients/federation${icb ? `?icb=${icb}` : ""}`);
export const createFederation  = (d)        => req("POST", "/clients/federation", d);
export const updateFederation  = (id, d)    => req("PUT",  `/clients/federation/${id}`, d);
export const deleteFederation  = (id)       => req("DELETE",`/clients/federation/${id}`);

// ── PCN ────────────────────────────────────────────────────
export const getPCNs        = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req("GET", `/clients/pcn${qs ? `?${qs}` : ""}`);
};
export const getPCNById     = (id)       => req("GET",  `/clients/pcn/${id}`);
export const getPCNRollup   = (id)       => req("GET",  `/clients/pcn/${id}/rollup`);
export const createPCN      = (d)        => req("POST", "/clients/pcn", d);
export const updatePCN      = (id, d)    => req("PUT",  `/clients/pcn/${id}`, d);
export const deletePCN      = (id)       => req("DELETE",`/clients/pcn/${id}`);
export const updateRestrictedClinicians = (id, ids) =>
  req("PATCH", `/clients/pcn/${id}/restricted`, { clinicianIds: ids });
export const getMonthlyMeetings  = (id)  => req("GET",  `/clients/pcn/${id}/meetings`);
export const upsertMonthlyMeeting = (id, d) => req("POST", `/clients/pcn/${id}/meetings`, d);

// ── Practice ───────────────────────────────────────────────
export const getPractices    = (pcn)      => req("GET",  `/clients/practice${pcn ? `?pcn=${pcn}` : ""}`);
export const getPracticeById = (id)       => req("GET",  `/clients/practice/${id}`);
export const createPractice  = (d)        => req("POST", "/clients/practice", d);
export const updatePractice  = (id, d)    => req("PUT",  `/clients/practice/${id}`, d);
export const deletePractice  = (id)       => req("DELETE",`/clients/practice/${id}`);

// ── Contact History ────────────────────────────────────────
export const getContactHistory  = (type, id, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req("GET", `/clients/${type}/${id}/history${qs ? `?${qs}` : ""}`);
};
export const addContactHistory    = (type, id, d)    => req("POST",  `/clients/${type}/${id}/history`, d);
export const updateContactHistory = (logId, d)       => req("PUT",   `/clients/history/${logId}`, d);
export const toggleStarred        = (logId)          => req("PATCH", `/clients/history/${logId}/star`);
export const deleteContactHistory = (logId)          => req("DELETE",`/clients/history/${logId}`);

// ── Mass Email ─────────────────────────────────────────────
export const sendMassEmail = (type, id, d) => req("POST", `/clients/${type}/${id}/mass-email`, d);