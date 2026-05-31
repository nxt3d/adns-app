'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProjects, type IndexerName } from '@/lib/indexer';

/**
 * Up to 3 example registered projects (parent names directly under the apex).
 * Sourced from the indexer; renders nothing until at least one real project
 * exists, so the section stays clean pre-launch.
 */
export function ExampleProjects() {
  const [items, setItems] = useState<IndexerName[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchProjects(3).then((r) => {
      if (active) setItems(r);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-12">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-subtle">
        Projects on ADNS
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.node}
            href={`/${p.label}`}
            className="focus-ring rounded-card border border-line bg-paper px-5 py-4 transition hover:border-brand"
          >
            <span className="font-mono text-sm font-semibold text-ink">
              {p.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
