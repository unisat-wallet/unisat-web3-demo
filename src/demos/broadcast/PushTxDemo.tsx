import { useState } from 'react';
import { Button, Input } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const pushTxConfig: DemoConfig = {
  key: 'pushTx',
  title: 'Push Transaction',
  category: 'broadcast',
  apiMethod: 'unisat.pushTx',
  docUrl: 'https://github.com/unisat-wallet/wallet/blob/master/docs/api/sign-transaction.md#pushtx',
  description: 'Broadcast a raw transaction to the network.',
  walletConnectSupported: false,
};

export function PushTxDemo() {
  const [rawTx, setRawTx] = useState('');
  const { result, execute, isLoading } = useDemoExecution();

  const handlePush = async () => {
    if (!rawTx.trim()) {
      throw new Error('Please enter a raw transaction hex');
    }

    await execute(async () => {
      return getUnisat().pushTx(rawTx);
    });
  };

  return (
    <DemoCard config={pushTxConfig} result={result}>
      <DemoField label="Raw Transaction Hex">
        <Input.TextArea
          value={rawTx}
          onChange={(e) => setRawTx(e.target.value)}
          placeholder="Enter raw transaction hex string"
          rows={3}
        />
      </DemoField>

      <Button
        type="primary"
        loading={isLoading}
        onClick={handlePush}
        style={{ marginTop: 16 }}
      >
        Broadcast Transaction
      </Button>
    </DemoCard>
  );
}
