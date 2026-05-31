import { mainnet } from 'viem/chains';
import { ADNS_REGISTRAR_ABI } from '@/abis/adnsRegistrar';
import { ADNS_REGISTRY_ABI } from '@/abis/adnsRegistry';

/** ADNS is deployed on Ethereum mainnet only (chainId 1). */
export const CHAIN = mainnet;
export const CHAIN_ID = mainnet.id;

/** Mainnet proxy addresses (v-current deployment). */
export const ADNS_REGISTRY_ADDRESS =
  '0x14D71F25aBb1e86959584aF1AE1677d3f39105AE' as const;
export const ADNS_REGISTRAR_ADDRESS =
  '0xf2bFc17D87a774c32C6e950640db8A34AF758981' as const;

/**
 * The protocol apex. Public names render as `<collection>.<label>` but are
 * stored under the ENS-compatible namespace as `<label>.<collection>.adns.eth`,
 * which is what the registry node (namehash) is derived from.
 */
export const APEX = 'adns.eth';

export { ADNS_REGISTRAR_ABI, ADNS_REGISTRY_ABI };

/**
 * `rentPrice` is declared `payable` in the registrar ABI but is only ever used
 * as a price quote via `eth_call`. wagmi/viem's read helpers reject non
 * view/pure functions at the type level, so we expose a read-only variant with
 * the mutability overridden. This does not change on-chain behaviour.
 */
/**
 * `addr`/`setAddr` are overloaded on the registry, which collapses wagmi's
 * type inference to `never`. We read/write multicoin addresses exclusively
 * through the coin-typed variant (coinType 60 = ETH), so a dedicated
 * single-function ABI keeps the hooks well-typed and avoids overload
 * resolution entirely.
 */
export const ADDR_COIN_ABI = [
  {
    type: 'function',
    name: 'addr',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'coinType', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bytes' }],
  },
  {
    type: 'function',
    name: 'setAddr',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'coinType', type: 'uint256' },
      { name: 'addr', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;

/** Minimal owner getter used by the availability check + project page. */
export const OWNER_READ_ABI = [
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

/** Minimal controller getter used to gate record editing on /manage. */
export const CONTROLLER_READ_ABI = [
  {
    type: 'function',
    name: 'controllerOf',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

/** One year in seconds — the default quote duration on the homepage. */
export const ONE_YEAR_SECONDS = 365n * 24n * 60n * 60n;

export const RENT_PRICE_READ_ABI = [
  {
    type: 'function',
    name: 'rentPrice',
    stateMutability: 'view',
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
