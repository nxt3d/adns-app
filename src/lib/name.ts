import { namehash } from 'viem/ens';
import { APEX } from '@/config/contracts';

export interface ParsedName {
  /** second-level label the user registers, e.g. `yoel` */
  label: string;
  /** first-level collection label, e.g. `normies` */
  parentLabel: string;
  /** stored / resolver form: `yoel.normies.adns.eth` */
  stored: string;
  /** human / public form: `normies.yoel` */
  display: string;
  /** registry node = namehash(stored) */
  node: `0x${string}`;
}

const APEX_SUFFIX = `.${APEX}`;

/** Build the stored (namehash) form from label + collection. */
export function buildStored(label: string, parentLabel: string): string {
  return `${label}.${parentLabel}${APEX_SUFFIX}`;
}

/** namehash of an already-stored name. */
export function toNode(stored: string): `0x${string}` {
  return namehash(stored) as `0x${string}`;
}

export function buildParsed(label: string, parentLabel: string): ParsedName {
  const l = label.trim().toLowerCase();
  const p = parentLabel.trim().toLowerCase();
  const stored = buildStored(l, p);
  return {
    label: l,
    parentLabel: p,
    stored,
    display: `${p}.${l}`,
    node: namehash(stored) as `0x${string}`,
  };
}

/**
 * Parse a stored name like `yoel.normies.adns.eth` (the route param on the
 * profile page) into its parts. Returns null if it isn't a valid 2-level aDNS
 * name under the apex.
 */
export function parseStored(name: string): ParsedName | null {
  const n = decodeURIComponent(name).trim().toLowerCase().replace(/\.$/, '');
  if (!n.endsWith(APEX_SUFFIX)) return null;
  const head = n.slice(0, -APEX_SUFFIX.length); // expect `label.parentLabel`
  const parts = head.split('.');
  if (parts.length !== 2) return null;
  const [label, parentLabel] = parts;
  if (!label || !parentLabel) return null;
  return {
    label,
    parentLabel,
    stored: n,
    display: `${parentLabel}.${label}`,
    node: namehash(n) as `0x${string}`,
  };
}

/** Basic label validation (lowercase alphanumeric + hyphen, no leading/trailing hyphen). */
export function isValidLabel(label: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(label);
}
