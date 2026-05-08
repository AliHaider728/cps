import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rotaService } from "../services/api/rotaService";
import { QK } from "../lib/queryKeys";

/* ─── Query Key Helpers ──────────────────────────────────────────────────── */
const keyRotaList  = (params) => (QK.ROTA_LIST  ? QK.ROTA_LIST(params)  : ["rota", "list",  params]);
const keyRota      = (id)     => (QK.ROTA       ? QK.ROTA(id)            : ["rota", "shift", id]);
const keyCompliance = (id)    => ["rota", "compliance", id];
const keyRestricted = (clinicianId, practiceId) => ["rota", "restricted", clinicianId, practiceId];

/* ─── Queries ────────────────────────────────────────────────────────────── */

export const useRotaList = (params = {}) =>
  useQuery({
    queryKey: keyRotaList(params),
    queryFn:  () => {
      const { month, year, ...rest } = params || {};
      return rotaService.getRotaGrid(month, year, rest).then((r) => r.data);
    },
  });

export const useRota = (id) =>
  useQuery({
    queryKey: keyRota(id),
    queryFn:  () => rotaService.getRotaById(id).then((r) => r.data),
    enabled:  !!id,
  });

export const useClinicianRota = (clinicianId, month, year, params = {}) =>
  useQuery({
    queryKey: ["rota", "clinician", clinicianId, { month, year, ...params }],
    queryFn:  () =>
      rotaService.getClinicianRota(clinicianId, month, year, params).then((r) => r.data),
    enabled: !!clinicianId && !!month && !!year,
  });

export const useGapReport = (days = 14) =>
  useQuery({
    queryKey: QK.ROTA_GAPS ? QK.ROTA_GAPS({ days }) : ["rota", "gaps", { days }],
    queryFn:  () => rotaService.getGapReport(days).then((r) => r.data),
  });

export const useCoverRequests = (params = {}) =>
  useQuery({
    queryKey: QK.ROTA_COVER_REQUESTS
      ? QK.ROTA_COVER_REQUESTS(params)
      : ["rota", "cover-requests", params],
    queryFn: () => rotaService.getCoverRequests(params).then((r) => r.data),
  });

// ── BR-R3: Compliance pre-check before booking (lazy — call manually) ──────
// Usage: const { data, refetch } = useComplianceCheck(clinicianId, { enabled: false })
//        then call refetch() on demand, or pass enabled: !!clinicianId
export const useComplianceCheck = (clinicianId, options = {}) =>
  useQuery({
    queryKey: keyCompliance(clinicianId),
    queryFn:  () =>
      rotaService.checkMandatoryCompliance(clinicianId).then((r) => r.data),
    enabled: !!clinicianId && (options.enabled ?? false),
    staleTime: 1000 * 60 * 2, // 2 min — compliance status changes infrequently
    ...options,
  });

// ── BR-R2: Restricted clinician check for a given practice ────────────────
export const useRestrictedClinicianCheck = (clinicianId, practiceId, options = {}) =>
  useQuery({
    queryKey: keyRestricted(clinicianId, practiceId),
    queryFn:  () =>
      rotaService.checkRestrictedClinician(clinicianId, practiceId).then((r) => r.data),
    enabled: !!clinicianId && !!practiceId && (options.enabled ?? false),
    staleTime: 1000 * 60 * 5, // 5 min
    ...options,
  });

/* ─── Mutations ──────────────────────────────────────────────────────────── */

// ── Create shift (POST /api/rota/shift) ───────────────────────────────────
export const useCreateRota = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => rotaService.createShift(data).then((r) => r.data),
    onSuccess: (result, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err, vars, ctx) => {
      // 403 → restricted clinician  |  409 → compliance incomplete
      options.onError?.(err, vars, ctx);
    },
  });
};

// ── Update shift (PUT /api/rota/shift/:id) ────────────────────────────────
export const useUpdateRota = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      rotaService.updateShift(id, data).then((r) => r.data),
    onSuccess: (result, { id }, ctx) => {
      qc.setQueryData(keyRota(id), result);
      qc.invalidateQueries({ queryKey: keyRota(id) });
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, { id }, ctx);
    },
    onError: (err, vars, ctx) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

// ── Patch shift status only (PATCH /api/rota/shift/:id/status) ───────────
// Supports: "working" | "absent" | "cancelled" | "pending" etc.
export const useUpdateShiftStatus = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      rotaService.updateShiftStatus(id, { status }).then((r) => r.data),
    onSuccess: (result, { id }, ctx) => {
      qc.setQueryData(keyRota(id), result);
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, { id }, ctx);
    },
    onError: (err, vars, ctx) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

// ── Delete shift ──────────────────────────────────────────────────────────
export const useDeleteRota = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => rotaService.deleteShift(id).then((r) => r.data),
    onSuccess: (_result, id, ctx) => {
      qc.removeQueries({ queryKey: keyRota(id) });
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(_result, id, ctx);
    },
    onError: (err, vars, ctx) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

// ── Assign cover (cover entry — is_cover: true, original_gap_id required) ─
export const useAssignCover = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => rotaService.assignCover(data).then((r) => r.data),
    onSuccess: (result, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err, vars, ctx) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

// ── Assign cover to a specific gap shift (wraps assignCover with gap context)
// Automatically sets is_cover: true and original_gap_id from the gap shift
export const useAssignCoverToShift = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ gapShiftId, clinicianId, ...rest }) =>
      rotaService
        .assignCover({ original_gap_id: gapShiftId, clinician_id: clinicianId, is_cover: true, ...rest })
        .then((r) => r.data),
    onSuccess: (result, { gapShiftId }, ctx) => {
      qc.invalidateQueries({ queryKey: keyRota(gapShiftId) });
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, { gapShiftId }, ctx);
    },
    onError: (err, vars, ctx) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

// ── Send rota to client ───────────────────────────────────────────────────
export const useSendRotaToClient = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }) =>
      rotaService.sendRotaToClient(clientId, data).then((r) => r.data),
    onSuccess: (result, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err, vars, ctx) => {
      options.onError?.(err, vars, ctx);
    },
  });
};

// ── Generate monthly rota ─────────────────────────────────────────────────
export const useGenerateRota = (options = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ month, year }) =>
      rotaService.generateMonthlyRota(month, year).then((r) => r.data),
    onSuccess: (result, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ["rota"] });
      options.onSuccess?.(result, vars, ctx);
    },
    onError: (err, vars, ctx) => {
      options.onError?.(err, vars, ctx);
    },
  });
};