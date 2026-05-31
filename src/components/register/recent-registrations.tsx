'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchRecentRegistrations, type IndexerName } from '@/lib/indexer';

/**
 * Recent registrations feed, sourced from the aDNS indexer via the same-origin
 * proxy. The indexer stores the stored-form parent node, so we resolve the
 * collection label for the profile link where we can.
 */
export function RecentRegistrations() {
  const [items, setItems] = useState<IndexerName[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchRecentRegistrations(10).then((r) => {
      if (!active) return;
      setItems(r);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-12">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-subtle">
        Recent registrations
      </h2>
      {!loaded ? (
        <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-ink-subtle">
          Loading…
        </p>
      ) : items && items.length > 0 ? (
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line">
          {items.map((it) => {
            const date = new Date(
              Number(it.createdAt.timestamp) * 1000,
            ).toLocaleDateString();
            // Only link when the indexer resolved the full stored name (the
            // route needs the stored form; a bare namehash can't be reversed).
            const inner = (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-mono text-sm">{it.name ?? it.label}</span>
                <span className="text-xs text-ink-subtle">{date}</span>
              </div>
            );
            return (
              <li key={it.node}>
                {it.name ? (
                  <Link href={`/${it.name}`} className="block hover:bg-paper-tint">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-ink-subtle">
          No registrations yet — be the first.
        </p>
      )}
    </section>
  );
}
