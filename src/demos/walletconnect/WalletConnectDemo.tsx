import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Input, Select, Space, Tag } from 'antd';
import QRCode from 'qrcode';
import {
  connectWalletConnect,
  createWalletConnectProvider,
  type WalletConnectProvider,
  type WalletConnectSession,
} from '@utexo/webrgb-walletconnect';
import { copyToClipboard } from '../../utils';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';
import { getWalletConnectClient, walletConnectProjectId } from './client';
import {
  BITCOIN_CHAINS,
  BITCOIN_METHODS,
  createUniSatWalletConnectLink,
  findSession,
  RGB_METHODS,
  rgbNetworkFromSession,
  sessionIdentity,
} from './protocol';

type PendingConnection = {
  kind: 'Bitcoin' | 'RGB';
  uri: string;
  qrCode: string;
  cancel(): Promise<void>;
};

type WalletConnectSignClient = Awaited<ReturnType<typeof getWalletConnectClient>>;

const STANDARD_PARAMS: Record<(typeof BITCOIN_METHODS)[number], object> = {
  getAccountAddresses: {},
  signMessage: { message: 'UniSat WalletConnect test', protocol: 'bip322' },
  signPsbt: { psbt: '', signInputs: [], broadcast: false },
  sendTransfer: { recipientAddress: '', amount: '1000' },
};

const RGB_PARAMS: Record<string, object> = {
  getInfo: {},
  getAddress: {},
  blindReceive: {},
  witnessReceive: {},
  listAssets: {},
  getAssetBalance: { assetId: '' },
  sendAsset: { invoice: '', feeRate: 1 },
  burnAsset: {
    assetId: '',
    amount: 1,
    feeRate: 1,
    minConfirmations: 3,
    burnDestination: {
      version: 1,
      chainId: 'eip155:1',
      address: '0x0000000000000000000000000000000000000000',
      dstEid: 30101,
    },
  },
  getConsignment: { transferId: '', assetId: '' },
  getReceivedMint: { invoice: '' },
  listTransfers: {},
  getTransferStatus: { transferId: '', assetId: '' },
  decodeRgbInvoice: { invoice: '' },
};

const stringify = (value: unknown) => JSON.stringify(value, null, 2);

function pairingTopic(uri: string) {
  return /^wc:([^@]+)@/.exec(uri)?.[1];
}

