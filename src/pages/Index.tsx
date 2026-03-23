import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import {
  Podcast,
  Zap,
  ShoppingBag,
  Compass,
  Shield,
  ArrowDown,
  Bitcoin,
  Radio,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DonateDialog } from '@/components/DonateDialog';
import { TopSupporters } from '@/components/TopSupporters';

const LINKS = {
  podcast: 'https://serve.podhome.fm/CitadelDispatch',
  nostrFeed: 'https://primal.net/citadel',
  citadelWire: 'https://citadelwire.com',
  odellNostr: 'https://primal.net/odell',
  odellSite: 'https://odell.xyz',
  citadelArcade: 'https://citadelarcade.com',
  signal: 'https://signal.me/#eu/HRcP2L9gdya44jj6lvfVtPNsyxRdiTsK2GIuAEFuciFj9ePBDHtKAbtGpyEffTsU',
  logo: '/citadeldispatch-hero.jpeg',
};

function HeroSection() {
  return (
    <section className="relative min-h-[68vh] sm:min-h-[72vh] flex flex-col items-center justify-center overflow-hidden isolate py-16 sm:py-20">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        {/* Radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.12),transparent_70%)]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Floating amber orbs */}
      <div className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full bg-amber-500/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-[10%] w-96 h-96 rounded-full bg-amber-500/3 blur-3xl animate-float animation-delay-200" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-5 sm:mb-6 animate-fade-in-up">
          <div className="inline-block relative">
            <div className="absolute -inset-4 bg-amber-500/10 rounded-2xl blur-2xl" />
            <img
              src={LINKS.logo}
              alt="Citadel Dispatch"
              className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl object-cover border border-amber-500/20 shadow-2xl"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3 animate-fade-in-up animation-delay-100">
          <span className="gradient-text">CITADEL</span>{' '}
          <span className="text-foreground">DISPATCH</span>
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-3 animate-fade-in-up animation-delay-200">
          Actionable Bitcoin and Freedom Tech Discussion
        </p>

        {/* Audience funded badge */}
        <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in-up animation-delay-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
            <Shield className="w-4 h-4" />
            <span>Audience Funded &mdash; No Ads, No Paywalls</span>
          </div>
        </div>

        {/* Top Supporters */}
        <div className="mb-6 animate-fade-in-up animation-delay-400">
          <TopSupporters />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 animate-fade-in-up animation-delay-400">
          <DonateDialog>
            <Button
              size="lg"
              className="rounded-full px-7 py-5 text-sm sm:text-base font-semibold bg-amber-500 hover:bg-amber-400 text-black glow-amber transition-all duration-300 hover:scale-105"
            >
              <Bitcoin className="w-5 h-5 mr-2" />
              Support with Bitcoin
            </Button>
          </DonateDialog>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-7 py-5 text-sm sm:text-base font-semibold border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-300"
          >
            <a href={LINKS.podcast} target="_blank" rel="noopener noreferrer">
              <Podcast className="w-5 h-5 mr-2" />
              Listen to Podcast
            </a>
          </Button>
        </div>

        <div className="flex justify-center mb-7 animate-fade-in-up animation-delay-500">
          <Button
            asChild
            size="lg"
            className="rounded-full px-9 py-5 text-sm sm:text-base font-semibold bg-card/70 border border-amber-500/25 text-amber-300 hover:bg-amber-500/12 hover:border-amber-500/45 glow-amber transition-all duration-300 hover:scale-105"
          >
            <Link to="/shop">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Rock the Badge
            </Link>
          </Button>
        </div>

        {/* Hosted by */}
        <p className="text-sm text-muted-foreground mb-5 animate-fade-in-up animation-delay-500">
          Hosted by{' '}
          <a
            href={LINKS.odellSite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors underline underline-offset-4 decoration-amber-500/30 hover:decoration-amber-400/60"
          >
            ODELL
          </a>
        </p>

        <QuickLinksSection />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
        <ArrowDown className="w-5 h-5 text-amber-400" />
      </div>
    </section>
  );
}

function QuickLinksSection() {
  const links = [
    {
      label: 'Nostr Feed',
      href: LINKS.nostrFeed,
      icon: Radio,
    },
    {
      label: 'Citadel Wire',
      href: LINKS.citadelWire,
      icon: Compass,
    },
    {
      label: 'ODELL on Nostr',
      href: LINKS.odellNostr,
      icon: MessageCircle,
    },
    {
      label: 'Citadel Arcade',
      href: LINKS.citadelArcade,
      icon: Zap,
    },
  ];

  return (
    <div className="max-w-[920px] mx-auto">
      <div className="flex flex-wrap justify-center gap-3">
        {links.map((link) => (
          <Button
            key={link.label}
            asChild
            size="lg"
            variant={link.accent ? 'default' : 'outline'}
            className={link.accent
              ? 'w-full sm:w-[208px] rounded-full px-7 py-5 text-sm sm:text-base font-semibold bg-amber-500 hover:bg-amber-400 text-black glow-amber transition-all duration-300 hover:scale-105'
              : 'w-full sm:w-[208px] rounded-full px-7 py-5 text-sm sm:text-base font-semibold border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-300'}
          >
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <link.icon className="w-5 h-5 mr-2" />
              {link.label}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}

function DonateSection() {
  return (
    <section className="relative py-14 sm:py-16 px-6">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(245,158,11,0.06),transparent_70%)]" />

      <div className="relative max-w-3xl mx-auto">
        <Card className="border-amber-500/20 bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Community Funded
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Support <span className="gradient-text">Dispatch</span>
            </h2>

            <p className="text-muted-foreground max-w-lg mx-auto mb-5 text-base sm:text-lg leading-relaxed">
              Citadel Dispatch is funded entirely by donations from our audience. We do not have ads or sponsors. Your support keeps it running.
            </p>

            <DonateDialog>
              <Button
                size="lg"
                className="rounded-full px-8 py-5 text-sm sm:text-base font-semibold bg-amber-500 hover:bg-amber-400 text-black glow-amber-strong transition-all duration-300 hover:scale-105 animate-pulse-glow"
              >
                <Bitcoin className="w-5 h-5 mr-2" />
                Donate Bitcoin
              </Button>
            </DonateDialog>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-8 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <img
              src={LINKS.logo}
              alt="Citadel Dispatch"
              className="w-8 h-8 rounded-lg object-cover border border-amber-500/20"
            />
            <span className="text-sm font-semibold text-foreground/80">CITADEL DISPATCH</span>
          </div>

          {/* Center */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href={LINKS.podcast} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
              Podcast
            </a>
            <a href={LINKS.nostrFeed} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
              Nostr
            </a>
            <Link to="/shop" className="hover:text-amber-400 transition-colors">
              Shop
            </Link>
            <DonateDialog className="inline">
              <button className="hover:text-amber-400 transition-colors cursor-pointer">
                Donate
              </button>
            </DonateDialog>
          </div>

          {/* Right */}
          <div className="text-xs text-muted-foreground/60">
            Vibed with{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500/60 hover:text-amber-400 transition-colors"
            >
              Shakespeare
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const Index = () => {
  useSeoMeta({
    title: 'CITADEL DISPATCH — Actionable Freedom Tech Discussion',
    description: 'Actionable Bitcoin and Freedom Tech Discussion',
    ogTitle: 'CITADEL DISPATCH — Actionable Freedom Tech Discussion',
    ogDescription: 'Actionable Bitcoin and Freedom Tech Discussion',
    ogImage: 'https://blossom.ditto.pub/fcd3bf49044447ab87c02a79c82f3d5ea64abcb8e8ba7513c2b0b964f0f3feea.jpeg',
    ogImageWidth: '1500',
    ogImageHeight: '1500',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'CITADEL DISPATCH — Actionable Freedom Tech Discussion',
    twitterDescription: 'Actionable Bitcoin and Freedom Tech Discussion',
    twitterImage: 'https://blossom.ditto.pub/fcd3bf49044447ab87c02a79c82f3d5ea64abcb8e8ba7513c2b0b964f0f3feea.jpeg',
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <HeroSection />
      <DonateSection />
      <Footer />
    </div>
  );
};

export default Index;
