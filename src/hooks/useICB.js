// src/hooks/useICB.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { icbAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: all ICBs
export const useICBs = () =>
  useQuery({
    queryKey: QK.ICBS,
    queryFn:  () => icbAPI.getAll().then((r) => r.data),
  });

// ── GET: single ICB by id
export const useICB = (id) =>
  useQuery({
    queryKey: QK.ICB(id),
    queryFn:  () => icbAPI.getById(id).then((r) => r.data),
    enabled:  !!id,
  });

// ── MUTATION: create ICB
export const useCreateICB = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => icbAPI.create(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.ICBS }),
  });
};

// ── MUTATION: update ICB
export const useUpdateICB = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => icbAPI.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.ICBS });
      qc.invalidateQueries({ queryKey: QK.ICB(id) });
    },
  });
};

// ── MUTATION: delete ICB
export const useDeleteICB = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => icbAPI.delete(id).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QK.ICBS }),
  });
};