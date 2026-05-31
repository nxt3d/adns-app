/** Common text-record keys preloaded in the profile editor. */
export const PRELOADED_TEXT_KEYS: { key: string; label: string; placeholder: string }[] = [
  { key: 'avatar', label: 'Avatar', placeholder: 'https://… or ipfs://…' },
  { key: 'description', label: 'Description', placeholder: 'A short bio' },
  { key: 'url', label: 'Website', placeholder: 'https://example.com' },
  { key: 'email', label: 'Email', placeholder: 'you@example.com' },
  { key: 'com.twitter', label: 'Twitter / X', placeholder: 'handle' },
  { key: 'org.telegram', label: 'Telegram', placeholder: 'handle' },
  { key: 'com.discord', label: 'Discord', placeholder: 'handle' },
  { key: 'com.github', label: 'GitHub', placeholder: 'handle' },
];

/** ENSIP-9 / SLIP-44 coin types preloaded in the address editor. */
export const PRELOADED_COIN_TYPES: { coinType: number; label: string; isEvm: boolean }[] = [
  { coinType: 60, label: 'ETH', isEvm: true },
  { coinType: 0, label: 'BTC', isEvm: false },
  { coinType: 2147483658, label: 'Optimism', isEvm: true },
  { coinType: 2147525809, label: 'Base', isEvm: true },
];

/** ERC standard enum used by the binding tuple (TokenStandard). */
export const TOKEN_STANDARD_LABELS: Record<number, string> = {
  0: 'Unset',
  1: 'ERC-721',
  2: 'ERC-1155',
  3: 'ERC-6909',
};
