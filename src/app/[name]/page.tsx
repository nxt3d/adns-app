'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { ADNS_REGISTRY_ABI, ADNS_REGISTRY_ADDRESS } from '@/config/contracts';
import { parseStored } from '@/lib/name';
import { ProfileHeader } from '@/components/profile/profile-header';
import { TextRecordsPanel } from '@/components/profile/text-records-panel';
import { AddressRecordsPanel } from '@/components/profile/address-records-panel';
import { ContentHashPanel } from '@/components/profile/content-hash-panel';
import { DataRecordsPanel } from '@/components/profile/data-records-panel';
import { BindingPanel } from '@/components/profile/binding-panel';

export default function ProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: raw } = use(params);
  const parsed = parseStored(raw);
  const { address } = useAccount();

  const controller = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'controllerOf',
    args: parsed ? [parsed.node] : undefined,
    query: { enabled: Boolean(parsed) },
  });

  if (!parsed) {
    return (
      <div className="mx-auto max-w-xl rounded-card border border-line bg-paper p-8 text-center">
        <h1 className="text-xl font-bold">Invalid name</h1>
        <p className="mt-2 text-ink-muted">
          Expected a name like{' '}
          <span className="font-mono">yoel.normies.adns.eth</span>.
        </p>
        <Link href="/" className="mt-4 inline-block text-brand hover:underline">
          ← Back to register
        </Link>
      </div>
    );
  }

  const controllerAddr = controller.data as string | undefined;
  const canEdit = Boolean(
    address &&
      controllerAddr &&
      address.toLowerCase() === controllerAddr.toLowerCase(),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProfileHeader name={parsed} />

      {!canEdit ? (
        <p className="rounded-card border border-dashed border-line px-4 py-3 text-center text-sm text-ink-subtle">
          {address
            ? 'You are not the controller of this name — records are read-only.'
            : 'Connect the controller wallet to edit records.'}
        </p>
      ) : null}

      <TextRecordsPanel node={parsed.node} canEdit={canEdit} />
      <AddressRecordsPanel node={parsed.node} canEdit={canEdit} />
      <ContentHashPanel node={parsed.node} canEdit={canEdit} />
      <DataRecordsPanel node={parsed.node} canEdit={canEdit} />
      <BindingPanel node={parsed.node} canEdit={canEdit} />
    </div>
  );
}
