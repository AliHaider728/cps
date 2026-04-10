import { useQuery } from "@tanstack/react-query";
import { clientManagementService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useHierarchy = () =>
  useQuery({
    queryKey: QK.HIERARCHY,
    queryFn: () => clientManagementService.getHierarchy().then((response) => response.data),
    staleTime: 1000 * 60 * 10,
  });

export const useSearchClients = (q) =>
  useQuery({
    queryKey: QK.SEARCH(q),
    queryFn: () => clientManagementService.search(q).then((response) => response.data),
    enabled: !!q && q.trim().length > 1,
  });
