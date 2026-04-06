// src/hooks/useEmail.js
import { useMutation } from "@tanstack/react-query";
import { emailAPI } from "../api/api";

// ── MUTATION: send mass email to entity contacts
export const useSendMassEmail = () =>
  useMutation({
    mutationFn: ({ entityType, entityId, data }) =>
      emailAPI.sendMass(entityType, entityId, data).then((r) => r.data),
  });