'use client';

import { http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'adns-placeholder-project-id';

/**
 * RPC transport URL.
 *
 * In the browser we point wagmi at our same-origin proxy `/api/rpc`, which
 * attaches the Alchemy key server-side — the key NEVER ships in the bundle.
 *
 * During SSR a relative URL can't resolve, so we use an absolute origin. We
 * prefer NEXT_PUBLIC_APP_URL; otherwise the server-only MAINNET_RPC_URL is used
 * directly (it stays on the server, never serialized to the client). As a last
 * resort `http(undefined)` falls back to viem's default public RPC.
 */
function rpcTransport() {
  if (typeof window !== 'undefined') {
    return http('/api/rpc');
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) return http(`${appUrl.replace(/\/$/, '')}/api/rpc`);
  if (process.env.MAINNET_RPC_URL) return http(process.env.MAINNET_RPC_URL);
  return http();
}

/** Single-chain (Ethereum mainnet) RainbowKit + wagmi config. */
export const wagmiConfig = getDefaultConfig({
  appName: 'aDNS',
  projectId,
  transports: {
    [mainnet.id]: rpcTransport(),
  },
  chains: [mainnet],
  ssr: true,
});
