import { apiClient } from "./client";
import { AxiosResponse } from "axios";

export const leaveService = {
  list: (params: Record<string, unknown> = {}): Promise<AxiosResponse> => apiClient.get("/leaves", { params }),
  report: (): Promise<AxiosResponse> => apiClient.get("/leaves/report"),
  review: (id: string | number, data: Record<string, unknown>): Promise<AxiosResponse> => apiClient.patch(`/leaves/${id}/review`, data),
};

export default leaveService;
