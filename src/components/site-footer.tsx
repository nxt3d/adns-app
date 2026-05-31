import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-semibold text-ink">
          aDNS <span className="font-normal text-ink-subtle">— domain names for agent projects</span>
        </p>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="transition hover:text-ink">
            Docs
          </Link>
          <a
            href="https://github.com/nxt3d/adns"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
