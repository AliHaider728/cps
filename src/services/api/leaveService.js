import { apiClient } from "./client";

export const leaveService = {
  list: (params = {}) => apiClient.get("/leaves", { params }),
  report: () => apiClient.get("/leaves/report"),
  review: (id, data) => apiClient.patch(`/leaves/${id}/review`, data),
};

export default leaveService;
