'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import {
  ADNS_REGISTRY_ADDRESS,
  OWNER_READ_ABI,
  ZERO_ADDRESS,
} from '@/config/contracts';
import {
  fetchName,
  fetchNamesByParent,
  type IndexerName,
  type IndexerNameDetail,
} from '@/lib/indexer';
import { isValidLabel, normalizeLabel, parentNode } from '@/lib/name';
import { truncateMiddle } from '@/lib/format';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ label: string }>;
}) {
  const { label: rawLabel } = use(params);
  const label = normalizeLabel(rawLabel);
  const valid = isValidLabel(label);
  const node = valid ? parentNode(label) : undefined;

  const [detail, setDetail] = useState<IndexerNameDetail | null>(null);
  const [children, setChildren] = useState<IndexerName[] | null>(null);

  useEffect(() => {
    if (!node) return;
    let active = true;
    fetchName(node).then((d) => active && setDetail(d));
    fetchNamesByParent(node).then((c) => active && setChildren(c));
    return () => {
      active = false;
    };
  }, [node]);

  // On-chain fallback for ownership when the indexer hasn't caught up.
  const ownerRead = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: OWNER_READ_ABI,
    functionName: 'owner',
    args: node ? [node] : undefined,
    query: { enabled: Boolean(node) },
  });

  if (!valid) {
    return (
      <Wrap>
        <div className="rounded-card border border-line bg-paper p-8 text-center">
          <h1 className="text-xl font-bold text-ink">Invalid project name</h1>
          <p className="mt-2 text-ink-muted">
            Project names are a single label, e.g.{' '}
            <span className="font-mono">normies</span>.
          </p>
          <Link href="/" className="mt-4 inline-block text-brand-strong hover:underline">
            ← Back home
          </Link>
        </div>
      </Wrap>
    );
  }

  const owner = (detail?.owner ?? (ownerRead.data as `0x${string}` | undefined)) || undefined;
  const registered = owner != null && owner !== ZERO_ADDRESS;
  const textRecords = detail?.records.text ?? [];
  const addrRecords = detail?.records.addresses ?? [];

  return (
    <Wrap>
      <header className="rounded-card border border-line bg-paper p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-display-2 tracking-tight text-ink">
              {label}
            </h1>
            {children && children.length > 0 ? (
              <p className="mt-1 text-sm text-ink-subtle">
                {children.length} name{children.length === 1 ? '' : 's'} issued
              </p>
            ) : null}
          </div>
          <span
            className={`rounded-pill px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
              registered ? 'bg-brand-soft text-brand-fg' : 'bg-paper-tint text-ink-muted'
            }`}
          >
            {registered ? 'Registered' : 'Available'}
          </span>
        </div>

        {registered ? (
          <p className="mt-5 text-sm text-ink-muted">
            Owner{' '}
            <a
              href={`https://etherscan.io/address/${owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-brand-strong"
            >
              {truncateMiddle(owner ?? '')}
            </a>
          </p>
        ) : (
          <p className="mt-5 text-ink-muted">
            This project name isn’t registered yet.{' '}
            <Link href="/" className="text-brand-strong hover:underline">
              Check availability →
            </Link>
          </p>
        )}
      </header>

      {registered ? (
        <>
          {/* Parent resolver records (view-only). */}
          {textRecords.length > 0 || addrRecords.length > 0 ? (
            <section className="mt-6 rounded-card border border-line bg-paper p-6">
              <h2 className="mb-3 text-base font-bold text-ink">Records</h2>
              <dl className="grid gap-2 text-sm">
                {textRecords.map((t) => (
                  <div key={`t-${t.key}`} className="flex justify-between gap-4">
                    <dt className="text-ink-subtle">{t.key}</dt>
                    <dd className="truncate text-ink">{t.value}</dd>
                  </div>
                ))}
                {addrRecords.map((a) => (
                  <div key={`a-${a.coinType}`} className="flex justify-between gap-4">
                    <dt className="text-ink-subtle">coin {a.coinType}</dt>
                    <dd className="truncate font-mono text-ink">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {/* Issued subnames. */}
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-ink-subtle">
              Names issued by {label}
            </h2>
            {children == null ? (
              <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-ink-subtle">
                Loading…
              </p>
            ) : children.length === 0 ? (
              <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-ink-subtle">
                No subnames issued yet.
              </p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-card border border-line">
                {children.map((c) => (
                  <li
                    key={c.node}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="font-mono text-sm text-ink">
                      {c.label}.{label}
                    </span>
                    <span className="font-mono text-xs text-ink-subtle">
                      {truncateMiddle(c.owner)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      <p className="mt-10 text-center text-xs text-ink-subtle">Powered by aDNS</p>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">{children}</div>
  );
}
