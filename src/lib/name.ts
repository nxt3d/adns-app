import { namehash } from 'viem/ens';
import { APEX } from '@/config/contracts';

export interface ParsedName {
  /** second-level label, e.g. `yoel` */
  label: string;
  /** first-level collection/project label, e.g. `normies` */
  parentLabel: string;
  /** stored / resolver form: `yoel.normies.adns.eth` */
  stored: string;
  /** human / public form: `normies.yoel` */
  display: string;
  /** registry node = namehash(stored) */
  node: `0x${string}`;
}

const APEX_SUFFIX = `.${APEX}`;

/** Basic label validation (lowercase alphanumeric + hyphen, no leading/trailing hyphen). */
export function isValidLabel(label: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(label);
}

/** Normalize a raw label input (trim, lowercase, strip any apex the user typed). */
export function normalizeLabel(raw: string): string {
  let s = raw.trim().toLowerCase().replace(/\.$/, '');
  if (s.endsWith(APEX_SUFFIX)) s = s.slice(0, -APEX_SUFFIX.length);
  return s;
}

/** Stored form for a project parent: `<label>.adns.eth`. */
export function parentStored(label: string): string {
  return `${label}${APEX_SUFFIX}`;
}

/** Registry node for a project parent label, i.e. namehash(`<label>.adns.eth`). */
export function parentNode(label: string): `0x${string}` {
  return namehash(parentStored(label)) as `0x${string}`;
}

/** Build the stored form from a 2-level label + collection. */
export function buildStored(label: string, parent: string): string {
  return `${label}.${parent}${APEX_SUFFIX}`;
}

/** namehash of an already-stored name. */
export function toNode(stored: string): `0x${string}` {
  return namehash(stored) as `0x${string}`;
}

/**
 * Parse a stored name like `yoel.normies.adns.eth` into its parts. Returns null
 * if it isn't a valid 2-level aDNS name under the apex.
 */
export function parseStored(name: string): ParsedName | null {
  const n = decodeURIComponent(name).trim().toLowerCase().replace(/\.$/, '');
  if (!n.endsWith(APEX_SUFFIX)) return null;
  const head = n.slice(0, -APEX_SUFFIX.length); // expect `label.parentLabel`
  const parts = head.split('.');
  if (parts.length !== 2) return null;
  const [label, parent] = parts;
  if (!label || !parent) return null;
  return {
    label,
    parentLabel: parent,
    stored: n,
    display: `${parent}.${label}`,
    node: namehash(n) as `0x${string}`,
  };
}
