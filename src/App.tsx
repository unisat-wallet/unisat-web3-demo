import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { Button, Input, message, Radio, Tag } from 'antd';
import { CHAINS_MAP, ChainType } from './const';
import { copyToClipboard, satoshisToAmount } from './utils';
import { useWallet } from '@unisat/wallet-connect-react';
import { CATEGORY_LABELS, DEMOS, getDemosByCategory } from './demos';
import type { DemoCategory } from './demos';

type AppProps = {
  initialChainType?: ChainType;
  onBeforeConnect?: () => Promise<void>;
  onChainTypeChange?: (chainType: ChainType) => void;
};

const CATEGORY_DESCRIPTIONS: Record<DemoCategory, string> = {
  wallet: 'Connection & state',
  signing: 'Messages & PSBTs',
  transaction: 'Bitcoin & assets',
  rgb: 'Experimental assets',
  webrgb: 'WebRGB v1 interfaces',
  broadcast: 'Publish to network',
  advanced: 'Power-user tools',
};

const truncate = (value?: string, head = 8, tail = 6) => {
  if (!value) return 'Not connected';
  return value.length > head + tail ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;
};

function App({
  initialChainType = ChainType.BITCOIN_MAINNET,
  onBeforeConnect,
  onChainTypeChange,
}: AppProps) {
  const { account, wallet, isConnecting, isInitialized, connect, disconnect } = useWallet();
  const connected = Boolean(account);
  const [balanceV2, setBalanceV2] = useState({ available: 0, unavailable: 0, total: 0 });
  const [network, setNetwork] = useState('livenet');
  const [version, setVersion] = useState('');
  const [chainType, setChainType] = useState<ChainType>(initialChainType);
  const [selectedDemoKey, setSelectedDemoKey] = useState(DEMOS[0]?.config.key ?? '');
  const [search, setSearch] = useState('');
  const [messageApi, contextHolder] = message.useMessage();
  const workspaceRef = useRef<HTMLElement>(null);

  const chain = CHAINS_MAP[chainType];
  const demosByCategory = useMemo(() => getDemosByCategory(), []);
  const selectedDemo = DEMOS.find((demo) => demo.config.key === selectedDemoKey) ?? DEMOS[0];
  const SelectedDemo = selectedDemo.component;

  useEffect(() => {
    setChainType(initialChainType);
  }, [initialChainType]);

  useEffect(() => {
    workspaceRef.current?.scrollTo?.({ top: 0 });
  }, [selectedDemoKey]);

  const getBasicInfo = useCallback(async () => {
    const unisat = (window as any).unisat;
    if (!unisat) return;

    try {
      const [balance, nextChain, nextNetwork, nextVersion] = await Promise.all([
        unisat.getBalanceV2(),
        unisat.getChain(),
        unisat.getNetwork(),
        unisat.getVersion(),
      ]);
      setBalanceV2(balance);
      setChainType(nextChain.enum);
      onChainTypeChange?.(nextChain.enum);
      setNetwork(nextNetwork);
      setVersion(nextVersion);
    } catch (error) {
      console.log('Failed to refresh wallet info', error);
    }
  }, [onChainTypeChange]);

  useEffect(() => {
    if (account) void getBasicInfo();
  }, [account, getBasicInfo]);

  useEffect(() => {
    const unisat = (window as any).unisat;
    if (!unisat) return;

    const handleNetworkChanged = () => void getBasicInfo();
    const handleChainChanged = (nextChain: { enum: ChainType }) => {
      setChainType(nextChain.enum);
      onChainTypeChange?.(nextChain.enum);
      void getBasicInfo();
    };

    unisat.on('networkChanged', handleNetworkChanged);
    unisat.on('chainChanged', handleChainChanged);
    return () => {
      unisat.removeListener('networkChanged', handleNetworkChanged);
      unisat.removeListener('chainChanged', handleChainChanged);
    };
  }, [getBasicInfo, onChainTypeChange]);

  const handleConnect = async () => {
    await onBeforeConnect?.();
    connect();
  };

  const switchChain = async (nextChainType: ChainType) => {
    const unisat = (window as any).unisat;
    if (!unisat) {
      messageApi.error('UniSat Wallet is not available.');
      return;
    }
    try {
      const nextChain = await unisat.switchChain(nextChainType);
      setChainType(nextChain.enum);
      onChainTypeChange?.(nextChain.enum);
    } catch (error) {
      messageApi.error((error as Error).message);
    }
  };

  if (!isInitialized || !selectedDemo) {
    return <main className="app-loading">Loading wallet workspace…</main>;
  }

  return (
    <main className="app-shell">
      {contextHolder}
      <header className="app-topbar">
        <div className="brand">
          <div className="brand-mark"><img src={`${import.meta.env.BASE_URL}unisat-logo.svg`} alt="" /></div>
          <div>
            <strong>UniSat Wallet Integration Demo</strong>
            <span>dApp integration playground</span>
          </div>
        </div>

        <div className="topbar-actions">
          <Tag className="network-tag" color={connected ? 'processing' : 'default'}>
            <span className="status-dot" />{connected ? chain?.label : 'Wallet not connected'}
          </Tag>
          {connected && (
            <button
              className="account-chip"
              type="button"
              onClick={() => {
                if (account) {
                  copyToClipboard(account.address);
                  messageApi.success('Address copied.');
                }
              }}
              title="Copy wallet address"
            >
              {truncate(account?.address)}
            </button>
          )}
          {connected ? (
            <Button onClick={disconnect}>Disconnect</Button>
          ) : (
            <Button type="primary" loading={isConnecting} onClick={() => void handleConnect()}>
              Connect wallet
            </Button>
          )}
        </div>
      </header>

      <div className="app-layout">
        <aside className="api-explorer" aria-label="API Explorer">
          <div className="explorer-heading">
            <div>
              <span className="eyebrow">API EXPLORER</span>
              <h1>Try an API</h1>
            </div>
            <span className="demo-count">{DEMOS.length}</span>
          </div>
          <Input
            className="api-search"
            aria-label="Search APIs"
            placeholder="Search APIs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            allowClear
          />

          <nav className="api-nav">
            {Array.from(demosByCategory.entries()).map(([category, demos]) => {
              const filteredDemos = demos.filter((demo) => {
                const query = search.toLowerCase();
                return !query || [demo.config.title, demo.config.apiMethod, demo.config.description]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes(query);
              });
              if (!filteredDemos.length) return null;
              const categoryIsActive = selectedDemo.config.category === category;
              return (
                <section className="api-group" key={category}>
                  <button
                    className={`api-group-label ${categoryIsActive ? 'is-active' : ''}`}
                    type="button"
                    onClick={() => setSelectedDemoKey(filteredDemos[0].config.key)}
                    aria-label={`Open ${CATEGORY_LABELS[category]} APIs`}
                  >
                    <div>
                      <strong>{CATEGORY_LABELS[category]}</strong>
                      <span>{CATEGORY_DESCRIPTIONS[category]}</span>
                    </div>
                    <span className="api-group-count">{filteredDemos.length} <b aria-hidden="true">›</b></span>
                  </button>
                  {filteredDemos.map((demo) => (
                    <button
                      className={`api-item ${selectedDemo.config.key === demo.config.key ? 'is-selected' : ''}`}
                      key={demo.config.key}
                      type="button"
                      onClick={() => setSelectedDemoKey(demo.config.key)}
                    >
                      <span><i aria-hidden="true">↳</i>{demo.config.title}</span>
                      <code>{demo.config.apiMethod}</code>
                    </button>
                  ))}
                </section>
              );
            })}
          </nav>

          <section className="session-panel">
            <div className="session-panel-title">
              <span>Session</span>
              {wallet && <small>via {wallet.config.name}</small>}
            </div>
            <div className="session-row"><span>Chain</span><strong>{chain?.label}</strong></div>
            <div className="session-row"><span>Network</span><strong>{network}</strong></div>
            <div className="session-row"><span>Balance</span><strong>{connected ? `${satoshisToAmount(balanceV2.total)} ${chain?.unit}` : '—'}</strong></div>
          </section>
        </aside>

        <section className="workspace" ref={workspaceRef}>
          <div className="workspace-intro">
            <div>
              <div className="breadcrumbs">{CATEGORY_LABELS[selectedDemo.config.category]} <span>/</span> {selectedDemo.config.title}</div>
              <h2>{selectedDemo.config.title}</h2>
              <p>{selectedDemo.config.description}</p>
            </div>
            {!connected && <div className="connection-hint">Connect a wallet to send requests</div>}
          </div>

          <section className="environment-panel" aria-label="Wallet environment">
            <div className="environment-header">
              <div>
                <span className="eyebrow">WALLET ENVIRONMENT</span>
                <h3>{connected ? 'Connected wallet' : 'Preview mode'}</h3>
              </div>
              {version && <span className="version">v{version}</span>}
            </div>
            <div className="environment-grid">
              <div className="environment-control">
                <span>Chain</span>
                <Radio.Group value={chainType} onChange={(event) => void switchChain(event.target.value)} disabled={!connected}>
                  {Object.values(CHAINS_MAP).map((availableChain) => (
                    <Radio.Button key={availableChain.enum} value={availableChain.enum}>{availableChain.label.replace('Bitcoin ', '')}</Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </div>
          </section>

          <section className="demo-workspace">
            <SelectedDemo />
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
