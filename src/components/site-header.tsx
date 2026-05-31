import Link from 'next/link';
import { ConnectButton } from '@/components/wallet/connect-button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper-warm/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-pill bg-ink text-paper text-sm">
            a
          </span>
          <span className="text-lg">aDNS</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/"
            className="focus-ring rounded-pill px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink"
          >
            Register
          </Link>
          <Link
            href="/docs"
            className="focus-ring rounded-pill px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink"
          >
            Docs
          </Link>
          <ConnectButton className="ml-1" />
        </nav>
      </div>
    </header>
  );
}
