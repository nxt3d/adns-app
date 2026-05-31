'use client';

import { useEffect, useState } from 'react';
import { isAddress, isHex } from 'viem';
import { useReadContract } from 'wagmi';
import { ADDR_COIN_ABI, ADNS_REGISTRY_ADDRESS } from '@/config/contracts';
import { PRELOADED_COIN_TYPES } from '@/lib/records';
import { useTx } from '@/hooks/use-tx';
import { Panel, btnCls, inputCls } from './panel';

function AddrRow({
  node,
  coinType,
  label,
  isEvm,
  canEdit,
}: {
  node: `0x${string}`;
  coinType: number;
  label: string;
  isEvm: boolean;
  canEdit: boolean;
}) {
  // Read/write every coin through the coin-typed variant (60 = ETH). For EVM
  // coins the 20-byte address is used directly as the `bytes` value.
  const read = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADDR_COIN_ABI,
    functionName: 'addr',
    args: [node, BigInt(coinType)],
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

  const valid = value === '' || (isEvm ? isAddress(value) : isHex(value));

  const onSave = () => {
    if (!valid) return;
    const bytes = (value === '' ? '0x' : value) as `0x${string}`;
    tx.write({
      address: ADNS_REGISTRY_ADDRESS,
      abi: ADDR_COIN_ABI,
      functionName: 'setAddr',
      args: [node, BigInt(coinType), bytes],
    });
  };

  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-2">
      <span className="truncate text-sm font-medium text-ink-muted">{label}</span>
      <input
        className={inputCls}
        value={value}
        placeholder={isEvm ? '0x… address' : '0x… bytes'}
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
          onClick={onSave}
        >
          {tx.isPending || tx.isConfirming ? '…' : 'Save'}
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

export function AddressRecordsPanel({
  node,
  canEdit,
}: {
  node: `0x${string}`;
  canEdit: boolean;
}) {
  return (
    <Panel
      title="Address records"
      description="ENSIP-9 multicoin addresses this name points to."
    >
      <div className="flex flex-col gap-3">
        {PRELOADED_COIN_TYPES.map((c) => (
          <AddrRow
            key={c.coinType}
            node={node}
            coinType={c.coinType}
            label={c.label}
            isEvm={c.isEvm}
            canEdit={canEdit}
          />
        ))}
      </div>
    </Panel>
  );
}
