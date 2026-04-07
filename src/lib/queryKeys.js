// src/lib/queryKeys.js
export const QK = {
  // ── Auth
  ME:    ["auth", "me"],
  USERS: ["auth", "users"],

  // ── Hierarchy
  HIERARCHY: ["hierarchy"],
  SEARCH:    (q) => ["clients", "search", q],

  // ── ICB
  ICBS: ["icb"],
  ICB:  (id) => ["icb", id],

  // ── Federation
  FEDERATIONS:        ["federation"],
  FEDERATIONS_BY_ICB: (icbId) => ["federation", { icbId }],

  // ── PCN
  PCNS:         ["pcn"],
  PCN:          (id) => ["pcn", id],
  PCN_ROLLUP:   (id) => ["pcn", id, "rollup"],
  PCN_MEETINGS: (id) => ["pcn", id, "meetings"],

  // ── Practice
  PRACTICES: ["practice"],
  PRACTICE:  (id) => ["practice", id],

  // ── History
  HISTORY: (type, id) => ["history", type, id],

  // ── Compliance — Entity Level (ICB/PCN/Practice)
  COMPLIANCE: (type, id) => ["compliance", type, id],
  EXPIRING:   (days)     => ["compliance", "expiring", days],

  // ── Compliance Docs — Master Document Library
  COMPLIANCE_DOCS: ["compliance-docs"],
  COMPLIANCE_DOC:  (id) => ["compliance-docs", id],

  // ── Document Groups
  DOC_GROUPS: ["doc-groups"],
  DOC_GROUP:  (id) => ["doc-groups", id],
  ENTITY_DOCUMENTS: (type, id) => ["entity-documents", type, id],

  // ── Audit
  AUDIT: (params) => ["audit", params],
};
