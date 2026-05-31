'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { isAddress, type Address } from 'viem';
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import {
  ADNS_REGISTRAR_ABI,
  ADNS_REGISTRAR_ADDRESS,
  CHAIN_ID,
  RENT_PRICE_READ_ABI,
} from '@/config/contracts';
import { buildStored, isValidLabel } from '@/lib/name';
import { formatCountdown, formatEth, SECONDS_PER_DAY, SECONDS_PER_YEAR } from '@/lib/format';
import { ConnectButton } from '@/components/wallet/connect-button';
import { PricingTable } from '@/components/register/pricing-table';

type Phase = 'idle' | 'committing' | 'waiting' | 'ready' | 'registering' | 'done';

const DURATION_OPTIONS: { label: string; seconds: bigint }[] = [
  { label: '28 days (min)', seconds: BigInt(28 * SECONDS_PER_DAY) },
  { label: '1 year', seconds: BigInt(SECONDS_PER_YEAR) },
  { label: '2 years', seconds: BigInt(2 * SECONDS_PER_YEAR) },
  { label: '3 years', seconds: BigInt(3 * SECONDS_PER_YEAR) },
  { label: '5 years', seconds: BigInt(5 * SECONDS_PER_YEAR) },
  { label: '10 years', seconds: BigInt(10 * SECONDS_PER_YEAR) },
];

// Field names MUST match the registrar's InitRecords tuple components exactly
// (keys, values, coinTypes, addresses, contentHash, dataKeys, dataValues) —
// viem encodes the tuple by component name.
const EMPTY_RECORDS = {
  keys: [] as string[],
  values: [] as string[],
  coinTypes: [] as bigint[],
  addresses: [] as `0x${string}`[],
  contentHash: '0x' as `0x${string}`,
  dataKeys: [] as string[],
  dataValues: [] as `0x${string}`[],
} as const;

