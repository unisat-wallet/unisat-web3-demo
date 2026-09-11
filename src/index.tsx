import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './polyfills';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  WalletProvider,
  UniSatWallet,
} from '@unisat/wallet-connect-react';
import type { ChainType as WalletConnectChainType } from '@unisat/wallet-connect-react';
import { SelectWalletModal } from './components/SelectWalletModal';
import { message } from 'antd';
import { ChainType } from './const';

// Create wallet instances
const wallets = [new UniSatWallet()];

// Simple notifier using antd message
const notifier = {
  warning: (options: { message: string; description?: string; key?: string; onClick?: () => void }) => {
    message.warning({
      content: (
        <span onClick={options.onClick} style={{ cursor: options.onClick ? 'pointer' : 'default' }}>
          {options.message}
          {options.description && <div style={{ fontSize: 12 }}>{options.description}</div>}
        </span>
      ),
      key: options.key,
    });
  },
  destroy: (key: string) => {
    message.destroy(key);
  },
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const CHAIN_TYPE_STORAGE_KEY = 'unisat_web3_demo_chain_type';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readStoredChainType = () => {
  const chainType = localStorage.getItem(CHAIN_TYPE_STORAGE_KEY) as ChainType | null;
  return chainType && chainType in ChainType ? chainType : ChainType.BITCOIN_MAINNET;
};

function Root() {
  const [chainType, setChainType] = useState<ChainType>(readStoredChainType);
  const [isChainInitialized, setIsChainInitialized] = useState(false);

  const syncWalletChainType = useCallback((chainType: ChainType) => {
    setChainType(chainType);
    localStorage.setItem(CHAIN_TYPE_STORAGE_KEY, chainType);
    wallets.forEach((wallet) => {
      wallet.setChainType(chainType as unknown as WalletConnectChainType);
    });
  }, []);

  const getCurrentChainType = useCallback(async (fallback = ChainType.BITCOIN_MAINNET) => {
    for (let i = 0; i < 10; i += 1) {
      const unisat = (window as any).unisat;
      if (unisat) {
        try {
          const chain = await unisat.getChain();
          if (chain?.enum) {
            return chain.enum as ChainType;
          }
        } catch {
          return fallback;
        }
      }
      await sleep(100 + i * 100);
    }

    return fallback;
  }, []);

  useEffect(() => {
    syncWalletChainType(chainType);
    let disposed = false;

    const syncChainType = (chain: { enum: ChainType }) => {
      syncWalletChainType(chain.enum);
    };

    getCurrentChainType().then((chainType) => {
      if (disposed) return;

      syncWalletChainType(chainType);
      setIsChainInitialized(true);

      const unisat = (window as any).unisat;
      unisat?.on('chainChanged', syncChainType);
    });

    return () => {
      disposed = true;
      const unisat = (window as any).unisat;
      unisat?.removeListener('chainChanged', syncChainType);
    };
  }, [chainType, getCurrentChainType, syncWalletChainType]);

  const syncCurrentChainBeforeConnect = useCallback(async () => {
    const currentChainType = await getCurrentChainType(chainType || ChainType.BITCOIN_MAINNET);
    syncWalletChainType(currentChainType);
  }, [chainType, getCurrentChainType, syncWalletChainType]);

  if (!isChainInitialized) {
    return (
      <div className="App">
        <header className="App-header">
          <div>Loading wallets...</div>
        </header>
      </div>
    );
  }

  return (
    <WalletProvider
      chainType={chainType as unknown as WalletConnectChainType}
      wallets={wallets}
      notifier={notifier}
      validateAddress={() => true}
      onConnectError={(error) => {
        message.error(error instanceof Error ? error.message : 'Connection failed');
      }}
      renderModal={(props) => <SelectWalletModal {...props} />}
    >
      <App
        initialChainType={chainType}
        onBeforeConnect={syncCurrentChainBeforeConnect}
        onChainTypeChange={(chainType) => {
          syncWalletChainType(chainType);
        }}
      />
    </WalletProvider>
  );
}

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
