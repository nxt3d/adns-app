import Link from 'next/link';
import { getAllDocs } from '@/lib/docs';

export function DocsNav({ activeSlug }: { activeSlug: string }) {
  const docs = getAllDocs();
  return (
    <nav className="flex flex-col gap-1 text-sm">
      {docs.map((d) => {
        const href = d.slug === 'index' ? '/docs' : `/docs/${d.slug}`;
        const active = d.slug === activeSlug;
        return (
          <Link
            key={d.slug}
            href={href}
            className={`focus-ring rounded-lg px-3 py-2 ${
              active
                ? 'bg-brand-soft font-semibold text-brand-fg'
                : 'text-ink-muted hover:bg-paper-tint hover:text-ink'
            }`}
          >
            {d.title}
          </Link>
        );
      })}
    </nav>
  );
}
