import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { basePatternService } from "../services/api/timesheetService";

export interface BasePatternData {
  id?: string;
  [key: string]: any;
}

export function useBasePatterns(clinicianId: string): UseQueryResult<BasePatternData[], Error> {
  return useQuery<BasePatternData[], Error>({
    queryKey: ["base-patterns", clinicianId],
    queryFn: () => basePatternService.getByClinician(clinicianId),
    enabled: !!clinicianId,
  });
}

export function useCreateBasePattern(): UseMutationResult<BasePatternData, Error, Partial<BasePatternData>> {
  const queryClient = useQueryClient();
  return useMutation<BasePatternData, Error, Partial<BasePatternData>>({
    mutationFn: (data) => basePatternService.create(data),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["base-patterns"] }); },
  });
}

export function useUpdateBasePattern(): UseMutationResult<BasePatternData, Error, { id: string; data: Partial<BasePatternData> }> {
  const queryClient = useQueryClient();
  return useMutation<BasePatternData, Error, { id: string; data: Partial<BasePatternData> }>({
    mutationFn: ({ id, data }) => basePatternService.update(id, data),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["base-patterns"] }); },
  });
}


