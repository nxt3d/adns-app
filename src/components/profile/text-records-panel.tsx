'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { ADNS_REGISTRY_ABI, ADNS_REGISTRY_ADDRESS } from '@/config/contracts';
import { PRELOADED_TEXT_KEYS } from '@/lib/records';
import { useTx } from '@/hooks/use-tx';
import { Panel, btnCls, inputCls } from './panel';

function TextRow({
  node,
  recordKey,
  label,
  placeholder,
  canEdit,
}: {
  node: `0x${string}`;
  recordKey: string;
  label: string;
  placeholder: string;
  canEdit: boolean;
}) {
  const { data, refetch } = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'text',
    args: [node, recordKey],
  });
  const current = typeof data === 'string' ? data : '';
  const [value, setValue] = useState('');
  const [dirty, setDirty] = useState(false);
  const tx = useTx();

  useEffect(() => {
    if (!dirty) setValue(current);
  }, [current, dirty]);

  useEffect(() => {
    if (tx.isSuccess) {
      setDirty(false);
      refetch();
    }
  }, [tx.isSuccess, refetch]);

  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-2">
      <span className="truncate text-sm font-medium text-ink-muted" title={recordKey}>
        {label}
      </span>
      <input
        className={inputCls}
        value={value}
        placeholder={placeholder}
        disabled={!canEdit}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
      />
      {canEdit ? (
        <button
          className={btnCls}
          disabled={!dirty || tx.isPending || tx.isConfirming}
          onClick={() =>
            tx.write({
              address: ADNS_REGISTRY_ADDRESS,
              abi: ADNS_REGISTRY_ABI,
              functionName: 'setText',
              args: [node, recordKey, value],
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

export function TextRecordsPanel({
  node,
  canEdit,
}: {
  node: `0x${string}`;
  canEdit: boolean;
}) {
  const [customKey, setCustomKey] = useState('');
  const [extraKeys, setExtraKeys] = useState<string[]>([]);

  const preloaded = PRELOADED_TEXT_KEYS.map((k) => k.key);
  const addCustom = () => {
    const k = customKey.trim();
    if (k && !preloaded.includes(k) && !extraKeys.includes(k)) {
      setExtraKeys((p) => [...p, k]);
      setCustomKey('');
    }
  };

  return (
    <Panel title="Text records" description="Profile metadata stored as key/value text.">
      <div className="flex flex-col gap-3">
        {PRELOADED_TEXT_KEYS.map((k) => (
          <TextRow
            key={k.key}
            node={node}
            recordKey={k.key}
            label={k.label}
            placeholder={k.placeholder}
            canEdit={canEdit}
          />
        ))}
        {extraKeys.map((k) => (
          <TextRow
            key={k}
            node={node}
            recordKey={k}
            label={k}
            placeholder="value"
            canEdit={canEdit}
          />
        ))}
        {canEdit ? (
          <div className="mt-1 flex items-center gap-2 border-t border-line pt-3">
            <input
              className={inputCls}
              value={customKey}
              placeholder="Custom key (e.g. com.linkedin)"
              onChange={(e) => setCustomKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            />
            <button className={btnCls} onClick={addCustom} disabled={!customKey.trim()}>
              Add
            </button>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
