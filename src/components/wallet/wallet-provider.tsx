'use client';

import type { ReactNode } from 'react';
import { http } from 'viem';
import { mainnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? 'adns-placeholder-project-id';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const rpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;

const networks = [mainnet] as const;

// Single-chain (Ethereum mainnet) adapter. `http(undefined)` falls back to
// viem's default public RPC, which is fine for local dev.
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId,
  ssr: true,
  transports: {
    [mainnet.id]: http(rpcUrl),
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  defaultNetwork: mainnet,
  projectId,
  metadata: {
    name: 'aDNS',
    description: 'Names for NFTs — register and manage aDNS names.',
    url: appUrl,
    icons: [`${appUrl}/icon.png`],
  },
  themeMode: 'light',
  features: { analytics: false },
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

// Suppress unused warning while keeping the typed tuple for reference.
export const SUPPORTED_NETWORKS = networks;
