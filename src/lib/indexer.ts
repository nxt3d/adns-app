/**
 * ADNS indexer client.
 *
 * The browser never talks to the indexer directly — it calls our same-origin
 * proxy at `/api/adns/*` (see `src/app/api/adns/[...path]/route.ts`), which
 * attaches the server-only `x-adns-proxy-secret`. If the indexer is down the
 * proxy returns a non-200 and callers fall back to direct contract reads.
 */

import { namehash } from 'viem/ens';
import { APEX } from '@/config/contracts';

const PROXY_BASE = '/api/adns';

/** Registry node of the protocol apex (`adns.eth`). Projects are its children. */
export const APEX_NODE = namehash(APEX) as `0x${string}`;

export interface IndexerTimestamp {
  block: string;
  timestamp: string;
  txHash?: string;
}

export interface IndexerName {
  node: `0x${string}`;
  parentNode: `0x${string}`;
  label: string;
  name: string | null;
  owner: `0x${string}`;
  controller: `0x${string}`;
  isBound: boolean;
  lockExpiration: string | null;
  transferModeDisabledUntil: string | null;
  expires: string | null;
  registeredPrice: string | null;
  contenthash: string | null;
  createdAt: IndexerTimestamp;
  updatedAt: IndexerTimestamp;
}

export interface IndexerNameDetail extends IndexerName {
  binding: {
    standard: number;
    chainId: string;
    tokenContract: `0x${string}`;
    tokenId: string;
  } | null;
  records: {
    text: { key: string; value: string; updatedAt: string }[];
    addresses: { coinType: string; value: string; updatedAt: string }[];
    contenthash: string | null;
    data: { key: string; value: string; updatedAt: string }[];
  };
}

export interface IndexerStats {
  totalNames: number;
  totalBoundNames: number;
  totalRegistrations: number;
  totalEthPaid: string;
  updatedAt: IndexerTimestamp;
}

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${PROXY_BASE}/${path}`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchStats(): Promise<IndexerStats | null> {
  return get<IndexerStats>('stats');
}

/** Apex/system labels that aren't user registrations. */
const SYSTEM_LABELS = new Set(['eth', 'adns']);
const ZERO_NODE =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Recent user registrations for the homepage. Sorts newest-first and filters
 * out the protocol apex nodes (`eth`, `adns.eth`). Returns [] if the indexer
 * is unreachable.
 */
export async function fetchRecentRegistrations(limit = 10): Promise<IndexerName[]> {
  const res = await get<{ names: IndexerName[] }>(`names?limit=${limit + 5}`);
  if (!res?.names) return [];
  return res.names
    .filter((n) => !SYSTEM_LABELS.has(n.label) && n.parentNode !== ZERO_NODE)
    .sort(
      (a, b) => Number(b.createdAt.timestamp) - Number(a.createdAt.timestamp),
    )
    .slice(0, limit);
}

/** Names owned by a wallet (for a future "My Names" view). */
export async function fetchNamesByOwner(address: string): Promise<IndexerName[]> {
  const res = await get<{ names: IndexerName[] }>(
    `names/by-owner/${address.toLowerCase()}`,
  );
  return res?.names ?? [];
}

/** Full single-name state including records. Null if missing or indexer down. */
export async function fetchName(node: `0x${string}`): Promise<IndexerNameDetail | null> {
  return get<IndexerNameDetail>(`names/${node}`);
}

/** Children registered under a given parent node (e.g. subnames of a project). */
export async function fetchNamesByParent(
  parentNodeHash: `0x${string}`,
  limit = 100,
): Promise<IndexerName[]> {
  const res = await get<{ names: IndexerName[] }>(
    `names/by-parent/${parentNodeHash}?limit=${limit}`,
  );
  return res?.names ?? [];
}

/**
 * Registered projects: names directly under the apex (`*.adns.eth`), excluding
 * the apex itself. Newest-first.
 */
export async function fetchProjects(limit = 3): Promise<IndexerName[]> {
  const children = await fetchNamesByParent(APEX_NODE, limit + 5);
  return children
    .filter((n) => !SYSTEM_LABELS.has(n.label))
    .sort((a, b) => Number(b.createdAt.timestamp) - Number(a.createdAt.timestamp))
    .slice(0, limit);
}
