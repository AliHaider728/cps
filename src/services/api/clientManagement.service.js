import apiClient from "./client";

export const clientManagementService = {
  getHierarchy: () => apiClient.get("/clients/hierarchy"),
  search: (q) => apiClient.get("/clients/search", { params: { q } }),
  getICBs: () => apiClient.get("/clients/icb"),
  getFederations: (icbId) =>
    apiClient.get("/clients/federation", { params: icbId ? { icb: icbId } : {} }),
};

export default clientManagementService;
