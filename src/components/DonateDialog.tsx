import { useState, useEffect, useRef } from 'react';
import {
  Bitcoin,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Sparkle,
  Sparkles,
  Star,
  Rocket,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/useToast';
import QRCode from 'qrcode';

const LIGHTNING_ADDRESS = 'odell@primal.net';

const presetAmounts = [
  { amount: 1000, label: '1k', icon: Sparkle },
  { amount: 5000, label: '5k', icon: Sparkles },
  { amount: 10000, label: '10k', icon: Zap },
  { amount: 21000, label: '21k', icon: Star },
  { amount: 42000, label: '42k', icon: Rocket },
];

interface LNURLPayParams {
  callback: string;
  minSendable: number;
  maxSendable: number;
  metadata: string;
  tag: string;
  commentAllowed?: number;
}

async function resolveLightningAddress(address: string): Promise<LNURLPayParams> {
  const [name, domain] = address.split('@');
  if (!name || !domain) throw new Error('Invalid lightning address');

  const url = `https://${domain}/.well-known/lnurlp/${name}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to resolve lightning address: HTTP ${res.status}`);

  const data = await res.json();
  if (data.status === 'ERROR') throw new Error(data.reason || 'LNURL error');
  if (data.tag !== 'payRequest') throw new Error('Not a valid LNURL-pay endpoint');

  return data as LNURLPayParams;
}

