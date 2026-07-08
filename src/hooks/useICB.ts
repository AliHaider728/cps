import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { icbAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

export interface ICB {
  id?: string | number;
  name?: string;
  [key: string]: any;
}

// ── GET: all ICBs
export const useICBs = (): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: QK.ICBS,
    queryFn: () => icbAPI.getAll().then((r: { data: any }) => r.data),
  });

// ── GET: single ICB by id
export const useICB = (id: string | number): UseQueryResult<ICB, Error> =>
  useQuery({
    queryKey: QK.ICB(id),
    queryFn: () => icbAPI.getById(id).then((r: { data: ICB }) => r.data),
    enabled: !!id,
  });

// ── MUTATION: create ICB
export const useCreateICB = (): UseMutationResult<ICB, Error, Partial<ICB>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ICB>) => icbAPI.create(data).then((r: { data: ICB }) => r.data),
    onSuccess: async () => await qc.invalidateQueries({ queryKey: QK.ICBS }),
  });
};

// ── MUTATION: update ICB
export const useUpdateICB = (): UseMutationResult<ICB, Error, { id: string | number; data: Partial<ICB> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<ICB> }) => icbAPI.update(id, data).then((r: { data: ICB }) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.ICBS });
      qc.invalidateQueries({ queryKey: QK.ICB(id) });
    },
  });
};

// ── MUTATION: delete ICB
export const useDeleteICB = (): UseMutationResult<void, Error, string | number> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => icbAPI.delete(id).then((r: { data: void }) => r.data),
    onSuccess: async () => await qc.invalidateQueries({ queryKey: QK.ICBS }),
  });
};


