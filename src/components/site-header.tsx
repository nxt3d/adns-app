import Link from 'next/link';
import { ConnectButton } from '@/components/wallet/connect-button';

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper-warm/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="focus-ring flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-pill bg-brand text-sm font-extrabold text-paper-warm">
            a
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">aDNS</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/manage"
            className="focus-ring rounded-pill px-3 py-2 text-sm font-semibold text-ink-muted transition hover:bg-paper-tint hover:text-ink"
          >
            My names
          </Link>
          <Link
            href="/docs"
            className="focus-ring rounded-pill px-3 py-2 text-sm font-semibold text-ink-muted transition hover:bg-paper-tint hover:text-ink"
          >
            Docs
          </Link>
          <div className="ml-1">
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
