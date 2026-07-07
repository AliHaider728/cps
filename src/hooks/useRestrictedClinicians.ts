/**
 * hooks/useRestrictedClinicians.ts — Module 3
 *
 * React Query hooks for the RestrictedCliniciansPage —
 * the global list of all per-client restrictions across the system,
 * and the rota-facing lookup "which clinicians are blocked at this client?".
 */

import { useMutation, useQuery, useQueryClient, UseQueryResult, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";
import { QK } from "../lib/queryKeys";

const base = "/restricted-clinicians";

export interface RestrictedCliniciansParams {
  [key: string]: any;
}

export interface RestrictedClinician {
  id?: string | number;
  [key: string]: any;
}

/* ─── LIST ALL restrictions (with optional filters) ─────── */
export const useAllRestrictedClinicians = (params: RestrictedCliniciansParams = {}): UseQueryResult<RestrictedClinician[], Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: [QK.RESTRICTED_CLINICIANS, params],
    queryFn: () => apiClient.get(base, { params }).then((r: { data: RestrictedClinician[] }) => r.data),
  });

/* ─── GET restrictions AT a specific client (for rota) ──── */
export const useRestrictedAtClient = (entityType: string, entityId: string | number): UseQueryResult<RestrictedClinician[], Error> =>
  useQuery({
    queryKey: [QK.RESTRICTED_AT_CLIENT, entityType, entityId],
    queryFn: () =>
      apiClient
        .get(`${base}/${entityType}/${entityId}`)
        .then((r: { data: RestrictedClinician[] }) => r.data),
    enabled: !!(entityType && entityId),
  });


