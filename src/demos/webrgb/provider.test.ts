import { act, renderHook } from '@testing-library/react';
import { useWebRgbProvider, type WebRgbProvider } from './provider';

function createProvider(): WebRgbProvider {
  return {
    enabled: false,
    enable: jest.fn().mockResolvedValue(undefined),
    getInfo: jest.fn().mockResolvedValue({}),
    getAddress: jest.fn().mockResolvedValue({ address: 'rgb:test' }),
    blindReceive: jest.fn().mockResolvedValue({}),
    witnessReceive: jest.fn().mockResolvedValue({}),
    listAssets: jest.fn().mockResolvedValue([]),
    getAssetBalance: jest.fn().mockResolvedValue({}),
    decodeRgbInvoice: jest.fn().mockResolvedValue({}),
    sendAsset: jest.fn().mockResolvedValue({}),
    listTransfers: jest.fn().mockResolvedValue([]),
    getTransferStatus: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    off: jest.fn(),
  };
}

function announce(provider: unknown, name: string, rdns: string) {
  window.dispatchEvent(new CustomEvent('rgb:announceProvider', {
    detail: { provider, info: { name, rdns } },
  }));
}

beforeEach(() => {
  localStorage.removeItem('unisat_web3_demo_webrgb_provider');
  delete (window as any).rgb;
});

test('ignores announcements that do not implement the WebRGB interface', () => {
  const { result } = renderHook(() => useWebRgbProvider());

  act(() => announce({ enabled: false, enable: jest.fn() }, 'Fake wallet', 'fake.wallet'));

  expect(result.current.providers).toHaveLength(0);
  expect(result.current.provider).toBeUndefined();
});

test('requires an explicit selection when multiple providers respond', () => {
  const first = createProvider();
  const second = createProvider();
  const { result } = renderHook(() => useWebRgbProvider());

  act(() => announce(first, 'First wallet', 'first.wallet'));
  expect(result.current.provider).toBe(first);

  act(() => announce(second, 'Second wallet', 'second.wallet'));
  expect(result.current.providers).toHaveLength(2);
  expect(result.current.provider).toBeUndefined();

  act(() => result.current.selectProvider('second.wallet'));
  expect(result.current.provider).toBe(second);
  expect(localStorage.getItem('unisat_web3_demo_webrgb_provider')).toBe('second.wallet');
});
