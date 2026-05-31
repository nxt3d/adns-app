'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { isHex } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { ADNS_REGISTRY_ADDRESS, CONTROLLER_READ_ABI } from '@/config/contracts';
import { fetchName, type IndexerNameDetail } from '@/lib/indexer';
import { truncateMiddle } from '@/lib/format';
import { TextRecordsPanel } from '@/components/profile/text-records-panel';
import { AddressRecordsPanel } from '@/components/profile/address-records-panel';
import { ContentHashPanel } from '@/components/profile/content-hash-panel';
import { DataRecordsPanel } from '@/components/profile/data-records-panel';
import { BindingPanel } from '@/components/profile/binding-panel';

export default function ManageNamePage({
  params,
}: {
  params: Promise<{ node: string }>;
}) {
  const { node: rawNode } = use(params);
  const node = (isHex(rawNode) ? rawNode : '0x') as `0x${string}`;
  const validNode = isHex(rawNode) && rawNode.length === 66;

  const { address } = useAccount();
  const [detail, setDetail] = useState<IndexerNameDetail | null>(null);

  useEffect(() => {
    if (!validNode) return;
    let active = true;
    fetchName(node).then((d) => active && setDetail(d));
    return () => {
      active = false;
    };
  }, [node, validNode]);

  const controllerRead = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: CONTROLLER_READ_ABI,
    functionName: 'controllerOf',
    args: validNode ? [node] : undefined,
    query: { enabled: validNode },
  });

  const controller = controllerRead.data as `0x${string}` | undefined;
  const canEdit = Boolean(
    address && controller && address.toLowerCase() === controller.toLowerCase(),
  );

  if (!validNode) {
    return (
      <Wrap>
        <div className="rounded-card border border-line bg-paper p-8 text-center">
          <h1 className="text-xl font-bold text-ink">Invalid name</h1>
          <Link href="/manage" className="mt-3 inline-block text-brand-strong hover:underline">
            ← Back to my names
          </Link>
        </div>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Link href="/manage" className="text-sm text-ink-muted hover:text-ink">
        ← My names
      </Link>

      <header className="mt-4 rounded-card border border-line bg-paper p-6">
        <h1 className="font-mono text-xl font-bold text-ink">
          {detail?.name ?? truncateMiddle(node, 10, 8)}
        </h1>
        <p className="mt-2 text-sm text-ink-subtle">
          Controller {truncateMiddle(controller ?? '')}
          {controllerRead.isLoading ? ' · checking…' : ''}
        </p>
      </header>

      {!canEdit ? (
        <p className="mt-4 rounded-card border border-dashed border-line px-4 py-3 text-center text-sm text-ink-subtle">
          {address
            ? 'Connected wallet is not the controller — records are read-only.'
            : 'Connect the controller wallet to edit records.'}
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        <TextRecordsPanel node={node} canEdit={canEdit} />
        <AddressRecordsPanel node={node} canEdit={canEdit} />
        <ContentHashPanel node={node} canEdit={canEdit} />
        <DataRecordsPanel node={node} canEdit={canEdit} />
        <BindingPanel node={node} canEdit={canEdit} />
      </div>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">{children}</div>
  );
}
