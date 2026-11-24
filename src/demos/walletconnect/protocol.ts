import type { WalletConnectSession } from '@utexo/webrgb-walletconnect';

export const DEFAULT_WALLETCONNECT_PROJECT_ID = '7050c239565395fabc48c29d5601f1c9';

export const BITCOIN_CHAINS = {
  mainnet: 'bip122:000000000019d6689c085ae165831e93',
  testnet3: 'bip122:000000000933ea01ad0ee984209779ba',
  testnet4: 'bip122:00000000da84f2bafbbc53dee25a72ae',
  signet: 'bip122:00000008819873e925422c1ff0f99f7c',
} as const;

export const BITCOIN_METHODS = [
  'getAccountAddresses',
  'signMessage',
  'signPsbt',
  'sendTransfer',
] as const;

export const RGB_METHODS = [
  'getAddress',
  'blindReceive',
  'witnessReceive',
  'listAssets',
  'getAssetBalance',
  'sendAsset',
  'burnAsset',
  'getConsignment',
  'getReceivedMint',
  'listTransfers',
  'getTransferStatus',
  'decodeRgbInvoice',
] as const;

export function createUniSatWalletConnectLink(uri: string) {
  if (!/^wc:[0-9a-f]{64}@2\?/i.test(uri)) {
    throw new Error('A WalletConnect v2 URI is required.');
  }
  return `unisat://wc?uri=${encodeURIComponent(uri)}`;
}

export function sessionIdentity(
  session: WalletConnectSession | undefined,
  namespace: 'bip122' | 'rgb',
) {
  const account = session?.namespaces?.[namespace]?.accounts?.[0];
  if (!account) return null;
  const firstSeparator = account.indexOf(':');
  const secondSeparator = account.indexOf(':', firstSeparator + 1);
  if (firstSeparator <= 0 || secondSeparator <= firstSeparator + 1) return null;
  return {
    chainId: account.slice(0, secondSeparator),
    account: account.slice(secondSeparator + 1),
  };
}

export function findSession(
  sessions: WalletConnectSession[],
  namespace: 'bip122' | 'rgb',
) {
  return sessions
    .filter((session) => Boolean(session.namespaces?.[namespace]))
    .reduce<WalletConnectSession | undefined>((latest, current) => {
      if (!latest || current.expiry >= latest.expiry) return current;
      return latest;
    }, undefined);
}

export function rgbNetworkFromSession(session: WalletConnectSession) {
  const identity = sessionIdentity(session, 'rgb');
  if (!identity || !identity.chainId.startsWith('rgb:')) {
    throw new Error('The restored RGB session has an invalid account namespace.');
  }
  return identity.chainId.slice('rgb:'.length);
}
