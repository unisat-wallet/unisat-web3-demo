import { useEffect, useState } from 'react';

export type WebRgbEvent = 'transferReceived' | 'transferSettled';

export type WebRgbProvider = {
  enabled: boolean;
  enable(): Promise<void>;
  getInfo(): Promise<any>;
  getAddress(): Promise<{ address: string }>;
  blindReceive(args?: Record<string, unknown>): Promise<any>;
  witnessReceive(args?: Record<string, unknown>): Promise<any>;
  listAssets(): Promise<any[]>;
  getAssetBalance(assetId: string): Promise<any>;
  decodeRgbInvoice(invoice: string): Promise<any>;
  sendAsset(args: Record<string, unknown>): Promise<any>;
  listTransfers(assetId?: string): Promise<any[]>;
  getTransferStatus(transferId: string, assetId?: string): Promise<any>;
  on(event: WebRgbEvent, listener: (transfer: any) => void): void;
  off(event: WebRgbEvent, listener: (transfer: any) => void): void;
};

export type WebRgbProviderOption = {
  id: string;
  name: string;
  rdns?: string;
  provider: WebRgbProvider;
};

type ProviderAnnouncement = {
  info?: { name?: string; rdns?: string; uuid?: string };
  provider?: WebRgbProvider;
};

const SELECTED_PROVIDER_STORAGE_KEY = 'unisat_web3_demo_webrgb_provider';

const providerMethods: (keyof WebRgbProvider)[] = [
  'enable',
  'getInfo',
  'getAddress',
  'blindReceive',
  'witnessReceive',
  'listAssets',
  'getAssetBalance',
  'decodeRgbInvoice',
  'sendAsset',
  'listTransfers',
  'getTransferStatus',
  'on',
  'off',
];

function isWebRgbProvider(value: unknown): value is WebRgbProvider {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<WebRgbProvider>;
  return typeof candidate.enabled === 'boolean' &&
    providerMethods.every((method) => typeof candidate[method] === 'function');
}

function readSelectedProviderId() {
  try {
    return localStorage.getItem(SELECTED_PROVIDER_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function useWebRgbProvider() {
  const [providers, setProviders] = useState<WebRgbProviderOption[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState(readSelectedProviderId);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const registerProvider = (
      nextProvider: unknown,
      info: ProviderAnnouncement['info'] = {},
      fallbackName = 'Discovered wallet',
    ) => {
      if (!isWebRgbProvider(nextProvider)) return;

      setProviders((current) => {
        if (current.some((option) => option.provider === nextProvider)) return current;

        const baseId = info?.rdns || info?.uuid || fallbackName;
        const existingIds = new Set(current.map((option) => option.id));
        let id = baseId;
        let suffix = 2;
        while (existingIds.has(id)) {
          id = `${baseId}:${suffix}`;
          suffix += 1;
        }

        return [
          ...current,
          {
            id,
            name: info?.name || info?.rdns || fallbackName,
            rdns: info?.rdns,
            provider: nextProvider,
          },
        ];
      });
    };

    registerProvider((window as any).rgb, { name: 'window.rgb' }, 'window.rgb');

    const announce = (event: Event) => {
      const detail = (event as CustomEvent<ProviderAnnouncement>).detail;
      registerProvider(detail?.provider, detail?.info);
    };

    window.addEventListener('rgb:announceProvider', announce);
    window.dispatchEvent(new Event('rgb:requestProvider'));
    return () => window.removeEventListener('rgb:announceProvider', announce);
  }, []);

  const selectedOption = providers.find((option) => option.id === selectedProviderId);
  const automaticOption = !selectedProviderId && providers.length === 1 ? providers[0] : undefined;
  const activeOption = selectedOption || automaticOption;
  const provider = activeOption?.provider;

  useEffect(() => {
    setEnabled(Boolean(provider?.enabled));
  }, [provider]);

  const selectProvider = (id: string) => {
    if (!providers.some((option) => option.id === id)) return;
    setSelectedProviderId(id);
    try {
      localStorage.setItem(SELECTED_PROVIDER_STORAGE_KEY, id);
    } catch {
      // Selection still works for the current page when storage is unavailable.
    }
  };

  return {
    provider,
    providerName: activeOption?.name || '',
    providers,
    selectedProviderId: activeOption?.id || '',
    selectProvider,
    enabled,
    setEnabled,
  };
}

export function requireWebRgb(provider?: WebRgbProvider): WebRgbProvider {
  if (!provider) throw new Error('No WebRGB provider discovered');
  if (!provider.enabled) throw new Error('Enable WebRGB before calling this interface');
  return provider;
}