function randomSecret(): `0x${string}` {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return `0x${Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function RegisterWidget() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [label, setLabel] = useState('yoel');
  const [parentLabel, setParentLabel] = useState('normies');
  const [duration, setDuration] = useState<bigint>(BigInt(SECONDS_PER_YEAR));
  const [owner, setOwner] = useState('');
  const [secret, setSecret] = useState<`0x${string}` | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [committedAt, setCommittedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  // Default the owner field to the connected wallet.
  useEffect(() => {
    if (address && !owner) setOwner(address);
  }, [address, owner]);

  // tick for the countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const ownerValid = isAddress(owner);
  const labelValid = isValidLabel(label);
  const parentValid = isValidLabel(parentLabel);
  const onMainnet = chainId === CHAIN_ID;
  const stored = useMemo(() => buildStored(label, parentLabel), [label, parentLabel]);

  // Reset the flow if the identity-defining inputs change after a commit.
  const resetFlow = useCallback(() => {
    setPhase('idle');
    setSecret(null);
    setCommittedAt(null);
  }, []);

  // ---- reads -------------------------------------------------------------
  const { data: price } = useReadContract({
    address: ADNS_REGISTRAR_ADDRESS,
    abi: RENT_PRICE_READ_ABI,
    functionName: 'rentPrice',
    args: [label, duration],
    query: { enabled: labelValid },
  });

  const { data: minAge } = useReadContract({
    address: ADNS_REGISTRAR_ADDRESS,
    abi: ADNS_REGISTRAR_ABI,
    functionName: 'minCommitmentAge',
  });
  const { data: maxAge } = useReadContract({
    address: ADNS_REGISTRAR_ADDRESS,
    abi: ADNS_REGISTRAR_ABI,
    functionName: 'maxCommitmentAge',
  });
  const minCommitmentAge = minAge ? Number(minAge) : 60;
  const maxCommitmentHours = maxAge ? Math.round(Number(maxAge) / 3600) : 24;

  // commitment is computed on-chain (pure) once we have owner + secret
  const { data: commitment } = useReadContract({
    address: ADNS_REGISTRAR_ADDRESS,
    abi: ADNS_REGISTRAR_ABI,
    functionName: 'makeCommitment',
    args: secret && ownerValid ? [label, owner as Address, secret] : undefined,
    query: { enabled: Boolean(secret) && ownerValid && labelValid },
  });

  // ---- writes ------------------------------------------------------------
  const commitTx = useWriteContract();
  const commitReceipt = useWaitForTransactionReceipt({ hash: commitTx.data });

  const registerTx = useWriteContract();
  const registerReceipt = useWaitForTransactionReceipt({ hash: registerTx.data });

  // advance phase on commit confirmation
  useEffect(() => {
    if (commitReceipt.isSuccess && phase === 'committing') {
      setCommittedAt(Math.floor(Date.now() / 1000));
      setPhase('waiting');
    }
  }, [commitReceipt.isSuccess, phase]);

  // countdown -> ready
  const elapsed = committedAt ? now - committedAt : 0;
  const remaining = Math.max(0, minCommitmentAge - elapsed);
  useEffect(() => {
    if (phase === 'waiting' && remaining === 0) setPhase('ready');
  }, [phase, remaining]);

  // advance phase on register confirmation
  useEffect(() => {
    if (registerReceipt.isSuccess && phase === 'registering') setPhase('done');
  }, [registerReceipt.isSuccess, phase]);

  // ---- actions -----------------------------------------------------------
  const onCommit = () => {
    if (!ownerValid || !labelValid || !parentValid) return;
    const s = randomSecret();
    setSecret(s);
    setPhase('committing');
    // commitment depends on the freshly-generated secret; recompute inline.
    // The on-chain makeCommitment read will also resolve, but we compute the
    // commit arg from the same inputs to avoid a read race.
    import('viem').then(({ keccak256, encodeAbiParameters }) => {
      const c = keccak256(
        encodeAbiParameters(
          [{ type: 'string' }, { type: 'address' }, { type: 'bytes32' }],
          [label, owner as Address, s],
        ),
      );
      commitTx.writeContract({
        address: ADNS_REGISTRAR_ADDRESS,
        abi: ADNS_REGISTRAR_ABI,
        functionName: 'commit',
        args: [c],
      });
    });
  };

  const onRegister = () => {
    if (!secret || !ownerValid || price == null) return;
    setPhase('registering');
    registerTx.writeContract({
      address: ADNS_REGISTRAR_ADDRESS,
      abi: ADNS_REGISTRAR_ABI,
      functionName: 'register',
      args: [parentLabel, label, owner as Address, duration, secret, EMPTY_RECORDS],
      value: price as bigint,
    });
  };

  const inputCls =
    'focus-ring w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-ink-subtle';
  const labelCls = 'mb-1.5 block text-sm font-medium text-ink-muted';

  // ---- success state -----------------------------------------------------
  if (phase === 'done') {
    return (
      <div className="rounded-card border border-line bg-paper p-8 text-center shadow-lift">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-pill bg-brand-soft text-2xl text-brand-fg">
          ✓
        </div>
        <h2 className="text-2xl font-extrabold">Registered!</h2>
        <p className="mt-2 text-ink-muted">
          <span className="font-semibold text-ink">{parentLabel}.{label}</span> is yours.
        </p>
        <Link
          href={`/${stored}`}
          className="focus-ring mt-6 inline-flex items-center justify-center rounded-pill bg-ink px-6 py-3 font-semibold text-paper hover:bg-brand-fg"
        >
          View profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-paper p-6 shadow-lift sm:p-8">
      {/* name inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Name</label>
          <input
            className={inputCls}
            value={label}
            placeholder="yoel"
            onChange={(e) => {
              setLabel(e.target.value.toLowerCase());
              resetFlow();
            }}
          />
        </div>
        <div>
          <label className={labelCls}>Collection</label>
          <input
            className={inputCls}
            value={parentLabel}
            placeholder="normies"
            onChange={(e) => {
              setParentLabel(e.target.value.toLowerCase());
              resetFlow();
            }}
          />
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-subtle">
        You are registering{' '}
        <span className="font-mono text-ink">{parentLabel}.{label}</span>{' '}
        <span className="text-ink-subtle">(stored as {stored})</span>
      </p>

      {!labelValid || !parentValid ? (
        <p className="mt-2 text-sm text-red-500">
          Name and collection must be lowercase letters, digits, or hyphens.
        </p>
      ) : null}

      {/* duration + owner */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Duration</label>
          <select
            className={inputCls}
            value={duration.toString()}
            onChange={(e) => setDuration(BigInt(e.target.value))}
          >
            {DURATION_OPTIONS.map((o) => (
              <option key={o.label} value={o.seconds.toString()}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Owner</label>
          <input
            className={inputCls}
            value={owner}
            placeholder="0x…"
            onChange={(e) => {
              setOwner(e.target.value);
              resetFlow();
            }}
          />
          {owner && !ownerValid ? (
            <p className="mt-1 text-xs text-red-500">Not a valid address.</p>
          ) : null}
        </div>
      </div>

      {/* price quote */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-paper-tint px-4 py-3">
        <span className="text-sm text-ink-muted">Price</span>
        <span className="text-lg font-bold">
          {price != null ? formatEth(price as bigint) : labelValid ? '…' : '—'}
        </span>
      </div>

      {/* flow */}
      <div className="mt-6">
        {!isConnected ? (
          <ConnectButton className="w-full justify-center" />
        ) : !onMainnet ? (
          <button
            type="button"
            onClick={() => switchChain({ chainId: CHAIN_ID })}
            className="focus-ring w-full rounded-pill bg-ink px-6 py-3 font-semibold text-paper hover:bg-brand-fg"
          >
            Switch to Ethereum
          </button>
        ) : phase === 'idle' || phase === 'committing' ? (
          <button
            type="button"
            disabled={
              !labelValid ||
              !parentValid ||
              !ownerValid ||
              phase === 'committing' ||
              commitReceipt.isLoading
            }
            onClick={onCommit}
            className="focus-ring w-full rounded-pill bg-ink px-6 py-3 font-semibold text-paper hover:bg-brand-fg disabled:opacity-50"
          >
            {phase === 'committing' || commitReceipt.isLoading
              ? 'Committing…'
              : 'Commit'}
          </button>
        ) : phase === 'waiting' ? (
          <div className="rounded-xl border border-line bg-paper-tint px-4 py-5 text-center">
            <p className="text-3xl font-bold tabular-nums">{formatCountdown(remaining)}</p>
            <p className="mt-1 text-sm text-ink-muted">
              Waiting out the {minCommitmentAge}s commitment delay…
            </p>
            <p className="mt-1 text-xs text-ink-subtle">
              Your commitment stays valid for ~{maxCommitmentHours}h.
            </p>
          </div>
        ) : phase === 'ready' || phase === 'registering' ? (
          <button
            type="button"
            disabled={phase === 'registering' || registerReceipt.isLoading || price == null}
            onClick={onRegister}
            className="focus-ring w-full rounded-pill bg-brand px-6 py-3 font-semibold text-paper hover:bg-brand-strong disabled:opacity-50"
          >
            {phase === 'registering' || registerReceipt.isLoading
              ? 'Registering…'
              : `Register ${parentLabel}.${label}`}
          </button>
        ) : null}

        {commitment ? (
          <p className="mt-2 break-all text-center text-[11px] text-ink-subtle">
            commitment {commitment as string}
          </p>
        ) : null}
        {commitTx.error || registerTx.error ? (
          <p className="mt-2 text-center text-sm text-red-500">
            {(commitTx.error || registerTx.error)?.message?.slice(0, 140)}
          </p>
        ) : null}
      </div>

      <PricingTable />
    </div>
  );
}
