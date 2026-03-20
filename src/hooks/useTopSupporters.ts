import type { NostrEvent } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

/** The pubkey for citadel@primal.net */
export const CITADEL_PUBKEY = '7f573f55d875ce8edc528edf822949fd2ab9f9c65d914a40225663b0a697be07';

export interface Supporter {
  pubkey: string;
  totalSats: number;
  latestAt: number;
}

/** Pubkeys excluded from the supporters list. */
const EXCLUDED_PUBKEYS = new Set([
  CITADEL_PUBKEY,
]);

function getZapSender(event: NostrEvent): string | null {
  const bigPTag = event.tags.find(([name]) => name === 'P')?.[1];
  if (bigPTag && /^[0-9a-f]{64}$/.test(bigPTag)) {
    return bigPTag;
  }

  const descriptionTag = event.tags.find(([name]) => name === 'description')?.[1];
  if (descriptionTag) {
    try {
      const zapRequest = JSON.parse(descriptionTag);
      if (zapRequest.pubkey && /^[0-9a-f]{64}$/.test(zapRequest.pubkey)) {
        return zapRequest.pubkey;
      }
    } catch {
      // Invalid JSON
    }
  }

  return null;
}

function getZapAmount(event: NostrEvent): number | null {
  const amountTag = event.tags.find(([name]) => name === 'amount')?.[1];
  if (amountTag) {
    const msats = Number.parseInt(amountTag, 10);
    if (Number.isSafeInteger(msats) && msats > 0) {
      return Math.floor(msats / 1000);
    }
  }

  const bolt11 = event.tags.find(([name]) => name === 'bolt11')?.[1];
  if (bolt11) {
    return parseBolt11Amount(bolt11);
  }

  const descriptionTag = event.tags.find(([name]) => name === 'description')?.[1];
  if (descriptionTag) {
    try {
      const zapRequest = JSON.parse(descriptionTag);
      const reqAmount = zapRequest.tags?.find((t: string[]) => t[0] === 'amount')?.[1];
      if (reqAmount) {
        const msats = Number.parseInt(reqAmount, 10);
        if (Number.isSafeInteger(msats) && msats > 0) {
          return Math.floor(msats / 1000);
        }
      }
    } catch {
      // Invalid JSON
    }
  }

  return null;
}

function parseBolt11Amount(bolt11: string): number | null {
  const lower = bolt11.toLowerCase();
  const match = lower.match(/^lnbc(\d+)([munp]?)/);
  if (!match) return null;

  const value = Number.parseInt(match[1], 10);
  if (!Number.isSafeInteger(value) || value <= 0) return null;

  const multiplier = match[2];
  switch (multiplier) {
    case 'm': return value * 100000;
    case 'u': return value * 100;
    case 'n': return Math.floor(value / 10);
    case 'p': return Math.floor(value / 10000);
    case '': return value * 100000000;
    default: return null;
  }
}

function aggregateZapSupporters(events: NostrEvent[]): Supporter[] {
  const map = new Map<string, { totalSats: number; latestAt: number }>();

  for (const event of events) {
    if (event.kind !== 9735) continue;

    const sender = getZapSender(event);
    if (!sender) continue;
    if (EXCLUDED_PUBKEYS.has(sender)) continue;

    const sats = getZapAmount(event);
    if (!sats || sats <= 0) continue;

    const existing = map.get(sender);
    if (existing) {
      existing.totalSats += sats;
      if (event.created_at > existing.latestAt) {
        existing.latestAt = event.created_at;
      }
    } else {
      map.set(sender, { totalSats: sats, latestAt: event.created_at });
    }
  }

  return Array.from(map.entries())
    .map(([pubkey, data]) => ({ pubkey, ...data }))
    .sort((a, b) => b.totalSats - a.totalSats);
}

export function useTopSupporters(limit: number = 10) {
  const { nostr } = useNostr();

  return useQuery<Supporter[]>({
    queryKey: ['top-supporters', CITADEL_PUBKEY],
    queryFn: async () => {
      const events = await nostr.query([
        {
          kinds: [9735],
          '#p': [CITADEL_PUBKEY],
          limit: 500,
        },
      ]);

      return aggregateZapSupporters(events).slice(0, limit);
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  });
}
