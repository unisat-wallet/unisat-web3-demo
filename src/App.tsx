import { useEffect, useState } from 'react';
import './App.css';
import { Button, Card, Collapse, Radio, Tabs } from 'antd';
import { CHAINS_MAP, ChainType } from './const';
import { copyToClipboard, satoshisToAmount } from './utils';
import useMessage from 'antd/es/message/useMessage';
import { useWallet } from '@unisat/wallet-connect-react';
import { getDemosByCategory, CATEGORY_LABELS } from './demos';

function App() {
  const { account, wallet, isConnecting, isInitialized, connect, disconnect } = useWallet();
  const connected = !!account;

  const [balanceV2, setBalanceV2] = useState({
    available: 0,
    unavailable: 0,
    total: 0,
  });
  const [network, setNetwork] = useState('livenet');
  const [version, setVersion] = useState('');
  const [chainType, setChainType] = useState<ChainType>(ChainType.BITCOIN_MAINNET);

  const chain = CHAINS_MAP[chainType];
  const [messageApi, contextHolder] = useMessage();

  const getBasicInfo = async () => {
    const unisat = (window as any).unisat;
    if (!unisat) return;

    try {
      const balanceV2 = await unisat.getBalanceV2();
      setBalanceV2(balanceV2);
    } catch (e) {
      console.log('getBalanceV2 error', e);
    }

    try {
      const chain = await unisat.getChain();
      setChainType(chain.enum);
    } catch (e) {
      console.log('getChain error', e);
    }

    try {
      const network = await unisat.getNetwork();
      setNetwork(network);
    } catch (e) {
      console.log('getNetwork error', e);
    }

    try {
      const version = await unisat.getVersion();
      setVersion(version);
    } catch (e) {
      console.log('getVersion error ', e);
    }
  };

  useEffect(() => {
    if (account) {
      getBasicInfo();
    }
  }, [account]);

  useEffect(() => {
    const unisat = (window as any).unisat;
    if (!unisat) return;

    const handleNetworkChanged = (network: string) => {
      setNetwork(network);
      getBasicInfo();
    };

    const handleChainChanged = (chain: { enum: ChainType; name: string; network: string }) => {
      setChainType(chain.enum);
      getBasicInfo();
    };

    unisat.on('networkChanged', handleNetworkChanged);
    unisat.on('chainChanged', handleChainChanged);

    return () => {
      unisat.removeListener('networkChanged', handleNetworkChanged);
      unisat.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="App">
        <header className="App-header">
          {contextHolder}
          <div>Loading wallets...</div>
        </header>
      </div>
    );
  }

  const unisat = (window as any).unisat;

  // Build demo tabs from registry
  const demosByCategory = getDemosByCategory();
  const tabItems = Array.from(demosByCategory.entries()).map(([category, demos]) => ({
    key: category,
    label: CATEGORY_LABELS[category],
    children: (
      <Collapse accordion>
        {demos.map((demo) => (
          <Collapse.Panel
            key={demo.config.key}
            header={
              <div style={{ textAlign: 'start' }}>
                {demo.config.apiMethod || demo.config.title}
              </div>
            }
          >
            <demo.component />
          </Collapse.Panel>
        ))}
      </Collapse>
    ),
  }));

  const chains = Object.keys(CHAINS_MAP).map((key) => {
    const chain = CHAINS_MAP[key as ChainType];
    return {
      label: chain.label,
      value: chain.enum,
    };
  });

  const supportLegacyNetworks = ['livenet', 'testnet'];

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <div style={{ minWidth: 100 }}>
            {wallet && (
              <span style={{ fontSize: 12, color: '#888' }}>
                via {wallet.config.name}
              </span>
            )}
          </div>
          <p>UniSat Wallet Demo</p>
          <div style={{ minWidth: 100 }}>
            {connected && (
              <Button onClick={disconnect}>
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {contextHolder}
        {connected && account ? (
          <div className="wallet-info-container">
            <div className="info-cards-container">
              <Card size="small" title="Wallet Info" style={{ flex: 1 }}>
                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>Version:</div>
                  <div style={{ wordWrap: 'break-word' }}>{version}</div>
                </div>

                {chain && (
                  <div style={{ textAlign: 'left', marginTop: 10 }}>
                    <div style={{ fontWeight: 'bold' }}>Chain:</div>
                    <Radio.Group
                      onChange={async (e) => {
                        if (!unisat) return;
                        try {
                          const chain = await unisat.switchChain(e.target.value);
                          setChainType(chain.enum);
                        } catch (e) {
                          messageApi.error((e as any).message);
                        }
                      }}
                      value={chain.enum}
                    >
                      {chains.map((chain) => (
                        <Radio key={chain.value} value={chain.value}>
                          {chain.label}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </div>
                )}

                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>Network:</div>
                  {supportLegacyNetworks.includes(network) ? (
                    <Radio.Group
                      onChange={async (e) => {
                        if (!unisat) return;
                        try {
                          const network = await unisat.switchNetwork(e.target.value);
                          setNetwork(network);
                        } catch (e) {
                          messageApi.error((e as any).message);
                        }
                      }}
                      value={network}
                    >
                      <Radio value={'livenet'}>livenet</Radio>
                      <Radio value={'testnet'}>testnet</Radio>
                    </Radio.Group>
                  ) : (
                    <div>
                      <p style={{ fontSize: 12, color: '#888' }}>
                        Use "unisat.getChain" for non-legacy networks
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card size="small" title="Account Info" style={{ flex: 1 }}>
                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>Address:</div>
                  <div
                    style={{ wordWrap: 'break-word', cursor: 'pointer' }}
                    onClick={() => {
                      copyToClipboard(account.address);
                      messageApi.success('Address Copied.');
                    }}
                  >
                    {account.address}
                  </div>
                </div>

                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>PublicKey:</div>
                  <div
                    style={{ wordWrap: 'break-word', cursor: 'pointer' }}
                    onClick={() => {
                      copyToClipboard(account.pubKey);
                      messageApi.success('PublicKey Copied.');
                    }}
                  >
                    {account.pubKey}
                  </div>
                </div>

                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>Balance</div>
                  <div style={{ wordWrap: 'break-word' }}>
                    <div>
                      Available: {satoshisToAmount(balanceV2.available)} {chain && chain.unit}
                    </div>
                    <div>
                      Unavailable: {satoshisToAmount(balanceV2.unavailable)} {chain && chain.unit}
                    </div>
                    <div>
                      Total: {satoshisToAmount(balanceV2.total)} {chain && chain.unit}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="demos-container">
              <Tabs items={tabItems} />
            </div>
          </div>
        ) : (
          <div>
            <Button
              onClick={connect}
              loading={isConnecting}
              type="primary"
              size="large"
            >
              Connect Wallet
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
