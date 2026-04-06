// src/hooks/useHierarchy.js
import { useQuery } from "@tanstack/react-query";
import { hierarchyAPI } from "../api/api";
import { QK } from "../lib/queryKeys";

// ── GET: full client hierarchy tree
export const useHierarchy = () =>
  useQuery({
    queryKey: QK.HIERARCHY,
    queryFn:  () => hierarchyAPI.getHierarchy().then((r) => r.data),
    staleTime: 1000 * 60 * 10, // 10 min — hierarchy rarely changes
  });

// ── GET: search clients
export const useSearchClients = (q) =>
  useQuery({
    queryKey: QK.SEARCH(q),
    queryFn:  () => hierarchyAPI.search(q).then((r) => r.data),
    enabled:  !!q && q.trim().length > 1, // 2+ chars hone pe search karo
  });