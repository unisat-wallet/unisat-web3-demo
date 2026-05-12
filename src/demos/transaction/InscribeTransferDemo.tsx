import { useState } from 'react';
import { Button, Input, InputNumber } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const inscribeTransferConfig: DemoConfig = {
  key: 'inscribeTransfer',
  title: 'Inscribe Transfer',
  category: 'transaction',
  apiMethod: 'unisat.inscribeTransfer',
  docUrl: 'https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#inscribetransfer',
  description: 'Inscribe a BRC-20 transfer inscription.',
  walletConnectSupported: false,
};

export function InscribeTransferDemo() {
  const [ticker, setTicker] = useState('');
  const [amount, setAmount] = useState<string>('1000');
  const { result, execute, isLoading } = useDemoExecution();

  const handleInscribe = async () => {
    if (!ticker.trim()) {
      throw new Error('Please enter a ticker');
    }
    if (!amount || Number(amount) <= 0) {
      throw new Error('Please enter a valid amount');
    }

    await execute(
      async () => {
        return getUnisat().inscribeTransfer(ticker, amount);
      },
      (result) => JSON.stringify(result, null, 2)
    );
  };

  return (
    <DemoCard config={inscribeTransferConfig} result={result}>
      <DemoField label="Ticker">
        <Input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="e.g., ordi"
        />
      </DemoField>

      <DemoField label="Amount">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </DemoField>

      <Button
        type="primary"
        loading={isLoading}
        onClick={handleInscribe}
        style={{ marginTop: 16 }}
      >
        Inscribe Transfer
      </Button>
    </DemoCard>
  );
}
