import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coverService } from "../services/api/timesheetService";

export function useOpenCoverRequests() {
  return useQuery({
    queryKey: ["cover", "open"],
    queryFn: () => coverService.getOpen(),
  });
}

export function useCreateCoverRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => coverService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cover", "open"] }),
  });
}

export function useAssignCover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, clinician_id }) => coverService.assign(id, clinician_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cover", "open"] }),
  });
}
