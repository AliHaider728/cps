import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { clientManagementService } from "../services/api";
import { QK } from "../lib/queryKeys";

export const useHierarchy = (): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: QK.HIERARCHY,
    queryFn: () => clientManagementService.getHierarchy().then((response: { data: any }) => response.data),
    staleTime: 1000 * 60 * 10,
  });

export const useSearchClients = (q: string): UseQueryResult<any, Error> =>
  useQuery({
    queryKey: QK.SEARCH(q),
    queryFn: () => clientManagementService.search(q).then((response: { data: any }) => response.data),
    enabled: !!q && q.trim().length > 1,
  });


