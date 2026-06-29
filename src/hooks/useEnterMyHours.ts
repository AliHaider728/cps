import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";

const unwrap = (r: { data?: any }) => r?.data ?? {};

export function useEnterMyHours(month: number | string, year: number | string): UseQueryResult<unknown[], Error> {
  return useQuery({
    queryKey: ["enter-my-hours", month, year],
    queryFn: () =>
      apiClient
        .get("/enter-my-hours/my", { params: { month, year } })
        .then((r: { data?: { entries?: unknown[] } }) => unwrap(r).entries || []),
    enabled: !!month && !!year,
  });
}

export function useUpsertEnterMyHours(): UseMutationResult<unknown, Error, Record<string, unknown>> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post("/enter-my-hours/my/upsert", payload).then((r: { data?: { entry?: unknown } }) => unwrap(r).entry),
    onSuccess: (_data, vars) => {
      const month = Number(vars?.month);
      const year = Number(vars?.year);
      if (month && year) qc.invalidateQueries({ queryKey: ["enter-my-hours", month, year] });
      qc.invalidateQueries({ queryKey: ["enter-my-hours"] });
    },
  });
}

export function useSubmitEnterMyHours(): UseMutationResult<unknown, Error, { month: number | string; year: number | string }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ month, year }: { month: number | string; year: number | string }) =>
      apiClient.post("/enter-my-hours/my/submit", { month, year }).then((r: { data?: unknown }) => unwrap(r)),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["enter-my-hours", Number(vars?.month), Number(vars?.year)] });
      qc.invalidateQueries({ queryKey: ["enter-my-hours"] });
    },
  });
}

