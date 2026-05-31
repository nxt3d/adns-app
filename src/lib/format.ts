import { formatEther } from 'viem';

export function truncateMiddle(value: string, lead = 6, tail = 4): string {
  if (!value) return '';
  if (value.length <= lead + tail + 1) return value;
  return `${value.slice(0, lead)}…${value.slice(-tail)}`;
}

export function formatEth(wei: bigint, maxFractionDigits = 6): string {
  const eth = formatEther(wei);
  const n = Number(eth);
  if (Number.isNaN(n)) return `${eth} ETH`;
  return `${n.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits })} ETH`;
}

export const SECONDS_PER_DAY = 86_400;
export const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

export function yearsToSeconds(years: number): bigint {
  return BigInt(Math.round(years * SECONDS_PER_YEAR));
}

export function daysToSeconds(days: number): bigint {
  return BigInt(Math.round(days * SECONDS_PER_DAY));
}

/** Human readable duration from a number of seconds. */
export function formatDuration(seconds: number | bigint): string {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return 'expired';
  const days = s / SECONDS_PER_DAY;
  if (days >= 365) {
    const years = days / 365;
    return `${years.toLocaleString(undefined, { maximumFractionDigits: 1 })} yr`;
  }
  if (days >= 1) return `${Math.round(days)} d`;
  const hours = s / 3600;
  if (hours >= 1) return `${Math.round(hours)} h`;
  const mins = s / 60;
  if (mins >= 1) return `${Math.round(mins)} m`;
  return `${Math.round(s)} s`;
}

/** mm:ss countdown string. */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
