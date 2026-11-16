import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useWebRgbProvider, type WebRgbProvider } from './provider';

function createProvider(): WebRgbProvider {
  return {
    enabled: false,
    enable: vi.fn().mockResolvedValue(undefined),
    getInfo: vi.fn().mockResolvedValue({}),
    getAddress: vi.fn().mockResolvedValue({ address: 'rgb:test' }),
    blindReceive: vi.fn().mockResolvedValue({}),
    witnessReceive: vi.fn().mockResolvedValue({}),
    listAssets: vi.fn().mockResolvedValue([]),
    getAssetBalance: vi.fn().mockResolvedValue({}),
    decodeRgbInvoice: vi.fn().mockResolvedValue({}),
    sendAsset: vi.fn().mockResolvedValue({}),
    listTransfers: vi.fn().mockResolvedValue([]),
    getTransferStatus: vi.fn().mockResolvedValue({}),
    on: vi.fn(),
    off: vi.fn(),
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

  act(() => announce({ enabled: false, enable: vi.fn() }, 'Fake wallet', 'fake.wallet'));

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
