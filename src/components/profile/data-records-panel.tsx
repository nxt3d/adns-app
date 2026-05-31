'use client';

import { useEffect, useState } from 'react';
import { isHex } from 'viem';
import { useReadContract } from 'wagmi';
import { ADNS_REGISTRY_ABI, ADNS_REGISTRY_ADDRESS } from '@/config/contracts';
import { useTx } from '@/hooks/use-tx';
import { Panel, btnCls, inputCls } from './panel';

function DataRow({
  node,
  recordKey,
  canEdit,
}: {
  node: `0x${string}`;
  recordKey: string;
  canEdit: boolean;
}) {
  const read = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'data',
    args: [node, recordKey],
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
    <div className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-2">
      <span className="truncate text-sm font-medium text-ink-muted" title={recordKey}>
        {recordKey}
      </span>
      <input
        className={inputCls}
        value={value}
        placeholder="0x… bytes"
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
              functionName: 'setData',
              args: [node, recordKey, (value === '' ? '0x' : value) as `0x${string}`],
            })
          }
        >
          {tx.isPending || tx.isConfirming ? '…' : 'Save'}
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

export function DataRecordsPanel({
  node,
  canEdit,
}: {
  node: `0x${string}`;
  canEdit: boolean;
}) {
  const [newKey, setNewKey] = useState('');
  const [keys, setKeys] = useState<string[]>([]);

  const addKey = () => {
    const k = newKey.trim();
    if (k && !keys.includes(k)) {
      setKeys((p) => [...p, k]);
      setNewKey('');
    }
  };

  return (
    <Panel
      title="Data records"
      description="Arbitrary binary key/value records (hex-encoded)."
    >
      <div className="flex flex-col gap-3">
        {keys.length === 0 ? (
          <p className="text-sm text-ink-subtle">
            Add a key to read or write a binary data record.
          </p>
        ) : (
          keys.map((k) => (
            <DataRow key={k} node={node} recordKey={k} canEdit={canEdit} />
          ))
        )}

        {canEdit ? (
          <>
            <div className="mt-1 flex items-center gap-2 border-t border-line pt-3">
              <input
                className={inputCls}
                value={newKey}
                placeholder="Data key (e.g. adns)"
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKey()}
              />
              <button className={btnCls} onClick={addKey} disabled={!newKey.trim()}>
                Add
              </button>
            </div>
            <p className="text-xs text-ink-subtle">
              Binary file upload — coming soon. For now paste hex-encoded bytes.
            </p>
          </>
        ) : null}
      </div>
    </Panel>
  );
}
