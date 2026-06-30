// src/hooks/useEmail.ts
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { emailAPI } from "../api/api";

export const useSendMassEmail = (): UseMutationResult<any, Error, { entityType: string; entityId: string; data: Record<string, unknown> }> =>
  useMutation({
    mutationFn: ({ entityType, entityId, data }: { entityType: string; entityId: string; data: Record<string, unknown> }) =>
      emailAPI.sendMass(entityType, entityId, data).then((r: { data: any }) => r.data),
  });


