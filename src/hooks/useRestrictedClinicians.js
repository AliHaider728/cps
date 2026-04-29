/**
 * hooks/useRestrictedClinicians.js — Module 3
 *
 * React Query hooks for the RestrictedCliniciansPage —
 * the global list of all per-client restrictions across the system,
 * and the rota-facing lookup "which clinicians are blocked at this client?".
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";
import { QK } from "../lib/queryKeys";

const base = "/restricted-clinicians";

/* ─── LIST ALL restrictions (with optional filters) ─────── */
export const useAllRestrictedClinicians = (params = {}) =>
  useQuery({
    queryKey: [QK.RESTRICTED_CLINICIANS, params],
    queryFn:  () => apiClient.get(base, { params }).then((r) => r.data),
  });

/* ─── GET restrictions AT a specific client (for rota) ──── */
export const useRestrictedAtClient = (entityType, entityId) =>
  useQuery({
    queryKey: [QK.RESTRICTED_AT_CLIENT, entityType, entityId],
    queryFn:  () =>
      apiClient
        .get(`${base}/${entityType}/${entityId}`)
        .then((r) => r.data),
    enabled:  !!(entityType && entityId),
  });