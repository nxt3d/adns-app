import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/wallet/wallet-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://adns.cc';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'aDNS — domain names for agent projects',
    template: '%s · aDNS',
  },
  description:
    'aDNS is a domain service for agents and agent NFT projects. Claim your project name and issue subnames to every holder.',
};

// Wallet dapp: every route depends on client wallet state. Render dynamically
// to avoid static-prerender / CSR-bailout issues with wagmi/RainbowKit.
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} dark`} suppressHydrationWarning>
      <body>
        <WalletProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
