import { useQuery } from '@tanstack/react-query';

export interface Supporter {
  pubkey: string;
  totalSats: number;
  latestAt: number;
}

/** 
 * Hook to get top supporters from our Cloudflare Worker cache.
 * Falls back to raw Nostr query if the worker isn't deployed yet.
 */
export function useTopSupporters(limit: number = 10) {
  // Replace this placeholder with your actual production Worker URL once deployed
  const WORKER_URL = 'https://citadel-dispatch-worker.modl21.workers.dev/api/supporters';

  return useQuery<Supporter[]>({
    queryKey: ['top-supporters-cache'],
    queryFn: async () => {
      try {
        const res = await fetch(WORKER_URL);
        if (!res.ok) throw new Error('Worker fetch failed');
        const data = await res.json();
        return (data as Supporter[]).slice(0, limit);
      } catch (err) {
        console.warn('Worker cache unavailable, please deploy the worker:', err);
        return [];
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
}
