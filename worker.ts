interface Env {
  SUPPORTERS_KV: KVNamespace;
}

const CITADEL_PUBKEY = '7f573f55d875ce8edc528edf822949fd2ab9f9c65d914a40225663b0a697be07';
const RELAYS = ['wss://relay.primal.net', 'wss://relay.damus.io', 'wss://relay.ditto.pub', 'wss://antiprimal.net'];

interface Supporter {
  pubkey: string;
  totalSats: number;
  latestAt: number;
}

/** 
 * Simple Nostr query helper. 
 * Since Workers don't support WebSockets well for long-running subs, 
 * we use Primal's HTTP API for faster, one-shot queries.
 */
async function fetchZapReceipts(): Promise<any[]> {
  const query = [
    {
      kinds: [9735],
      '#p': [CITADEL_PUBKEY],
      limit: 1000
    }
  ];

  // We use Primal's caching API which is high-performance and accessible via HTTP
  const res = await fetch('https://cache.primal.net/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(['feed', { filter: query[0] }])
  });

  if (!res.ok) return [];
  const data: any = await res.json();
  
  // Primal returns an array of events
  return Array.isArray(data) ? data : [];
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

function aggregateSupporters(events: any[]): Supporter[] {
  const map = new Map<string, { totalSats: number; latestAt: number }>();

  for (const event of events) {
    if (event.kind !== 9735) continue;

    // Extract sender pubkey
    let sender = event.tags.find((t: string[]) => t[0] === 'P')?.[1];
    if (!sender || !/^[0-9a-f]{64}$/.test(sender)) {
      const descriptionTag = event.tags.find((t: string[]) => t[0] === 'description')?.[1];
      if (descriptionTag) {
        try {
          const zapRequest = JSON.parse(descriptionTag);
          sender = zapRequest.pubkey;
        } catch {}
      }
    }

    if (!sender || sender === CITADEL_PUBKEY) continue;

    // Extract amount
    let sats = 0;
    const amountTag = event.tags.find((t: string[]) => t[0] === 'amount')?.[1];
    if (amountTag) {
      sats = Math.floor(Number.parseInt(amountTag, 10) / 1000);
    } else {
      const bolt11 = event.tags.find((t: string[]) => t[0] === 'bolt11')?.[1];
      if (bolt11) sats = parseBolt11Amount(bolt11) || 0;
    }

    if (sats <= 0) continue;

    const existing = map.get(sender);
    if (existing) {
      existing.totalSats += sats;
      existing.latestAt = Math.max(existing.latestAt, event.created_at);
    } else {
      map.set(sender, { totalSats: sats, latestAt: event.created_at });
    }
  }

  return Array.from(map.entries())
    .map(([pubkey, data]) => ({ pubkey, ...data }))
    .sort((a, b) => b.totalSats - a.totalSats);
}

export default {
  /**
   * Main request handler
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint: GET /api/supporters
    if (url.pathname === '/api/supporters') {
      // Try to get from cache first
      const cached = await env.SUPPORTERS_KV.get('top_supporters');
      
      if (cached && !url.searchParams.has('refresh')) {
        return new Response(cached, {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // If not cached or refresh requested, fetch and aggregate
      const events = await fetchZapReceipts();
      const supporters = aggregateSupporters(events);
      const json = JSON.stringify(supporters);

      // Cache for 5 minutes
      await env.SUPPORTERS_KV.put('top_supporters', json, { expirationTtl: 300 });

      return new Response(json, {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Default response
    return new Response('Citadel Dispatch Zap Cache API', { status: 200 });
  },

  /**
   * Scheduled task to update the cache every 10 minutes automatically
   */
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const events = await fetchZapReceipts();
    const supporters = aggregateSupporters(events);
    await env.SUPPORTERS_KV.put('top_supporters', JSON.stringify(supporters), { expirationTtl: 3600 });
  }
};
