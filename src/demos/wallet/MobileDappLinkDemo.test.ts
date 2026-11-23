import { describe, expect, test } from 'vitest';
import { createUniSatMobileLink } from './MobileDappLinkDemo';

describe('createUniSatMobileLink', () => {
  test('encodes an HTTPS dApp URL as an openDapp request', () => {
    const dappUrl = 'https://example.com/rgb-test?network=mainnet';
    const result = new URL(createUniSatMobileLink(dappUrl));

    expect(result.origin + result.pathname).toBe('https://app.unisat.cloud/request');
    expect(result.searchParams.get('method')).toBe('openDapp');
    expect(result.searchParams.get('from')).toBe('browser');
    expect(JSON.parse(atob(result.searchParams.get('data') ?? ''))).toEqual([dappUrl]);
  });

  test('rejects non-HTTPS URLs', () => {
    expect(() => createUniSatMobileLink('http://example.com')).toThrow('must use HTTPS');
  });

  test('rejects invalid URLs and embedded credentials', () => {
    expect(() => createUniSatMobileLink('not-a-url')).toThrow('valid HTTPS URL');
    expect(() => createUniSatMobileLink('https://user:pass@example.com')).toThrow('must not contain credentials');
  });
});
