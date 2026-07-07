import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult, keepPreviousData } from "@tanstack/react-query";
import { coverService } from "../services/api/timesheetService";

export function useOpenCoverRequests(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ["cover", "open"],
    queryFn: () => coverService.getOpen(),
  });
}

export function useCreateCoverRequest(): UseMutationResult<any, Error, Record<string, unknown>> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => coverService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cover", "open"] }),
  });
}

export function useAssignCover(): UseMutationResult<any, Error, { id: string; clinician_id: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clinician_id }: { id: string; clinician_id: string }) => coverService.assign(id, clinician_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cover", "open"] }),
  });
}


