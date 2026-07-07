import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { practiceAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

export interface Practice {
  id?: string | number;
  [key: string]: any;
}

export interface PracticeParams {
  [key: string]: any;
}

// ── GET: all practices (with optional filters e.g. { pcn: id })
export const usePractices = (params: PracticeParams = {}): UseQueryResult<any, Error> =>
  useQuery({
    placeholderData: keepPreviousData,
    queryKey: [...QK.PRACTICES, params],
    queryFn: () => practiceAPI.getAll(params).then((r: { data: any }) => r.data),
  });

// ── GET: single practice
export const usePractice = (id: string | number): UseQueryResult<Practice, Error> =>
  useQuery({
    queryKey: QK.PRACTICE(id),
    queryFn: () => practiceAPI.getById(id).then((r: { data: Practice }) => r.data),
    enabled: !!id,
  });

// ── MUTATION: create practice
export const useCreatePractice = (): UseMutationResult<Practice, Error, Partial<Practice>> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Practice>) => practiceAPI.create(data).then((r: { data: Practice }) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.PRACTICES }),
  });
};

// ── MUTATION: update practice
export const useUpdatePractice = (): UseMutationResult<{ practice: Practice }, Error, { id: string | number; data: Partial<Practice> }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Practice> }) => practiceAPI.update(id, data).then((r: { data: { practice: Practice } }) => r.data),
    onSuccess: (result, { id }) => {
      if (result?.practice) {
        qc.setQueryData(QK.PRACTICE(id), (existing: { practice: Practice } | undefined) => (
          existing?.practice
            ? { ...existing, practice: { ...existing.practice, ...result.practice } }
            : { practice: result.practice }
        ));
      }
      qc.invalidateQueries({ queryKey: QK.PRACTICES });
      qc.invalidateQueries({ queryKey: QK.PRACTICE(id) });
      qc.invalidateQueries({ queryKey: QK.ENTITY_DOCUMENTS("Practice", id) });
    },
  });
};

// ── MUTATION: delete practice
export const useDeletePractice = (): UseMutationResult<void, Error, string | number> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => practiceAPI.delete(id).then((r: { data: void }) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.PRACTICES }),
  });
};

// ── MUTATION: update restricted clinicians (practice level)
export const useUpdateRestrictedPractice = (): UseMutationResult<any, Error, { id: string | number; clinicianIds: (string | number)[] }> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clinicianIds }: { id: string | number; clinicianIds: (string | number)[] }) =>
      // @ts-ignore
      practiceAPI.updateRestricted(id, clinicianIds).then((r: { data: any }) => r.data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: QK.PRACTICE(id) }),
  });
};

// ── MUTATION: request system access
export const useRequestSystemAccess = (): UseMutationResult<any, Error, { entityType: string; entityId: string | number; data: unknown }> =>
  useMutation({
    mutationFn: ({ entityType, entityId, data }: { entityType: string; entityId: string | number; data: unknown }) =>
      // @ts-ignore
      practiceAPI.requestSystemAccess(entityType, entityId, data).then((r: { data: any }) => r.data),
  });



