import { describe, expect, test } from 'vitest';
import {
  BITCOIN_CHAINS,
  createUniSatWalletConnectLink,
  findSession,
  rgbNetworkFromSession,
  sessionIdentity,
} from './protocol';

const session = (namespace: 'bip122' | 'rgb', account: string) => ({
  topic: namespace,
  expiry: 1,
  namespaces: { [namespace]: { accounts: [account], methods: [], events: [] } },
  peer: { metadata: { name: 'UniSat', url: 'https://unisat.io' } },
});

describe('WalletConnect demo protocol helpers', () => {
  test('creates the UniSat WalletConnect deep link without changing the URI', () => {
    const uri = `wc:${'a'.repeat(64)}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}`;
    const link = new URL(createUniSatWalletConnectLink(uri));
    expect(link.protocol).toBe('unisat:');
    expect(link.hostname).toBe('wc');
    expect(link.searchParams.get('uri')).toBe(uri);
  });

  test('rejects malformed or v1 pairing URIs', () => {
    expect(() => createUniSatWalletConnectLink('wc:topic@1?bridge=x')).toThrow('v2 URI');
  });

  test('finds and parses independent Bitcoin and RGB sessions', () => {
    const bitcoin = session('bip122', `${BITCOIN_CHAINS.mainnet}:bc1ptest`);
    const rgb = session('rgb', 'rgb:mainnet:rgb-account');
    const sessions = [bitcoin, rgb];
    expect(findSession(sessions, 'bip122')).toBe(bitcoin);
    expect(findSession(sessions, 'rgb')).toBe(rgb);
    expect(sessionIdentity(bitcoin, 'bip122')).toEqual({
      chainId: BITCOIN_CHAINS.mainnet,
      account: 'bc1ptest',
    });
    expect(sessionIdentity(rgb, 'rgb')).toEqual({ chainId: 'rgb:mainnet', account: 'rgb-account' });
    expect(rgbNetworkFromSession(rgb)).toBe('mainnet');
  });

  test('restores the newest session when stale sessions share a namespace', () => {
    const stale = { ...session('rgb', 'rgb:mainnet:stale'), expiry: 100 };
    const current = { ...session('rgb', 'rgb:mainnet:current'), expiry: 200 };

    expect(findSession([stale, current], 'rgb')).toBe(current);
  });
});
