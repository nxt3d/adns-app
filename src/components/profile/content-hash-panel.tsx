'use client';

import { useEffect, useState } from 'react';
import { isHex } from 'viem';
import { useReadContract } from 'wagmi';
import { ADNS_REGISTRY_ABI, ADNS_REGISTRY_ADDRESS } from '@/config/contracts';
import { useTx } from '@/hooks/use-tx';
import { Panel, btnCls, inputCls } from './panel';

export function ContentHashPanel({
  node,
  canEdit,
}: {
  node: `0x${string}`;
  canEdit: boolean;
}) {
  const read = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'contenthash',
    args: [node],
  });
  const current = typeof read.data === 'string' ? read.data : '';
  const [value, setValue] = useState('');
  const [dirty, setDirty] = useState(false);
  const tx = useTx();

  useEffect(() => {
    if (!dirty) setValue(current && current !== '0x' ? current : '');
  }, [current, dirty]);
  useEffect(() => {
    if (tx.isSuccess) {
      setDirty(false);
      read.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.isSuccess]);

  const valid = value === '' || isHex(value);

  return (
    <Panel
      title="Content hash"
      description="Points the name at content on IPFS/IPNS/Swarm/Arweave (hex-encoded)."
    >
      <div className="flex items-center gap-2">
        <input
          className={inputCls}
          value={value}
          placeholder="0x… (e.g. ipfs contenthash)"
          disabled={!canEdit}
          onChange={(e) => {
            setValue(e.target.value.trim());
            setDirty(true);
          }}
        />
        {canEdit ? (
          <button
            className={btnCls}
            disabled={!dirty || !valid || tx.isPending || tx.isConfirming}
            onClick={() =>
              tx.write({
                address: ADNS_REGISTRY_ADDRESS,
                abi: ADNS_REGISTRY_ABI,
                functionName: 'setContenthash',
                args: [node, (value === '' ? '0x' : value) as `0x${string}`],
              })
            }
          >
            {tx.isPending || tx.isConfirming ? '…' : 'Save'}
          </button>
        ) : null}
      </div>
      {!valid ? <p className="mt-1 text-xs text-red-500">Must be hex (0x…).</p> : null}
    </Panel>
  );
}
