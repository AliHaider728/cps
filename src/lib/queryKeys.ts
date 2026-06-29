/**
 * queryKeys.ts
 * Central registry for all TanStack Query cache keys.
 */

type QueryKeyArray = (string | number | Record<string, unknown>)[];

export const QK = {
  // ── Auth / Users ────────────────────────────────────────
  ME:    ["me"] as QueryKeyArray,
  USERS: ["users"] as QueryKeyArray,
  USER:  (id: string | number) => ["users", id] as QueryKeyArray,

  // ── Hierarchy & Search ──────────────────────────────────
  HIERARCHY: ["hierarchy"] as QueryKeyArray,
  SEARCH:    (q: string) => ["search", q] as QueryKeyArray,

  // ── ICBs ────────────────────────────────────────────────
  ICBS:  ["icbs"] as QueryKeyArray,
  ICB:   (id: string | number) => ["icbs", id] as QueryKeyArray,

  // ── Federations ─────────────────────────────────────────
  FEDERATIONS:          ["federations"] as QueryKeyArray,
  FEDERATIONS_BY_ICB:   (icbId: string | number) => ["federations", "icb", icbId] as QueryKeyArray,

  // ── PCNs ────────────────────────────────────────────────
  PCNS:             ["pcns"] as QueryKeyArray,
  PCN:              (id: string | number) => ["pcns", id] as QueryKeyArray,
  PCN_ROLLUP:       (id: string | number) => ["pcns", id, "rollup"] as QueryKeyArray,
  PCN_MEETINGS:     (id: string | number) => ["pcns", id, "meetings"] as QueryKeyArray,
  PCN_RATE_HISTORY: (id: string | number) => ["pcns", id, "rate-history"] as QueryKeyArray,
  PCN_RATE_SUMMARY: ["pcn-rate-summary"] as QueryKeyArray,

  // ── Practices ───────────────────────────────────────────
  PRACTICES: ["practices"] as QueryKeyArray,
  PRACTICE:  (id: string | number) => ["practices", id] as QueryKeyArray,

  // ── Contact History ─────────────────────────────────────
  HISTORY: (entityType: string, entityId: string | number) => ["history", entityType, entityId] as QueryKeyArray,

  // ── Compliance (entity level) ───────────────────────────
  COMPLIANCE:  (entityType: string, entityId: string | number) => ["compliance", entityType, entityId] as QueryKeyArray,
  EXPIRING:    (days: number | string) => ["compliance", "expiring", days] as QueryKeyArray,

  // ── Compliance Documents (master library) ───────────────
  COMPLIANCE_DOCS: ["compliance-docs"] as QueryKeyArray,
  COMPLIANCE_DOC:  (id: string | number) => ["compliance-docs", id] as QueryKeyArray,

  // ── Document Groups ─────────────────────────────────────
  DOC_GROUPS: ["doc-groups"] as QueryKeyArray,
  DOC_GROUP:  (id: string | number) => ["doc-groups", id] as QueryKeyArray,

  // ── Entity Documents (group-based upload system) ────────
  ENTITY_DOCUMENTS: (entityType: string, entityId: string | number) => ["entity-documents", entityType, entityId] as QueryKeyArray,

  // ── Reporting Archive ───────────────────────────────────
  REPORTING_ARCHIVE: (entityType: string, entityId: string | number) => ["reporting-archive", entityType, entityId] as QueryKeyArray,

  // ── Audit ───────────────────────────────────────────────
  AUDIT: (params: Record<string, unknown>) => ["audit", params] as QueryKeyArray,

  // ── Clinicians (Module 3) ───────────────────────────────
  CLINICIANS:                   ["clinicians"] as QueryKeyArray,
  CLINICIAN:                    (id: string | number) => ["clinicians", id] as QueryKeyArray,
  CLINICIAN_COMPLIANCE:         (id: string | number) => ["clinicians", id, "compliance"] as QueryKeyArray,
  CLINICIAN_LEAVE:              (id: string | number) => ["clinicians", id, "leave"] as QueryKeyArray,
  CLINICIAN_SUPERVISION:        (id: string | number) => ["clinicians", id, "supervision"] as QueryKeyArray,
  CLINICIAN_CPPE:               (id: string | number) => ["clinicians", id, "cppe"] as QueryKeyArray,
  CLINICIAN_CLIENT_HISTORY:     (id: string | number) => ["clinicians", id, "client-history"] as QueryKeyArray,
  CLINICIAN_ONBOARDING:         (id: string | number) => ["clinicians", id, "onboarding"] as QueryKeyArray,
  CLINICIAN_SCOPE:              (id: string | number) => ["clinicians", id, "scope"] as QueryKeyArray,
  CLINICIAN_RESTRICTED_CLIENTS: (id: string | number) => ["clinicians", id, "restricted-clients"] as QueryKeyArray,

  // ── Restricted Clinicians ───────────────────────────────
  RESTRICTED_CLINICIANS:        ["restricted-clinicians"] as QueryKeyArray,
  RESTRICTED_AT_CLIENT:         (clientId: string | number) => ["restricted-at-client", clientId] as QueryKeyArray,

  // ── Rota (Module 5) ─────────────────────────────────────
  ROTA_LIST: (params: Record<string, unknown>) => ["rota", "list", params] as QueryKeyArray,
  ROTA:      (id: string | number) => ["rota", "shift", id] as QueryKeyArray,
  ROTA_GAPS: (params: Record<string, unknown>) => ["rota", "gaps", params] as QueryKeyArray,
  ROTA_COVER_REQUESTS: (params: Record<string, unknown>) => ["rota", "cover-requests", params] as QueryKeyArray,

  // ── Time Entries (Clock-In / Clock-Out) ─────────────────────
  TIME_ENTRIES_ACTIVE:          ["time-entries", "active"] as QueryKeyArray,
  TIME_ENTRIES_LIST:            (params: Record<string, unknown>) => ["time-entries", "list", params] as QueryKeyArray,
  TIME_ENTRIES_ADMIN_SUMMARY:   ["time-entries", "admin-summary"] as QueryKeyArray,

};
