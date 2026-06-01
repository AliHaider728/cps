import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api/client";

const unwrap = (r) => r?.data ?? {};

export function useEnterMyHours(month, year) {
  return useQuery({
    queryKey: ["enter-my-hours", month, year],
    queryFn: () =>
      apiClient
        .get("/enter-my-hours/my", { params: { month, year } })
        .then((r) => unwrap(r).entries || []),
    enabled: !!month && !!year,
  });
}

export function useUpsertEnterMyHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient.post("/enter-my-hours/my/upsert", payload).then((r) => unwrap(r).entry),
    onSuccess: (_data, vars) => {
      const month = Number(vars?.month);
      const year = Number(vars?.year);
      if (month && year) qc.invalidateQueries({ queryKey: ["enter-my-hours", month, year] });
      qc.invalidateQueries({ queryKey: ["enter-my-hours"] });
    },
  });
}

export function useSubmitEnterMyHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ month, year }) =>
      apiClient.post("/enter-my-hours/my/submit", { month, year }).then((r) => unwrap(r)),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["enter-my-hours", Number(vars?.month), Number(vars?.year)] });
      qc.invalidateQueries({ queryKey: ["enter-my-hours"] });
    },
  });
}

