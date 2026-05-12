import { useState } from 'react';
import { Button, Input, InputNumber } from 'antd';
import { DemoCard, DemoField } from '../components/DemoCard';
import { useDemoExecution, getUnisat } from '../hooks/useDemoExecution';
import type { DemoConfig } from '../types';

export const sendRunesConfig: DemoConfig = {
  key: 'sendRunes',
  title: 'Send Runes',
  category: 'transaction',
  apiMethod: 'unisat.sendRunes',
  docUrl: 'https://github.com/unisat-wallet/wallet/blob/master/docs/api/manage-assets.md#sendrunes',
  description: 'Transfer Runes tokens to another address.',
  walletConnectSupported: false,
};

export function SendRunesDemo() {
  const [toAddress, setToAddress] = useState('');
  const [runeId, setRuneId] = useState('');
  const [amount, setAmount] = useState<string>('1000');
  const { result, execute, isLoading } = useDemoExecution();

  const handleSend = async () => {
    if (!toAddress.trim()) {
      throw new Error('Please enter a receiver address');
    }
    if (!runeId.trim()) {
      throw new Error('Please enter a Rune ID');
    }
    if (!amount || Number(amount) <= 0) {
      throw new Error('Please enter a valid amount');
    }

    await execute(async () => {
      return getUnisat().sendRunes(toAddress, runeId, amount);
    });
  };

  return (
    <DemoCard config={sendRunesConfig} result={result}>
      <DemoField label="Receiver Address">
        <Input
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Enter Bitcoin address"
        />
      </DemoField>

      <DemoField label="Rune ID">
        <Input
          value={runeId}
          onChange={(e) => setRuneId(e.target.value)}
          placeholder="e.g., 840000:1"
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
        onClick={handleSend}
        style={{ marginTop: 16 }}
      >
        Send Runes
      </Button>
    </DemoCard>
  );
}