async function fetchInvoice(
  callback: string,
  amountMsats: number,
  comment?: string
): Promise<string> {
  const url = new URL(callback);
  url.searchParams.set('amount', String(amountMsats));
  if (comment) {
    url.searchParams.set('comment', comment);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch invoice: HTTP ${res.status}`);

  const data = await res.json();
  if (data.status === 'ERROR') throw new Error(data.reason || 'Invoice error');
  if (!data.pr) throw new Error('No invoice returned');

  return data.pr;
}

interface DonateDialogProps {
  children: React.ReactNode;
  className?: string;
}

export function DonateDialog({ children, className }: DonateDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | string>(10000);
  const [memo, setMemo] = useState('');
  const [invoice, setInvoice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [lnurlParams, setLnurlParams] = useState<LNURLPayParams | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Resolve lightning address when dialog opens
  useEffect(() => {
    if (open && !lnurlParams) {
      resolveLightningAddress(LIGHTNING_ADDRESS)
        .then(setLnurlParams)
        .catch((err) => {
          console.error('Failed to resolve lightning address:', err);
          toast({
            title: 'Error',
            description: 'Failed to resolve lightning address. Please try again.',
            variant: 'destructive',
          });
        });
    }
  }, [open, lnurlParams, toast]);

  // Generate QR code when invoice changes
  useEffect(() => {
    let cancelled = false;

    if (!invoice) {
      setQrCodeUrl('');
      return;
    }

    QRCode.toDataURL(invoice.toUpperCase(), {
      width: 512,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setQrCodeUrl(url);
      })
      .catch((err) => {
        if (!cancelled) console.error('QR code generation failed:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [invoice]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAmount(10000);
      setMemo('');
      setInvoice(null);
      setCopied(false);
      setQrCodeUrl('');
      setIsLoading(false);
    }
  }, [open]);

  const handleGenerateInvoice = async () => {
    if (!lnurlParams) {
      toast({
        title: 'Not ready',
        description: 'Still resolving lightning address. Please wait...',
        variant: 'destructive',
      });
      return;
    }

    const finalAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    if (!finalAmount || finalAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    const amountMsats = finalAmount * 1000;

    if (amountMsats < lnurlParams.minSendable) {
      toast({
        title: 'Amount too low',
        description: `Minimum amount is ${Math.ceil(lnurlParams.minSendable / 1000)} sats.`,
        variant: 'destructive',
      });
      return;
    }

    if (amountMsats > lnurlParams.maxSendable) {
      toast({
        title: 'Amount too high',
        description: `Maximum amount is ${Math.floor(lnurlParams.maxSendable / 1000)} sats.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const trimmedMemo = memo.trim() || undefined;
      const pr = await fetchInvoice(lnurlParams.callback, amountMsats, trimmedMemo);
      setInvoice(pr);
    } catch (err) {
      console.error('Invoice error:', err);
      toast({
        title: 'Failed to create invoice',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (invoice) {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Lightning invoice copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInWallet = () => {
    if (invoice) {
      window.open(`lightning:${invoice}`, '_blank');
    }
  };

  const displayAmount =
    typeof amount === 'string' ? parseInt(amount, 10) || 0 : amount;

  const formatSats = (sats: number) => {
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M`;
    if (sats >= 1000) return `${(sats / 1000).toFixed(sats % 1000 === 0 ? 0 : 1)}k`;
    return String(sats);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={className}>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] max-h-[95vh] overflow-y-auto border-amber-500/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold">
            {invoice ? (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Lightning Invoice
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Bitcoin className="w-5 h-5 text-amber-400" />
                Support Citadel Dispatch
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {invoice
              ? 'Scan or copy the invoice to pay with any Lightning wallet.'
              : 'Choose an amount and optionally add a memo.'}
          </DialogDescription>
        </DialogHeader>

        {invoice ? (
          // Invoice view
          <div className="flex flex-col items-center gap-4">
            {/* Amount display */}
            <div className="text-center">
              <span className="text-3xl font-bold text-amber-400">
                {formatSats(displayAmount)}
              </span>
              <span className="text-muted-foreground ml-2">sats</span>
            </div>

            <Separator className="bg-border/50" />

            {/* QR Code */}
            <Card className="border-amber-500/10 bg-white p-3 rounded-2xl shadow-xl shadow-amber-500/5">
              <CardContent className="p-0">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Lightning Invoice QR Code"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 bg-muted animate-pulse rounded" />
                )}
              </CardContent>
            </Card>

            {/* Invoice copy field */}
            <div className="w-full space-y-2">
              <Label htmlFor="donate-invoice" className="text-xs text-muted-foreground">
                Lightning Invoice
              </Label>
              <div className="flex gap-2">
                <Input
                  id="donate-invoice"
                  value={invoice}
                  readOnly
                  className="font-mono text-xs min-w-0 flex-1 overflow-hidden text-ellipsis"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0 border-amber-500/20 hover:bg-amber-500/10"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full space-y-3">
              <Button
                onClick={openInWallet}
                className="w-full rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-all duration-300"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Lightning Wallet
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setInvoice(null);
                  setQrCodeUrl('');
                  setCopied(false);
                }}
                className="w-full text-muted-foreground hover:text-amber-400"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change amount
              </Button>
            </div>
          </div>
        ) : (
          // Amount selection view
          <div className="space-y-5">
            {/* Preset amounts */}
            <ToggleGroup
              type="single"
              value={String(displayAmount)}
              onValueChange={(value) => {
                if (value) setAmount(parseInt(value, 10));
              }}
              className="grid grid-cols-5 gap-1.5"
            >
              {presetAmounts.map(({ amount: preset, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={preset}
                  value={String(preset)}
                  className="flex flex-col h-auto min-w-0 text-xs px-1 py-3 data-[state=on]:bg-amber-500/15 data-[state=on]:text-amber-400 data-[state=on]:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-200"
                >
                  <Icon className="h-4 w-4 mb-1.5" />
                  <span className="font-medium">{label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <Label htmlFor="donate-amount" className="text-xs text-muted-foreground">
                Custom amount (sats)
              </Label>
              <Input
                ref={inputRef}
                id="donate-amount"
                type="number"
                placeholder="Enter amount in sats"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-amber-500/10 focus:border-amber-500/30"
              />
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="donate-memo" className="text-xs text-muted-foreground">
                Memo (optional)
              </Label>
              <Textarea
                id="donate-memo"
                placeholder="Add a message..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="resize-none border-amber-500/10 focus:border-amber-500/30"
                rows={2}
              />
            </div>

            {/* Generate invoice button */}
            <Button
              onClick={handleGenerateInvoice}
              disabled={isLoading || !displayAmount}
              className="w-full rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold glow-amber transition-all duration-300 hover:scale-[1.02]"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating invoice...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Invoice for {formatSats(displayAmount)} sats
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
