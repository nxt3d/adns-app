import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { WalletProvider } from '@/components/wallet/wallet-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

// This is a wallet dapp: every route depends on client wallet state and the
// Reown AppKit provider (which uses useSearchParams). Render dynamically to
// avoid brittle static prerendering / CSR-bailout failures at build time.
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://adns.cc';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'aDNS — names for NFTs',
    template: '%s · aDNS',
  },
  description:
    'Register and manage aDNS names. Names belong to NFTs, resolved on Ethereum mainnet.',
};

const themeScript = `
(() => {
  try {
    const saved = localStorage.getItem('adns-theme');
    const theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Suspense fallback={null}>
          <WalletProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
                {children}
              </main>
              <SiteFooter />
            </div>
          </WalletProvider>
        </Suspense>
      </body>
    </html>
  );
}
