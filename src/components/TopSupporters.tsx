import { type NostrMetadata, NSchema as n } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useTopSupporters } from '@/hooks/useTopSupporters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { cn } from '@/lib/utils';

const EXTRA_PROFILE_RELAYS = ['wss://purplepag.es', 'wss://relay.nostr.band', 'wss://antiprimal.net'];
const DEFAULT_AVATAR = 'https://blossom.ditto.pub/62ead074d0d5a7d1b707b101f7d0db62af97bd66843f4f28c7a1d9007e1e6960.jpeg';

function useSupporterProfile(pubkey: string) {
  const { nostr } = useNostr();

  return useQuery<{ metadata?: NostrMetadata }>({
    queryKey: ['supporter-profile', pubkey],
    queryFn: async () => {
      const [event] = await nostr.query(
        [{ kinds: [0], authors: [pubkey], limit: 1 }],
        { signal: AbortSignal.timeout(3000) },
      );

      if (event) {
        try {
          const metadata = n.json().pipe(n.metadata()).parse(event.content);
          return { metadata };
        } catch {
          return {};
        }
      }

      const extraGroup = nostr.group(EXTRA_PROFILE_RELAYS);
      try {
        const [extra] = await extraGroup.query(
          [{ kinds: [0], authors: [pubkey], limit: 1 }],
          { signal: AbortSignal.timeout(4000) },
        );
        if (extra) {
          try {
            const metadata = n.json().pipe(n.metadata()).parse(extra.content);
            return { metadata };
          } catch {
            return {};
          }
        }
      } catch {
        // Extra relays unreachable
      }

      return {};
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

function SupporterAvatar({ pubkey, totalSats, rank }: { pubkey: string; totalSats: number; rank: number }) {
  const profile = useSupporterProfile(pubkey);
  const metadata = profile.data?.metadata;
  const npub = nip19.npubEncode(pubkey);
  const displayName = metadata?.display_name || metadata?.name || npub.slice(0, 12) + '...';

  return (
    <a
      href={`https://primal.net/p/${npub}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1 group shrink-0"
      title={`${displayName} — ${totalSats.toLocaleString('en-US')} sats`}
    >
      <div className="relative">
        <Avatar className={cn(
          'ring-1 transition-transform group-hover:scale-110',
          rank === 0 ? 'h-8 w-8 sm:h-9 sm:w-9 ring-amber-500/60' :
          rank <= 2 ? 'h-7 w-7 sm:h-8 sm:w-8 ring-amber-500/40' :
          'h-6 w-6 sm:h-7 sm:w-7 ring-border/40',
        )}>
          <AvatarImage src={metadata?.picture || DEFAULT_AVATAR} alt={displayName} />
          <AvatarFallback delayMs={200}>
            <img src={DEFAULT_AVATAR} alt={displayName} className="h-full w-full object-cover" />
          </AvatarFallback>
        </Avatar>
        {rank === 0 && (
          <div className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white rounded-full w-3 h-3 flex items-center justify-center">
            <Zap className="h-2 w-2" />
          </div>
        )}
      </div>
      <span className="text-[8px] sm:text-[9px] text-muted-foreground/60 tabular-nums font-medium group-hover:text-amber-400/80 transition-colors">
        {totalSats >= 1000 ? `${Math.round(totalSats / 1000)}k` : totalSats}
      </span>
    </a>
  );
}

export function TopSupporters() {
  const { data: supporters, isLoading } = useTopSupporters(10);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Top Supporters</span>
        <div className="flex items-center gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-2 w-5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!supporters || supporters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
        Top Supporters
      </span>
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1 px-0.5">
        {supporters.map((supporter, index) => (
          <SupporterAvatar
            key={supporter.pubkey}
            pubkey={supporter.pubkey}
            totalSats={supporter.totalSats}
            rank={index}
          />
        ))}
      </div>
    </div>
  );
}
