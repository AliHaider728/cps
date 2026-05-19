import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { basePatternService } from "../services/api/timesheetService";

export function useBasePatterns(clinicianId) {
  return useQuery({
    queryKey: ["base-patterns", clinicianId],
    queryFn: () => basePatternService.getByClinician(clinicianId),
    enabled: !!clinicianId,
  });
}

export function useCreateBasePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => basePatternService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["base-patterns"] }),
  });
}

export function useUpdateBasePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => basePatternService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["base-patterns"] }),
  });
}
