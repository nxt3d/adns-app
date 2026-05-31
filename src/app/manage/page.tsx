'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/wallet/connect-button';
import { fetchNamesByOwner, type IndexerName } from '@/lib/indexer';
import { truncateMiddle } from '@/lib/format';

export default function ManagePage() {
  const { address, isConnected } = useAccount();
  const [names, setNames] = useState<IndexerName[] | null>(null);

  useEffect(() => {
    if (!address) {
      setNames(null);
      return;
    }
    let active = true;
    fetchNamesByOwner(address).then((r) => active && setNames(r));
    return () => {
      active = false;
    };
  }, [address]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-display-2 tracking-tight text-ink">My names</h1>
      <p className="mt-3 text-ink-muted">
        Names controlled by your connected wallet. Open one to edit its records.
      </p>

      {!isConnected ? (
        <div className="mt-8 rounded-card border border-line bg-paper p-8 text-center">
          <p className="mb-4 text-ink-muted">Connect your wallet to see your names.</p>
          <div className="inline-flex">
            <ConnectButton />
          </div>
        </div>
      ) : names == null ? (
        <p className="mt-8 rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-ink-subtle">
          Loading…
        </p>
      ) : names.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-line px-4 py-8 text-center text-sm text-ink-subtle">
          No names found for {truncateMiddle(address ?? '')}.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-card border border-line">
          {names.map((n) => (
            <li key={n.node}>
              <Link
                href={`/manage/${n.node}`}
                className="flex items-center justify-between px-4 py-4 transition hover:bg-paper-tint"
              >
                <span className="font-mono text-sm text-ink">
                  {n.name ?? `${n.label}.…`}
                </span>
                <span className="text-xs font-semibold text-brand-strong">Manage →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
