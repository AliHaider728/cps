import apiClient from "./client";
import { AxiosResponse } from "axios";

export const pcnService = {
  getAll: (params?: Record<string, unknown>): Promise<AxiosResponse> => apiClient.get("/clients/pcn", { params }),
  getById: (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/pcn/${id}`),
  getRollup: (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/pcn/${id}/rollup`),
  create: (data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post("/clients/pcn", data),
  update: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.put(`/clients/pcn/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse> => apiClient.delete(`/clients/pcn/${id}`),
  updateRestricted: (id: string | number, clinicianIds: string[] | number[]): Promise<AxiosResponse> =>
    apiClient.patch(`/clients/pcn/${id}/restricted`, { clinicianIds }),
  getMeetings: (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/pcn/${id}/meetings`),
  upsertMeeting: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.post(`/clients/pcn/${id}/meetings`, data),

  // NEW — Rate & Contract History (Jun 2026)
  getRateSummary: (): Promise<AxiosResponse> => apiClient.get("/clients/pcn/rate-history/summary"),
  getRateHistory: (id: string | number): Promise<AxiosResponse> => apiClient.get(`/clients/pcn/${id}/rate-history`),
};

export default pcnService;
