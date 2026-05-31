'use client';

import { http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'adns-placeholder-project-id';

const rpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;

/** Single-chain (Ethereum mainnet) RainbowKit + wagmi config. */
export const wagmiConfig = getDefaultConfig({
  appName: 'aDNS',
  projectId,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(rpcUrl),
  },
  ssr: true,
});
