import { useState } from 'react';
import { Button, Input, InputNumber } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const sendBitcoinConfig: DemoConfig = {
  key: 'sendBitcoin',
  title: 'Send Bitcoin',
  category: 'transaction',
  apiMethod: 'unisat.sendBitcoin',
  docUrl: 'https://docs.unisat.io/dev/unisat-developer-center/unisat-wallet#sendbitcoin',
  description: 'Send BTC to a specified address.',
  walletConnectSupported: false,
};

export function SendBitcoinDemo() {
  const [toAddress, setToAddress] = useState('');
  const [satoshis, setSatoshis] = useState<number>(1000);
  const { result, execute, isLoading } = useDemoExecution();

  const handleSend = async () => {
    if (!toAddress.trim()) {
      throw new Error('Please enter a receiver address');
    }
    if (!satoshis || satoshis <= 0) {
      throw new Error('Please enter a valid amount');
    }

    await execute(async () => {
      return getUnisat().sendBitcoin(toAddress, satoshis);
    });
  };

  return (
    <DemoCard config={sendBitcoinConfig} result={result}>
      <DemoField label="Receiver Address">
        <Input
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Enter Bitcoin address"
        />
      </DemoField>

      <DemoField label="Amount (satoshis)">
        <InputNumber
          value={satoshis}
          onChange={(value) => setSatoshis(value || 0)}
          min={1}
          style={{ width: '100%' }}
        />
      </DemoField>

      <Button
        type="primary"
        loading={isLoading}
        onClick={handleSend}
        style={{ marginTop: 16 }}
      >
        Send Bitcoin
      </Button>
    </DemoCard>
  );
}
