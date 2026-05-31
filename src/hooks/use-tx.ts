'use client';

import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

/** Thin wrapper bundling a contract write with its receipt-confirmation state. */
export function useTx() {
  const w = useWriteContract();
  const r = useWaitForTransactionReceipt({ hash: w.data });
  return {
    write: w.writeContract,
    hash: w.data,
    error: w.error,
    isPending: w.isPending,
    isConfirming: r.isLoading,
    isSuccess: r.isSuccess,
    reset: w.reset,
  };
}
