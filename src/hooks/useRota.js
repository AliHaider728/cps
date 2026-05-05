import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rotaService } from "../services/api/rotaService";
import { QK } from "../lib/queryKeys";

const keyRotaList = (params) => (QK.ROTA_LIST ? QK.ROTA_LIST(params) : ["rota", "list", params]);
const keyRota = (id) => (QK.ROTA ? QK.ROTA(id) : ["rota", "shift", id]);

export const useRotaList = (params = {}) =>
  useQuery({
    queryKey: keyRotaList(params),
    queryFn: () => {
      const { month, year, ...rest } = params || {};
      return rotaService.getRotaGrid(month, year, rest).then((r) => r.data);
    },
  });

export const useRota = (id) =>
  useQuery({
    queryKey: keyRota(id),
    queryFn: () => rotaService.getRotaById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useClinicianRota = (clinicianId, month, year, params = {}) =>
  useQuery({
    queryKey: ["rota", "clinician", clinicianId, { month, year, ...params }],
    queryFn: () => rotaService.getClinicianRota(clinicianId, month, year, params).then((r) => r.data),
    enabled: !!clinicianId && !!month && !!year,
  });

export const useCreateRota = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => rotaService.createShift(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rota"] });
    },
  });
};

export const useGapReport = (days = 14) =>
  useQuery({
    queryKey: QK.ROTA_GAPS ? QK.ROTA_GAPS({ days }) : ["rota", "gaps", { days }],
    queryFn: () => rotaService.getGapReport(days).then((r) => r.data),
  });

export const useCoverRequests = (params = {}) =>
  useQuery({
    queryKey: QK.ROTA_COVER_REQUESTS ? QK.ROTA_COVER_REQUESTS(params) : ["rota", "cover-requests", params],
    queryFn: () => rotaService.getCoverRequests(params).then((r) => r.data),
  });

export const useAssignCover = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => rotaService.assignCover(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rota"] });
    },
  });
};

export const useSendRotaToClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, data }) => rotaService.sendRotaToClient(clientId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rota"] });
    },
  });
};

export const useUpdateRota = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => rotaService.updateShift(id, data).then((r) => r.data),
    onSuccess: (result, { id }) => {
      qc.invalidateQueries({ queryKey: keyRota(id) });
      qc.invalidateQueries({ queryKey: ["rota"] });

      qc.setQueryData(keyRota(id), result);
    },
  });
};

export const useDeleteRota = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => rotaService.deleteShift(id).then((r) => r.data),
    onSuccess: (_result, id) => {
      qc.removeQueries({ queryKey: keyRota(id) });
      qc.invalidateQueries({ queryKey: ["rota"] });
    },
  });
};

export const useGenerateRota = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ month, year }) => rotaService.generateMonthlyRota(month, year).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rota"] });
    },
  });
};
