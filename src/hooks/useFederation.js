import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { federationAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: all federations (optional icbId filter)
// FIX: now returns full query object including isLoading, isError etc.
// so consumers (e.g. PCNModal) can wait for data before rendering the select
export const useFederations = (icbId) =>
  useQuery({
    queryKey: icbId ? QK.FEDERATIONS_BY_ICB(icbId) : QK.FEDERATIONS,
    queryFn:  () => federationAPI.getAll(icbId).then((r) => r.data),
  });

// ── MUTATION: create federation
export const useCreateFederation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => federationAPI.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.FEDERATIONS }),
  });
};

// ── MUTATION: update federation
export const useUpdateFederation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => federationAPI.update(id, data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.FEDERATIONS }),
  });
};

// ── MUTATION: delete federation
export const useDeleteFederation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => federationAPI.delete(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.FEDERATIONS }),
  });
};