'use client';

import { useReadContracts } from 'wagmi';
import { ADNS_REGISTRAR_ABI, ADNS_REGISTRAR_ADDRESS } from '@/config/contracts';
import { formatEth, SECONDS_PER_YEAR } from '@/lib/format';

const BUCKETS = [1, 2, 3, 4, 5];

/**
 * Length-bucket pricing, read from the registrar's `charAmounts` view.
 * `charAmounts(n)` is the per-second base amount for an n-character label; we
 * annualise it for a readable "per year" figure. Bucket 5 represents "5+".
 */
export function PricingTable() {
  const { data } = useReadContracts({
    contracts: BUCKETS.map((n) => ({
      address: ADNS_REGISTRAR_ADDRESS,
      abi: ADNS_REGISTRAR_ABI,
      functionName: 'charAmounts',
      args: [BigInt(n)],
    })),
  });

  if (!data) return null;

  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
        Pricing by length
      </p>
      <div className="grid grid-cols-5 gap-2 text-center">
        {BUCKETS.map((n, i) => {
          const res = data[i];
          const amount =
            res && res.status === 'success' ? (res.result as bigint) : null;
          const perYear = amount != null ? amount * BigInt(SECONDS_PER_YEAR) : null;
          return (
            <div key={n} className="rounded-lg bg-paper-tint px-2 py-3">
              <p className="text-sm font-bold">
                {n}
                {n === 5 ? '+' : ''}
              </p>
              <p className="mt-1 text-[11px] text-ink-muted">
                {perYear != null ? `${formatEth(perYear, 4)}/yr` : '—'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