function parseObject(value: string) {
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Request params must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

export const bitcoinWalletConnectConfig: DemoConfig = {
  key: 'bitcoinWalletConnect',
  title: 'WalletConnect — Bitcoin',
  category: 'mobile',
  apiMethod: 'WalletConnect v2 / bip122',
  description: 'Connect and test a standard Bitcoin WalletConnect session with UniSat Mobile.',
};

export const rgbWalletConnectConfig: DemoConfig = {
  key: 'rgbWalletConnect',
  title: 'WalletConnect — RGB',
  category: 'mobile',
  apiMethod: 'WalletConnect v2 / webrgb:1',
  description: 'Connect and test an independent WebRGB WalletConnect session with UniSat Mobile.',
};

type WalletConnectDemoProps = {
  mode: 'bitcoin' | 'rgb';
};

function WalletConnectDemo({ mode }: WalletConnectDemoProps) {
  const [client, setClient] = useState<WalletConnectSignClient>();
  const [initializationError, setInitializationError] = useState('');
  const [standardSession, setStandardSession] = useState<WalletConnectSession>();
  const [rgbSession, setRgbSession] = useState<WalletConnectSession>();
  const [rgbProvider, setRgbProvider] = useState<WalletConnectProvider>();
  const rgbProviderRef = useRef<WalletConnectProvider>();
  const [pending, setPending] = useState<PendingConnection>();
  const pendingRef = useRef<PendingConnection>();
  const [bitcoinChain, setBitcoinChain] = useState<string>(BITCOIN_CHAINS.mainnet);
  const [rgbNetwork, setRgbNetwork] = useState('mainnet');
  const [bitcoinMethod, setBitcoinMethod] = useState<(typeof BITCOIN_METHODS)[number]>('getAccountAddresses');
  const [bitcoinParams, setBitcoinParams] = useState(stringify(STANDARD_PARAMS.getAccountAddresses));
  const [rgbMethod, setRgbMethod] = useState('getInfo');
  const [rgbParams, setRgbParams] = useState(stringify(RGB_PARAMS.getInfo));
  const { result, execute, isLoading } = useDemoExecution();

  const replaceRgbProvider = useCallback((next?: WalletConnectProvider) => {
    if (rgbProviderRef.current && rgbProviderRef.current !== next) {
      rgbProviderRef.current.dispose();
    }
    rgbProviderRef.current = next;
    setRgbProvider(next);
  }, []);

  const refreshSessions = useCallback((nextClient: WalletConnectSignClient) => {
    const sessions = nextClient.session.getAll() as WalletConnectSession[];
    if (mode === 'bitcoin') {
      setStandardSession(findSession(sessions, 'bip122'));
      return;
    }
    const nextRgb = findSession(sessions, 'rgb');
    setRgbSession(nextRgb);
    if (!nextRgb) {
      replaceRgbProvider();
      return;
    }
    if (rgbProviderRef.current?.topic === nextRgb.topic) return;
    replaceRgbProvider(createWalletConnectProvider({
      client: nextClient,
      topic: nextRgb.topic,
      network: rgbNetworkFromSession(nextRgb),
    }));
  }, [mode, replaceRgbProvider]);

  useEffect(() => {
    let active = true;
    const sessionChanged = () => {
      if (active) void getWalletConnectClient().then(refreshSessions);
    };
    void getWalletConnectClient().then((nextClient) => {
      if (!active) return;
      setClient(nextClient);
      refreshSessions(nextClient);
      nextClient.on('session_delete', sessionChanged);
      nextClient.on('session_expire', sessionChanged);
      nextClient.on('session_update', sessionChanged);
    }).catch((error) => {
      if (active) setInitializationError(error instanceof Error ? error.message : String(error));
    });
    return () => {
      active = false;
      void getWalletConnectClient().then((nextClient) => {
        nextClient.off('session_delete', sessionChanged);
        nextClient.off('session_expire', sessionChanged);
        nextClient.off('session_update', sessionChanged);
      });
      pendingRef.current?.cancel().catch(() => {});
      pendingRef.current = undefined;
      if (mode === 'rgb') {
        rgbProviderRef.current?.dispose();
        rgbProviderRef.current = undefined;
      }
    };
  }, [mode, refreshSessions]);

  const showPairing = useCallback(async (
    kind: PendingConnection['kind'],
    uri: string | undefined,
    cancel: () => Promise<void>,
  ) => {
    if (!uri) return;
    const connection: PendingConnection = {
      kind,
      uri,
      qrCode: await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', margin: 2, width: 280 }),
      cancel,
    };
    pendingRef.current = connection;
    setPending(connection);
  }, []);

  const clearPairing = useCallback(() => {
    pendingRef.current = undefined;
    setPending(undefined);
  }, []);

  const run = (operation: () => Promise<unknown>) =>
    execute(operation, stringify).catch(() => undefined);

  const connectBitcoin = () => run(async () => {
    if (!client) throw new Error('WalletConnect SignClient is still initializing.');
    const connection = await client.connect({
      optionalNamespaces: {
        bip122: {
          chains: [bitcoinChain],
          methods: [...BITCOIN_METHODS],
          events: ['accountsChanged', 'chainChanged'],
        },
      },
    });
    await showPairing('Bitcoin', connection.uri, async () => {
      const topic = connection.uri && pairingTopic(connection.uri);
      if (topic) await client.core.pairing.disconnect({ topic });
    });
    try {
      const session = await connection.approval() as WalletConnectSession;
      setStandardSession(session);
      return { connected: true, topic: session.topic, namespace: 'bip122' };
    } finally {
      clearPairing();
    }
  });

  const connectRgb = () => run(async () => {
    if (!client) throw new Error('WalletConnect SignClient is still initializing.');
    const connection = await connectWalletConnect({
      client,
      network: rgbNetwork,
      methods: [...RGB_METHODS],
      events: [],
    });
    await showPairing('RGB', connection.uri, () => connection.cancel());
    try {
      const provider = await connection.approval();
      await provider.enable();
      replaceRgbProvider(provider);
      setRgbSession(client.session.get(provider.topic) as WalletConnectSession);
      return { connected: true, topic: provider.topic, chainId: provider.chainId };
    } finally {
      clearPairing();
    }
  });

  const requestBitcoin = () => run(async () => {
    if (!client || !standardSession) throw new Error('Connect the Bitcoin WalletConnect session first.');
    const identity = sessionIdentity(standardSession, 'bip122');
    if (!identity) throw new Error('The Bitcoin session has no approved account.');
    const params = parseObject(bitcoinParams);
    if (params.account === undefined) params.account = identity.account;
    return client.request({
      topic: standardSession.topic,
      chainId: identity.chainId,
      request: { method: bitcoinMethod, params },
    });
  });

  const requestRgb = () => run(async () => {
    if (!rgbProvider) throw new Error('Connect the RGB WalletConnect session first.');
    const params = parseObject(rgbParams);
    const provider = rgbProvider as unknown as Record<string, (...args: any[]) => Promise<unknown>>;
    switch (rgbMethod) {
      case 'getInfo':
      case 'getAddress':
      case 'listAssets':
        return provider[rgbMethod]();
      case 'getAssetBalance':
        return provider.getAssetBalance(String(params.assetId || ''));
      case 'listTransfers':
        return provider.listTransfers(params.assetId ? String(params.assetId) : undefined);
      case 'getTransferStatus':
        return provider.getTransferStatus(String(params.transferId || ''), params.assetId ? String(params.assetId) : undefined);
      case 'decodeRgbInvoice':
        return provider.decodeRgbInvoice(String(params.invoice || ''));
      default: {
        const method = provider[rgbMethod];
        if (typeof method !== 'function') throw new Error(`RGB provider does not expose ${rgbMethod}.`);
        return method(params);
      }
    }
  });

  const disconnectBitcoin = () => run(async () => {
    if (!client || !standardSession) return { disconnected: false };
    await client.disconnect({
      topic: standardSession.topic,
      reason: { code: 6000, message: 'User disconnected the demo session' },
    });
    setStandardSession(undefined);
    return { disconnected: true };
  });

  const disconnectRgb = () => run(async () => {
    if (!rgbProvider) return { disconnected: false };
    await rgbProvider.disconnect();
    replaceRgbProvider();
    setRgbSession(undefined);
    return { disconnected: true };
  });

  const standardIdentity = useMemo(() => sessionIdentity(standardSession, 'bip122'), [standardSession]);
  const rgbIdentity = useMemo(() => sessionIdentity(rgbSession, 'rgb'), [rgbSession]);

  return (
    <DemoCard config={mode === 'bitcoin' ? bitcoinWalletConnectConfig : rgbWalletConnectConfig} result={result}>
      <Alert
        type="info"
        showIcon
        message={mode === 'bitcoin' ? 'Standard Bitcoin WalletConnect session' : 'Independent RGB WalletConnect session'}
        description={mode === 'bitcoin'
          ? 'This demo uses the bip122 namespace. Its session can remain connected while a separate RGB session is active.'
          : 'This demo uses the webrgb:1 profile and does not reuse the Bitcoin session. Scan the raw QR on a second device or use the UniSat deep link on the same phone.'}
      />
      <div className="walletconnect-project-id">Reown Project ID: <code>{walletConnectProjectId()}</code></div>
      {initializationError && <Alert type="error" showIcon message="Unable to initialize SignClient" description={initializationError} />}

      {pending && (
        <section className="walletconnect-pairing" aria-label={`${pending.kind} WalletConnect pairing`}>
          <img src={pending.qrCode} alt={`${pending.kind} WalletConnect QR code`} />
          <div>
            <Tag color="processing">Waiting for {pending.kind} approval</Tag>
            <DemoField label="WalletConnect URI">
              <Input.TextArea value={pending.uri} readOnly autoSize={{ minRows: 3, maxRows: 6 }} />
            </DemoField>
            <Space wrap>
              <Button onClick={() => void copyToClipboard(pending.uri)}>Copy URI</Button>
              <Button type="primary" href={createUniSatWalletConnectLink(pending.uri)}>Open UniSat Mobile</Button>
              <Button danger onClick={() => void pending.cancel().finally(clearPairing)}>Cancel pairing</Button>
            </Space>
          </div>
        </section>
      )}

      {mode === 'bitcoin' && <section className="walletconnect-session-block">
        <div className="walletconnect-session-heading">
          <div><strong>Standard Bitcoin</strong><span>bip122</span></div>
          <Tag color={standardSession ? 'green' : 'default'}>{standardSession ? 'Connected' : 'Disconnected'}</Tag>
        </div>
        <DemoField label="Bitcoin network">
          <Select
            value={bitcoinChain}
            disabled={Boolean(standardSession) || isLoading}
            style={{ width: '100%' }}
            options={Object.entries(BITCOIN_CHAINS).map(([label, value]) => ({ label, value }))}
            onChange={setBitcoinChain}
          />
        </DemoField>
        {standardIdentity && <Alert type="success" showIcon message={standardIdentity.account} description={standardIdentity.chainId} />}
        <Space wrap>
          <Button type="primary" disabled={!client || Boolean(standardSession) || isLoading} onClick={connectBitcoin}>Connect Bitcoin</Button>
          <Button danger disabled={!standardSession || isLoading} onClick={disconnectBitcoin}>Disconnect Bitcoin</Button>
        </Space>
        <DemoField label="Bitcoin method">
          <Select
            value={bitcoinMethod}
            style={{ width: '100%' }}
            options={BITCOIN_METHODS.map((method) => ({ label: method, value: method }))}
            onChange={(method) => {
              setBitcoinMethod(method);
              setBitcoinParams(stringify(STANDARD_PARAMS[method]));
            }}
          />
        </DemoField>
        <DemoField label="Request params (JSON)">
          <Input.TextArea value={bitcoinParams} onChange={(event) => setBitcoinParams(event.target.value)} autoSize={{ minRows: 4, maxRows: 12 }} />
        </DemoField>
        <Button disabled={!standardSession || isLoading} onClick={requestBitcoin}>Send Bitcoin request</Button>
      </section>}

      {mode === 'rgb' && <section className="walletconnect-session-block">
        <div className="walletconnect-session-heading">
          <div><strong>RGB WalletConnect</strong><span>webrgb:1</span></div>
          <Tag color={rgbProvider ? 'green' : 'default'}>{rgbProvider ? 'Connected' : 'Disconnected'}</Tag>
        </div>
        <DemoField label="RGB network">
          <Select
            value={rgbNetwork}
            disabled={Boolean(rgbSession) || isLoading}
            style={{ width: '100%' }}
            options={['mainnet', 'testnet', 'testnet4', 'signet'].map((value) => ({ label: value, value }))}
            onChange={setRgbNetwork}
          />
        </DemoField>
        {rgbIdentity && <Alert type="success" showIcon message={rgbIdentity.account} description={rgbIdentity.chainId} />}
        <Space wrap>
          <Button type="primary" disabled={!client || Boolean(rgbSession) || isLoading} onClick={connectRgb}>Connect RGB</Button>
          <Button danger disabled={!rgbProvider || isLoading} onClick={disconnectRgb}>Disconnect RGB</Button>
        </Space>
        <DemoField label="RGB method">
          <Select
            value={rgbMethod}
            style={{ width: '100%' }}
            options={['getInfo', ...RGB_METHODS].map((method) => ({ label: method, value: method }))}
            onChange={(method) => {
              setRgbMethod(method);
              setRgbParams(stringify(RGB_PARAMS[method] || {}));
            }}
          />
        </DemoField>
        <DemoField label="Request params (JSON)">
          <Input.TextArea value={rgbParams} onChange={(event) => setRgbParams(event.target.value)} autoSize={{ minRows: 4, maxRows: 16 }} />
        </DemoField>
        <Button disabled={!rgbProvider || isLoading} onClick={requestRgb}>Send RGB request</Button>
      </section>}
    </DemoCard>
  );
}

export function BitcoinWalletConnectDemo() {
  return <WalletConnectDemo mode="bitcoin" />;
}

export function RgbWalletConnectDemo() {
  return <WalletConnectDemo mode="rgb" />;
}
