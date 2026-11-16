import { useState } from 'react';
import { Alert, Button, Space } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

type StateMethod = 'getBalanceV2' | 'getBalance' | 'getChain' | 'getVersion' | 'getNetwork' | 'readAll';

const PRIMARY_METHODS = ['getBalanceV2', 'getChain', 'getVersion'] as const;

export const walletStateConfig: DemoConfig = {
  key: 'walletState',
  title: 'Wallet State',
  category: 'wallet',
  apiMethod: 'unisat.getBalanceV2 / getChain / getVersion',
  docUrl: 'https://github.com/unisat-wallet/unisat-dev-docs/tree/master/wallet-api/api-docs',
  description: 'Read the connected wallet balance, chain and extension version.',
};

export function WalletStateDemo() {
  const [activeMethod, setActiveMethod] = useState<StateMethod>();
  const { result, execute, isLoading } = useDemoExecution();

  const run = async (method: StateMethod) => {
    setActiveMethod(method);
    try {
      await execute(async () => {
        const unisat = getUnisat();
        if (method === 'readAll') {
          const [balanceV2, chain, version] = await Promise.all([
            unisat.getBalanceV2(),
            unisat.getChain(),
            unisat.getVersion(),
          ]);
          return { balanceV2, chain, version };
        }
        return unisat[method]();
      }, (data) => `${method} result\n${JSON.stringify(data, null, 2)}`);
    } catch {
      // useDemoExecution has already rendered the request error.
    } finally {
      setActiveMethod(undefined);
    }
  };

  const renderButton = (method: StateMethod, label: string = method) => (
    <Button
      key={method}
      loading={isLoading && activeMethod === method}
      disabled={isLoading && activeMethod !== method}
      onClick={() => void run(method)}
    >
      {label}
    </Button>
  );

  return (
    <DemoCard config={walletStateConfig} result={result}>
      <Alert
        type="info"
        showIcon
        message="Explicit reads"
        description="These methods run only when clicked. Read all requests the three current wallet-state methods in parallel."
      />
      <DemoField label="Wallet state interfaces">
        <Space wrap>
          {PRIMARY_METHODS.map((method) => renderButton(method))}
          {renderButton('readAll', 'Read all wallet state')}
        </Space>
      </DemoField>
      <DemoField label="Deprecated compatibility interface">
        <Space wrap>
          {renderButton('getBalance', 'getBalance (deprecated)')}
          {renderButton('getNetwork', 'getNetwork (deprecated)')}
        </Space>
      </DemoField>
    </DemoCard>
  );
}
