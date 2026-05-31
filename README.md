# adns-app

Front-end for **aDNS** — names for NFTs. Register and manage aDNS names on
Ethereum mainnet. Built with Next.js 15 (App Router), wagmi v2, viem v2, and
Reown AppKit, styled with Tailwind.

> Rebuilt from scratch using `dappa-app` as the wiring template. The previous
> `adns-app` (USDC / dual-mode patterns) is superseded.

## Pages

- **`/`** — Register a name. Length-bucket pricing (`registrar.charAmounts`),
  duration picker, live price quote (`registrar.rentPrice`), and the full
  **commit → wait → register** commit-reveal flow with a `minCommitmentAge`
  countdown. Recent registrations feed is stubbed until the indexer is live.
- **`/[name]`** — Profile for a stored name (e.g. `/yoel.normies.adns.eth`).
  Header (owner, controller, lock status) plus editable record panels:
  **text**, **address (ENSIP-9)**, **content hash**, **data**, and **NFT
  binding** (bind / rebind / unbind). Read-only unless the connected wallet is
  the name's controller.
- **`/docs`, `/docs/[slug]`** — Concept docs (naming, BYONFT, ADNSIP-25,
  integration), rendered from `content/docs/*.mdx`.

## Contracts (Ethereum mainnet, chainId 1)

| Contract       | Address |
| -------------- | ------- |
| ADNSRegistry   | `0x14D71F25aBb1e86959584aF1AE1677d3f39105AE` |
| ADNSRegistrar  | `0xf2bFc17D87a774c32C6e950640db8A34AF758981` |

ABIs in `src/abis/` are copied verbatim from the Foundry artifacts in the
`adns` repo (`out/ADNSRegistry.sol`, `out/ADNSRegistrar.sol`).

A name's public form is `<collection>.<label>` (e.g. `normies.yoel`); it is
stored under the ENS-compatible apex as `<label>.<collection>.adns.eth`, and the
registry node is `namehash(stored)`.

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_REOWN_PROJECT_ID
pnpm dev                     # http://localhost:3000
```

### Environment

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Reown/WalletConnect project id (wallet modal) |
| `NEXT_PUBLIC_APP_URL` | Public site URL (wallet metadata). Prod: `https://adns.cc` |
| `NEXT_PUBLIC_MAINNET_RPC_URL` | Mainnet RPC. Must be `NEXT_PUBLIC_` to reach the browser; blank → viem public RPC |
| `NEXT_PUBLIC_ADNS_INDEXER_URL` | aDNS indexer GraphQL endpoint (coming soon); blank → direct contract reads |

## Indexer

The `adns-indexer` (Render, GraphQL) is being built in parallel. Until
`NEXT_PUBLIC_ADNS_INDEXER_URL` is set, the app reads directly from the
contracts. Plug-in points are marked `TODO(indexer)` in `src/lib/indexer.ts`
and `src/components/register/recent-registrations.tsx`.

## Notes / decisions

- **Reown AppKit, not RainbowKit.** The brief said "RainbowKit", but the
  `dappa-app` template uses `@reown/appkit` + wagmi v2. Matched the template to
  reuse proven wiring; swapping to RainbowKit later is mechanical.
- **`register` records are a struct, not flat arrays.** The registrar's
  `register(parentLabel, label, owner, duration, secret, InitRecords)` takes one
  `InitRecords` tuple `{keys, values, coinTypes, addresses, contentHash,
  dataKeys, dataValues}`, not the flat `[],[],…` the brief sketched.
- **`rentPrice` is `payable` in the ABI** but used only as a quote; a read-only
  ABI variant (`RENT_PRICE_READ_ABI`) is used for `eth_call`.
- **`force-dynamic`** on the root layout: this is a wallet dapp; every route
  depends on client wallet state, so static prerender is disabled.
