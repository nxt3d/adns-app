'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import {
  ADNS_REGISTRAR_ADDRESS,
  ADNS_REGISTRY_ADDRESS,
  ONE_YEAR_SECONDS,
  OWNER_READ_ABI,
  RENT_PRICE_READ_ABI,
  ZERO_ADDRESS,
} from '@/config/contracts';
import { isValidLabel, normalizeLabel, parentNode } from '@/lib/name';
import { fetchNamesByParent, type IndexerName } from '@/lib/indexer';
import { formatEth, truncateMiddle } from '@/lib/format';

const ALLOCATION_CONTACT =
  process.env.NEXT_PUBLIC_ALLOCATION_CONTACT ?? 'mailto:hello@adns.cc';

export function AvailabilityCheck() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState<string | null>(null);

  const label = normalizeLabel(input);
  const valid = isValidLabel(label);
  const node = useMemo(() => (query ? parentNode(query) : undefined), [query]);

  const ownerRead = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: OWNER_READ_ABI,
    functionName: 'owner',
    args: node ? [node] : undefined,
    query: { enabled: Boolean(node) },
  });

  const priceRead = useReadContract({
    address: ADNS_REGISTRAR_ADDRESS,
    abi: RENT_PRICE_READ_ABI,
    functionName: 'rentPrice',
    args: query ? [query, ONE_YEAR_SECONDS] : undefined,
    query: { enabled: Boolean(query) },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) setQuery(label);
  };

  const owner = ownerRead.data as `0x${string}` | undefined;
  const isTaken = owner != null && owner !== ZERO_ADDRESS;
  const isAvailable = owner != null && owner === ZERO_ADDRESS;
  const loading = Boolean(query) && (ownerRead.isLoading || ownerRead.isFetching);

  // When a project is taken, surface a sample of the subnames it has issued.
  const [subs, setSubs] = useState<IndexerName[] | null>(null);
  useEffect(() => {
    if (!isTaken || !node) {
      setSubs(null);
      return;
    }
    let active = true;
    fetchNamesByParent(node).then((r) => active && setSubs(r));
    return () => {
      active = false;
    };
  }, [isTaken, node]);

  return (
    <div className="w-full">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            autoFocus
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setQuery(null);
            }}
            placeholder="your project name"
            aria-label="Project name"
            className="focus-ring h-14 w-full rounded-card border border-line bg-paper px-4 text-lg font-semibold text-ink placeholder:text-ink-subtle"
          />
        </div>
        <button
          type="submit"
          disabled={!valid}
          className="focus-ring h-14 shrink-0 rounded-card bg-brand px-6 text-base font-bold text-paper-warm transition hover:bg-brand-strong disabled:opacity-40"
        >
          Check availability
        </button>
      </form>

      {input && !valid ? (
        <p className="mt-2 text-sm text-red-400">
          Use lowercase letters, digits, or hyphens.
        </p>
      ) : null}

      {query ? (
        <div className="mt-5 rounded-card border border-line bg-paper p-5">
          {loading ? (
            <p className="text-ink-muted">Checking {query}…</p>
          ) : ownerRead.isError ? (
            <p className="text-red-400">
              Couldn’t reach the network. Try again in a moment.
            </p>
          ) : isAvailable ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-pill bg-brand-soft px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-brand-fg">
                    Available
                  </span>
                  <span className="font-mono text-lg font-semibold text-ink">
                    {query}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  {priceRead.data != null
                    ? `${formatEth(priceRead.data as bigint)} / year`
                    : 'Price unavailable'}{' '}
                  · parent allocation is admin-reviewed in v1.
                </p>
              </div>
              <a
                href={`${ALLOCATION_CONTACT}${
                  ALLOCATION_CONTACT.startsWith('mailto:')
                    ? `?subject=${encodeURIComponent(`Reserve ${query}`)}`
                    : ''
                }`}
                className="focus-ring inline-flex h-12 shrink-0 items-center justify-center rounded-pill bg-ink px-6 text-sm font-bold text-paper-warm transition hover:bg-brand-fg"
              >
                Reserve {query}
              </a>
            </div>
          ) : isTaken ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-pill bg-paper-tint px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-ink-muted">
                    Taken
                  </span>
                  <span className="font-mono text-lg font-semibold text-ink">
                    {query}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  {subs && subs.length > 0
                    ? `${query} has issued ${subs.length} name${subs.length === 1 ? '' : 's'}: ${subs
                        .slice(0, 3)
                        .map((s) => `${s.label}.${query}`)
                        .join(', ')}${subs.length > 3 ? '…' : ''}`
                    : `Owned by ${truncateMiddle(owner ?? '')}`}
                </p>
              </div>
              <Link
                href={`/${query}`}
                className="focus-ring inline-flex h-12 shrink-0 items-center justify-center rounded-pill border border-line bg-paper px-6 text-sm font-bold text-ink-muted transition hover:border-brand hover:text-brand-fg"
              >
                View {query} →
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
