'use client';

import { useEffect, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { truncateMiddle } from '@/lib/format';

/**
 * Wallet connect / account button. Opens the Reown AppKit modal.
 * Renders a neutral placeholder until mounted to avoid hydration mismatch.
 */
export function ConnectButton({ className = '' }: { className?: string }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const base =
    'focus-ring inline-flex min-h-10 items-center gap-2 rounded-pill px-4 text-sm font-semibold transition';
  const extra = className ? ` ${className}` : '';

  if (!mounted) {
    return (
      <span className={`${base} border border-line bg-paper text-ink-subtle${extra}`}>
        Connect wallet
      </span>
    );
  }

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => open()}
        className={`${base} border border-line bg-paper text-ink hover:border-brand${extra}`}
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-brand" />
        <span className="font-mono">{truncateMiddle(address)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open()}
      className={`${base} bg-ink text-paper hover:bg-brand-fg${extra}`}
    >
      Connect wallet
    </button>
  );
}
