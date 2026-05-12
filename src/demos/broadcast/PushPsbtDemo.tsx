import { useState } from 'react';
import { Button, Input } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const pushPsbtConfig: DemoConfig = {
  key: 'pushPsbt',
  title: 'Push PSBT',
  category: 'broadcast',
  apiMethod: 'unisat.pushPsbt',
  docUrl: 'https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#pushpsbt',
  description: 'Broadcast a signed PSBT to the network.',
  walletConnectSupported: false,
};

export function PushPsbtDemo() {
  const [psbtHex, setPsbtHex] = useState('');
  const { result, execute, isLoading } = useDemoExecution();

  const handlePush = async () => {
    if (!psbtHex.trim()) {
      throw new Error('Please enter a signed PSBT hex');
    }

    await execute(async () => {
      return getUnisat().pushPsbt(psbtHex);
    });
  };

  return (
    <DemoCard config={pushPsbtConfig} result={result}>
      <DemoField label="Signed PSBT Hex">
        <Input.TextArea
          value={psbtHex}
          onChange={(e) => setPsbtHex(e.target.value)}
          placeholder="Enter signed PSBT hex string"
          rows={3}
        />
      </DemoField>

      <Button
        type="primary"
        loading={isLoading}
        onClick={handlePush}
        style={{ marginTop: 16 }}
      >
        Broadcast PSBT
      </Button>
    </DemoCard>
  );
}
