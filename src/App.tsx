import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Button, Card, CollapseProps, Input, Radio, message } from 'antd';
import { CHAINS_MAP, ChainType } from './const';
import { copyToClipboard, satoshisToAmount } from './utils';
import { SendBitcoinCard } from './components/SendBitcoinCard';
import { PushPsbtCard } from './components/PushPsbtCard';
import { PushTxCard } from './components/PushTxCard';
import { SignMessageCard } from './components/SignMessageCard';
import { SignPsbtCard } from './components/SignPsbtCard';
import { Collapse } from 'antd';
import { InscribeTransferCard } from './components/InscribeTransferCard';
import { SendInscriptionCard } from './components/SendInscriptionCard';
import { SendRunesCard } from './components/SendRunesCard';
import { MultiSignMessageCard } from './components/MultiSignMessageCard';
import { SignPsbtsCard } from './components/SignPsbtsCard';
import useMessage from 'antd/es/message/useMessage';

function App() {
  const [unisatInstalled, setUnisatInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [balanceV2, setBalanceV2] = useState({
    available: 0,
    unavailable: 0,
    total: 0,
  });
  const [network, setNetwork] = useState('livenet');

  const [version, setVersion] = useState('');

  const [chainType, setChainType] = useState<ChainType>(
    ChainType.BITCOIN_MAINNET
  );

  const chain = CHAINS_MAP[chainType];

  const getBasicInfo = async () => {
    const unisat = (window as any).unisat;

    try {
      const accounts = await unisat.getAccounts();
      setAccounts(accounts);
    } catch (e) {
      console.log('getAccounts error', e);
    }

    try {
      const publicKey = await unisat.getPublicKey();
      setPublicKey(publicKey);
    } catch (e) {
      console.log('getPublicKey error', e);
    }

    try {
      const balance = await unisat.getBalance();
      setBalance(balance);
    } catch (e) {
      console.log('getBalance error', e);
    }

    try {
      const balanceV2 = await unisat.getBalanceV2();
      setBalanceV2(balanceV2);
      console.log('BalanceV2:', balanceV2);
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

    if (unisat.getChain !== undefined) {
      try {
        const chain = await unisat.getChain();
        setChainType(chain.enum);
      } catch (e) {
        console.log('getChain error', e);
      }
    }
  };

  const selfRef = useRef<{ accounts: string[] }>({
    accounts: [],
  });
  const self = selfRef.current;
  const handleAccountsChanged = (_accounts: string[]) => {
    console.log('accounts changed', _accounts);
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setAddress(_accounts[0]);

      getBasicInfo();
    } else {
      setConnected(false);
    }
  };

  const handleNetworkChanged = (network: string) => {
    console.log('network changed', network);
    setNetwork(network);
    getBasicInfo();
  };

  const handleChainChanged = (chain: {
    enum: ChainType;
    name: string;
    network: string;
  }) => {
    console.log('chain changed', chain);
    setChainType(chain.enum);
    getBasicInfo();
  };

  useEffect(() => {
    async function checkUnisat() {
      let unisat = (window as any).unisat;

      for (let i = 1; i < 10 && !unisat; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100 * i));
        unisat = (window as any).unisat;
      }

      if (unisat) {
        setUnisatInstalled(true);
      } else if (!unisat) return;

      unisat
        .getAccounts()
        .then((accounts: string[]) => {
          // 主动获取一次账户信息
          handleAccountsChanged(accounts);
        })
        .catch((e: any) => {
          messageApi.error((e as any).message);
        });

      unisat.on('accountsChanged', handleAccountsChanged);
      unisat.on('networkChanged', handleNetworkChanged);
      unisat.on('chainChanged', handleChainChanged);

      return () => {
        unisat.removeListener('accountsChanged', handleAccountsChanged);
        unisat.removeListener('networkChanged', handleNetworkChanged);
        unisat.removeListener('chainChanged', handleChainChanged);
      };
    }

    checkUnisat().then();
  }, []);

  const [messageApi, contextHolder] = useMessage();

  if (!unisatInstalled) {
    return (
      <div className="App">
        <header className="App-header">
          {contextHolder}
          <div>
            <Button
              onClick={() => {
                window.location.href = 'https://unisat.io';
              }}
            >
              Install Unisat Wallet
            </Button>
          </div>
        </header>
      </div>
    );
  }

  const unisat = (window as any).unisat;

  const items: CollapseProps['items'] = [
    {
      key: 'sendBitcoin',
      label: <div style={{ textAlign: 'start' }}>unisat.sendBitcoin</div>,
      children: <SendBitcoinCard />,
    },
    {
      key: 'sendInscription',
      label: <div style={{ textAlign: 'start' }}>unisat.sendInscription</div>,
      children: <SendInscriptionCard />,
    },
    {
      key: 'sendRunes',
      label: <div style={{ textAlign: 'start' }}>unisat.sendRunes</div>,
      children: <SendRunesCard />,
    },
    {
      key: 'inscribeTransfer',
      label: <div style={{ textAlign: 'start' }}>unisat.inscribeTransfer</div>,
      children: <InscribeTransferCard />,
    },
    {
      key: 'signMessage',
      label: <div style={{ textAlign: 'start' }}>unisat.signMessage</div>,
      children: <SignMessageCard />,
    },
    {
      key: 'multiSignMessage',
      label: <div style={{ textAlign: 'start' }}>unisat.multiSignMessage</div>,
      children: <MultiSignMessageCard />,
    },
    {
      key: 'signPsbt',
      label: <div style={{ textAlign: 'start' }}>unisat.signPsbt</div>,
      children: <SignPsbtCard />,
    },
    {
      key: 'signPsbts',
      label: <div style={{ textAlign: 'start' }}>unisat.signPsbts</div>,
      children: <SignPsbtsCard />,
    },
    {
      key: 'pushPsbt',
      label: <div style={{ textAlign: 'start' }}>unisat.pushPsbt</div>,
      children: <PushPsbtCard />,
    },
    {
      key: 'pushTx',
      label: <div style={{ textAlign: 'start' }}>unisat.pushTx</div>,
      children: <PushTxCard />,
    },
  ];

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
          <div style={{ minWidth: 100 }}> </div>
          <p>Unisat Wallet Demo</p>
          <div style={{ minWidth: 100 }}>
            {connected ? (
              <Button
                onClick={async () => {
                  await unisat.disconnect();
                }}
              >
                disconnect
              </Button>
            ) : null}
          </div>
        </div>

        {contextHolder}
        {connected ? (
          <div className="wallet-info-container">
            <div className="info-cards-container">
              <Card size="small" title="Wallet Info" style={{ flex: 1 }}>
                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>Version:</div>
                  <div style={{ wordWrap: 'break-word' }}>{version}</div>
                </div>

                {chain ? (
                  <div style={{ textAlign: 'left', marginTop: 10 }}>
                    <div style={{ fontWeight: 'bold' }}>Chain:</div>
                    <Radio.Group
                      onChange={async (e) => {
                        try {
                          const chain = await unisat.switchChain(
                            e.target.value
                          );
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
                ) : null}

                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>Network:</div>
                  {supportLegacyNetworks.includes(network) ? (
                    <Radio.Group
                      onChange={async (e) => {
                        try {
                          const network = await unisat.switchNetwork(
                            e.target.value
                          );
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
                      <p>
                        "unisat.getNetwork" is legacy. Please use
                        "unisat.getChain" instead.{' '}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
              <Card size="small" title="Account Info" style={{ flex: 1 }}>
                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>Address:</div>
                  <div
                    style={{ wordWrap: 'break-word' }}
                    onClick={() => {
                      copyToClipboard(address);
                      messageApi.success('Address Copied.');
                    }}
                  >
                    {address}
                  </div>
                </div>

                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>PublicKey:</div>
                  <div
                    style={{ wordWrap: 'break-word' }}
                    onClick={() => {
                      copyToClipboard(publicKey);
                      messageApi.success('PublicKey Copied.');
                    }}
                  >
                    {publicKey}
                  </div>
                </div>

                <div style={{ textAlign: 'left', marginTop: 10 }}>
                  <div style={{ fontWeight: 'bold' }}>Balance </div>
                  <div style={{ wordWrap: 'break-word' }}>
                    <div>
                      Available: {satoshisToAmount(balanceV2.available)}{' '}
                      {chain && chain.unit}
                    </div>
                    <div>
                      Unavailable: {satoshisToAmount(balanceV2.unavailable)}{' '}
                      {chain && chain.unit}
                    </div>
                    <div>
                      Total: {satoshisToAmount(balanceV2.total)}{' '}
                      {chain && chain.unit}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Collapse
              className="collapse-container"
              items={items}
              defaultActiveKey={[]}
              onChange={() => {
                // todo
              }}
            />
          </div>
        ) : (
          <div>
            <Button
              onClick={async () => {
                try {
                  const result = await unisat.requestAccounts();
                  handleAccountsChanged(result);
                } catch (e) {
                  messageApi.error((e as any).message);
                }
              }}
            >
              Connect Unisat Wallet
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
