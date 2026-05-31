'use client';

import { useEffect, useState } from 'react';
import { isAddress, type Address } from 'viem';
import { useReadContract } from 'wagmi';
import { ADNS_REGISTRY_ABI, ADNS_REGISTRY_ADDRESS } from '@/config/contracts';
import { TOKEN_STANDARD_LABELS } from '@/lib/records';
import { truncateMiddle } from '@/lib/format';
import { useTx } from '@/hooks/use-tx';
import { Panel, btnCls, inputCls } from './panel';

interface Binding {
  standard: number;
  chainId: bigint;
  tokenContract: Address;
  tokenId: bigint;
}

export function BindingPanel({
  node,
  canEdit,
}: {
  node: `0x${string}`;
  canEdit: boolean;
}) {
  const isBound = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'isBound',
    args: [node],
  });
  const boundTo = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'boundTo',
    args: [node],
    query: { enabled: Boolean(isBound.data) },
  });

  const tx = useTx();
  const [form, setForm] = useState({
    standard: 1,
    chainId: '1',
    tokenContract: '',
    tokenId: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (tx.isSuccess) {
      isBound.refetch();
      boundTo.refetch();
      setShowForm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.isSuccess]);

  const bound = Boolean(isBound.data);
  const b = boundTo.data as unknown as Binding | undefined;

  const formValid =
    isAddress(form.tokenContract) &&
    /^\d+$/.test(form.chainId) &&
    /^\d+$/.test(form.tokenId);

  const submit = (fn: 'bind' | 'rebind') => {
    if (!formValid) return;
    tx.write({
      address: ADNS_REGISTRY_ADDRESS,
      abi: ADNS_REGISTRY_ABI,
      functionName: fn,
      args: [
        node,
        {
          standard: form.standard,
          chainId: BigInt(form.chainId),
          tokenContract: form.tokenContract as Address,
          tokenId: BigInt(form.tokenId),
        },
      ],
    });
  };

  return (
    <Panel
      title="NFT binding"
      description="Bind this name to the NFT that should own it (BYONFT)."
    >
      {bound && b ? (
        <div className="space-y-3">
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-ink-subtle">Standard</dt>
            <dd>{TOKEN_STANDARD_LABELS[Number(b.standard)] ?? b.standard}</dd>
            <dt className="text-ink-subtle">Chain ID</dt>
            <dd>{b.chainId?.toString()}</dd>
            <dt className="text-ink-subtle">Contract</dt>
            <dd className="font-mono">{truncateMiddle(b.tokenContract ?? '')}</dd>
            <dt className="text-ink-subtle">Token ID</dt>
            <dd>{b.tokenId?.toString()}</dd>
          </dl>
          {canEdit ? (
            <div className="flex gap-2">
              <button
                className={btnCls}
                disabled={tx.isPending || tx.isConfirming}
                onClick={() => setShowForm((s) => !s)}
              >
                Rebind
              </button>
              <button
                className="focus-ring rounded-pill border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand disabled:opacity-50"
                disabled={tx.isPending || tx.isConfirming}
                onClick={() =>
                  tx.write({
                    address: ADNS_REGISTRY_ADDRESS,
                    abi: ADNS_REGISTRY_ABI,
                    functionName: 'unbind',
                    args: [node],
                  })
                }
              >
                Unbind
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="text-sm text-ink-subtle">
            {bound ? 'Bound.' : 'Free mode — not bound to an NFT.'}
          </p>
          {canEdit && !showForm ? (
            <button className={`${btnCls} mt-3`} onClick={() => setShowForm(true)}>
              Bind to NFT
            </button>
          ) : null}
        </div>
      )}

      {canEdit && showForm ? (
        <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-ink-subtle">Standard</label>
            <select
              className={inputCls}
              value={form.standard}
              onChange={(e) => setForm({ ...form, standard: Number(e.target.value) })}
            >
              <option value={1}>ERC-721</option>
              <option value={2}>ERC-1155</option>
              <option value={3}>ERC-6909</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-subtle">Chain ID</label>
            <input
              className={inputCls}
              value={form.chainId}
              onChange={(e) => setForm({ ...form, chainId: e.target.value.trim() })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-ink-subtle">NFT contract</label>
            <input
              className={inputCls}
              value={form.tokenContract}
              placeholder="0x…"
              onChange={(e) => setForm({ ...form, tokenContract: e.target.value.trim() })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-subtle">Token ID</label>
            <input
              className={inputCls}
              value={form.tokenId}
              onChange={(e) => setForm({ ...form, tokenId: e.target.value.trim() })}
            />
          </div>
          <div className="flex items-end">
            <button
              className={btnCls}
              disabled={!formValid || tx.isPending || tx.isConfirming}
              onClick={() => submit(bound ? 'rebind' : 'bind')}
            >
              {tx.isPending || tx.isConfirming ? '…' : bound ? 'Confirm rebind' : 'Confirm bind'}
            </button>
          </div>
        </div>
      ) : null}

      {tx.error ? (
        <p className="mt-2 text-sm text-red-500">{tx.error.message.slice(0, 140)}</p>
      ) : null}
    </Panel>
  );
}
