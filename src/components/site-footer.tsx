import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-ink-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>aDNS — names for NFTs. Ethereum mainnet.</p>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="hover:text-ink">
            Docs
          </Link>
          <a
            href="https://github.com/nxt3d/adns"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
