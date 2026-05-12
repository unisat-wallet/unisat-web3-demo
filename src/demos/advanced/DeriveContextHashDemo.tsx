import { useState } from 'react';
import { Alert, Button, Input } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { getUnisat, useDemoExecution } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const deriveContextHashConfig: DemoConfig = {
  key: 'deriveContextHash',
  title: 'Derive Context Hash',
  category: 'advanced',
  apiMethod: 'unisat.deriveContextHash',
  docUrl: 'https://github.com/unisat-wallet/wallet/blob/master/docs/api/derive-context-hash.md#derivecontexthash',
  description: 'Experimental: derive a deterministic context hash for the connected account.',
  walletConnectSupported: false,
};

export function DeriveContextHashDemo() {
  const [appName, setAppName] = useState('test-app-name');
  const [context, setContext] = useState('000000000000');
  const { result, execute, isLoading } = useDemoExecution();

  const handleDerive = async () => {
    await execute(async () => {
      return getUnisat().deriveContextHash(appName, context);
    });
  };

  return (
    <DemoCard config={deriveContextHashConfig} result={result}>
      <Alert
        type="warning"
        showIcon
        style={{ marginTop: 16, textAlign: 'left' }}
        message="Experimental"
        description="This API is experimental and may change in future wallet versions."
      />

      <DemoField label="App Name">
        <Input
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="test-app-name"
        />
      </DemoField>

      <DemoField label="Context">
        <Input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="000000000000"
        />
      </DemoField>

      <Button
        type="primary"
        loading={isLoading}
        onClick={handleDerive}
        style={{ marginTop: 16, width: '100%' }}
        disabled={!appName.trim() || !context.trim()}
      >
        Derive Context Hash
      </Button>
    </DemoCard>
  );
}
