import { useState } from 'react';
import { Alert, Button, Space } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type AccountMethod = 'requestAccounts' | 'getAccounts' | 'getPublicKey';

export const walletAccountConfig: DemoConfig = {
  key: 'walletAccount',
  title: 'Account & Connection',
  category: 'wallet',
  apiMethod: 'unisat.requestAccounts / getAccounts / getPublicKey',
  docUrl: 'https://github.com/unisat-wallet/unisat-dev-docs/blob/master/wallet-api/api-docs/access-accounts.md',
  description: 'Connect to UniSat Wallet and inspect the active account and public key.',
};

export function WalletAccountDemo() {
  const [activeMethod, setActiveMethod] = useState<AccountMethod>();
  const { result, execute, isLoading } = useDemoExecution();

  const run = async (method: AccountMethod) => {
    setActiveMethod(method);
    try {
      await execute(() => getUnisat()[method](), (data) => `${method} result\n${JSON.stringify(data, null, 2)}`);
    } catch {
      // useDemoExecution has already rendered the request error.
    } finally {
      setActiveMethod(undefined);
    }
  };

  return (
    <DemoCard config={walletAccountConfig} result={result}>
      <Alert
        type="info"
        showIcon
        message="Call account APIs only after a user action"
        description="requestAccounts opens the connection flow. Other account-bound calls may also ask the user to connect when the origin is not authorized."
      />
      <DemoField label="Account interfaces">
        <Space wrap>
          {(['requestAccounts', 'getAccounts', 'getPublicKey'] as AccountMethod[]).map((method) => (
            <Button
              key={method}
              loading={isLoading && activeMethod === method}
              disabled={isLoading && activeMethod !== method}
              onClick={() => void run(method)}
            >
              {method}
            </Button>
          ))}
        </Space>
      </DemoField>
    </DemoCard>
  );
}
