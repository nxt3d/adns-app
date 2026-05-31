'use client';

import { ConnectButton as RKConnectButton } from '@rainbow-me/rainbowkit';

/**
 * Wallet connect button — RainbowKit's, styled via the dark theme in
 * WalletProvider. Thin wrapper so the rest of the app imports one name.
 */
export function ConnectButton() {
  return (
    <RKConnectButton
      accountStatus="address"
      chainStatus="none"
      showBalance={false}
    />
  );
}
