import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

const SUPABASE_BASE = 'https://ttmxlwpfzdagwofrjewr.supabase.co/storage/v1/object/public/public';

interface ShopItem {
  name: string;
  href: string;
  category: 'hat' | 'shirt';
  imageId: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { name: 'Citadel Navy Hat', href: 'https://pay.zaprite.com/pl_Gn13TI05re', category: 'hat', imageId: '55b76ba7-595e-46b1-a416-0e20534d780e' },
  { name: 'Citadel White Hat', href: 'https://pay.zaprite.com/pl_KyoVgy6mFM', category: 'hat', imageId: '9808ee32-1292-4ca6-9b2d-b91e58b00c72' },
  { name: 'Citadel OG Hat', href: 'https://pay.zaprite.com/pl_zNBq1JVXM1', category: 'hat', imageId: '27fa3d48-f247-4c8d-8f44-9262446cd207' },
  { name: 'Stack Sats Hat', href: 'https://pay.zaprite.com/pl_GaQnc2RQvs', category: 'hat', imageId: 'a9177b0b-828d-4061-bdf0-c00387add815' },
  { name: 'Humble Hat — White', href: 'https://pay.zaprite.com/pl_DHkYreJPiG', category: 'hat', imageId: '2d8b02d3-55d8-4a5f-a40f-5aed448ea4bf' },
  { name: 'Humble Hat — Black', href: 'https://pay.zaprite.com/pl_IxG5qaT55t', category: 'hat', imageId: '84efb00e-08e4-445a-9cc2-9f8bc9ce5a9e' },
  { name: 'Ten31 Hat', href: 'https://pay.zaprite.com/pl_DzhQjtqHpX', category: 'hat', imageId: 'f97ff5b9-181b-4749-907e-6c02e7f08b88' },
  { name: 'Stack Sats Shirt', href: 'https://pay.zaprite.com/pl_b9F1l7Y94G', category: 'shirt', imageId: '2f53c0f3-9a20-4982-a6b7-3d094e17cd8e' },
];

const SIGNAL_LINK = 'https://signal.me/#eu/HRcP2L9gdya44jj6lvfVtPNsyxRdiTsK2GIuAEFuciFj9ePBDHtKAbtGpyEffTsU';

function ProductImage({ item }: { item: ShopItem }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const src = `${SUPABASE_BASE}/${item.imageId}`;

  return (
    <AspectRatio ratio={1}>
      {!loaded && !error && (
        <Skeleton className="absolute inset-0 rounded-xl" />
      )}
      {!error ? (
        <img
          src={src}
          alt={item.name}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover rounded-xl transition-all duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-secondary flex items-center justify-center text-3xl">
          {item.category === 'hat' ? '🧢' : '👕'}
        </div>
      )}
    </AspectRatio>
  );
}

export default function Shop() {
  useSeoMeta({
    title: 'Shop — CITADEL DISPATCH',
    description: 'Support Dispatch by rocking the badge. Hats, shirts, and more — pay with Bitcoin.',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm tracking-wide">CITADEL SHOP</span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 px-6 overflow-hidden isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(245,158,11,0.1),transparent_70%)]" />

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
            <ShoppingBag className="w-4 h-4" />
            Merch
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Support Dispatch by{' '}
            <span className="gradient-text">Rocking the Badge</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Every purchase directly supports the show. Pay with Bitcoin.
          </p>
        </div>
      </section>

      {/* Items Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {SHOP_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:bg-card/80 hover:shadow-lg hover:shadow-amber-500/5 hover:scale-[1.02] overflow-hidden">
                  <CardContent className="p-0">
                    {/* Product image */}
                    <div className="overflow-hidden rounded-t-lg">
                      <ProductImage item={item} />
                    </div>

                    {/* Product info */}
                    <div className="p-3 sm:p-5 text-center">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-amber-400 transition-colors mb-1.5 sm:mb-2 leading-tight">
                        {item.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground group-hover:text-amber-400/80 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Buy with Bitcoin
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-16 text-center">
            <Card className="inline-block border-border/50 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground mb-2">
                    Have questions or issues with your order?
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
                  >
                    <a href={SIGNAL_LINK} target="_blank" rel="noopener noreferrer">
                      Contact via Signal
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground/60">
          <Link to="/" className="hover:text-amber-400 transition-colors">
            &larr; citadeldispatch.com
          </Link>
          <span>
            Vibed with{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500/60 hover:text-amber-400 transition-colors"
            >
              Shakespeare
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
