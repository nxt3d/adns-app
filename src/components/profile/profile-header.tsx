'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { ADNS_REGISTRY_ABI, ADNS_REGISTRY_ADDRESS } from '@/config/contracts';
import type { ParsedName } from '@/lib/name';
import { formatDuration, truncateMiddle } from '@/lib/format';

export function ProfileHeader({ name }: { name: ParsedName }) {
  const owner = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'owner',
    args: [name.node],
  });
  const controller = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'controllerOf',
    args: [name.node],
  });
  const lockExp = useReadContract({
    address: ADNS_REGISTRY_ADDRESS,
    abi: ADNS_REGISTRY_ABI,
    functionName: 'getLockExpiration',
    args: [name.node],
  });

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const ownerAddr = owner.data as string | undefined;
  const controllerAddr = controller.data as string | undefined;
  const exp = lockExp.data ? Number(lockExp.data) : null;
  const remaining = exp ? exp - now : null;
  const expiringSoon = remaining != null && remaining > 0 && remaining < 30 * 86400;
  const expired = remaining != null && remaining <= 0 && exp !== 0;
  const registered = Boolean(ownerAddr && ownerAddr !== '0x0000000000000000000000000000000000000000');

  return (
    <header className="rounded-card border border-line bg-paper p-6 shadow-lift sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-display-2">{name.display}</h1>
          <p className="mt-1 font-mono text-sm text-ink-subtle">{name.stored}</p>
        </div>
        {registered ? (
          <span
            className={`rounded-pill px-3 py-1 text-xs font-semibold ${
              expired
                ? 'bg-red-100 text-red-700'
                : expiringSoon
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-brand-soft text-brand-fg'
            }`}
          >
            {expired
              ? 'Expired'
              : remaining != null
                ? exp === 0
                  ? 'Permanent'
                  : `Locked · ${formatDuration(remaining)} left`
                : 'Registered'}
          </span>
        ) : (
          <span className="rounded-pill bg-paper-tint px-3 py-1 text-xs font-semibold text-ink-subtle">
            Unregistered
          </span>
        )}
      </div>

      {registered ? (
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-ink-subtle">Owner</dt>
            <dd className="font-mono">
              <a
                href={`https://etherscan.io/address/${ownerAddr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand"
              >
                {truncateMiddle(ownerAddr ?? '')}
              </a>
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-ink-subtle">Controller</dt>
            <dd className="font-mono">{truncateMiddle(controllerAddr ?? ownerAddr ?? '')}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-ink-muted">
          This name isn’t registered yet.{' '}
          <a href="/" className="text-brand hover:underline">
            Register it →
          </a>
        </p>
      )}
    </header>
  );
}
