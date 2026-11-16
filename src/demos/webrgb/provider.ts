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

type ProviderAnnouncement = {
  info?: { name?: string; rdns?: string; uuid?: string };
  provider?: WebRgbProvider;
};

export function useWebRgbProvider() {
  const [provider, setProvider] = useState<WebRgbProvider>();
  const [providerName, setProviderName] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const selectProvider = (nextProvider: WebRgbProvider, name: string) => {
      setProvider((current) => current || nextProvider);
      setProviderName((current) => current || name);
      setEnabled(nextProvider.enabled);
    };

    const globalProvider = (window as any).rgb as WebRgbProvider | undefined;
    if (globalProvider) selectProvider(globalProvider, 'window.rgb');

    const announce = (event: Event) => {
      const detail = (event as CustomEvent<ProviderAnnouncement>).detail;
      if (!detail?.provider) return;
      selectProvider(detail.provider, detail.info?.name || detail.info?.rdns || 'Discovered wallet');
    };

    window.addEventListener('rgb:announceProvider', announce);
    window.dispatchEvent(new Event('rgb:requestProvider'));
    return () => window.removeEventListener('rgb:announceProvider', announce);
  }, []);

  return { provider, providerName, enabled, setEnabled };
}

export function requireWebRgb(provider?: WebRgbProvider): WebRgbProvider {
  if (!provider) throw new Error('No WebRGB provider discovered');
  if (!provider.enabled) throw new Error('Enable WebRGB before calling this interface');
  return provider;
}
