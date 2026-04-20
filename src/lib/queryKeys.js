/**
 * queryKeys.js
 * Central registry for all TanStack Query cache keys.
 *
 
 */

export const QK = {
  // ── Auth / Users ────────────────────────────────────────
  ME:    ["me"],
  USERS: ["users"],
  USER:  (id) => ["users", id],

  // ── Hierarchy & Search ──────────────────────────────────
  HIERARCHY: ["hierarchy"],
  SEARCH:    (q) => ["search", q],

  // ── ICBs ────────────────────────────────────────────────
  ICBS:  ["icbs"],
  ICB:   (id) => ["icbs", id],

  // ── Federations ─────────────────────────────────────────
  FEDERATIONS:          ["federations"],
  FEDERATIONS_BY_ICB:   (icbId) => ["federations", "icb", icbId],

  // ── PCNs ────────────────────────────────────────────────
  PCNS:         ["pcns"],
  PCN:          (id) => ["pcns", id],
  PCN_ROLLUP:   (id) => ["pcns", id, "rollup"],
  PCN_MEETINGS: (id) => ["pcns", id, "meetings"],

  // ── Practices ───────────────────────────────────────────
  PRACTICES: ["practices"],
  PRACTICE:  (id) => ["practices", id],

  // ── Contact History ─────────────────────────────────────
  HISTORY: (entityType, entityId) => ["history", entityType, entityId],

  // ── Compliance (entity level) ───────────────────────────
  COMPLIANCE:  (entityType, entityId) => ["compliance", entityType, entityId],
  EXPIRING:    (days) => ["compliance", "expiring", days],

  // ── Compliance Documents (master library) ───────────────
  COMPLIANCE_DOCS: ["compliance-docs"],
  COMPLIANCE_DOC:  (id) => ["compliance-docs", id],

  // ── Document Groups ─────────────────────────────────────
  DOC_GROUPS: ["doc-groups"],
  DOC_GROUP:  (id) => ["doc-groups", id],

  // ── Entity Documents (group-based upload system) ────────
  ENTITY_DOCUMENTS: (entityType, entityId) => ["entity-documents", entityType, entityId],

  // ── Reporting Archive ───────────────────────────────────
  // NEW: PCN/Practice monthly reporting archive
  REPORTING_ARCHIVE: (entityType, entityId) => ["reporting-archive", entityType, entityId],

  // ── Audit ───────────────────────────────────────────────
  AUDIT: (params) => ["audit", params],
};