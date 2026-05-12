import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  WalletProvider,
  UniSatWallet,
  ChainTypeEnum,
} from '@unisat/wallet-connect-react';
import { SelectWalletModal } from './components/SelectWalletModal';
import { message } from 'antd';

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

root.render(
  <React.StrictMode>
    <WalletProvider
      chainType={ChainTypeEnum.BITCOIN_MAINNET}
      wallets={wallets}
      notifier={notifier}
      onConnectError={(error) => {
        message.error(error instanceof Error ? error.message : 'Connection failed');
      }}
      renderModal={(props) => <SelectWalletModal {...props} />}
    >
      <App />
    </WalletProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
